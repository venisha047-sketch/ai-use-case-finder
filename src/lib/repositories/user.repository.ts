// ─────────────────────────────────────────────────────────────────────────────
// User Repository — all Prisma calls relating to the User model
//
// The repository layer is the only place in the codebase that imports `db`
// and calls Prisma directly. Services call repositories; routes call services.
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "@/lib/prisma";
import type { User } from "@/types/index";

// ─── Mappers ──────────────────────────────────────────────────────────────────
// Convert raw Prisma records to domain types. Keeps @prisma/client out of
// type signatures that leak to higher layers.

function toUser(record: {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): User {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    imageUrl: record.imageUrl,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function findUserById(id: string): Promise<User | null> {
  const record = await db.user.findUnique({ where: { id } });
  return record ? toUser(record) : null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const record = await db.user.findUnique({ where: { email } });
  return record ? toUser(record) : null;
}

export async function userExists(id: string): Promise<boolean> {
  const count = await db.user.count({ where: { id } });
  return count > 0;
}

// ─── Write ────────────────────────────────────────────────────────────────────

export interface UpsertUserPayload {
  id: string;
  email: string;
  name?: string | null;
  imageUrl?: string | null;
}

/**
 * Creates or updates a user row — called by the Clerk webhook handler
 * on user.created and user.updated events.
 */
export async function upsertUser(payload: UpsertUserPayload): Promise<User> {
  const record = await db.user.upsert({
    where: { id: payload.id },
    create: {
      id: payload.id,
      email: payload.email,
      name: payload.name ?? null,
      imageUrl: payload.imageUrl ?? null,
    },
    update: {
      email: payload.email,
      name: payload.name ?? null,
      imageUrl: payload.imageUrl ?? null,
    },
  });
  return toUser(record);
}

/**
 * Hard-deletes the user and all owned data via cascade.
 * Called by the Clerk user.deleted webhook event.
 */
export async function deleteUser(id: string): Promise<void> {
  await db.user.delete({ where: { id } });
}

/**
 * Fallback sync: if the Clerk webhook hasn't fired yet (e.g. first login
 * before the webhook endpoint was configured), this upserts the user row
 * using data fetched from the Clerk API so the DB FK is never missing.
 *
 * Call this at the start of any route that creates user-owned data.
 */
export async function ensureUserSynced(userId: string): Promise<void> {
  const exists = await userExists(userId);
  if (exists) return;

  try {
    // Lazy import keeps @clerk/nextjs/server out of the repository at bundle time
    const { currentUser } = await import("@clerk/nextjs/server");
    const clerkUser = await currentUser();
    if (!clerkUser || clerkUser.id !== userId) return;

    const primaryEmail = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    );
    if (!primaryEmail) return;

    await upsertUser({
      id: clerkUser.id,
      email: primaryEmail.emailAddress,
      name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
      imageUrl: clerkUser.imageUrl ?? null,
    });
  } catch {
    // Best-effort: if Clerk API is unavailable, let the DB FK error surface naturally
  }
}
