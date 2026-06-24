import type { LikelihoodTier } from "./types";

// Tier order is the single source of likelihood ranking: the legend, the
// tier-summary header, and any future sort all read this array. Index 0 is
// "most likely to partner."
export const TIER_ORDER: readonly LikelihoodTier[] = [
  "active",
  "warm",
  "candidate",
  "research",
] as const;

interface TierMeta {
  label: string;
  // One-liner shown in the legend / summary so a first-time reader understands
  // what the colour means without opening the research doc.
  blurb: string;
  // Choropleth fill. Chosen to read on the cream map surface: a deep editorial
  // blue anchors our existing relationships (visually "ours"), then a warm
  // gold→sand ramp signals decreasing certainty. Hex (not CSS vars) because
  // these are passed to SVG fill attributes computed client-side, where the
  // brand custom properties aren't always resolvable at paint time.
  fill: string;
}

export const TIER_META: Record<LikelihoodTier, TierMeta> = {
  active: {
    label: "active relationship",
    blurb: "partners we already work with.",
    fill: "#1a2a3c",
  },
  warm: {
    label: "warm prospect",
    blurb: "strong fit, runs international programs, reachable.",
    fill: "#c08609",
  },
  candidate: {
    label: "candidate",
    blurb: "real dance scene — worth an introduction.",
    fill: "#e4a315",
  },
  research: {
    label: "needs research",
    blurb: "scene exists; international posture still unknown.",
    fill: "#cdbfa0",
  },
};

// Countries with no entry in our dataset. Kept distinct from `research` (which
// means "we looked and there's something there") so the map honestly shows the
// difference between "unexplored" and "explored-but-uncertain".
export const UNMAPPED_FILL = "#ece7da";

export function tierFill(tier: LikelihoodTier): string {
  return TIER_META[tier].fill;
}
