// Organization-wide constants surfaced in the UI and in legal disclosures.
//
// These are deliberately strings in code (not env vars) because they are
// matters of legal record, not configuration — flipping the legal name in
// staging vs. production would be a bug, not a feature.

export const ORG = {
  legalName: "MOTIVE 4 ARTISTS INC.",
  displayName: "MOtiVE 4 Artists",
  dbaLine: 'MOTIVE 4 ARTISTS INC. ("MOtiVE 4 Artists")',

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
  incorporationDate: "2026-03",

  // IRS status flips here when the 501(c)(3) determination letter arrives.
  // Until then, the donate page surfaces fiscal-sponsor copy.
  irsStatus: "pending" as "pending" | "approved",
  ntee: "A60",
  foundationClassification: "509(a)(1) / 170(b)(1)(A)(vi)",

  // Fiscal sponsor (active while irsStatus === "pending").
  fiscalSponsor: {
    name: "The Performance Zone Inc (dba The Field)",
    address: "75 Maiden Lane, Suite 906, New York, NY 10038",
    phone: "212-691-6969",
  },

  contact: {
    email: "hello@motive4artists.org",
    sender: "MOtiVE 4 Artists",
  },

  social: {
    // Filled in as accounts are created post-1023-EZ approval.
    instagram: null as string | null,
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
