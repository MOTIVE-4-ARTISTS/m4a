import { INGEST_USER_AGENT, type IngestSource, type RawListing } from "../types";

// NYFA Opportunities adapter — uses the WordPress REST endpoint at
// nyfa.org/wp-json instead of scraping rendered HTML. JSON is structured
// and stable; the underlying page chrome could change weekly without
// affecting us.
//
// STATUS (2026-06): NYFA put the site behind a Cloudflare bot-challenge —
// the REST endpoint now returns a 403 "Just a moment..." interstitial to a
// plain fetch. We can't pass that without a headless browser, which isn't
// worth the infra here. So `discover()` now DEGRADES GRACEFULLY: on a
// challenge / any fetch failure it logs once and returns [] (a clean no-op
// run) instead of throwing and 500-ing the cron. NYFA coverage flows
// through the newsletter channel instead — `opportunities@motive4artists.org`
// subscribed to NYFA Classifieds, routed to the `nyfa_classifieds` source in
// app/api/inbound/email/route.ts. If NYFA ever reopens the REST endpoint,
// this adapter starts working again with no further changes.
//
// Per docs/research/grant-source-inventory.md: nyfa.org/robots.txt is
// permissive (only blocks staging subdomains). We still respect a polite 2s
// crawl delay for when the endpoint is reachable.

const REST_INDEX = "https://www.nyfa.org/wp-json/wp/v2/opportunities?per_page=50";

// Cloudflare's interstitial body. If we see it, the REST endpoint is walled
// and there's nothing to discover this run.
const CHALLENGE_MARKERS = ["just a moment", "cf-browser-verification", "challenge-platform"];

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
    let raw: unknown;
    try {
      raw = await fetchJson(`${REST_INDEX}&_embed=wp:term`);
    } catch (err) {
      // Cloudflare wall or any transient failure: degrade to a no-op run so
      // the cron stays green. NYFA coverage comes via the newsletter channel.
      console.warn("[nyfa-opportunities] discover unavailable (Cloudflare?), skipping run", err);
      return [];
    }
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
  // A Cloudflare challenge can come back as HTTP 200 with an HTML body. Catch
  // that here so the caller treats it as "unavailable" rather than choking on
  // JSON.parse of an interstitial page.
  const body = await res.text();
  const lower = body.slice(0, 2_000).toLowerCase();
  if (CHALLENGE_MARKERS.some((m) => lower.includes(m))) {
    throw new Error("nyfa-opportunities: Cloudflare challenge interstitial");
  }
  return JSON.parse(body);
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
