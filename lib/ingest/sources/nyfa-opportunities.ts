import { INGEST_USER_AGENT, type IngestSource, type RawListing } from "../types";

// NYFA Opportunities adapter — uses the WordPress REST endpoint at
// nyfa.org/wp-json instead of scraping rendered HTML. JSON is structured
// and stable; the underlying page chrome could change weekly without
// affecting us.
//
// Per docs/research/grant-source-inventory.md: nyfa.org/robots.txt is
// permissive (only blocks staging subdomains), sitemaps are declared,
// no AI-bot blocks. We still respect a polite 2s crawl delay.

const REST_INDEX = "https://www.nyfa.org/wp-json/wp/v2/opportunities?per_page=50";

// The "dance" tag id changes if NYFA renumbers their taxonomy, so the
// adapter filters by `tags` array content client-side rather than via
// the REST URL — keeps the call site resilient to NYFA's taxonomy
// edits. The set below is the canonical dance-relevant tag slugs in
// May 2026; missing slugs degrade to "include everything", which is
// noisier but never silent.
const DANCE_TAG_SLUGS = new Set(["dance", "choreography", "performance", "movement", "ballet"]);

type WpPost = {
  id: number;
  link: string;
  title: { rendered: string };
  _embedded?: {
    "wp:term"?: Array<Array<{ taxonomy: string; slug: string }>>;
  };
};

const nyfaOpportunities: IngestSource = {
  id: "nyfa_opportunities",
  label: "NYFA Opportunities Board",
  cadence: "weekly",
  crawlDelayMs: 2_000,

  async discover(): Promise<string[]> {
    const raw = await fetchJson(`${REST_INDEX}&_embed=wp:term`);
    if (!Array.isArray(raw)) return [];

    const posts = raw as WpPost[];
    const danceLinks = posts.filter((post) => isDanceRelevant(post)).map((p) => p.link);

    // De-dupe and keep insertion order (WordPress returns newest-first).
    return [...new Set(danceLinks)];
  },

  async fetchOne(url: string): Promise<RawListing> {
    const raw = await fetchText(url);
    return { url, raw, observed_at: new Date() };
  },
};

export default nyfaOpportunities;

// Visible for tests.
export function isDanceRelevant(post: WpPost): boolean {
  const tagGroups = post._embedded?.["wp:term"] ?? [];
  for (const group of tagGroups) {
    for (const term of group) {
      if (DANCE_TAG_SLUGS.has(term.slug.toLowerCase())) return true;
    }
  }
  return false;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": INGEST_USER_AGENT, Accept: "application/json" },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`nyfa-opportunities fetch ${url} → ${res.status}`);
  }
  return await res.json();
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": INGEST_USER_AGENT, Accept: "text/html,application/xhtml+xml" },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`nyfa-opportunities fetch ${url} → ${res.status}`);
  }
  return await res.text();
}
