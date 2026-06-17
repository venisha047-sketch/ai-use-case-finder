// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Service — aggregates stats for the authenticated user's dashboard
// ─────────────────────────────────────────────────────────────────────────────

import {
  countProjectsByUserId,
  findRecentProjectsByUserId,
} from "@/lib/repositories/project.repository";
import {
  countAnalysesByUserId,
  getAnalysisAggregatesByUserId,
  findScoreTrendByUserId,
} from "@/lib/repositories/analysis.repository";
import type { DashboardStats } from "@/types/index";

export async function getDashboardStatsForUser(
  userId: string
): Promise<DashboardStats> {
  // Run all independent queries in parallel — single round-trip to the DB layer
  const [
    totalProjects,
    totalAnalyses,
    aggregates,
    recentProjects,
    scoreTrend,
  ] = await Promise.all([
    countProjectsByUserId(userId),
    countAnalysesByUserId(userId),
    getAnalysisAggregatesByUserId(userId),
    findRecentProjectsByUserId(userId, 5),
    findScoreTrendByUserId(userId, 10),
  ]);

  return {
    totalProjects,
    totalAnalyses,
    avgFeasibilityScore: aggregates.avgFeasibilityScore,
    avgImpactScore: aggregates.avgImpactScore,
    avgComplexityScore: aggregates.avgComplexityScore,
    roiDistribution: aggregates.roiDistribution,
    recentProjects,
    scoreTrend,
  };
}
