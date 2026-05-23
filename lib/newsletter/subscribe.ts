"use server";

import "server-only";
import { z } from "zod";
import { serverEnv } from "@/lib/env/server";
import { actionError, err, ok, type Result } from "@/lib/result";
import { emailSchema, sourceSchema } from "@/lib/validation";

// Degrades gracefully until Phase 4 lands the Supabase `subscribers` table
// and Phase 7 wires Resend Broadcasts: the action validates input, logs the
// address server-side for later manual import, and reports "queued" so the
// form is useful pre-launch. The Result<T, E> contract is final — the
// happy-path payload won't change when Resend/Supabase are wired.

const schema = z.object({
  email: emailSchema,
  source: sourceSchema.optional(),
});

export type SubscribeOk = { readonly message: string };
export type SubscribeResult = Result<SubscribeOk>;

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
    return err(actionError("invalid_input", first?.message ?? "That email doesn't look right."));
  }

  const hasResend = Boolean(serverEnv.RESEND_API_KEY);

  if (!hasResend) {
    console.warn(`[newsletter] subscribe queued (Resend not configured): ${parsed.data.email}`);
    return ok({
      message:
        "Thanks — we've got your email. You'll hear from us once we send our first dispatch.",
    });
  }

  // TODO(eran, 2026-Q3): write to Supabase subscribers + send Resend confirmation.
  return ok({
    message: "Thanks for subscribing. Check your inbox for a confirmation link.",
  });
}
