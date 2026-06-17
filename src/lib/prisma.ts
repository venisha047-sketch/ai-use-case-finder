// ─────────────────────────────────────────────────────────────────────────────
// Prisma Client Singleton
//
// Next.js dev mode hot-reloads modules on every save, which would create a
// new PrismaClient instance on each reload and exhaust the connection pool.
// The global cache pattern ensures only one client exists per process.
//
// In production, module-level state persists for the lifetime of the function
// instance so the global trick is not needed — but it's harmless to include.
//
// Usage:
//   import { db } from "@/lib/prisma";
//   const user = await db.user.findUnique({ where: { id } });
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import { isDev } from "./env";

// ─── Factory ──────────────────────────────────────────────────────────────────
// In Prisma 7 the database URL is sourced from prisma.config.ts, not the
// constructor. Logging is still configurable here.

function createPrismaClient() {
  return new PrismaClient({
    log: isDev ? ["query", "error", "warn"] : ["error"],
  });
}

// ─── Global cache type ────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const db: PrismaClient = globalThis.__prisma ?? createPrismaClient();

if (isDev) {
  globalThis.__prisma = db;
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────
// Ensures open connections are closed when the process exits.
// Required for long-running Next.js server processes and serverless warm starts.

process.on("beforeExit", async () => {
  await db.$disconnect();
});
