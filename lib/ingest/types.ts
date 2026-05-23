// Common types for the /opportunities ingest pipeline.
//
// Adapters live in lib/ingest/sources/<source>.ts. Each one exports a
// default object matching `IngestSource`. The cron runner
// (lib/ingest/cron-runner.ts) picks the oldest-due source from a
// registry, calls its `discover()` to get URLs, then for each URL calls
// `fetchOne()` to retrieve raw HTML/text, which is then handed to the
// AI extractor (lib/ai/extract-opportunity.ts).
//
// The shape is deliberately small so adding a new source is a
// 100-line file plus a fixture (see docs/checklists/ingest-source.md).

import type { OpportunitySource } from "@/lib/opportunities/schema";

export type Cadence = "daily" | "weekly" | "monthly" | "quarterly";

export type RawListing = {
  // Canonical source URL (where an artist would click to apply / learn).
  // Will end up in the `opportunity_sources.source_url` column.
  url: string;
  // Raw HTML or text fetched from that URL. Stored verbatim in the
  // `raw_payload` JSONB so we can re-extract later if the AI prompt
  // changes without re-fetching from the funder's site.
  raw: string;
  // When we observed this listing. Defaults to "now" in fetchOne, but
  // adapters working off a sitemap may have an authoritative timestamp.
  observed_at?: Date;
};

export interface IngestSource {
  // Stable id used as `opportunity_sources.source` and as the registry
  // key. Must match one of the OPPORTUNITY_SOURCES enum values in
  // lib/opportunities/schema.ts.
  id: OpportunitySource;
  // Human-friendly name surfaced in logs.
  label: string;
  // How often the cron runner is allowed to invoke this source. The
  // runner enforces this against `_cron_runs.last_ran_at` (added in a
  // follow-up migration; v1 stores last-run-at in-memory + console
  // logs as the audit trail).
  cadence: Cadence;
  // Crawl-delay in ms per fetch — adapters that hit pages with a
  // declared robots.txt crawl-delay set it here. The runner sleeps for
  // this between fetchOne() calls.
  crawlDelayMs: number;
  // Hit the source's index page (or sitemap, or REST endpoint) and
  // return the URLs of the individual listings. Bounded by the adapter
  // (don't fetch 12,000 NYFA Source rows — slice to the top N most
  // recent or dance-tagged).
  discover(): Promise<string[]>;
  // One round-trip per listing URL — kept separate from discover() so
  // a source whose listing API is fast but whose detail pages are
  // rate-limited can throttle the second call independently.
  fetchOne(url: string): Promise<RawListing>;
}

// The user-agent we present when scraping. Identifies us, links back to
// the public surface, and lets a funder reach a human if a scrape
// surprises them. We never send a generic "Mozilla/5.0" UA — being
// honest costs nothing and earns goodwill.
export const INGEST_USER_AGENT =
  "motive4artists.org-ingest/1.0 (+https://motive4artists.org/opportunities; opportunities@motive4artists.org)";
