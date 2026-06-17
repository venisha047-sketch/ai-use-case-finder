// ─────────────────────────────────────────────────────────────────────────────
// GET /api/dashboard/stats — aggregated statistics for the authenticated user
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "@clerk/nextjs/server";
import {
  withApiHandler,
  requireAuth,
  successResponse,
} from "@/lib/errors";
import { getDashboardStatsForUser } from "@/lib/services/dashboard.service";

export const GET = withApiHandler(async () => {
  const { userId } = await auth();
  requireAuth(userId);

  const stats = await getDashboardStatsForUser(userId);

  return successResponse(stats);
});
