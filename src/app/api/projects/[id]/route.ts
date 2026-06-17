// ─────────────────────────────────────────────────────────────────────────────
// GET    /api/projects/[id] — project detail + latest analysis
// PATCH  /api/projects/[id] — partial update
// DELETE /api/projects/[id] — permanent delete (cascades to analyses)
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "@clerk/nextjs/server";
import {
  withApiHandler,
  requireAuth,
  parseBody,
  successResponse,
} from "@/lib/errors";
import {
  validate,
  UpdateProjectSchema,
  RouteIdSchema,
} from "@/lib/validations";
import {
  getProjectWithAnalysisForUser,
  updateProjectForUser,
  deleteProjectForUser,
} from "@/lib/services/project.service";
import type { RouteParams } from "@/types/api";

export const GET = withApiHandler(async (_req, { params }: RouteParams) => {
  const { userId } = await auth();
  requireAuth(userId);

  const { id } = validate(RouteIdSchema, await params);

  const project = await getProjectWithAnalysisForUser(id, userId);

  return successResponse(project);
});

export const PATCH = withApiHandler(async (req, { params }: RouteParams) => {
  const { userId } = await auth();
  requireAuth(userId);

  const { id } = validate(RouteIdSchema, await params);
  const body = await parseBody(req);
  const input = validate(UpdateProjectSchema, body);

  const updated = await updateProjectForUser(id, userId, input);

  return successResponse(updated, "Project updated successfully");
});

export const DELETE = withApiHandler(async (_req, { params }: RouteParams) => {
  const { userId } = await auth();
  requireAuth(userId);

  const { id } = validate(RouteIdSchema, await params);

  await deleteProjectForUser(id, userId);

  return successResponse({ id }, "Project deleted successfully");
});
