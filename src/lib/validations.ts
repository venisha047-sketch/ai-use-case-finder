// ─────────────────────────────────────────────────────────────────────────────
// Validation Schemas — Zod schemas for all API request inputs
//
// These schemas are the single source of truth for what each API route accepts.
// They are shared between:
//   - Server-side route handlers (request body / query param validation)
//   - Client-side React Hook Form (via zodResolver) for instant field-level feedback
//
// Every schema is exported alongside its inferred TypeScript type so callers
// never need to maintain a separate interface.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

// ─── Reusable primitives ──────────────────────────────────────────────────────

const nonEmptyString = (label: string, max = 255) =>
  z
    .string()
    .min(1, `${label} cannot be empty`)
    .max(max, `${label} must be ${max} characters or fewer`)
    .transform((v) => v.trim());

const cuidId = z
  .string()
  .cuid("Must be a valid resource ID");

const positiveInt = (label: string, min = 1, max = 100) =>
  z
    .number()
    .int(`${label} must be a whole number`)
    .min(min, `${label} must be at least ${min}`)
    .max(max, `${label} must be at most ${max}`);

// ─── Enums ────────────────────────────────────────────────────────────────────

export const CompanySizeSchema = z.enum(
  ["STARTUP", "SMALL_BUSINESS", "MID_MARKET", "ENTERPRISE"] as const
);

export const ProjectStatusSchema = z.enum(
  ["PENDING", "ANALYZING", "COMPLETED", "FAILED"] as const
);

// ─── Industry / Department allow-lists ────────────────────────────────────────
// Validated as free-text (no closed enum) — organisations can enter custom values.
// Minimum length prevents empty submissions; maximum prevents abuse.

const industrySchema = nonEmptyString("Industry", 100);
const departmentSchema = nonEmptyString("Department", 100);

// ─── POST /api/projects ───────────────────────────────────────────────────────

export const CreateProjectSchema = z.object({
  title: nonEmptyString("Title", 120),

  industry: industrySchema,

  department: departmentSchema,

  companySize: CompanySizeSchema,

  problemStatement: z
    .string()
    .min(20, "Problem statement must be at least 20 characters — please provide more detail")
    .max(2000, "Problem statement must be 2,000 characters or fewer")
    .transform((v) => v.trim()),

  processDescription: z
    .string()
    .min(20, "Process description must be at least 20 characters — please provide more detail")
    .max(3000, "Process description must be 3,000 characters or fewer")
    .transform((v) => v.trim()),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

// ─── PATCH /api/projects/[id] ─────────────────────────────────────────────────
// All fields optional — only send what changed.

export const UpdateProjectSchema = CreateProjectSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

// ─── POST /api/analysis ───────────────────────────────────────────────────────

export const CreateAnalysisSchema = z.object({
  projectId: cuidId,
});

export type CreateAnalysisInput = z.infer<typeof CreateAnalysisSchema>;

// ─── GET /api/projects — query params ────────────────────────────────────────
// Query params arrive as strings; coerce to the right types before use.

export const GetProjectsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(positiveInt("Page", 1, 10_000)),

  pageSize: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 10))
    .pipe(positiveInt("Page size", 1, 100)),

  industry: z.string().max(100).optional(),

  status: ProjectStatusSchema.optional(),

  search: z
    .string()
    .max(200, "Search query must be 200 characters or fewer")
    .optional()
    .transform((v) => v?.trim() || undefined),
});

export type GetProjectsQueryInput = z.infer<typeof GetProjectsQuerySchema>;

// ─── Route ID param ───────────────────────────────────────────────────────────

export const RouteIdSchema = z.object({
  id: cuidId,
});

export type RouteIdInput = z.infer<typeof RouteIdSchema>;

// ─── POST /api/webhooks/clerk ─────────────────────────────────────────────────

export const ClerkWebhookUserSchema = z.object({
  id: z.string().min(1),
  email_addresses: z
    .array(
      z.object({
        email_address: z.string().email(),
        id: z.string(),
      })
    )
    .min(1, "User must have at least one email address"),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  image_url: z.string().url().nullable(),
});

export const ClerkWebhookEventSchema = z.object({
  type: z.enum(["user.created", "user.updated", "user.deleted"]),
  data: ClerkWebhookUserSchema,
});

export type ClerkWebhookEventInput = z.infer<typeof ClerkWebhookEventSchema>;

// ─── Validation helper ────────────────────────────────────────────────────────
// Parses data against a schema and throws an AppError-compatible ZodError
// that `classifyError` in errors.ts will convert to a 422 response.

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    // Re-throw as ZodError so classifyError in errors.ts handles it uniformly
    throw result.error;
  }
  return result.data;
}

// ─── Query param parser ───────────────────────────────────────────────────────
// Converts a URL's search params into a plain object for schema validation.

export function parseSearchParams(
  url: string
): Record<string, string | undefined> {
  const { searchParams } = new URL(url);
  return Object.fromEntries(searchParams.entries());
}
