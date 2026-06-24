// Organization-wide constants surfaced in the UI and in legal disclosures.
//
// These are deliberately strings in code (not env vars) because they are
// matters of legal record, not configuration — flipping the legal name in
// staging vs. production would be a bug, not a feature.

export const ORG = {
  legalName: "MOTIVE 4 ARTISTS INC.",
  displayName: "MOtiVE 4 Artists",
  dbaLine: 'MOTIVE 4 ARTISTS INC. ("MOtiVE 4 Artists")',

  // Verbatim charitable-purpose statement as filed on Form 1023-EZ (Part III #1).
  // This is the *legal* mission used in structured/legal contexts (JSON-LD,
  // /transparency). The warmer artist-facing copy on /about/mission is a
  // separate, deliberately non-legal voice — do not unify the two.
  missionStatement:
    "The corporation is formed for the charitable purpose of supporting the artists community, including emerging and established practitioners, by providing resources, opportunities, and programs to foster artistic growth, cultural exchange, and community engagement.",

  // EIN is in env (NEXT_PUBLIC_EIN) so we can keep this file off the
  // legal-review fast path; surfaced at `ORG.ein()` below.

  address: {
    street: "609 E 11th St",
    city: "New York",
    state: "NY",
    postal: "10009",
    country: "USA",
  },
  legalCounty: "Kings County, New York",
  incorporationState: "New York",
  incorporationDate: "2026-03-02",
  fiscalYearEnd: "December 31",

  // NY DOS public-record identifiers (NY State corporation search). Public, not
  // sensitive — surfaced on /transparency as a "show the receipts" credibility
  // signal. Director PII from the same filing stays in the gitignored
  // founding-record.secret.md, never here.
  dosId: "7848002",
  dosFilingNumber: "260303000632",

  // Federal tax-exempt status. The 1023-EZ determination is in hand; the
  // exemption is effective to the date of formation (retroactive because the
  // application was filed within the 27-month window).
  irsStatus: "approved" as "pending" | "approved",
  taxExemptEffective: "March 2, 2026",
  ntee: "A60",
  foundationClassification: "509(a)(1) / 170(b)(1)(A)(vi)",

  // Online card giving (Stripe Embedded Checkout) goes live once the
  // nonprofit Stripe account is verified in production. Until then /donate
  // routes gifts through the interim email/check path. Flip to true the day
  // the production checkout is confirmed working.
  onlineGivingLive: false,

  contact: {
    email: "hello@motive4artists.org",
    sender: "MOtiVE 4 Artists",
  },

  social: {
    // Until the nonprofit opens its own handle, Instagram points at the
    // brand-family sibling account @motivebrooklyn (the LLC studio). The
    // brand-confusion risk here is real and documented
    // (docs/research/peer-website-benchmarking.md §6), so the link is
    // labelled "@motivebrooklyn" explicitly — we never imply the LLC's
    // account *is* the nonprofit.
    // TODO(eran, 2026-07): create @motive4artists and swap both fields.
    instagram: "https://www.instagram.com/motivebrooklyn",
    instagramHandle: "@motivebrooklyn",
    facebook: null as string | null,
  },

  board: [
    { name: "Lilach Orenstein", role: "Founder, President & Director" },
    { name: "Eran Nussinovitch", role: "Secretary, Treasurer & Director" },
    { name: "Sara Brown", role: "Director" },
  ],
} as const;

import { publicEnv } from "./env/public";

// EIN is read from env so a typo doesn't ride through a code review unchallenged.
export function ein(): string {
  return publicEnv.NEXT_PUBLIC_EIN ?? "EIN pending publication";
}
