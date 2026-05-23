# Ingest-source checklist

Use this when adding a new source to the /opportunities ingest pipeline (Phase 5+ of the feature plan). Mirrors `docs/checklists/server-action.md` in spirit — every adapter lands with the same shape so a future reader can navigate to the relevant file from any other.

Order matters. Do them top to bottom.

## 1. Read the robots.txt and ToS

- Fetch `https://<host>/robots.txt` and read it. Pay attention to:
  - Any `User-agent: <bot> / Disallow: /` directive that names a generic AI crawler (`ClaudeBot`, `GPTBot`, `ChatGPT-User`, `anthropic-ai`, `PerplexityBot`). If we're listed, do not scrape — even with a non-AI user-agent, it's hostile to do this anyway.
  - `Crawl-delay` — we must respect it. The adapter's `crawlDelayMs` should equal or exceed the `Crawl-delay × 1000`.
  - Explicit `Disallow:` paths. If the listings live behind one, we walk away.
- Read the site's ToS for "automated access", "scraping", "redistribute" language. If it forbids automated access, do not scrape — pursue an inbox subscription instead (see `lib/ingest/inbound-email/` once that lands).
- Document the verdict in `docs/research/grant-source-inventory.md` under the source heading. If the verdict is YELLOW or RED, link it from the adapter file's leading comment.

## 2. Add an entry to the source enum

- Append the source id to `OPPORTUNITY_SOURCES` in `lib/opportunities/schema.ts`.
- The id is the same string the adapter exports as its `id` field and the same string written into `opportunity_sources.source`. Use a short, underscore_lowercase identifier (`dance_nyc`, `nyfa_classifieds`).

## 3. Write the adapter

- File path: `lib/ingest/sources/<source-id>.ts`.
- Default-exports an `IngestSource` object (see `lib/ingest/types.ts`).
- `discover()` returns canonical absolute URLs. Be conservative — slice to the top N most recent / most-relevant; do not enumerate 12,000 results.
- `fetchOne(url)` returns `RawListing { url, raw, observed_at }`. Use `INGEST_USER_AGENT` on every fetch.
- Add a leading comment that explains:
  - Why we picked this source (link to `docs/research/grant-source-inventory.md`).
  - The robots.txt verdict + the crawl-delay we promised.
  - The fragility note: if the source redesigns, what fails and how we'll know.

## 4. Save a fixture and write a unit test

- Save a real HTML / JSON snapshot to `lib/ingest/__fixtures__/<source-id>-index.html` (or `.json`).
- Export a `parseXxx` helper from the adapter and unit-test it against the fixture. The test must:
  - Cover the happy path (at least one URL extracted).
  - Cover de-duplication (the same listing linked twice → one URL out).
  - Cover the negative path (a footer link or unrelated nav link is NOT picked up).
- The test must be offline-safe — no `fetch()` calls in tests.

## 5. Register the source

- Add the adapter to `SOURCES` in `lib/ingest/registry.ts`. Higher-signal sources go first.

## 6. Confirm the dedup story

- Run the manual test:
  - Seed a known opportunity (via `scripts/seed-opportunities.ts` or by hand).
  - Run the cron locally: `curl -X POST -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/cron/ingest`
  - Confirm the cron returns `counts: { merged: 1, inserted: 0 }` — i.e., the dedup matcher caught the existing row.
- If merging fails (it inserts a duplicate), add a dedup-fixture in `lib/ingest/__fixtures__/` and write a `lib/ingest/dedupe.test.ts` case that proves the matcher's expected score for this funder pair. Then tune `lib/opportunities/slug.ts` (rarely) or the dedupe weights (more commonly).

## 7. Document the cadence in the editor's calendar

- For sources with `cadence: 'quarterly'` or rarer, add a calendar reminder so an editor sanity-checks the source manually around its known cycle (e.g., NYSCA opens annually in April → April calendar alert: "verify the NYSCA scrape ran cleanly").
- This is operational, not code. The calendar is the safety net the cron alone can't be.

## 8. Quick file map

```
lib/opportunities/schema.ts              # add to OPPORTUNITY_SOURCES enum
lib/ingest/sources/<source-id>.ts        # the adapter — IngestSource default export
lib/ingest/sources/<source-id>.test.ts   # fixture-driven parser tests
lib/ingest/__fixtures__/<source-id>-*.html  # saved real-world snapshot(s)
lib/ingest/registry.ts                   # register in SOURCES
docs/research/grant-source-inventory.md  # the audit-trail entry
```
