import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { extractOpportunity } from "@/lib/ai/extract-opportunity";
import { serverEnv } from "@/lib/env/server";
import { loadLastRuns, pickDueSource, recordRun } from "@/lib/ingest/cron-runner";
import { type UpsertResult, upsertFromExtraction } from "@/lib/ingest/upsert";

// Hourly cron entrypoint. Vercel Cron sends a GET with an Authorization
// header carrying `Bearer ${CRON_SECRET}`; we verify before doing any work
// so a casual hit from the public internet does nothing. POST is kept for
// manual/local triggering (curl with the same bearer).
//
// One source per invocation, capped at MAX_PER_INVOCATION discoveries.
// This is the simplest reliable shape: even if the LLM gets slow or a
// source's index page is huge, a single invocation can never run past
// Vercel's 60-second serverless timeout.
//
// 4 keeps us comfortably under Gemini Flash's free-tier ceiling of 5
// requests/minute. Lift to ~30 once we move to a paid Gemini billing
// account; the hourly cron cadence will keep things fresh either way.

const MAX_PER_INVOCATION = 4;

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = serverEnv.CRON_SECRET ? `Bearer ${serverEnv.CRON_SECRET}` : null;
  if (!expected || auth !== expected) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }

  const lastRuns = await loadLastRuns();
  const decision = pickDueSource(new Date(), lastRuns);
  if (decision.source == null) {
    return NextResponse.json({ ok: true, message: decision.reason });
  }
  const source = decision.source;

  const counts = { discovered: 0, inserted: 0, merged: 0, reviewed: 0, skipped: 0, failed: 0 };
  const failures: string[] = [];

  try {
    const urls = await source.discover();
    counts.discovered = urls.length;

    const sliced = urls.slice(0, MAX_PER_INVOCATION);

    for (const url of sliced) {
      try {
        const listing = await source.fetchOne(url);
        const extracted = await extractOpportunity(listing.raw, listing.url);
        const result: UpsertResult = await upsertFromExtraction(extracted, source.id, listing.url);
        counts[result.kind] = (counts[result.kind] ?? 0) + 1;
        if (result.kind === "failed") {
          failures.push(`${listing.url}: ${result.reason}`);
        }
      } catch (err) {
        counts.failed += 1;
        failures.push(`${url}: ${err instanceof Error ? err.message : String(err)}`);
      }
      // Polite crawl delay between fetches per source-declared cadence.
      await sleep(source.crawlDelayMs);
    }
    await recordRun(source.id, counts);
  } catch (err) {
    console.error(`[cron/ingest] ${source.id} discover failed`, err);
    return NextResponse.json(
      {
        ok: false,
        source: source.id,
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, source: source.id, counts, failures: failures.slice(0, 5) });
}

export const GET = handle;
export const POST = handle;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
