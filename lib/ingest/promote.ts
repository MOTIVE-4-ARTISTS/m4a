import "server-only";

import { embedOpportunity } from "@/lib/ai/embed";
import { validatedOpportunityDraftSchema } from "@/lib/opportunities/schema";
import { canonicalKey, slugify } from "@/lib/opportunities/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, OpportunitySubmission } from "@/lib/supabase/types";

// Promote a reviewed submission into a live `opportunities` row. Called from
// the admin approve action AFTER a human has eyeballed (and possibly edited)
// the row — so unlike the ingest path this does NOT re-gate on confidence:
// human approval is the gate.
//
// Runs entirely through the service-role admin client: it writes the
// `opportunities` row, an `opportunity_sources` provenance row (a
// service-role-only table), and reuses the embedding the ingest pipeline
// already computed when available.

export type PromoteResult = { ok: true; opportunity_id: string } | { ok: false; reason: string };

// canonical_key needs a fiscal-year/window token. Prefer the one the ingest
// pipeline stashed in raw_payload; otherwise derive it from the deadline year
// (or "rolling"), matching lib/opportunities/slug.ts conventions.
function deriveWindow(sub: OpportunitySubmission): string {
  const stashed = (sub.raw_payload as { extracted?: { fiscalYearOrWindow?: unknown } })?.extracted
    ?.fiscalYearOrWindow;
  if (typeof stashed === "string" && stashed.trim().length > 0) return stashed;
  if (sub.is_rolling || !sub.deadline) return "rolling";
  const year = sub.deadline.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : "rolling";
}

export async function promoteSubmission(
  sub: OpportunitySubmission,
  reviewer: string,
): Promise<PromoteResult> {
  const supabase = createAdminClient();
  if (!supabase) return { ok: false, reason: "Supabase is not configured." };

  // Assemble a full draft from the (possibly partial) submission, applying
  // the same safe defaults the seed importer uses, then validate. A
  // validation failure here is the signal the reviewer must edit-then-approve
  // (e.g. a community submission missing its description).
  const parsed = validatedOpportunityDraftSchema.safeParse({
    name: sub.name,
    funder_name: sub.funder_name,
    type: sub.type,
    deadline: sub.deadline,
    is_rolling: sub.is_rolling,
    amount_min_cents: sub.amount_min_cents,
    amount_max_cents: sub.amount_max_cents,
    amount_display: sub.amount_display,
    eligibility_individual: sub.eligibility_individual ?? false,
    eligibility_fiscal_sponsor: sub.eligibility_fiscal_sponsor ?? false,
    eligibility_501c3: sub.eligibility_501c3 ?? false,
    location_requirement: sub.location_requirement ?? "national",
    application_fee_cents: sub.application_fee_cents ?? 0,
    discipline_tags: sub.discipline_tags,
    genre_tags: sub.genre_tags,
    career_stage: sub.career_stage,
    equity_tags: sub.equity_tags,
    description_short: sub.description_short ?? "",
    source_url: sub.source_url,
    application_platform: sub.application_platform,
    verified_by: `editor:${reviewer}`,
  });
  if (!parsed.success) {
    return {
      ok: false,
      reason: parsed.error.issues[0]?.message ?? "Submission is missing required fields.",
    };
  }
  const draft = parsed.data;

  const key = canonicalKey(draft.funder_name, draft.name, deriveWindow(sub));
  const funderSlug = slugify(draft.funder_name);

  let embedding = sub.embedding;
  if (!embedding) {
    try {
      embedding = await embedOpportunity({
        name: draft.name,
        funder_name: draft.funder_name,
        type: draft.type,
        description_short: draft.description_short,
        discipline_tags: draft.discipline_tags,
        career_stage: draft.career_stage,
        equity_tags: draft.equity_tags,
      });
    } catch {
      embedding = null;
    }
  }

  const row: Database["public"]["Tables"]["opportunities"]["Insert"] = {
    canonical_key: key,
    name: draft.name,
    funder_name: draft.funder_name,
    funder_slug: funderSlug,
    type: draft.type,
    deadline: draft.deadline ?? null,
    is_rolling: draft.is_rolling,
    application_window: null,
    amount_min_cents: draft.amount_min_cents ?? null,
    amount_max_cents: draft.amount_max_cents ?? null,
    amount_display: draft.amount_display ?? null,
    eligibility_individual: draft.eligibility_individual,
    eligibility_fiscal_sponsor: draft.eligibility_fiscal_sponsor,
    eligibility_501c3: draft.eligibility_501c3,
    location_requirement: draft.location_requirement,
    application_fee_cents: draft.application_fee_cents,
    discipline_tags: draft.discipline_tags,
    genre_tags: draft.genre_tags,
    career_stage: draft.career_stage,
    equity_tags: draft.equity_tags,
    description_short: draft.description_short,
    source_url: draft.source_url,
    application_platform: draft.application_platform ?? null,
    verified_by: draft.verified_by,
    embedding,
  };

  type InsertChain = {
    upsert: (
      v: Database["public"]["Tables"]["opportunities"]["Insert"],
      opts: { onConflict: string },
    ) => {
      select: (cols: string) => {
        single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
      };
    };
  };
  const opps = (supabase as unknown as { from: (t: string) => InsertChain }).from("opportunities");
  const { data, error } = await opps
    .upsert(row, { onConflict: "canonical_key" })
    .select("id")
    .single();
  if (error || !data) {
    return { ok: false, reason: error?.message ?? "Insert returned no row." };
  }

  // Provenance: record that an editor promoted this from the review queue.
  type ProvChain = {
    upsert: (
      v: Database["public"]["Tables"]["opportunity_sources"]["Insert"],
      opts: { onConflict: string },
    ) => Promise<{ error: { message: string } | null }>;
  };
  const sources = (supabase as unknown as { from: (t: string) => ProvChain }).from(
    "opportunity_sources",
  );
  await sources.upsert(
    {
      opportunity_id: data.id,
      source: `review:${sub.submission_kind}`,
      source_url: draft.source_url,
      raw_payload: { promoted_from_submission: sub.id, reviewer },
    },
    { onConflict: "opportunity_id,source,source_url" },
  );

  return { ok: true, opportunity_id: data.id };
}
