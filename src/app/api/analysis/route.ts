// ─────────────────────────────────────────────────────────────────────────────
// POST /api/analysis — trigger Gemini analysis for a project
//
// This is the most expensive route in the application (~15–45s).
// Vercel Fluid Compute keeps the function alive for the duration.
// The route is idempotent per project per request — concurrent calls for the
// same project are rejected with 409 PROJECT_ALREADY_ANALYZING.
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "@clerk/nextjs/server";
import {
  withApiHandler,
  requireAuth,
  parseBody,
  successResponse,
} from "@/lib/errors";
import { validate, CreateAnalysisSchema } from "@/lib/validations";
import { runAnalysisForProject } from "@/lib/services/analysis.service";

// Extend the Vercel function timeout to accommodate long Gemini calls
export const maxDuration = 120; // seconds

export const POST = withApiHandler(async (req) => {
  const { userId } = await auth();
  requireAuth(userId);

  const body = await parseBody(req);
  const { projectId } = validate(CreateAnalysisSchema, body);

  const analysis = await runAnalysisForProject(projectId, userId);

  return successResponse(analysis, "Analysis completed successfully", 201);
});
