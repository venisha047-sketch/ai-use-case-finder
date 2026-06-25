// ─────────────────────────────────────────────────────────────────────────────
// Analysis Service — orchestrates the full AI analysis pipeline
//
// Pipeline:
//   1. Verify ownership and project exists
//   2. Guard against concurrent analysis on the same project
//   3. Enforce per-user rate limit
//   4. Set project status → ANALYZING
//   5. Call Gemini via gemini.ts
//   6. Map the validated response → repository payload
//   7. Persist the Analysis row
//   8. Set project status → COMPLETED (or FAILED on error)
//   9. Return the saved Analysis
// ─────────────────────────────────────────────────────────────────────────────

import {
  findProjectById,
  getProjectStatus,
  updateProjectStatus,
} from "@/lib/repositories/project.repository";
import {
  createAnalysis,
  findAnalysisById,
  findAnalysesByProjectId,
  countRecentAnalysesByUserId,
  type CreateAnalysisPayload,
} from "@/lib/repositories/analysis.repository";
import {
  runAnalysis,
  normaliseRoiLevel,
  normalisePriorityRank,
} from "@/lib/gemini";
import { Errors, requireOwnership } from "@/lib/errors";
import { env } from "@/lib/env";
import type { Analysis } from "@/types/index";
import type { GeminiPromptContext } from "@/types/gemini";

// ─── Rate limit window ────────────────────────────────────────────────────────

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// ─── Run analysis ─────────────────────────────────────────────────────────────

export async function runAnalysisForProject(
  projectId: string,
  userId: string
): Promise<Analysis> {
  // ── 1. Verify project exists and user owns it ──────────────────────────────
  const project = await findProjectById(projectId);

  if (!project) throw Errors.projectNotFound(projectId);

  requireOwnership(project.userId, userId);

  // ── 2. Guard against concurrent analysis ──────────────────────────────────
  const currentStatus = await getProjectStatus(projectId);

  if (currentStatus === "ANALYZING") {
    throw Errors.projectAlreadyAnalyzing(projectId);
  }

  // ── 3. Enforce per-user rate limit ────────────────────────────────────────
  const recentCount = await countRecentAnalysesByUserId(
    userId,
    RATE_LIMIT_WINDOW_MS
  );

  if (recentCount >= env.ANALYSIS_RATE_LIMIT_PER_HOUR) {
    throw Errors.analysisLimitReached();
  }

  // ── 4. Mark project as analyzing ──────────────────────────────────────────
  await updateProjectStatus(projectId, "ANALYZING");

  try {
    // ── 5. Build context and call Gemini ──────────────────────────────────────
    const context: GeminiPromptContext = {
      industry: project.industry,
      department: project.department,
      companySize: project.companySize,
      problemStatement: project.problemStatement,
      processDescription: project.processDescription,
    };

    const { parsed, rawResponse, promptTokens, completionTokens } =
      await runAnalysis(context);

    // ── 6. Map Gemini response → repository payload ────────────────────────────
    const payload: CreateAnalysisPayload = {
      projectId,

      feasibilityScore: parsed.feasibilityScore,
      impactScore: parsed.impactScore,
      complexityScore: parsed.complexityScore,

      roiLevel: normaliseRoiLevel(parsed.roiLevel),
      roiRange: parsed.roiRange,

      priorityRank: normalisePriorityRank(parsed.priorityRank),

      executiveSummary: parsed.executiveSummary,

      // Map Gemini use cases → domain UseCase[] (id already a valid slug from schema)
      recommendations: parsed.useCases.map((uc) => ({
        id: uc.id,
        title: uc.title,
        description: uc.description,
        category: uc.category,
        feasibility: uc.feasibility,
        impact: uc.impact,
        complexity: uc.complexity,
        timeToValue: uc.timeToValue,
        requiredCapabilities: uc.requiredCapabilities,
        benefits: uc.benefits,
        risks: uc.risks,
      })),

      // Map Gemini roadmap → domain Roadmap
      roadmap: {
        day30: {
          title: parsed.roadmap.day30.title,
          tasks: parsed.roadmap.day30.tasks,
          milestone: parsed.roadmap.day30.milestone,
        },
        day60: {
          title: parsed.roadmap.day60.title,
          tasks: parsed.roadmap.day60.tasks,
          milestone: parsed.roadmap.day60.milestone,
        },
        day90: {
          title: parsed.roadmap.day90.title,
          tasks: parsed.roadmap.day90.tasks,
          milestone: parsed.roadmap.day90.milestone,
        },
      },

      // Map tech recommendations
      techRecommendations: parsed.techRecommendations.map((tr) => ({
        name: tr.name,
        category: tr.category,
        description: tr.description,
        rationale: tr.rationale,
        tier: tr.tier,
      })),

      rawGeminiResponse: rawResponse,
      promptTokens,
      completionTokens,
    };

    // ── 7. Persist analysis ────────────────────────────────────────────────────
    const analysis = await createAnalysis(payload);

    // ── 8. Mark project as completed ──────────────────────────────────────────
    await updateProjectStatus(projectId, "COMPLETED");

    return analysis;
  } catch (err) {
    // ── 8b. Mark project as failed on any error ────────────────────────────────
    await updateProjectStatus(projectId, "FAILED").catch(() => {
      // Best-effort status update — don't let this mask the original error
    });

    throw err;
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getAnalysesForProject(
  projectId: string,
  userId: string
): Promise<Analysis[]> {
  const project = await findProjectById(projectId);
  if (!project) throw Errors.projectNotFound(projectId);
  requireOwnership(project.userId, userId);
  return findAnalysesByProjectId(projectId);
}

export async function getAnalysisForUser(
  analysisId: string,
  userId: string
): Promise<Analysis> {
  const analysis = await findAnalysisById(analysisId);

  if (!analysis) throw Errors.analysisNotFound(analysisId);

  // Verify the analysis's project belongs to the requesting user
  const project = await findProjectById(analysis.projectId);

  if (!project) throw Errors.projectNotFound(analysis.projectId);

  requireOwnership(project.userId, userId);

  return analysis;
}
