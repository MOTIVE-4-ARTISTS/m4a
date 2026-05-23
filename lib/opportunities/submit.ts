"use server";

import "server-only";

import { z } from "zod";
import { serverEnv } from "@/lib/env/server";
import {
  CAREER_STAGES,
  DISCIPLINE_TAGS,
  EQUITY_TAGS,
  LOCATION_REQUIREMENTS,
  OPPORTUNITY_TYPES,
} from "@/lib/opportunities/schema";
import { slugify } from "@/lib/opportunities/slug";
import { actionError, err, ok, type Result } from "@/lib/result";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import { emailSchema, VALIDATION_LIMITS } from "@/lib/validation";

// Community opportunity submission.
//
// Writes to `opportunity_submissions` (status='pending') for editorial
// review. Never writes directly to `opportunities` — the editor is the
// only path from "someone on the internet says this is a thing" to
// "the directory shows it."
//
// Editor review flow (v1): the editor reads pending submissions via
// the Supabase admin client or a small admin route (lands when the
// broader admin dashboard does — see the AGENTS.md roadmap). A weekly
// digest email with one-click approve/reject is deferred to v2 to keep
// the v1 surface minimal.
//
// Turnstile is consulted when configured; in pre-config environments
// the gate degrades to "open" and we log a warning so the editor knows
// to expect bot noise until the secret is wired.

