// ─────────────────────────────────────────────────────────────────────────────
// Project Service — business logic for project lifecycle
//
// Responsibilities:
//   - Enforce ownership on every read/write
//   - Orchestrate repository calls
//   - Keep route handlers thin (routes validate inputs; services apply rules)
// ─────────────────────────────────────────────────────────────────────────────

import {
  createProject,
  updateProject,
  deleteProject,
  findProjectById,
  findProjectWithLatestAnalysis,
  findProjectsByUserId,
  findRecentProjectsByUserId,
  countProjectsByUserId,
  type CreateProjectPayload,
  type UpdateProjectPayload,
} from "@/lib/repositories/project.repository";
import { Errors, requireOwnership } from "@/lib/errors";
import { ensureUserSynced } from "@/lib/repositories/user.repository";
import type {
  Project,
  ProjectSummary,
  ProjectWithLatestAnalysis,
  PaginatedResult,
} from "@/types/index";
import type { CreateProjectInput, GetProjectsQueryInput, UpdateProjectInput } from "@/lib/validations";

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createProjectForUser(
  userId: string,
  input: CreateProjectInput
): Promise<Project> {
  await ensureUserSynced(userId);

  const payload: CreateProjectPayload = {
    userId,
    title: input.title,
    industry: input.industry,
    department: input.department,
    companySize: input.companySize,
    problemStatement: input.problemStatement,
    processDescription: input.processDescription,
  };

  return createProject(payload);
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getProjectForUser(
  projectId: string,
  userId: string
): Promise<Project> {
  const project = await findProjectById(projectId);

  if (!project) throw Errors.projectNotFound(projectId);

  requireOwnership(project.userId, userId);

  return project;
}

export async function getProjectWithAnalysisForUser(
  projectId: string,
  userId: string
): Promise<ProjectWithLatestAnalysis> {
  const project = await findProjectWithLatestAnalysis(projectId);

  if (!project) throw Errors.projectNotFound(projectId);

  requireOwnership(project.userId, userId);

  return project;
}

export async function listProjectsForUser(
  userId: string,
  query: GetProjectsQueryInput
): Promise<PaginatedResult<ProjectSummary>> {
  return findProjectsByUserId(userId, query);
}

export async function getRecentProjectsForUser(
  userId: string,
  limit = 5
): Promise<ProjectSummary[]> {
  return findRecentProjectsByUserId(userId, limit);
}

export async function getTotalProjectsForUser(userId: string): Promise<number> {
  return countProjectsByUserId(userId);
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProjectForUser(
  projectId: string,
  userId: string,
  input: UpdateProjectInput
): Promise<Project> {
  const existing = await findProjectById(projectId);

  if (!existing) throw Errors.projectNotFound(projectId);

  requireOwnership(existing.userId, userId);

  const payload: UpdateProjectPayload = {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.industry !== undefined && { industry: input.industry }),
    ...(input.department !== undefined && { department: input.department }),
    ...(input.companySize !== undefined && { companySize: input.companySize }),
    ...(input.problemStatement !== undefined && {
      problemStatement: input.problemStatement,
    }),
    ...(input.processDescription !== undefined && {
      processDescription: input.processDescription,
    }),
  };

  return updateProject(projectId, payload);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteProjectForUser(
  projectId: string,
  userId: string
): Promise<void> {
  const existing = await findProjectById(projectId);

  if (!existing) throw Errors.projectNotFound(projectId);

  requireOwnership(existing.userId, userId);

  await deleteProject(projectId);
}
