import "server-only";

import { EmbedError, embedOpportunity } from "@/lib/ai/embed";
import type { ExtractedOpportunity } from "@/lib/ai/extract-opportunity";
import { canonicalKey, slugify } from "@/lib/opportunities/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Opportunity, SubmissionKind } from "@/lib/supabase/types";
import { shouldAutoPublish } from "./confidence";
import { type DraftWithKey, decide, type SimilarityScores } from "./dedupe";

// Cosine-similarity floor for "interesting enough to consider" — same as
// the dedup matcher's review band. Anything below this is too unrelated
// for the matcher to ever lift into a merge or review decision.
const SIMILARITY_FLOOR = 0.6;
const MAX_SIMILAR_CANDIDATES = 10;

// Persist a freshly-extracted opportunity to Supabase, running the dedup
// matcher against existing rows for the same funder. Returns a tagged
// result describing what happened so the cron route can log meaningful
// counts ("inserted=3 merged=1 reviewed=0 failed=0").

export type UpsertResult =
  | { kind: "inserted"; opportunity_id: string }
  | { kind: "merged"; opportunity_id: string; score: number }
  | { kind: "reviewed"; submission_id: string; score: number }
  | { kind: "skipped"; reason: string }
  | { kind: "failed"; reason: string };

type SourceTag = string;

export async function upsertFromExtraction(
  extracted: ExtractedOpportunity,
  sourceTag: SourceTag,
  sourceUrl: string,
): Promise<UpsertResult> {
  // The extractor sets is_opportunity=false for rental ads / paid
  // classes / commercial auditions / press releases — pages that
  // happen to live on a community listings board but aren't grants.
  // We never insert those; logging as `skipped` keeps cron counts
  // honest (vs. failing schema validation, which would look like a
  // bug in the pipeline).
  if (!extracted.is_opportunity) {
    return { kind: "skipped", reason: "extractor marked page as not-an-opportunity" };
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return { kind: "skipped", reason: "supabase not configured" };
  }

  const draft: DraftWithKey = {
    ...extracted,
    // ExtractedOpportunity intentionally omits source_url (the LLM
    // doesn't need to echo it back); we re-attach it here from the
    // caller's known value so downstream code (dedupe, persistence)
    // sees a complete OpportunityDraft shape.
    source_url: sourceUrl,
    genre_tags: [],
    verified_by: `scrape:${sourceTag}`,
    fiscalYearOrWindow: extracted.fiscal_year_or_window,
  };

  const funderSlug = slugify(extracted.funder_name);

  // Embed the candidate before the dedup query so we can do a
  // nearest-neighbor lookup in the same round-trip-set. Failure here
  // degrades to lexical-only dedup — we still want to ingest the row.
  let embedding: number[] | null = null;
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
  } catch (caught) {
    if (caught instanceof EmbedError && caught.kind === "no_provider") {
      // Gemini key not configured — fine, we just skip the cosine pass.
      embedding = null;
    } else {
      console.warn("[ingest.upsert] embedding failed, falling back to lexical-only dedup", caught);
      embedding = null;
    }
  }

  // Candidate set is the union of:
  //   (a) same-funder_slug rows (cheap b-tree lookup; catches every variant
  //       of "same funder different program name"),
  //   (b) top-K cosine-nearest rows across ALL funders (catches the
  //       cross-funder near-twins Levenshtein can't see).
  type SelectChain = {
    select: (cols: string) => SelectChain;
    eq: (col: string, val: unknown) => SelectChain;
    in: (col: string, vals: unknown[]) => SelectChain;
    limit: (
      n: number,
    ) => Promise<{ data: Opportunity[] | null; error: { message: string } | null }>;
  };
  const table = (supabase as unknown as { from: (t: string) => SelectChain }).from("opportunities");

  const { data: funderCandidates, error: queryErr } = await table
    .select("*")
    .eq("funder_slug", funderSlug)
    .eq("is_archived", false)
    .limit(50);
  if (queryErr) {
    return { kind: "failed", reason: `dedup query failed: ${queryErr.message}` };
  }

  let similarRows: Opportunity[] = [];
  const similarities = new Map<string, number>();
  if (embedding) {
    const nearest = await findSimilarOpportunities(embedding);
    if (nearest.length > 0) {
      // Hydrate the full rows for the similar ids that aren't already
      // in the funder-slug candidate set.
      const funderIds = new Set((funderCandidates ?? []).map((row) => row.id));
      const missingIds = nearest.map((n) => n.id).filter((id) => !funderIds.has(id));
      if (missingIds.length > 0) {
        const { data: extras, error: extraErr } = await table
          .select("*")
          .in("id", missingIds)
          .eq("is_archived", false)
          .limit(MAX_SIMILAR_CANDIDATES);
        if (extraErr) {
          console.warn(
            "[ingest.upsert] failed to hydrate similar rows, continuing with funder-slug-only",
            extraErr,
          );
        } else if (extras) {
          similarRows = extras;
        }
      }
      for (const hit of nearest) similarities.set(hit.id, hit.similarity);
    }
  }

  const candidates = [...(funderCandidates ?? []), ...similarRows];
  const decision = decide(draft, candidates, sourceUrl, similarities as SimilarityScores);

  if (decision.kind === "review") {
    // Ambiguous duplicate (dedup score 0.6–0.8): a human decides whether
    // it's a genuine new cycle or a re-listing of an existing row.
    return await writeSubmission({
      kind: "dedup_review",
      draft,
      sourceUrl,
      confidence: extracted.confidence,
      embedding,
      notes: `possible duplicate of "${decision.into.name}" (dedup score ${decision.score.toFixed(2)})`,
    });
  }
  if (decision.kind === "merge") {
    return await mergeIntoExisting(decision.into, decision.score, draft, sourceTag, sourceUrl);
  }

  // It's a genuinely new row. The confidence gate decides whether it's
  // trustworthy + complete enough to publish unattended, or whether it
  // waits for one-click human approval in /admin/opportunities.
  const gate = shouldAutoPublish({ ...draft, confidence: extracted.confidence }, sourceTag);
  if (!gate.autoPublish) {
    return await writeSubmission({
      kind: "low_confidence",
      draft,
      sourceUrl,
      confidence: extracted.confidence,
      embedding,
      notes: gate.reason,
    });
  }
  return await insertNew(draft, funderSlug, sourceTag, sourceUrl, embedding);
}

