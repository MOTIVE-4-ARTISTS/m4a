import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import { SOURCES } from "./registry";
import type { Cadence, IngestSource } from "./types";

// Cron-runner glue. Owns "which source is next" + "how many fetches per
// invocation" without owning fetch-mechanics (those live in each adapter)
// or extraction (lives in lib/ai/extract-opportunity.ts).
//
// Scheduling decisions stay PURE (pickDueSource takes the last-run map as
// an argument) so they're trivially testable. Persistence is a separate
// async concern: loadLastRuns() / recordRun() read and write the
// `_ingest_runs` table (migration 0006) via the admin client. When
// Supabase isn't configured we fall back to the in-memory map below, which
// keeps local/dev and the unit tests working without a database.

const lastRanAt = new Map<string, number>();

const CADENCE_MS: Record<Cadence, number> = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
  quarterly: 90 * 24 * 60 * 60 * 1000,
};

export type DueDecision = { source: IngestSource } | { source: null; reason: string };

export function pickDueSource(
  now: Date = new Date(),
  lastRuns: ReadonlyMap<string, number> = lastRanAt,
): DueDecision {
  // Oldest "due" source wins. A source is due when (now - lastRunAt) >= cadence,
  // or when we've never run it.
  let candidate: IngestSource | null = null;
  let candidateAge = -1;

  for (const source of SOURCES) {
    const last = lastRuns.get(source.id);
    const ageMs = last == null ? Number.POSITIVE_INFINITY : now.getTime() - last;
    if (ageMs >= CADENCE_MS[source.cadence] && ageMs > candidateAge) {
      candidate = source;
      candidateAge = ageMs;
    }
  }

  if (candidate == null) {
    return { source: null, reason: "no source is currently due" };
  }
  return { source: candidate };
}

export function markRan(sourceId: string, at: Date = new Date()): void {
  lastRanAt.set(sourceId, at.getTime());
}

// Load the durable last-run map from `_ingest_runs`. Falls back to the
// in-memory mirror when Supabase isn't configured (dev/test) so the
// scheduler still functions, just without cross-deploy persistence.
export async function loadLastRuns(): Promise<Map<string, number>> {
  const supabase = createAdminClient();
  if (!supabase) return new Map(lastRanAt);

  type Chain = {
    select: (cols: string) => Promise<{
      data: Array<{ source: string; last_ran_at: string }> | null;
      error: { message: string } | null;
    }>;
  };
  const table = (supabase as unknown as { from: (t: string) => Chain }).from("_ingest_runs");
  const { data, error } = await table.select("source, last_ran_at");
  if (error || !data) {
    console.warn("[cron-runner] loadLastRuns failed, using in-memory fallback", error);
    return new Map(lastRanAt);
  }
  const map = new Map<string, number>();
  for (const row of data) map.set(row.source, new Date(row.last_ran_at).getTime());
  return map;
}

// Record an invocation's outcome durably. Always mirrors into the in-memory
// map so a same-lambda follow-up sees the update even before the row commits.
export async function recordRun(
  sourceId: string,
  counts: Record<string, number>,
  at: Date = new Date(),
): Promise<void> {
  markRan(sourceId, at);
  const supabase = createAdminClient();
  if (!supabase) return;

  type Chain = {
    upsert: (
      v: Database["public"]["Tables"]["_ingest_runs"]["Insert"],
      opts: { onConflict: string },
    ) => Promise<{ error: { message: string } | null }>;
  };
  const table = (supabase as unknown as { from: (t: string) => Chain }).from("_ingest_runs");
  const { error } = await table.upsert(
    { source: sourceId, last_ran_at: at.toISOString(), counts, updated_at: at.toISOString() },
    { onConflict: "source" },
  );
  if (error) console.warn("[cron-runner] recordRun failed", error);
}

// Test-only: clear the in-memory schedule so tests can exercise the
// scheduler from a clean slate without cross-test bleed.
export function _resetForTests(): void {
  lastRanAt.clear();
}

// Helper so adapters / tests can ask "what's the registered cadence for
// this source?" without re-importing CADENCE_MS.
export function cadenceMs(cadence: Cadence): number {
  return CADENCE_MS[cadence];
}
