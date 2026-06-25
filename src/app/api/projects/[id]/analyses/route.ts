// ─────────────────────────────────────────────────────────────────────────────
// GET /api/projects/[id]/analyses — list all analyses for a project
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "@clerk/nextjs/server";
import { withApiHandler, requireAuth, successResponse } from "@/lib/errors";
import { validate, RouteIdSchema } from "@/lib/validations";
import { getAnalysesForProject } from "@/lib/services/analysis.service";
import type { RouteParams } from "@/types/api";

export const GET = withApiHandler(async (_req, { params }: RouteParams) => {
  const { userId } = await auth();
  requireAuth(userId);

  const { id } = validate(RouteIdSchema, await params);

  const analyses = await getAnalysesForProject(id, userId);

  return successResponse(analyses);
});