const submitSchema = z.object({
  name: z.string().trim().min(1).max(200),
  funder_name: z.string().trim().min(1).max(200),
  type: z.enum(OPPORTUNITY_TYPES),
  source_url: z
    .string()
    .url()
    .regex(/^https?:\/\//, "URL must be http(s)://"),
  deadline: z.string().date().nullable().optional(),
  is_rolling: z
    .union([
      z.literal("on"),
      z.literal("true"),
      z.literal("1"),
      z.literal(""),
      z.null(),
      z.undefined(),
    ])
    .optional()
    .transform((v) => v === "on" || v === "true" || v === "1"),
  amount_display: z.string().trim().max(120).optional(),
  location_requirement: z.enum(LOCATION_REQUIREMENTS).optional(),
  eligibility_individual: z.union([z.literal("on"), z.undefined()]).transform((v) => v === "on"),
  eligibility_fiscal_sponsor: z
    .union([z.literal("on"), z.undefined()])
    .transform((v) => v === "on"),
  eligibility_501c3: z.union([z.literal("on"), z.undefined()]).transform((v) => v === "on"),
  discipline_tags: z.array(z.enum(DISCIPLINE_TAGS)).optional().default([]),
  career_stage: z.array(z.enum(CAREER_STAGES)).optional().default([]),
  equity_tags: z.array(z.enum(EQUITY_TAGS)).optional().default([]),
  description_short: z.string().trim().min(20).max(200),
  submitter_email: emailSchema.optional(),
  // Cloudflare Turnstile token issued client-side. Optional in pre-
  // configured dev environments; the server gates open in that mode.
  "cf-turnstile-response": z.string().optional(),
  // Honeypot — should always be empty for a human submission. Form
  // renders this field visually-hidden via CSS so bots happily fill it.
  hp_field: z.string().max(VALIDATION_LIMITS.NAME_MAX).optional(),
});

export type SubmitOk = {
  readonly submission_id: string;
  readonly message: string;
};
export type SubmitResult = Result<SubmitOk>;

export async function submitOpportunity(
  _prev: SubmitResult | null,
  formData: FormData,
): Promise<SubmitResult> {
  // Multi-select fields arrive as repeated form keys; getAll() returns []
  // when unchecked. Bool toggles arrive as "on" / absent.
  const raw = {
    name: formData.get("name"),
    funder_name: formData.get("funder_name"),
    type: formData.get("type"),
    source_url: formData.get("source_url"),
    deadline: formData.get("deadline") || null,
    is_rolling: formData.get("is_rolling") ?? undefined,
    amount_display: formData.get("amount_display") ?? undefined,
    location_requirement: formData.get("location_requirement") ?? undefined,
    eligibility_individual: formData.get("eligibility_individual") ?? undefined,
    eligibility_fiscal_sponsor: formData.get("eligibility_fiscal_sponsor") ?? undefined,
    eligibility_501c3: formData.get("eligibility_501c3") ?? undefined,
    discipline_tags: formData.getAll("discipline_tags"),
    career_stage: formData.getAll("career_stage"),
    equity_tags: formData.getAll("equity_tags"),
    description_short: formData.get("description_short"),
    submitter_email: formData.get("submitter_email") || undefined,
    "cf-turnstile-response": formData.get("cf-turnstile-response") ?? undefined,
    hp_field: formData.get("hp_field") ?? undefined,
  };

  const parsed = submitSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return err(
      actionError(
        "invalid_input",
        first?.message ?? "double-check the highlighted fields and try again.",
      ),
    );
  }

  // Honeypot trip — pretend success so bots don't learn we filtered.
  // Mirrors the pattern in lib/applications/submit.ts.
  if (parsed.data.hp_field) {
    console.warn("[opportunity-submit] honeypot tripped");
    return ok({ submission_id: "honeypot", message: "thanks — we've got it." });
  }

  // Turnstile gate. When the secret isn't configured we let the request
  // through and log; once Turnstile is provisioned, this becomes the
  // line of defense against bulk spam.
  const turnstileSecret = serverEnv.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const token = parsed.data["cf-turnstile-response"];
    if (!token) {
      return err(actionError("unauthorized", "couldn't verify the captcha. give it another try."));
    }
    const ok = await verifyTurnstile(turnstileSecret, token);
    if (!ok) {
      return err(actionError("unauthorized", "couldn't verify the captcha. give it another try."));
    }
  } else {
    console.warn("[opportunity-submit] Turnstile secret not configured — gate is open");
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return err(
      actionError(
        "dependency_unavailable",
        "submissions aren't accepting input yet — email hello@motive4artists.org and we'll handle it manually.",
      ),
    );
  }

  const row: Database["public"]["Tables"]["opportunity_submissions"]["Insert"] = {
    name: parsed.data.name,
    funder_name: parsed.data.funder_name,
    funder_slug: slugify(parsed.data.funder_name),
    type: parsed.data.type,
    deadline: parsed.data.deadline ?? null,
    is_rolling: parsed.data.is_rolling,
    amount_display: parsed.data.amount_display ?? null,
    location_requirement: parsed.data.location_requirement ?? null,
    eligibility_individual: parsed.data.eligibility_individual,
    eligibility_fiscal_sponsor: parsed.data.eligibility_fiscal_sponsor,
    eligibility_501c3: parsed.data.eligibility_501c3,
    discipline_tags: parsed.data.discipline_tags,
    career_stage: parsed.data.career_stage,
    equity_tags: parsed.data.equity_tags,
    description_short: parsed.data.description_short,
    source_url: parsed.data.source_url,
    submitter_email: parsed.data.submitter_email ?? null,
    status: "pending",
  };

  type Chain = {
    insert: (v: Database["public"]["Tables"]["opportunity_submissions"]["Insert"]) => {
      select: (cols: string) => {
        single: () => Promise<{
          data: { id: string } | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
  const table = (supabase as unknown as { from: (t: string) => Chain }).from(
    "opportunity_submissions",
  );

  const { data, error } = await table.insert(row).select("id").single();
  if (error || !data) {
    console.error("[opportunity-submit] insert failed", error);
    return err(actionError("server_error", "something broke on our end. try again in a moment."));
  }

  return ok({
    submission_id: data.id,
    message: "thanks — we've got it. you'll see it on the page after our weekly review.",
  });
}

async function verifyTurnstile(secret: string, token: string): Promise<boolean> {
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }).toString(),
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}
