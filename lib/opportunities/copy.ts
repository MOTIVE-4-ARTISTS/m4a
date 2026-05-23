// Brand-voice strings for the /opportunities feature.
//
// Why one file: editorial tweaks ("nothing's matching" → "no matches found")
// are inevitable. Centralising the strings means the editor (Lilach) can
// rewrite them in a single PR without touching layout components, and the
// reviewer can audit voice consistency in one diff. Mirrors the lib/org.ts
// pattern for compliance copy.
//
// Voice rules (from docs/research/opportunities-ux-synthesis.md §Brand
// tone): lowercase where stylistically intentional, warm-friend register,
// never bureaucratic. The em dash is the punctuation of the brand — keep
// using it.

export const OPPORTUNITIES_COPY = {
  pageTitle: "Opportunities",
  pageDescription:
    "Grants, residencies, fellowships, and open calls — curated for NYC dance artists and verified weekly.",

  hero: {
    eyebrow: "Opportunities",
    title: "here's what's open for you right now.",
    lead: "grants, residencies, fellowships, and calls — curated for nyc dance artists, verified this week.",
  },

  ai: {
    label: "tell us about your practice",
    placeholder:
      "discipline, where you're based, what kind of support you're looking for — a sentence or two is enough",
    submit: "find matches",
    submitting: "matching…",
    confirmation: (n: number) =>
      n === 1
        ? "we matched that to 1 opportunity — adjust the filters anytime"
        : `we matched those to ${n} opportunities — adjust the filters anytime`,
    clear: "clear AI filters",
    error: {
      invalidInput: "we couldn't read that. try a sentence or two about your practice.",
      rateLimited: "you've asked for a few in a row — give it a minute and try again.",
      dependencyUnavailable:
        "our matching service is taking a breath. you can still filter the list manually.",
      serverError: "something went wrong on our end. the manual filters still work.",
    },
  },

  filters: {
    label: "filters",
    moreFilters: "more filters",
    fewerFilters: "fewer filters",
    clear: "clear filters",
    result: (n: number) => (n === 1 ? "showing 1 opportunity" : `showing ${n} opportunities`),
    type: { label: "type" },
    deadline: {
      label: "deadline",
      thisWeek: "closing this week",
      thisMonth: "this month",
      next90: "next 3 months",
      rolling: "rolling",
    },
    eligibility: {
      label: "you're applying as",
      individual: "individual",
      fiscalSponsor: "fiscally sponsored",
      org501c3: "501(c)(3)",
    },
    location: {
      label: "location",
      nyc: "NYC",
      nycMetro: "NYC metro",
      nyState: "NY State",
      national: "national",
      international: "international",
    },
    free: { label: "free to apply" },
    discipline: { label: "discipline" },
    careerStage: { label: "career stage" },
  },

  card: {
    deadline: {
      rolling: "rolling",
      closingToday: "today is the last day to apply",
      closed: "closed",
      // Human countdown — kept in this module so editorial can change
      // "12 days left" → "12 days to go" in one place if the voice shifts.
      daysLeft: (n: number) => (n === 1 ? "1 day left" : `${n} days left`),
    },
    verified: {
      today: "verified today",
      // For 1–6 days the page renders "verified Xd ago"; for older,
      // "verified Xw ago"; the helper that computes these lives in
      // lib/opportunities/format.ts (Phase 2).
    },
    sourceLine: (funder: string, verified: string) => `from ${funder} · ${verified}`,
    saveLabel: (name: string) => `save ${name} to your list`,
    unsaveLabel: (name: string) => `remove ${name} from your list`,
    addToCalendar: (name: string) => `add ${name} deadline to your calendar`,
  },

  emptyState: {
    title: "nothing's matching your filters right now.",
    lead: "try widening the deadline window, or clear the discipline filter to see everything we track.",
    widenDeadline: "widen the deadline window",
    clearDiscipline: "clear discipline",
  },

  allCaughtUp: {
    title: "all caught up.",
    lead: "check back — new opportunities open regularly.",
  },

  page: {
    freshnessUpdatedToday: (n: number) => `updated today · ${n} open opportunities`,
    freshnessDaysAgo: (days: number, n: number) =>
      `updated ${days === 1 ? "1 day" : `${days} days`} ago · ${n} open opportunities`,
    copyLink: "copy link",
    copyLinkConfirmation: "link copied",
    exportIcs: "export to calendar",
    exportIcsConfirmation: (n: number) =>
      n === 1 ? "added 1 deadline to your download" : `added ${n} deadlines to your download`,
    saveConfirmation: "saved — it's in your list and added to your URL so you can share it",
  },

  footerTrust:
    "we curate this list manually. if you spot an error or a deadline we missed, let us know — it helps every artist who comes here.",

  submit: {
    pageTitle: "Submit an opportunity",
    pageDescription: "Know of a grant, residency, or open call we should include? Send it our way.",
    hero: {
      eyebrow: "Submit",
      title: "saw something we missed?",
      lead: "tell us about it. we review submissions weekly. you'll never see your name on the listing — submitters stay private.",
    },
    success: "thanks — we've got it. you'll see it on the page after our weekly review.",
    error: {
      invalidInput: "double-check the highlighted fields and try again.",
      rateLimited:
        "we've had a few submissions from this address recently — wait a moment and try again.",
      unauthorized: "couldn't verify the captcha. give it another try.",
      serverError: "something broke on our end. try again in a moment.",
    },
  },
} as const;
