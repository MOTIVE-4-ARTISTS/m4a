import { INGEST_USER_AGENT, type IngestSource, type RawListing } from "../types";

// Dance/NYC listings adapter — the v1 #1 source.
//
// robots.txt at dance.nyc: User-agent: *, Crawl-delay: 5, only /download/
// disallowed. We respect the 5-second crawl delay (per
// docs/research/grant-source-inventory.md §Legal posture).
//
// Strategy:
//   1. Fetch the listings index page (/for-artists/listings/).
//   2. Extract per-listing URLs via a deliberately-loose regex against the
//      anchor markup. We use a regex (not cheerio / jsdom) because (a) the
//      surface is small enough not to justify a parser dep and (b) the
//      regex deliberately fails open — if Dance/NYC changes their markup,
//      `discover()` returns an empty array and the cron run logs a
//      WARNING instead of crashing. We then notice in the next freshness
//      audit and write a new regex.
//   3. For each listing URL, fetchOne() pulls the page HTML and hands it
//      to the AI extractor downstream.

const INDEX_URL = "https://www.dance.nyc/for-artists/listings";

// Dance/NYC listing slugs land at paths like:
//   /for-artists/listings/2026/Brooklyn-Choreographer-Grant
// The regex below captures any /for-artists/listings/<segment>/<segment>
// path inside the index HTML.
const LISTING_PATH = /\/for-artists\/listings\/[^\s"'?#]+\/[^\s"'?#]+/g;

const danceNyc: IngestSource = {
  id: "dance_nyc",
  label: "Dance/NYC Listings",
  cadence: "daily",
  crawlDelayMs: 5_000,

  async discover(): Promise<string[]> {
    const html = await fetchText(INDEX_URL);
    const seen = new Set<string>();
    const matches = html.match(LISTING_PATH) ?? [];
    for (const m of matches) {
      // Some matches are bare paths, some include hash fragments — we
      // store the canonical absolute URL form so the dedupe matcher can
      // compare hostnames cleanly later.
      const absolute = new URL(m, "https://www.dance.nyc").toString();
      seen.add(absolute);
    }
    return [...seen];
  },

  async fetchOne(url: string): Promise<RawListing> {
    const raw = await fetchText(url);
    return { url, raw, observed_at: new Date() };
  },
};

export default danceNyc;

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": INGEST_USER_AGENT, Accept: "text/html,application/xhtml+xml" },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`dance-nyc fetch ${url} → ${res.status}`);
  }
  return await res.text();
}

// Exported for unit tests so we can exercise `discover` against a saved
// HTML fixture without going over the wire.
export function parseListingUrls(html: string): string[] {
  const seen = new Set<string>();
  const matches = html.match(LISTING_PATH) ?? [];
  for (const m of matches) {
    seen.add(new URL(m, "https://www.dance.nyc").toString());
  }
  return [...seen];
}
