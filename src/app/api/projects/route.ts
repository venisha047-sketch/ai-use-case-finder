// ─────────────────────────────────────────────────────────────────────────────
// GET  /api/projects — paginated list of authenticated user's projects
// POST /api/projects — create a new project
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
  CreateProjectSchema,
  GetProjectsQuerySchema,
  parseSearchParams,
} from "@/lib/validations";
import {
  createProjectForUser,
  listProjectsForUser,
} from "@/lib/services/project.service";
import { ensureUserSynced } from "@/lib/repositories/user.repository";

export const GET = withApiHandler(async (req) => {
  const { userId } = await auth();
  requireAuth(userId);

  const rawQuery = parseSearchParams(req.url);
  const query = validate(GetProjectsQuerySchema, rawQuery);

  const result = await listProjectsForUser(userId, query);

  return successResponse(result);
});

export const POST = withApiHandler(async (req) => {
  const { userId } = await auth();
  requireAuth(userId);

  // Ensure the user row exists even if the Clerk webhook hasn't fired yet
  await ensureUserSynced(userId);

  const body = await parseBody(req);
  const input = validate(CreateProjectSchema, body);

  const project = await createProjectForUser(userId, input);

  return successResponse(project, "Project created successfully", 201);
});
