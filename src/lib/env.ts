// ─────────────────────────────────────────────────────────────────────────────
// Environment Configuration — Type-safe runtime validation
//
// All environment variables are validated at startup using Zod.
// If a required variable is missing or malformed the app crashes immediately
// with a descriptive error rather than failing silently at runtime.
//
// Usage:
//   import { env } from "@/lib/env";
//   env.GEMINI_API_KEY   // fully typed, guaranteed non-empty string
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

// ─── Schema ───────────────────────────────────────────────────────────────────

const envSchema = z.object({
  // ── Node runtime ────────────────────────────────────────────────────────────
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // ── Database ─────────────────────────────────────────────────────────────────
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid PostgreSQL connection string")
    .startsWith("postgresql://", {
      message: "DATABASE_URL must start with 'postgresql://'",
    }),

  // ── Gemini AI ────────────────────────────────────────────────────────────────
  GEMINI_API_KEY: z
    .string()
    .min(20, "GEMINI_API_KEY appears too short — check your Google AI Studio key"),

  GEMINI_MODEL: z
    .string()
    .default("gemini-2.5-flash"),

  GEMINI_MAX_OUTPUT_TOKENS: z
    .string()
    .default("8192")
    .transform(Number)
    .pipe(z.number().int().min(1024).max(65536)),

  GEMINI_TIMEOUT_MS: z
    .string()
    .default("60000")
    .transform(Number)
    .pipe(z.number().int().min(5000).max(120000)),

  // ── Clerk Authentication ──────────────────────────────────────────────────────
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .startsWith("pk_", {
      message: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with 'pk_'",
    }),

  CLERK_SECRET_KEY: z
    .string()
    .startsWith("sk_", {
      message: "CLERK_SECRET_KEY must start with 'sk_'",
    }),

  CLERK_WEBHOOK_SECRET: z
    .string()
    .startsWith("whsec_", {
      message: "CLERK_WEBHOOK_SECRET must start with 'whsec_'",
    }),

  // ── Clerk redirect URLs ───────────────────────────────────────────────────────
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default("/dashboard"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default("/dashboard"),

  // ── App ───────────────────────────────────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .default("http://localhost:3000"),

  // ── Rate limiting (optional, safe defaults provided) ─────────────────────────
  ANALYSIS_RATE_LIMIT_PER_HOUR: z
    .string()
    .default("10")
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),
});

// ─── Validation ───────────────────────────────────────────────────────────────

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `\n\n❌ Invalid environment variables:\n${formatted}\n\n` +
        `Check your .env.local file and ensure all required variables are set.\n`
    );
  }

  return result.data;
}

// ─── Singleton export ─────────────────────────────────────────────────────────
// Validated once at module load time. Subsequent imports reuse the cached result.

export const env = validateEnv();

// ─── Derived helpers ──────────────────────────────────────────────────────────

export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";

// ─── Type export ──────────────────────────────────────────────────────────────

export type Env = z.infer<typeof envSchema>;
