import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Opportunity } from "@/lib/supabase/types";
import type { OpportunityFilters } from "./schema";

// Server-side reader for the /opportunities page.
//
// We deliberately do NOT lean on Supabase's PostgREST array-overlap filter
// syntax for every filter; instead we apply the eligibility / location /
// free-only filters in SQL (cheap, indexed) and the discipline / equity /
// career filters in JS after the round-trip. The page expects ≤500 rows
// in v1 (a manually-curated dataset that grows via weekly ingest), so a
// single round-trip with post-fetch filtering is faster to ship and
// easier to debug than 6 layered PostgREST queries. When the dataset
// crosses ~2k rows or the filter set grows, revisit and push the array
// filters into SQL with `cs.{}` overlap operators.
//
// Returns a typed `OpportunitiesPage` shape rather than a bare array so
// the SSR page can render the freshness indicator + count without a
// second query.

// supabase-js retries network failures with backoff. When the backend is
// unreachable (local stack down, or a production blip) that retry loop sums
// to ~7s of dead time on the SSR render before failing. We cap the round-trip
// so the page degrades to its quiet empty state fast instead of hanging the
// request. A healthy Supabase responds in well under 500ms, so 2.5s is pure
// headroom that only ever bites when the backend is actually down.
const OPPORTUNITIES_QUERY_TIMEOUT_MS = 2500;

export type OpportunitiesPage = {
  rows: Opportunity[];
  totalOpen: number;
  // The most recent `last_verified_at` across all live rows — drives the
  // "updated today / X days ago" freshness line at the top of the page.
  lastVerifiedAt: string | null;
  // True when Supabase isn't configured yet (env not set). The page
  // shows a "feature not yet available" friendly state instead of a 500.
  notConfigured: boolean;
};

export async function listOpportunities(filters: OpportunityFilters): Promise<OpportunitiesPage> {
  const supabase = await createClient();
  if (!supabase) {
    return { rows: [], totalOpen: 0, lastVerifiedAt: null, notConfigured: true };
  }

  // Same overlap-resolution workaround used in lib/applications/submit.ts
  // and app/api/stripe/webhook/route.ts — supabase-js's `.from(...)`
  // generic collapses to `never` for our hand-written Database type until
  // `pnpm supabase gen types typescript --linked` is wired into CI.
  type SelectChain = {
    select: (cols: string) => SelectChain;
    eq: (col: string, val: unknown) => SelectChain;
    in: (col: string, vals: unknown[]) => SelectChain;
    lte: (col: string, val: unknown) => SelectChain;
    or: (clause: string) => SelectChain;
    order: (col: string, opts: { ascending: boolean; nullsFirst?: boolean }) => SelectChain;
    abortSignal: (signal: AbortSignal) => SelectChain;
    limit: (n: number) => Promise<{
      data: Opportunity[] | null;
      error: { message: string } | null;
    }>;
  };
  const table = (supabase as unknown as { from: (t: string) => SelectChain }).from("opportunities");

  let query = table
    .select("*")
    .eq("is_archived", false)
    .order("deadline", { ascending: true, nullsFirst: false })
    .abortSignal(AbortSignal.timeout(OPPORTUNITIES_QUERY_TIMEOUT_MS));

  // The SQL-side filters: cheap to push down, indexed in 0003.
  if (filters.types.length > 0) {
    query = query.in("type", filters.types);
  }
  if (filters.locations.length > 0) {
    query = query.in("location_requirement", filters.locations);
  }
  if (filters.free_only) {
    query = query.eq("application_fee_cents", 0);
  }
  if (filters.deadline_window_days !== null) {
    const now = new Date();
    const horizon = new Date(now.getTime() + filters.deadline_window_days * 86_400_000);
    const horizonDate = horizon.toISOString().slice(0, 10);
    if (filters.include_rolling) {
      // Either the deadline is within the window OR it's a rolling program.
      query = query.or(`deadline.lte.${horizonDate},is_rolling.eq.true`);
    } else {
      query = query.lte("deadline", horizonDate);
    }
  } else if (!filters.include_rolling) {
    query = query.eq("is_rolling", false);
  }

  const { data, error } = await query.limit(500);
  if (error) {
    console.error("[opportunities.read] query failed", error);
    return { rows: [], totalOpen: 0, lastVerifiedAt: null, notConfigured: false };
  }

  const all = data ?? [];

  // Eligibility filter: OR semantics — "show me opportunities I can apply
  // for as ANY of these tiers" — because most grants accept multiple
  // applicant shapes.
  let filtered = all;
  if (filters.eligibility.length > 0) {
    const flags = new Set(filters.eligibility);
    filtered = filtered.filter(
      (row) =>
        (flags.has("individual") && row.eligibility_individual) ||
        (flags.has("fiscal_sponsor") && row.eligibility_fiscal_sponsor) ||
        (flags.has("501c3") && row.eligibility_501c3),
    );
  }

  // `discipline_tags` / `career_stage` / `equity_tags` are stored as
  // text[] so the row arrays are `string[]`, not narrowed enums. We
  // widen the comparison Sets to `Set<string>` so the .has() check
  // accepts any row value without TypeScript narrowing pain.
  if (filters.disciplines.length > 0) {
    const want = new Set<string>(filters.disciplines);
    filtered = filtered.filter((row) => row.discipline_tags.some((t) => want.has(t)));
  }
  if (filters.career_stages.length > 0) {
    const want = new Set<string>(filters.career_stages);
    // "any" on the row means the program is open to all career stages —
    // it matches whatever the artist asked for.
    filtered = filtered.filter(
      (row) => row.career_stage.includes("any") || row.career_stage.some((s) => want.has(s)),
    );
  }
  if (filters.equity_tags.length > 0) {
    const want = new Set<string>(filters.equity_tags);
    filtered = filtered.filter((row) => row.equity_tags.some((t) => want.has(t)));
  }

  const lastVerifiedAt = filtered.reduce<string | null>(
    (latest, row) =>
      latest == null || row.last_verified_at > latest ? row.last_verified_at : latest,
    null,
  );

  return {
    rows: filtered,
    totalOpen: all.length,
    lastVerifiedAt,
    notConfigured: false,
  };
}
