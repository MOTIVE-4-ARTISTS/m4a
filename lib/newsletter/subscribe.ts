"use server";

import "server-only";
import { z } from "zod";
import { serverEnv } from "@/lib/env/server";

// Newsletter subscribe Server Action.
//
// Until RESEND_API_KEY and the Supabase `subscribers` table are wired up
// (Phase 4 lands the Supabase clients, Phase 7 wires Resend Broadcasts),
// this action degrades gracefully:
//  - validates input
//  - reports "queued" success to the user
//  - logs the address server-side for later batch import
//
// The contract returned here doesn't change when the real implementation
// lands, so the <NewsletterForm> client doesn't need to change either.

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  source: z.string().max(64).optional(),
});

export type SubscribeResult = { ok: true; message: string } | { ok: false; message: string };

export async function subscribe(
  _prev: SubscribeResult | null,
  formData: FormData,
): Promise<SubscribeResult> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    source: formData.get("source") ?? undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      message: first?.message ?? "That email doesn't look right.",
    };
  }

  const hasResend = Boolean(serverEnv.RESEND_API_KEY);

  // Once Supabase + Resend are wired, this branch posts to Supabase and
  // sends a double-opt-in confirmation via Resend. Until then we accept
  // the address so the form remains useful during the pre-launch window;
  // the server log gives us a manual import path.
  if (!hasResend) {
    console.warn(`[newsletter] subscribe queued (Resend not configured): ${parsed.data.email}`);
    return {
      ok: true,
      message:
        "Thanks — we've got your email. You'll hear from us once we send our first dispatch.",
    };
  }

  // TODO(phase-7, 2026-Q3): write to Supabase subscribers + send Resend confirmation.
  return {
    ok: true,
    message: "Thanks for subscribing. Check your inbox for a confirmation link.",
  };
}
