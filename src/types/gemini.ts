// ─────────────────────────────────────────────────────────────────────────────
// Gemini Types — Zod schemas + inferred TypeScript types for AI responses
//
// This is the single source of truth for what Gemini must return.
// The schema is used in three places:
//   1. The system prompt instructs Gemini to match this exact shape
//   2. The Gemini service parses and validates the raw JSON against it
//   3. The Analysis service maps the validated result → Prisma create payload
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

export const UseCaseSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]+$/, "ID must be a URL-safe kebab-case slug")
    .describe("Unique kebab-case identifier, e.g. 'email-response-automation'"),

  title: z.string().min(5).max(100),

  description: z
    .string()
    .min(50)
    .max(500)
    .describe("Clear 2–4 sentence description of the use case"),

  category: z
    .string()
    .min(3)
    .max(60)
    .describe("Functional category, e.g. 'Customer Support', 'Process Automation'"),

  feasibility: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Technical and organisational feasibility score 0–100"),

  impact: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Business impact score 0–100"),

  complexity: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Implementation complexity score 0–100 (higher = harder)"),

  timeToValue: z
    .string()
    .max(30)
    .describe("Estimated time to first value, e.g. '3–6 months'"),

  requiredCapabilities: z
    .array(z.string().max(80))
    .min(1)
    .max(8)
    .describe("Skills, data, or infrastructure required"),

  benefits: z
    .array(z.string().max(120))
    .min(1)
    .max(6)
    .describe("Concrete, measurable business benefits"),

  risks: z
    .array(z.string().max(120))
    .min(1)
    .max(4)
    .describe("Key implementation or adoption risks"),
});

export const RoadmapPhaseSchema = z.object({
  title: z.string().min(3).max(80),
  tasks: z.array(z.string().min(5).max(200)).min(2).max(8),
  milestone: z.string().min(10).max(200).describe("Measurable success criterion"),
});

export const RoadmapSchema = z.object({
  day30: RoadmapPhaseSchema.describe("First 30-day quick wins and foundation"),
  day60: RoadmapPhaseSchema.describe("Days 31–60 build and iterate"),
  day90: RoadmapPhaseSchema.describe("Days 61–90 scale and measure"),
});

export const TechRecommendationSchema = z.object({
  name: z.string().min(1).max(60),
  category: z
    .string()
    .max(60)
    .describe("e.g. 'ML Platform', 'Data Pipeline', 'LLM API', 'Vector DB'"),
  description: z.string().min(10).max(200),
  rationale: z
    .string()
    .min(10)
    .max(300)
    .describe("Why this tool fits the user's specific context"),
  tier: z
    .enum(["core", "optional", "future"])
    .describe("'core' = must-have, 'optional' = nice-to-have, 'future' = post-MVP"),
});

// ─── Root Response Schema ─────────────────────────────────────────────────────

export const GeminiResponseSchema = z.object({
  executiveSummary: z
    .string()
    .min(100)
    .max(1500)
    .describe(
      "3–5 paragraph executive summary covering the problem, opportunity, recommended approach, and expected outcomes"
    ),

  useCases: z
    .array(UseCaseSchema)
    .min(3)
    .max(6)
    .describe("Ranked list of recommended AI use cases, most impactful first"),

  feasibilityScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Overall organisational feasibility score across all use cases"),

  impactScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Overall projected business impact score"),

  complexityScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Overall implementation complexity (higher = harder)"),

  roiLevel: z
    .enum(["Low", "Medium", "High"])
    .describe("Qualitative ROI classification"),

  roiRange: z
    .string()
    .regex(/^\d+[–-]\d+%$/, "Must be formatted as '120–180%'")
    .describe("Projected ROI percentage range, e.g. '150–220%'"),

  priorityRank: z
    .enum(["Immediate", "Strategic", "Future"])
    .describe(
      "'Immediate' = start within 30 days, 'Strategic' = 3–6 months, 'Future' = 6+ months"
    ),

  roadmap: RoadmapSchema,

  techRecommendations: z
    .array(TechRecommendationSchema)
    .min(3)
    .max(10)
    .describe("Specific tools and platforms suited to this company and use case set"),
});

// ─── Inferred TypeScript types ─────────────────────────────────────────────────

export type GeminiResponse = z.infer<typeof GeminiResponseSchema>;
export type UseCaseRaw = z.infer<typeof UseCaseSchema>;
export type RoadmapRaw = z.infer<typeof RoadmapSchema>;
export type RoadmapPhaseRaw = z.infer<typeof RoadmapPhaseSchema>;
export type TechRecommendationRaw = z.infer<typeof TechRecommendationSchema>;

// ─── ROI / Priority normalisation maps ────────────────────────────────────────
// Gemini returns human-readable strings; DB stores uppercase enums.

export const ROI_LEVEL_MAP = {
  Low: "LOW",
  Medium: "MEDIUM",
  High: "HIGH",
} as const satisfies Record<GeminiResponse["roiLevel"], string>;

export const PRIORITY_RANK_MAP = {
  Immediate: "IMMEDIATE",
  Strategic: "STRATEGIC",
  Future: "FUTURE",
} as const satisfies Record<GeminiResponse["priorityRank"], string>;

// ─── Prompt context type ──────────────────────────────────────────────────────
// The object passed into the Gemini service to build the user turn

export interface GeminiPromptContext {
  industry: string;
  department: string;
  companySize: string;
  problemStatement: string;
  processDescription: string;
}
