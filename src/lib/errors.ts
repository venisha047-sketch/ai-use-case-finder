// ─────────────────────────────────────────────────────────────────────────────
// Error Handling Utilities
//
// Three responsibilities:
//   1. AppError — typed application error class carrying a code + HTTP status
//   2. Factory helpers — one-liner constructors for every error code
//   3. withApiHandler — route wrapper that catches all errors and converts them
//      to the standard ApiError envelope with the correct HTTP status code
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import {
  API_ERROR_CODES,
  ERROR_STATUS_MAP,
  type ApiErrorCode,
  type ApiError,
  type ApiSuccess,
} from "@/types/api";
import { GeminiServiceError } from "./gemini";
import { isDev } from "./env";

// ─── AppError ─────────────────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = ERROR_STATUS_MAP[code];
    this.details = details;
  }
}

// ─── Error factories ──────────────────────────────────────────────────────────

export const Errors = {
  unauthorized: (message = "Authentication required") =>
    new AppError(API_ERROR_CODES.UNAUTHORIZED, message),

  forbidden: (message = "You do not have permission to access this resource") =>
    new AppError(API_ERROR_CODES.FORBIDDEN, message),

  projectNotFound: (id?: string) =>
    new AppError(
      API_ERROR_CODES.PROJECT_NOT_FOUND,
      id ? `Project '${id}' not found` : "Project not found"
    ),

  analysisNotFound: (id?: string) =>
    new AppError(
      API_ERROR_CODES.ANALYSIS_NOT_FOUND,
      id ? `Analysis '${id}' not found` : "Analysis not found"
    ),

  userNotFound: (id?: string) =>
    new AppError(
      API_ERROR_CODES.USER_NOT_FOUND,
      id ? `User '${id}' not found` : "User not found"
    ),

  validationError: (details: unknown) =>
    new AppError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "Request validation failed",
      details
    ),

  invalidJson: () =>
    new AppError(API_ERROR_CODES.INVALID_JSON, "Request body is not valid JSON"),

  projectAlreadyAnalyzing: (id: string) =>
    new AppError(
      API_ERROR_CODES.PROJECT_ALREADY_ANALYZING,
      `Project '${id}' already has an analysis in progress`
    ),

  analysisLimitReached: () =>
    new AppError(
      API_ERROR_CODES.ANALYSIS_LIMIT_REACHED,
      "Analysis rate limit reached. Please wait before running another analysis."
    ),

  geminiError: (message: string, cause?: unknown) =>
    new AppError(API_ERROR_CODES.GEMINI_ERROR, message, isDev ? cause : undefined),

  geminiParseError: (message: string, cause?: unknown) =>
    new AppError(
      API_ERROR_CODES.GEMINI_PARSE_ERROR,
      message,
      isDev ? cause : undefined
    ),

  geminiTimeout: () =>
    new AppError(
      API_ERROR_CODES.GEMINI_TIMEOUT,
      "AI analysis timed out. Please try again."
    ),

  databaseError: (cause?: unknown) =>
    new AppError(
      API_ERROR_CODES.DATABASE_ERROR,
      "A database error occurred",
      isDev ? cause : undefined
    ),

  webhookSignatureInvalid: () =>
    new AppError(
      API_ERROR_CODES.WEBHOOK_SIGNATURE_INVALID,
      "Webhook signature verification failed"
    ),

  internal: (cause?: unknown) =>
    new AppError(
      API_ERROR_CODES.INTERNAL_SERVER_ERROR,
      "An unexpected error occurred",
      isDev ? cause : undefined
    ),
} as const;

// ─── Response builders ────────────────────────────────────────────────────────

export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, ...(message && { message }) }, { status });
}

export function errorResponse(err: AppError): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
      },
    },
    { status: err.statusCode }
  );
}

// ─── Error classifier ──────────────────────────────────────────────────────────
// Converts any unknown thrown value into an AppError.

function classifyError(err: unknown): AppError {
  // Already an AppError — pass through
  if (err instanceof AppError) {
    return err;
  }

  // Zod validation error
  if (err instanceof ZodError) {
    return Errors.validationError(
      err.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
    );
  }

  // Gemini service errors
  if (err instanceof GeminiServiceError) {
    if (err.code === "GEMINI_TIMEOUT") return Errors.geminiTimeout();
    if (err.code === "GEMINI_PARSE_ERROR")
      return Errors.geminiParseError(err.message, err.cause);
    return Errors.geminiError(err.message, err.cause);
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      // Record not found — surfaced as a generic 404
      return new AppError(
        API_ERROR_CODES.PROJECT_NOT_FOUND,
        "The requested record does not exist"
      );
    }
    if (err.code === "P2002") {
      return Errors.validationError(`Unique constraint violation on: ${err.meta?.target}`);
    }
    return Errors.databaseError(isDev ? { prismaCode: err.code, meta: err.meta } : undefined);
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return Errors.databaseError(isDev ? err.message : undefined);
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return Errors.databaseError(isDev ? err.message : undefined);
  }

  // Generic Error
  if (err instanceof Error) {
    return Errors.internal(isDev ? { message: err.message, stack: err.stack } : undefined);
  }

  return Errors.internal(isDev ? err : undefined);
}

// ─── Route handler wrapper ────────────────────────────────────────────────────
// Wraps any async route handler. Any thrown error is caught, classified, and
// returned as a well-formed ApiError JSON response with the correct HTTP status.
//
// Usage:
//   export const GET = withApiHandler(async (req) => {
//     const data = await someService.getData();
//     return successResponse(data);
//   });

type RouteHandler<T> = (
  req: Request,
  context: { params: Promise<Record<string, string>> }
) => Promise<NextResponse<T>>;

export function withApiHandler<T>(
  handler: RouteHandler<T>
): RouteHandler<T | ApiError> {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (err) {
      const appErr = classifyError(err);

      // Log server-side for observability — never expose stack to client
      if (appErr.statusCode >= 500) {
        console.error(`[API Error] ${appErr.code}:`, err);
      }

      return errorResponse(appErr) as NextResponse<ApiError>;
    }
  };
}

// ─── Auth guard helper ────────────────────────────────────────────────────────
// Throws immediately if userId is null (Clerk middleware should prevent this,
// but this is a defence-in-depth guard for direct API calls).

export function requireAuth(userId: string | null | undefined): asserts userId is string {
  if (!userId) {
    throw Errors.unauthorized();
  }
}

// ─── Ownership guard helper ───────────────────────────────────────────────────
// Throws 403 if the authenticated user does not own the resource.

export function requireOwnership(
  resourceUserId: string,
  authenticatedUserId: string
): void {
  if (resourceUserId !== authenticatedUserId) {
    throw Errors.forbidden();
  }
}

// ─── Parse request body helper ────────────────────────────────────────────────

export async function parseBody<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw Errors.invalidJson();
  }
}
