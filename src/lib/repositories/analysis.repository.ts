// ─────────────────────────────────────────────────────────────────────────────
// Analysis Repository — all Prisma calls relating to the Analysis model
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "@/lib/prisma";
import type {
  Analysis,
  AnalysisSummary,
  UseCase,
  Roadmap,
  TechRecommendation,
  ROILevel,
  PriorityRank,
  ScoreTrendPoint,
} from "@/types/index";

// ─── Mapper helpers ───────────────────────────────────────────────────────────
// Exported so project.repository.ts can reuse for the joined latestAnalysis shape.

export function toAnalysisSummary(record: {
  id: string;
  feasibilityScore: number;
  impactScore: number;
  complexityScore: number;
  roiLevel: string;
  priorityRank: string;
  createdAt: Date;
}): AnalysisSummary {
  return {
    id: record.id,
    feasibilityScore: record.feasibilityScore,
    impactScore: record.impactScore,
    complexityScore: record.complexityScore,
    roiLevel: record.roiLevel as ROILevel,
    priorityRank: record.priorityRank as PriorityRank,
    createdAt: record.createdAt,
  };
}

function toAnalysis(record: {
  id: string;
  projectId: string;
  feasibilityScore: number;
  impactScore: number;
  complexityScore: number;
  roiLevel: string;
  roiRange: string;
  priorityRank: string;
  executiveSummary: string;
  recommendations: unknown;
  roadmap: unknown;
  techRecommendations: unknown;
  promptTokens: number | null;
  completionTokens: number | null;
  createdAt: Date;
}): Analysis {
  return {
    id: record.id,
    projectId: record.projectId,
    feasibilityScore: record.feasibilityScore,
    impactScore: record.impactScore,
    complexityScore: record.complexityScore,
    roiLevel: record.roiLevel as ROILevel,
    roiRange: record.roiRange,
    priorityRank: record.priorityRank as PriorityRank,
    executiveSummary: record.executiveSummary,
    recommendations: record.recommendations as UseCase[],
    roadmap: record.roadmap as Roadmap,
    techRecommendations: record.techRecommendations as TechRecommendation[],
    promptTokens: record.promptTokens,
    completionTokens: record.completionTokens,
    createdAt: record.createdAt,
  };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function findAnalysisById(id: string): Promise<Analysis | null> {
  const record = await db.analysis.findUnique({ where: { id } });
  return record ? toAnalysis(record) : null;
}

export async function findLatestAnalysisByProjectId(
  projectId: string
): Promise<Analysis | null> {
  const record = await db.analysis.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  return record ? toAnalysis(record) : null;
}

export async function findAnalysesByProjectId(
  projectId: string
): Promise<Analysis[]> {
  const records = await db.analysis.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  return records.map(toAnalysis);
}

export async function countAnalysesByUserId(userId: string): Promise<number> {
  return db.analysis.count({
    where: { project: { userId } },
  });
}

/**
 * Returns score data points for the trend line chart on the dashboard.
 * Fetches the most recent `limit` analyses for a user ordered oldest-first
 * so Recharts renders left-to-right chronologically.
 */
export async function findScoreTrendByUserId(
  userId: string,
  limit = 10
): Promise<ScoreTrendPoint[]> {
  const records = await db.analysis.findMany({
    where: { project: { userId } },
    select: {
      feasibilityScore: true,
      impactScore: true,
      complexityScore: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Reverse so chart reads chronologically left → right
  return records.reverse().map((r) => ({
    date: r.createdAt.toISOString().split("T")[0],
    feasibility: r.feasibilityScore,
    impact: r.impactScore,
    complexity: r.complexityScore,
  }));
}

// ─── Aggregates ───────────────────────────────────────────────────────────────

export interface AnalysisAggregates {
  avgFeasibilityScore: number;
  avgImpactScore: number;
  avgComplexityScore: number;
  roiDistribution: { low: number; medium: number; high: number };
}

export async function getAnalysisAggregatesByUserId(
  userId: string
): Promise<AnalysisAggregates> {
  const [averages, roiCounts] = await db.$transaction([
    db.analysis.aggregate({
      where: { project: { userId } },
      _avg: {
        feasibilityScore: true,
        impactScore: true,
        complexityScore: true,
      },
    }),
    db.analysis.groupBy({
      by: ["roiLevel"],
      where: { project: { userId } },
      _count: { _all: true },
      orderBy: { roiLevel: "asc" },
    }),
  ]);

  const roiMap = Object.fromEntries(
    roiCounts.map((r) => {
      const count = r._count as { _all?: number } | undefined;
      return [r.roiLevel, count?._all ?? 0];
    })
  ) as Record<string, number>;

  return {
    avgFeasibilityScore: Math.round(averages._avg.feasibilityScore ?? 0),
    avgImpactScore: Math.round(averages._avg.impactScore ?? 0),
    avgComplexityScore: Math.round(averages._avg.complexityScore ?? 0),
    roiDistribution: {
      low: roiMap["LOW"] ?? 0,
      medium: roiMap["MEDIUM"] ?? 0,
      high: roiMap["HIGH"] ?? 0,
    },
  };
}

// ─── Write ────────────────────────────────────────────────────────────────────

export interface CreateAnalysisPayload {
  projectId: string;
  feasibilityScore: number;
  impactScore: number;
  complexityScore: number;
  roiLevel: ROILevel;
  roiRange: string;
  priorityRank: PriorityRank;
  executiveSummary: string;
  recommendations: UseCase[];
  roadmap: Roadmap;
  techRecommendations: TechRecommendation[];
  rawGeminiResponse?: unknown;
  promptTokens?: number | null;
  completionTokens?: number | null;
}

export async function createAnalysis(
  payload: CreateAnalysisPayload
): Promise<Analysis> {
  const record = await db.analysis.create({
    data: {
      projectId: payload.projectId,
      feasibilityScore: payload.feasibilityScore,
      impactScore: payload.impactScore,
      complexityScore: payload.complexityScore,
      roiLevel: payload.roiLevel,
      roiRange: payload.roiRange,
      priorityRank: payload.priorityRank,
      executiveSummary: payload.executiveSummary,
      recommendations: payload.recommendations as object[],
      roadmap: payload.roadmap as object,
      techRecommendations: payload.techRecommendations as object[],
      rawGeminiResponse: (payload.rawGeminiResponse as object) ?? undefined,
      promptTokens: payload.promptTokens ?? null,
      completionTokens: payload.completionTokens ?? null,
    },
  });
  return toAnalysis(record);
}

// ─── Rate limiting ────────────────────────────────────────────────────────────

/**
 * Counts analyses created by a user in the last `windowMs` milliseconds.
 * Used by the analysis service to enforce the per-user rate limit.
 */
export async function countRecentAnalysesByUserId(
  userId: string,
  windowMs: number
): Promise<number> {
  const since = new Date(Date.now() - windowMs);
  return db.analysis.count({
    where: {
      project: { userId },
      createdAt: { gte: since },
    },
  });
}
