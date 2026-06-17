// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analysis/[id] — full analysis detail
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "@clerk/nextjs/server";
import {
  withApiHandler,
  requireAuth,
  successResponse,
} from "@/lib/errors";
import { validate, RouteIdSchema } from "@/lib/validations";
import { getAnalysisForUser } from "@/lib/services/analysis.service";
import type { RouteParams } from "@/types/api";

export const GET = withApiHandler(async (_req, { params }: RouteParams) => {
  const { userId } = await auth();
  requireAuth(userId);

  const { id } = validate(RouteIdSchema, await params);

  const analysis = await getAnalysisForUser(id, userId);

  return successResponse(analysis);
});
