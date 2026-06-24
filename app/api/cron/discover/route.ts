import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { extractOpportunity } from "@/lib/ai/extract-opportunity";
import { serverEnv } from "@/lib/env/server";
import { loadLastRuns, recordRun } from "@/lib/ingest/cron-runner";
import { DiscoveryError, discoverCandidateUrls } from "@/lib/ingest/discovery/discover";
import { DISCOVERY_QUERIES } from "@/lib/ingest/discovery/queries";
import { filterUnseenUrls, markSeen } from "@/lib/ingest/discovery/seen";
import { discoverNewSources, recordProposedSources } from "@/lib/ingest/discovery/sources";
import { INGEST_USER_AGENT } from "@/lib/ingest/types";
import { type UpsertResult, upsertFromExtraction } from "@/lib/ingest/upsert";

// Agentic web-discovery cron. Vercel Cron sends a GET with the bearer
// secret; POST is kept for manual triggering. Each invocation runs the
// least-recently-run discovery query, asks Gemini (search-grounded) for
// candidate funder URLs, and pushes the never-before-seen ones through the
// normal extract -> dedup -> confidence-gate path.
//
// `discovery` is a review-only source (lib/ingest/confidence.ts), so every
// row it produces lands in /admin/opportunities for human approval — the
// search is automatic, the publish decision stays human.
//
// MAX_FETCH is small: one grounded search call + N extraction calls must
// stay under Gemini Flash's free-tier 5-requests/minute ceiling.

const MAX_FETCH = 3;
const FETCH_TIMEOUT_MS = 10_000;
// How often the meta-agent proposes whole new sources (Phase 5), tracked
// under the `discovery:_sources` run key. Weekly keeps it cheap; when due we
// spend the invocation proposing sources instead of fetching listings so we
// never exceed Gemini's per-minute ceiling.
const SOURCE_DISCOVERY_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = serverEnv.CRON_SECRET ? `Bearer ${serverEnv.CRON_SECRET}` : null;
  if (!expected || auth !== expected) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }

  const lastRuns = await loadLastRuns();

  // Phase 5: when the source-discovery cadence is due, spend this invocation
  // proposing new funders/aggregators (into proposed_sources for editor
  // review) rather than fetching listings — keeps total LLM calls bounded.
  const sourcesLast = lastRuns.get("discovery:_sources") ?? 0;
  if (Date.now() - sourcesLast >= SOURCE_DISCOVERY_INTERVAL_MS) {
    try {
      const drafts = await discoverNewSources();
      const proposed = await recordProposedSources(drafts);
      await recordRun("discovery:_sources", { discovered: drafts.length, proposed });
      return NextResponse.json({ ok: true, mode: "sources", proposed, discovered: drafts.length });
    } catch (err) {
      if (err instanceof DiscoveryError && err.kind === "no_provider") {
        return NextResponse.json(
          { ok: false, message: "ai provider not configured" },
          { status: 503 },
        );
      }
      // Don't let a source-discovery hiccup block listing discovery next run;
      // record the attempt so we don't retry it every invocation.
      await recordRun("discovery:_sources", { discovered: 0, proposed: 0 });
      console.error("[cron/discover] source discovery failed", err);
    }
  }

  // Rotate: pick the listing-discovery query whose last run is oldest.
  const pick = [...DISCOVERY_QUERIES].sort(
    (a, b) => (lastRuns.get(`discovery:${a.id}`) ?? 0) - (lastRuns.get(`discovery:${b.id}`) ?? 0),
  )[0];
  if (!pick) {
    return NextResponse.json({ ok: true, message: "no discovery queries configured" });
  }

  const counts = {
    discovered: 0,
    fresh: 0,
    inserted: 0,
    merged: 0,
    reviewed: 0,
    skipped: 0,
    failed: 0,
  };
  const failures: string[] = [];

  let candidates: string[];
  try {
    candidates = await discoverCandidateUrls(pick.query, MAX_FETCH * 2);
  } catch (err) {
    if (err instanceof DiscoveryError && err.kind === "no_provider") {
      return NextResponse.json(
        { ok: false, message: "ai provider not configured" },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { ok: false, query: pick.id, message: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
  counts.discovered = candidates.length;

  const fresh = (await filterUnseenUrls(candidates)).slice(0, MAX_FETCH);
  counts.fresh = fresh.length;

  for (const url of fresh) {
    try {
      const html = await fetchText(url);
      const extracted = await extractOpportunity(html, url);
      const result: UpsertResult = await upsertFromExtraction(extracted, "discovery", url);
      counts[result.kind] = (counts[result.kind] ?? 0) + 1;
      if (result.kind === "failed") failures.push(`${url}: ${result.reason}`);
    } catch (err) {
      counts.failed += 1;
      failures.push(`${url}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Remember every candidate we considered (not just the fetched slice) so
  // we don't keep re-surfacing the same URLs on the next rotation.
  await markSeen(candidates.map((url) => ({ url, query: pick.id })));
  await recordRun(`discovery:${pick.id}`, counts);

  return NextResponse.json({ ok: true, query: pick.id, counts, failures: failures.slice(0, 5) });
}

export const GET = handle;
export const POST = handle;

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": INGEST_USER_AGENT, Accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}
