// ─────────────────────────────────────────────────────────────────────────────
// API Types — Request / Response contracts for all API routes
//
// Every API route handler imports its shape from here so the contract
// between client and server is always in sync and fully typed.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Analysis,
  AnalysisSummary,
  CompanySize,
  DashboardStats,
  PaginatedResult,
  Project,
  ProjectSummary,
  ProjectWithLatestAnalysis,
} from "./index";

// ─── Standard API Envelope ────────────────────────────────────────────────────
// Every API route returns one of these two shapes.

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;        // machine-readable, e.g. "PROJECT_NOT_FOUND"
    message: string;     // human-readable
    details?: unknown;   // Zod validation errors or extra context
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── POST /api/webhooks/clerk ─────────────────────────────────────────────────

export interface ClerkWebhookUserCreated {
  id: string;
  email_addresses: Array<{ email_address: string; id: string }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}

export interface ClerkWebhookEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: ClerkWebhookUserCreated;
}

// ─── GET /api/dashboard/stats ─────────────────────────────────────────────────

export type GetDashboardStatsResponse = ApiResponse<DashboardStats>;

// ─── GET /api/projects ────────────────────────────────────────────────────────

export interface GetProjectsQuery {
  page?: number;
  pageSize?: number;
  industry?: string;
  status?: string;
  search?: string;
}

export type GetProjectsResponse = ApiResponse<PaginatedResult<ProjectSummary>>;

// ─── POST /api/projects ───────────────────────────────────────────────────────

export interface CreateProjectBody {
  title: string;
  industry: string;
  department: string;
  companySize: CompanySize;
  problemStatement: string;
  processDescription: string;
}

export type CreateProjectResponse = ApiResponse<Project>;

// ─── GET /api/projects/[id] ───────────────────────────────────────────────────

export type GetProjectResponse = ApiResponse<ProjectWithLatestAnalysis>;

// ─── PATCH /api/projects/[id] ────────────────────────────────────────────────

export type UpdateProjectBody = Partial<
  Pick<
    CreateProjectBody,
    | "title"
    | "industry"
    | "department"
    | "companySize"
    | "problemStatement"
    | "processDescription"
  >
>;

export type UpdateProjectResponse = ApiResponse<Project>;

// ─── DELETE /api/projects/[id] ────────────────────────────────────────────────

export type DeleteProjectResponse = ApiResponse<{ id: string }>;

// ─── POST /api/analysis ───────────────────────────────────────────────────────

export interface CreateAnalysisBody {
  projectId: string;
}

export type CreateAnalysisResponse = ApiResponse<Analysis>;

// ─── GET /api/analysis/[id] ───────────────────────────────────────────────────

export type GetAnalysisResponse = ApiResponse<Analysis>;

// ─── GET /api/analysis/[id]/export ───────────────────────────────────────────
// Returns a binary PDF stream — no JSON envelope.
// The route sets Content-Type: application/pdf and Content-Disposition: attachment

// ─── Error Codes ──────────────────────────────────────────────────────────────
// Centralised registry of all machine-readable error codes used in ApiError

export const API_ERROR_CODES = {
  // Auth
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_JSON: "INVALID_JSON",

  // Resources
  PROJECT_NOT_FOUND: "PROJECT_NOT_FOUND",
  ANALYSIS_NOT_FOUND: "ANALYSIS_NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",

  // Business logic
  PROJECT_ALREADY_ANALYZING: "PROJECT_ALREADY_ANALYZING",
  ANALYSIS_LIMIT_REACHED: "ANALYSIS_LIMIT_REACHED",

  // External services
  GEMINI_ERROR: "GEMINI_ERROR",
  GEMINI_PARSE_ERROR: "GEMINI_PARSE_ERROR",
  GEMINI_TIMEOUT: "GEMINI_TIMEOUT",

  // Infrastructure
  DATABASE_ERROR: "DATABASE_ERROR",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",

  // Webhooks
  WEBHOOK_SIGNATURE_INVALID: "WEBHOOK_SIGNATURE_INVALID",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

// ─── HTTP Status Map ──────────────────────────────────────────────────────────
// Maps each error code to its canonical HTTP status code

export const ERROR_STATUS_MAP: Record<ApiErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  VALIDATION_ERROR: 422,
  INVALID_JSON: 400,
  PROJECT_NOT_FOUND: 404,
  ANALYSIS_NOT_FOUND: 404,
  USER_NOT_FOUND: 404,
  PROJECT_ALREADY_ANALYZING: 409,
  ANALYSIS_LIMIT_REACHED: 429,
  GEMINI_ERROR: 502,
  GEMINI_PARSE_ERROR: 502,
  GEMINI_TIMEOUT: 504,
  DATABASE_ERROR: 500,
  INTERNAL_SERVER_ERROR: 500,
  WEBHOOK_SIGNATURE_INVALID: 401,
};

// ─── Route Params ─────────────────────────────────────────────────────────────
// Next.js App Router passes params as Promise<{ id: string }> in Next 15

export interface RouteParams {
  params: Promise<Record<string, string>>;
}
