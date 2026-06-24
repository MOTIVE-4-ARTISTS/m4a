// Brand-voice strings for the offshore-opportunities exploration map.
// Same rationale as lib/opportunities/copy.ts: keep editorial wording in one
// place so voice can be tuned without touching layout. Lowercase where
// stylistically intentional; warm register; the em dash is the brand's
// punctuation.

export const OFFSHORE_COPY = {
  pageTitle: "Offshore Opportunities — map",
  pageDescription:
    "Internal exploration: a world map of dance houses and centers, ranked by how likely they are to partner with us on international exchange.",

  hero: {
    eyebrow: "Lab · Offshore Opportunities",
    title: "mapping the world's dance houses, by who we could partner with next.",
    lead: "we start from the partners we already have — bergen dansesenter, studio space art — and work outward, country by country, toward the centers most likely to host a motive artist. this is a working map, not a finished list.",
  },

  legend: {
    label: "likelihood of partnership",
    unmapped: "not yet explored",
  },

  summary: {
    countriesMapped: (n: number) => (n === 1 ? "1 country explored" : `${n} countries explored`),
    centersTracked: (n: number) =>
      n === 1 ? "1 dance center tracked" : `${n} dance centers tracked`,
  },

  panel: {
    empty: "select a country to see its dance centers.",
    noCenters: "no center mapped here yet — but the scene's worth a look. see the outreach note.",
    centersHeading: "dance centers",
    outreachHeading: "why reach out",
    intlYes: "international program",
    intlNo: "domestic focus",
    intlUnknown: "international posture unknown",
    visit: "visit site",
  },

  disclaimer:
    "working exploration — coverage is uneven and likelihood tiers are first-pass judgments, not verified commitments. sourcing lives in docs/research/offshore-dance-centers-2026-06.md.",
} as const;
