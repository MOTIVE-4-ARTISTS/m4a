// Date / amount / verified-at formatting for the /opportunities card list.
//
// The copy module (lib/opportunities/copy.ts) owns user-facing strings;
// this module owns the bucket-and-format math so the same opportunity row
// renders the same countdown whether it shows on the list page or the
// detail page. Pure functions only — easy to unit-test, no IO.

import { OPPORTUNITIES_COPY } from "./copy";

const COPY = OPPORTUNITIES_COPY.card;

export type DeadlineDisplay =
  | { kind: "closing_today"; label: string; tone: "urgent" }
  | { kind: "days_left"; days: number; label: string; tone: "urgent" }
  | { kind: "fixed_date"; label: string; tone: "calm" }
  | { kind: "rolling"; label: string; tone: "calm" }
  | { kind: "closed"; label: string; tone: "muted" };

// We compare in the funder-local zone by treating the stored DATE as
// midnight in the viewer's TZ. Grants are deadline-day-of policy ("must
// reach us by July 15"), not deadline-instant policy, so DAY granularity
// is the truth — minute precision would lie. For UI display this is the
// right granularity; the actual application_window tstzrange exists for
// the rare program with a real cutoff time.
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function formatDeadline(
  deadline: string | null,
  isRolling: boolean,
  now: Date = new Date(),
): DeadlineDisplay {
  if (isRolling || deadline === null) {
    return { kind: "rolling", label: COPY.deadline.rolling, tone: "calm" };
  }

  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const [y, m, d] = deadline.split("-").map((p) => Number(p));
  if (!y || !m || !d) {
    return { kind: "rolling", label: COPY.deadline.rolling, tone: "calm" };
  }
  const deadlineUtc = Date.UTC(y, m - 1, d);
  const diffDays = Math.round((deadlineUtc - todayUtc) / MS_PER_DAY);

  if (diffDays < 0) {
    return { kind: "closed", label: COPY.deadline.closed, tone: "muted" };
  }
  if (diffDays === 0) {
    return { kind: "closing_today", label: COPY.deadline.closingToday, tone: "urgent" };
  }
  if (diffDays < 14) {
    return {
      kind: "days_left",
      days: diffDays,
      label: COPY.deadline.daysLeft(diffDays),
      tone: "urgent",
    };
  }

  // 14-day-and-out: switch to a human date. "Jul 15" / "Jul 15, 2027" if
  // the year differs from the current year (so March 2027 cycles read
  // unambiguous from a May 2026 vantage point).
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: y === now.getUTCFullYear() ? undefined : "numeric",
    timeZone: "UTC",
  });
  return {
    kind: "fixed_date",
    label: fmt.format(new Date(deadlineUtc)),
    tone: "calm",
  };
}

export function formatAmount(
  minCents: number | null,
  maxCents: number | null,
  display: string | null,
): string | null {
  if (display && display.trim().length > 0) return display;
  if (minCents === null && maxCents === null) return null;

  const fmt = (cents: number): string =>
    `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  if (minCents !== null && maxCents !== null) {
    if (minCents === maxCents) return fmt(minCents);
    return `${fmt(minCents)}–${fmt(maxCents)}`;
  }
  if (minCents !== null) return `${fmt(minCents)}+`;
  if (maxCents !== null) return `up to ${fmt(maxCents)}`;
  return null;
}

// "verified today / 3d ago / 2w ago / 4mo ago". We keep the granularity
// human-friendly: precision past months would imply we know the exact
// minute, which we don't (and which doesn't matter to the artist).
export function formatVerifiedAt(timestamp: string, now: Date = new Date()): string {
  const verifiedAt = new Date(timestamp).getTime();
  const diffMs = now.getTime() - verifiedAt;
  const diffDays = Math.max(0, Math.floor(diffMs / MS_PER_DAY));

  if (diffDays === 0) return "verified today";
  if (diffDays === 1) return "verified 1 day ago";
  if (diffDays < 7) return `verified ${diffDays} days ago`;
  if (diffDays < 14) return "verified 1 week ago";
  if (diffDays < 31) return `verified ${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "verified 1 month ago";
  if (diffDays < 365) return `verified ${Math.floor(diffDays / 30)} months ago`;
  return "verified over a year ago";
}

// The card surface is denser than the filter surface — we render only
// the chips that are TRUE on a row, never all of them. The filter UI
// (chips along the top) keeps the full taxonomy visible; this helper
// only emits the subset that earns ink.
export function eligibilityChips(row: {
  eligibility_individual: boolean;
  eligibility_fiscal_sponsor: boolean;
  eligibility_501c3: boolean;
  application_fee_cents: number;
  location_requirement: string;
}): Array<{ label: string; key: string }> {
  const chips: Array<{ label: string; key: string }> = [];
  if (row.eligibility_individual) chips.push({ key: "indiv", label: "individual ok" });
  if (row.eligibility_fiscal_sponsor) chips.push({ key: "fs", label: "fiscal sponsor ok" });
  if (row.eligibility_501c3) chips.push({ key: "501c3", label: "501(c)(3)" });
  if (row.application_fee_cents === 0) chips.push({ key: "free", label: "free to apply" });
  if (row.location_requirement === "nyc") chips.push({ key: "nyc", label: "NYC only" });
  return chips;
}
