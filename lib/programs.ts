// Flagship-program registry — the typed source of truth for the three
// public application programs and their open/closed status.
//
// Lifted out of app/(marketing)/apply/page.tsx (where it lived inline as
// FORMS) so the home page's application-status strip + the apply page hub
// + future surfaces (announcement banner, /opportunities cross-link)
// share one definition. Editing the open/closed state, the blurb, or the
// status copy happens here once.
//
// Status copy is intentionally human ("rolling, monthly" / "closed for
// 2026" / "applications opening late 2026"). Audit recommendation §6 —
// answer the artist's first question ("is this open right now? if not,
// when?") immediately.

export type ProgramId = "residency" | "international" | "discounted_space" | "pedagogies";

export type Program = {
  id: ProgramId;
  title: string;
  applyHref: string;
  programHref: string;
  // Whether the application portal accepts new submissions today. Drives
  // the brand-yellow brand-soft chip on the apply page, the home-page
  // status strip's "open now" subset, and (eventually) the announcement
  // banner toggle wiring.
  open: boolean;
  // Short tag used in the strip and the apply hub badge.
  status: string;
  // Long-form blurb for the apply hub card.
  blurb: string;
};

export const PROGRAMS: readonly Program[] = [
  {
    id: "residency",
    title: "Artist in Residency",
    applyHref: "/apply/residency",
    programHref: "/programs/residency",
    open: false,
    status: "next cycle opens late 2026",
    blurb:
      "A co-designed residency built around your project. Applications for the 2027 cycle open in late 2026.",
  },
  {
    id: "international",
    title: "International Exchange",
    applyHref: "/apply/international",
    programHref: "/programs/international-exchange",
    open: true,
    status: "rolling · by inquiry",
    blurb:
      "Long-term partnership opportunities with peer organizations abroad. Start with a conversation.",
  },
  {
    id: "discounted_space",
    title: "Discounted Space Subsidy",
    applyHref: "/apply/discounted-space",
    programHref: "/programs/discounted-space",
    open: true,
    status: "rolling · monthly cohorts",
    blurb: "Subsidized hours at MOtiVE Brooklyn's studio. New cohorts begin on a rolling basis.",
  },
] as const;

export const OPEN_PROGRAMS: readonly Program[] = PROGRAMS.filter((p) => p.open);
