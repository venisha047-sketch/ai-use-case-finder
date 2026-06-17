// ─────────────────────────────────────────────────────────────────────────────
// POST /api/webhooks/clerk — sync Clerk user lifecycle events to the database
//
// This route is PUBLIC (no Clerk auth middleware — Clerk calls it from their
// servers). Security is enforced via Svix webhook signature verification.
//
// Events handled:
//   user.created  → upsert User row
//   user.updated  → upsert User row (email/name/avatar changes)
//   user.deleted  → hard delete User row (cascades to projects + analyses)
// ─────────────────────────────────────────────────────────────────────────────

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { env } from "@/lib/env";
import { Errors } from "@/lib/errors";
import {
  upsertUser,
  deleteUser,
} from "@/lib/repositories/user.repository";
import {
  validate,
  ClerkWebhookEventSchema,
} from "@/lib/validations";

// This route must be excluded from Clerk middleware — handled in middleware.ts
export const POST = async (req: Request): Promise<NextResponse> => {
  // ── 1. Read raw body as text for signature verification ────────────────────
  const rawBody = await req.text();

  // ── 2. Extract Svix headers ────────────────────────────────────────────────
  const headersList = await headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    const err = Errors.webhookSignatureInvalid();
    return NextResponse.json(
      { success: false, error: { code: err.code, message: err.message } },
      { status: err.statusCode }
    );
  }

  // ── 3. Verify signature via Svix ──────────────────────────────────────────
  let payload: unknown;
  try {
    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
    payload = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    const err = Errors.webhookSignatureInvalid();
    return NextResponse.json(
      { success: false, error: { code: err.code, message: err.message } },
      { status: err.statusCode }
    );
  }

  // ── 4. Validate payload shape ─────────────────────────────────────────────
  let event;
  try {
    event = validate(ClerkWebhookEventSchema, payload);
  } catch {
    // Unknown event type — acknowledge receipt so Clerk doesn't retry
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // ── 5. Handle event ───────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const primaryEmail = event.data.email_addresses[0]?.email_address;

        if (!primaryEmail) {
          console.warn(`[Clerk webhook] User ${event.data.id} has no email address`);
          break;
        }

        const fullName = [event.data.first_name, event.data.last_name]
          .filter(Boolean)
          .join(" ") || null;

        await upsertUser({
          id: event.data.id,
          email: primaryEmail,
          name: fullName,
          imageUrl: event.data.image_url,
        });

        break;
      }

      case "user.deleted": {
        await deleteUser(event.data.id);
        break;
      }
    }
  } catch (err) {
    // Log but return 200 — prevents Clerk from retrying an unrecoverable error
    console.error(`[Clerk webhook] Failed to process ${event.type}:`, err);
  }

  return NextResponse.json({ received: true }, { status: 200 });
};