// Wraps the find_similar_opportunities Postgres function added in
// supabase/migrations/0004_opportunity_similarity.sql. Returns the empty
// list if the RPC isn't available (e.g. the migration hasn't run yet —
// happens in scaffold environments). Never throws across the boundary.
async function findSimilarOpportunities(
  embedding: number[],
): Promise<Array<{ id: string; similarity: number }>> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  type RpcClient = {
    rpc: (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{
      data: Array<{ id: string; similarity: number }> | null;
      error: { message: string } | null;
    }>;
  };
  const { data, error } = await (supabase as unknown as RpcClient).rpc(
    "find_similar_opportunities",
    {
      query_embedding: embedding,
      similarity_threshold: SIMILARITY_FLOOR,
      match_count: MAX_SIMILAR_CANDIDATES,
    },
  );
  if (error) {
    console.warn("[ingest.upsert] find_similar_opportunities RPC failed", error);
    return [];
  }
  return data ?? [];
}

async function insertNew(
  draft: DraftWithKey,
  funderSlug: string,
  sourceTag: SourceTag,
  sourceUrl: string,
  embedding: number[] | null,
): Promise<UpsertResult> {
  const supabase = createAdminClient();
  if (!supabase) return { kind: "skipped", reason: "supabase not configured" };

  const key = canonicalKey(draft.funder_name, draft.name, draft.fiscalYearOrWindow);

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
    source_url: sourceUrl,
    application_platform: null,
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
  const table = (supabase as unknown as { from: (t: string) => InsertChain }).from("opportunities");
  const { data, error } = await table
    .upsert(row, { onConflict: "canonical_key" })
    .select("id")
    .single();

  if (error || !data) {
    return { kind: "failed", reason: error?.message ?? "insert returned no row" };
  }

  await writeProvenance(data.id, sourceTag, sourceUrl, draft);
  return { kind: "inserted", opportunity_id: data.id };
}

async function mergeIntoExisting(
  existing: Opportunity,
  score: number,
  draft: DraftWithKey,
  sourceTag: SourceTag,
  sourceUrl: string,
): Promise<UpsertResult> {
  // For v1 we don't update field-level data on merge — we trust the
  // earlier row and only record that we observed it again at this
  // source. Lets us add provenance without risking the extractor
  // overwriting a curated row with a worse extraction. A future v2
  // can layer "merge with conflict resolution" once we trust the
  // model more.
  await writeProvenance(existing.id, sourceTag, sourceUrl, draft);
  return { kind: "merged", opportunity_id: existing.id, score };
}

async function writeSubmission(opts: {
  kind: SubmissionKind;
  draft: DraftWithKey;
  sourceUrl: string;
  confidence: number | null;
  embedding: number[] | null;
  notes: string;
}): Promise<UpsertResult> {
  const { draft, sourceUrl } = opts;
  const supabase = createAdminClient();
  if (!supabase) return { kind: "skipped", reason: "supabase not configured" };

  type Chain = {
    insert: (v: Database["public"]["Tables"]["opportunity_submissions"]["Insert"]) => {
      select: (cols: string) => {
        single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
      };
    };
  };
  const table = (supabase as unknown as { from: (t: string) => Chain }).from(
    "opportunity_submissions",
  );

  const row: Database["public"]["Tables"]["opportunity_submissions"]["Insert"] = {
    name: draft.name,
    funder_name: draft.funder_name,
    funder_slug: slugify(draft.funder_name),
    type: draft.type,
    deadline: draft.deadline ?? null,
    is_rolling: draft.is_rolling,
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
    source_url: sourceUrl,
    submission_kind: opts.kind,
    extraction_confidence: opts.confidence,
    embedding: opts.embedding,
    raw_payload: { extracted: draft as unknown as Record<string, unknown> },
    reviewer_notes: opts.notes,
    status: "pending",
  };

  const { data, error } = await table.insert(row).select("id").single();
  if (error || !data) {
    return { kind: "failed", reason: error?.message ?? "submission insert returned no row" };
  }
  return { kind: "reviewed", submission_id: data.id, score: opts.confidence ?? 0 };
}

async function writeProvenance(
  opportunityId: string,
  sourceTag: SourceTag,
  sourceUrl: string,
  draft: DraftWithKey,
): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) return;

  type Chain = {
    upsert: (
      v: Database["public"]["Tables"]["opportunity_sources"]["Insert"],
      opts: { onConflict: string },
    ) => Promise<{ error: { message: string } | null }>;
  };
  const table = (supabase as unknown as { from: (t: string) => Chain }).from("opportunity_sources");

  await table.upsert(
    {
      opportunity_id: opportunityId,
      source: sourceTag,
      source_url: sourceUrl,
      raw_payload: { extracted: draft as unknown as Record<string, unknown> },
    },
    { onConflict: "opportunity_id,source,source_url" },
  );
}
