// The auto-publish gate for the autonomous ingest loop.
//
// Pure functions, no IO — easy to unit-test. Given a freshly-extracted
// opportunity and the channel it came from, decide whether it is trusted
// and complete enough to go live unattended, or whether a human should
// eyeball it first (it lands in opportunity_submissions for review).
//
// The whole point of the feature: discovery is automatic, but anything the
// model is unsure about — or anything from a channel we haven't vetted —
// waits for a one-click human approval rather than publishing itself.

import type { OpportunitySource } from "@/lib/opportunities/schema";

// Per-channel trust. A confidently-extracted row from an unvetted channel
// (open-web discovery, an unrecognized newsletter sender routed to
// "manual") is still held for review; only channels we've vetted may
// auto-publish. The curated seed script writes opportunities directly and
// never passes through this gate.
const SOURCE_TRUST: Record<string, "trusted" | "review_only"> = {
  manual: "review_only",
  community_submission: "review_only",
  discovery: "review_only",
  dance_nyc: "trusted",
  nyfa_opportunities: "trusted",
  nyfa_source: "trusted",
  nyfa_classifieds: "trusted",
  dance_nyc_newsletter: "trusted",
  creative_capital_lighthouse: "trusted",
};

// Below this self-reported confidence, even a trusted channel's row waits
// for review. 0.8 is the same threshold the dedup cascade uses for its
// auto-merge band, kept aligned so the two gates feel consistent.
export const AUTO_PUBLISH_MIN_CONFIDENCE = 0.8;

// Optional fields accept `undefined` as well as `null` so a parsed
// OpportunityDraft (whose nullable+optional Zod fields widen to
// `T | null | undefined`) can be passed straight through.
export type ExtractionForGate = {
  confidence: number;
  deadline?: string | null | undefined;
  is_rolling: boolean;
  amount_min_cents?: number | null | undefined;
  amount_max_cents?: number | null | undefined;
  amount_display?: string | null | undefined;
  eligibility_individual: boolean;
  eligibility_fiscal_sponsor: boolean;
  eligibility_501c3: boolean;
  description_short: string;
  source_url: string;
};

// "Complete enough to publish unattended": a usable deadline signal, some
// amount signal, at least one eligibility flag, a real source URL, and a
// substantive blurb. A gap in any of these is exactly the kind of thing a
// human should confirm before the row faces an artist.
export function completeness(e: ExtractionForGate): { complete: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!e.deadline && !e.is_rolling) missing.push("deadline");
  if (e.amount_min_cents == null && e.amount_max_cents == null && !e.amount_display?.trim()) {
    missing.push("amount");
  }
  if (!e.eligibility_individual && !e.eligibility_fiscal_sponsor && !e.eligibility_501c3) {
    missing.push("eligibility");
  }
  if (!/^https?:\/\//.test(e.source_url)) missing.push("source_url");
  if (e.description_short.trim().length < 20) missing.push("description");
  return { complete: missing.length === 0, missing };
}

export function isTrustedSource(source: OpportunitySource | string): boolean {
  return (SOURCE_TRUST[source] ?? "review_only") === "trusted";
}

export type AutoPublishDecision = { autoPublish: boolean; reason: string };

export function shouldAutoPublish(
  e: ExtractionForGate,
  source: OpportunitySource | string,
): AutoPublishDecision {
  if (!isTrustedSource(source)) {
    return { autoPublish: false, reason: `source '${source}' is review-only` };
  }
  if (e.confidence < AUTO_PUBLISH_MIN_CONFIDENCE) {
    return {
      autoPublish: false,
      reason: `confidence ${e.confidence.toFixed(2)} < ${AUTO_PUBLISH_MIN_CONFIDENCE}`,
    };
  }
  const c = completeness(e);
  if (!c.complete) {
    return { autoPublish: false, reason: `incomplete: missing ${c.missing.join(", ")}` };
  }
  return { autoPublish: true, reason: "trusted source, high confidence, complete" };
}
