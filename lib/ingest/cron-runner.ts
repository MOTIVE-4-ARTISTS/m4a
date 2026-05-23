import "server-only";

import { SOURCES } from "./registry";
import type { Cadence, IngestSource } from "./types";

// Cron-runner glue. Owns "which source is next" + "how many fetches per
// invocation" without owning fetch-mechanics (those live in each adapter)
// or extraction (lives in lib/ai/extract-opportunity.ts).
//
// V1 keeps last-run-at in process memory. On Vercel that means a cold
// start re-runs the oldest source — which is the safe failure mode (we
// over-fetch a source we just fetched). A follow-up migration adds a
// `_cron_runs(source, last_ran_at)` table when we notice the rate
// limits we want to set start mattering. For now console logs are the
// audit trail.

const lastRanAt = new Map<string, number>();

const CADENCE_MS: Record<Cadence, number> = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
  quarterly: 90 * 24 * 60 * 60 * 1000,
};

export type DueDecision = { source: IngestSource } | { source: null; reason: string };

export function pickDueSource(now: Date = new Date()): DueDecision {
  // Oldest "due" source wins. A source is due when (now - lastRunAt) >= cadence,
  // or when we've never run it.
  let candidate: IngestSource | null = null;
  let candidateAge = -1;

  for (const source of SOURCES) {
    const last = lastRanAt.get(source.id);
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
