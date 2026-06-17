// ─────────────────────────────────────────────────────────────────────────────
// Gemini Service Layer
//
// Responsibilities:
//   1. Build the system prompt that shapes Gemini's persona and output format
//   2. Build the user turn from project context
//   3. Call Gemini with JSON mode enforced via response schema
//   4. Parse and Zod-validate the response
//   5. Handle retries, timeouts, and structured error classification
//
// This module is server-only. It must never be imported by client components.
// ─────────────────────────────────────────────────────────────────────────────

import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  type GenerateContentResult,
} from "@google/generative-ai";
import { env } from "./env";
import {
  GeminiResponseSchema,
  ROI_LEVEL_MAP,
  PRIORITY_RANK_MAP,
  type GeminiPromptContext,
  type GeminiResponse,
} from "@/types/gemini";
import type { ROILevel, PriorityRank } from "@/types/index";

// ─── Client singleton ─────────────────────────────────────────────────────────

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// ─── Safety settings ──────────────────────────────────────────────────────────
// Permissive thresholds for a B2B business analysis tool.

const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert AI Strategy Analyst and Solutions Architect with 15+ years of experience helping organisations across all industries identify, evaluate, and implement AI use cases.

Your role is to analyse a company's business challenge and current processes, then produce a comprehensive, actionable AI opportunity assessment.

## Your Output Standards

- Be specific, not generic. Tailor every recommendation to the exact industry, department, company size, and problem described.
- Quantify wherever possible. Use realistic percentage ranges for ROI, specific timeframes, concrete capability requirements.
- Prioritise ruthlessly. Return 3–6 use cases ranked from highest to lowest combined impact-to-complexity ratio.
- Be honest about risks. Surface genuine implementation blockers, not just theoretical concerns.

## Scoring Guidelines

### Feasibility Score (0–100)
Evaluate based on:
- Data availability and quality (30%)
- Technical infrastructure readiness (25%)
- Organisational change management capacity (25%)
- Integration complexity with existing systems (20%)

Higher score = easier to implement.

### Impact Score (0–100)
Evaluate based on:
- Time savings (hours/week recovered) (30%)
- Cost reduction potential (25%)
- Revenue impact (direct or indirect) (25%)
- Customer or employee experience improvement (20%)

Higher score = greater business impact.

### Complexity Score (0–100)
Evaluate based on:
- Infrastructure and architecture requirements (30%)
- Data engineering effort (25%)
- Change management and training burden (25%)
- Regulatory and compliance considerations (20%)

Higher score = harder to implement.

### ROI Classification
- Low: < 50% projected annual ROI
- Medium: 50–150% projected annual ROI
- High: > 150% projected annual ROI

### Priority Rank
- Immediate: Can begin within 30 days, strong ROI, low-to-medium complexity
- Strategic: 3–6 month planning horizon, high impact, medium-to-high complexity
- Future: 6+ months, transformational but requires significant foundation work

## Output Format

You MUST respond with valid JSON only. No markdown fences, no prose outside the JSON object.
Your response must exactly match the schema provided.`;

// ─── User prompt builder ──────────────────────────────────────────────────────

function buildUserPrompt(ctx: GeminiPromptContext): string {
  return `Analyse the following business context and generate a comprehensive AI opportunity assessment.

## Business Context

**Industry:** ${ctx.industry}
**Department:** ${ctx.department}
**Company Size:** ${formatCompanySize(ctx.companySize)}

**Business Challenge:**
${ctx.problemStatement}

**Current Process Description:**
${ctx.processDescription}

## Instructions

1. Identify 3–6 high-value AI use cases specifically applicable to this ${ctx.industry} ${ctx.department} context
2. Score each use case individually (feasibility, impact, complexity)
3. Calculate overall portfolio scores across all use cases
4. Classify the overall ROI and priority rank for this organisation
5. Build a practical 30/60/90-day implementation roadmap
6. Recommend 3–10 specific technologies suited to this company's size and context

