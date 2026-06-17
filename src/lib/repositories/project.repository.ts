// ─────────────────────────────────────────────────────────────────────────────
// Project Repository — all Prisma calls relating to the Project model
// ─────────────────────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { db } from "@/lib/prisma";
import type {
  Project,
  ProjectSummary,
  ProjectWithLatestAnalysis,
  PaginatedResult,
  CompanySize,
  ProjectStatus,
} from "@/types/index";
import type { GetProjectsQueryInput } from "@/lib/validations";
import { toAnalysisSummary } from "./analysis.repository";

// ─── Prisma select shapes ─────────────────────────────────────────────────────
// Centralised select objects ensure consistent field sets across all queries.

const projectFullSelect = {
  id: true,
  userId: true,
  title: true,
  industry: true,
  department: true,
  companySize: true,
  problemStatement: true,
  processDescription: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProjectSelect;

const projectSummarySelect = {
  id: true,
  userId: true,
  title: true,
  industry: true,
  department: true,
  companySize: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  analyses: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: {
      id: true,
      feasibilityScore: true,
      impactScore: true,
      complexityScore: true,
      roiLevel: true,
      priorityRank: true,
      createdAt: true,
    },
  },
} satisfies Prisma.ProjectSelect;

// ─── Mappers ──────────────────────────────────────────────────────────────────

function toProject(record: Prisma.ProjectGetPayload<{ select: typeof projectFullSelect }>): Project {
  return {
    id: record.id,
    userId: record.userId,
    title: record.title,
    industry: record.industry,
    department: record.department,
    companySize: record.companySize as CompanySize,
    problemStatement: record.problemStatement,
    processDescription: record.processDescription,
    status: record.status as ProjectStatus,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toProjectSummary(
  record: Prisma.ProjectGetPayload<{ select: typeof projectSummarySelect }>
): ProjectSummary {
  const latest = record.analyses[0] ?? null;
  return {
    id: record.id,
    userId: record.userId,
    title: record.title,
    industry: record.industry,
    department: record.department,
    companySize: record.companySize as CompanySize,
    status: record.status as ProjectStatus,
    createdAt: record.createdAt,
    latestAnalysis: latest ? toAnalysisSummary(latest) : null,
  };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function findProjectById(id: string): Promise<Project | null> {
  const record = await db.project.findUnique({
    where: { id },
    select: projectFullSelect,
  });
  return record ? toProject(record) : null;
}

export async function findProjectWithLatestAnalysis(
  id: string
): Promise<ProjectWithLatestAnalysis | null> {
  const record = await db.project.findUnique({
    where: { id },
    select: {
      ...projectFullSelect,
      analyses: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!record) return null;

  const { analyses, ...projectFields } = record;
  const latestRaw = analyses[0] ?? null;

  return {
    ...toProject(projectFields),
    latestAnalysis: latestRaw
      ? {
          id: latestRaw.id,
          projectId: latestRaw.projectId,
          feasibilityScore: latestRaw.feasibilityScore,
          impactScore: latestRaw.impactScore,
          complexityScore: latestRaw.complexityScore,
          roiLevel: latestRaw.roiLevel as import("@/types/index").ROILevel,
          roiRange: latestRaw.roiRange,
          priorityRank: latestRaw.priorityRank as import("@/types/index").PriorityRank,
          executiveSummary: latestRaw.executiveSummary,
          recommendations: latestRaw.recommendations as unknown as import("@/types/index").UseCase[],
          roadmap: latestRaw.roadmap as unknown as import("@/types/index").Roadmap,
          techRecommendations: latestRaw.techRecommendations as unknown as import("@/types/index").TechRecommendation[],
          promptTokens: latestRaw.promptTokens,
          completionTokens: latestRaw.completionTokens,
          createdAt: latestRaw.createdAt,
        }
      : null,
  };
}

export async function findProjectsByUserId(
  userId: string,
  query: GetProjectsQueryInput
): Promise<PaginatedResult<ProjectSummary>> {
  const { page, pageSize, industry, status, search } = query;
  const skip = (page - 1) * pageSize;

  const where: Prisma.ProjectWhereInput = {
    userId,
    ...(industry && { industry: { contains: industry, mode: "insensitive" } }),
    ...(status && { status }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
        { problemStatement: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [records, total] = await db.$transaction([
    db.project.findMany({
      where,
      select: projectSummarySelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.project.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: records.map(toProjectSummary),
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export async function getProjectStatus(id: string): Promise<ProjectStatus | null> {
  const record = await db.project.findUnique({
    where: { id },
    select: { status: true },
  });
  return (record?.status as ProjectStatus) ?? null;
}

// ─── Write ────────────────────────────────────────────────────────────────────

export interface CreateProjectPayload {
  userId: string;
  title: string;
  industry: string;
  department: string;
  companySize: CompanySize;
  problemStatement: string;
  processDescription: string;
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const record = await db.project.create({
    data: {
      userId: payload.userId,
      title: payload.title,
      industry: payload.industry,
      department: payload.department,
      companySize: payload.companySize,
      problemStatement: payload.problemStatement,
      processDescription: payload.processDescription,
      status: "PENDING",
    },
    select: projectFullSelect,
  });
  return toProject(record);
}

export type UpdateProjectPayload = Partial<
  Pick<
    CreateProjectPayload,
    | "title"
    | "industry"
    | "department"
    | "companySize"
    | "problemStatement"
    | "processDescription"
  >
>;

export async function updateProject(
  id: string,
  payload: UpdateProjectPayload
): Promise<Project> {
  const record = await db.project.update({
    where: { id },
    data: payload,
    select: projectFullSelect,
  });
  return toProject(record);
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus
): Promise<void> {
  await db.project.update({ where: { id }, data: { status } });
}

export async function deleteProject(id: string): Promise<void> {
  await db.project.delete({ where: { id } });
}

// ─── Aggregates ───────────────────────────────────────────────────────────────

export async function countProjectsByUserId(userId: string): Promise<number> {
  return db.project.count({ where: { userId } });
}

export async function findRecentProjectsByUserId(
  userId: string,
  limit = 5
): Promise<ProjectSummary[]> {
  const records = await db.project.findMany({
    where: { userId },
    select: projectSummarySelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return records.map(toProjectSummary);
}