Respond with a single valid JSON object matching the required schema.`;
}

function formatCompanySize(size: string): string {
  const labels: Record<string, string> = {
    STARTUP: "Startup (1–50 employees)",
    SMALL_BUSINESS: "Small Business (51–200 employees)",
    MID_MARKET: "Mid-Market (201–1,000 employees)",
    ENTERPRISE: "Enterprise (1,000+ employees)",
  };
  return labels[size] ?? size;
}

// ─── Retry configuration ──────────────────────────────────────────────────────

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Timeout wrapper ──────────────────────────────────────────────────────────

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new GeminiTimeoutError(errorMessage)),
      timeoutMs
    );
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (err) {
    clearTimeout(timeoutId!);
    throw err;
  }
}

// ─── Custom error classes ─────────────────────────────────────────────────────

export class GeminiServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "GEMINI_ERROR" | "GEMINI_PARSE_ERROR" | "GEMINI_TIMEOUT",
    public readonly retryable: boolean = false,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "GeminiServiceError";
  }
}

export class GeminiTimeoutError extends GeminiServiceError {
  constructor(message: string) {
    super(message, "GEMINI_TIMEOUT", true);
    this.name = "GeminiTimeoutError";
  }
}

export class GeminiParseError extends GeminiServiceError {
  constructor(message: string, cause?: unknown) {
    super(message, "GEMINI_PARSE_ERROR", false, cause);
    this.name = "GeminiParseError";
  }
}

// ─── Raw call ─────────────────────────────────────────────────────────────────

async function callGeminiRaw(
  userPrompt: string
): Promise<GenerateContentResult> {
  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: env.GEMINI_MAX_OUTPUT_TOKENS,
      temperature: 0.4,       // balanced: creative enough to differentiate, stable enough to be accurate
      topP: 0.9,
      topK: 40,
    },
  });

  return withTimeout(
    model.generateContent(userPrompt),
    env.GEMINI_TIMEOUT_MS,
    `Gemini did not respond within ${env.GEMINI_TIMEOUT_MS / 1000}s`
  );
}

// ─── Response parser ──────────────────────────────────────────────────────────

function parseGeminiResult(result: GenerateContentResult): {
  parsed: GeminiResponse;
  promptTokens: number | null;
  completionTokens: number | null;
} {
  const candidate = result.response.candidates?.[0];

  if (!candidate) {
    throw new GeminiParseError(
      "Gemini returned no candidates. The prompt may have been blocked by safety filters."
    );
  }

  if (candidate.finishReason && candidate.finishReason !== "STOP") {
    throw new GeminiParseError(
      `Gemini stopped unexpectedly with reason: ${candidate.finishReason}`,
      { finishReason: candidate.finishReason }
    );
  }

  const rawText = result.response.text();

  if (!rawText || rawText.trim().length === 0) {
    throw new GeminiParseError("Gemini returned an empty response body.");
  }

  // Strip any accidental markdown fences Gemini may inject despite instructions
  const cleanedText = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(cleanedText);
  } catch (err) {
    throw new GeminiParseError(
      `Gemini response was not valid JSON: ${(err as Error).message}`,
      { rawText: cleanedText.slice(0, 500) }
    );
  }

  const validation = GeminiResponseSchema.safeParse(rawJson);

  if (!validation.success) {
    const issues = validation.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new GeminiParseError(
      `Gemini response failed schema validation: ${issues}`,
      { issues: validation.error.issues, rawJson }
    );
  }

  const usage = result.response.usageMetadata;

  return {
    parsed: validation.data,
    promptTokens: usage?.promptTokenCount ?? null,
    completionTokens: usage?.candidatesTokenCount ?? null,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface GeminiAnalysisResult {
  parsed: GeminiResponse;
  rawResponse: unknown;
  promptTokens: number | null;
  completionTokens: number | null;
}

/**
 * Runs a full AI analysis for the given project context.
 * Retries up to MAX_RETRIES times on transient errors.
 * Throws a GeminiServiceError on permanent failure.
 */
export async function runAnalysis(
  ctx: GeminiPromptContext
): Promise<GeminiAnalysisResult> {
  const userPrompt = buildUserPrompt(ctx);
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const result = await callGeminiRaw(userPrompt);
      const { parsed, promptTokens, completionTokens } = parseGeminiResult(result);

      return {
        parsed,
        rawResponse: result.response.candidates?.[0] ?? null,
        promptTokens,
        completionTokens,
      };
    } catch (err) {
      lastError = err;

      // Never retry parse errors — the response was received but malformed
      if (err instanceof GeminiParseError) {
        throw err;
      }

      const isRetryable =
        err instanceof GeminiServiceError
          ? err.retryable
          : isRetryableError(err);

      if (!isRetryable || attempt > MAX_RETRIES) {
        break;
      }

      const delay = RETRY_DELAY_MS * attempt;
      await sleep(delay);
    }
  }

  if (lastError instanceof GeminiServiceError) {
    throw lastError;
  }

  throw new GeminiServiceError(
    `Gemini analysis failed after ${MAX_RETRIES + 1} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
    "GEMINI_ERROR",
    false,
    lastError
  );
}

function isRetryableError(err: unknown): boolean {
  if (err instanceof GeminiTimeoutError) return true;
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("rate limit") || msg.includes("quota")) return true;
    if (msg.includes("503") || msg.includes("502") || msg.includes("500")) return true;
  }
  return false;
}

// ─── Normalisation helpers ────────────────────────────────────────────────────
// Convert Gemini's human-readable strings to DB enum values.

export function normaliseRoiLevel(raw: GeminiResponse["roiLevel"]): ROILevel {
  return ROI_LEVEL_MAP[raw] as ROILevel;
}

export function normalisePriorityRank(
  raw: GeminiResponse["priorityRank"]
): PriorityRank {
  return PRIORITY_RANK_MAP[raw] as PriorityRank;
}
