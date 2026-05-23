import { SaveButton } from "@/components/opportunities/save-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { OPPORTUNITIES_COPY } from "@/lib/opportunities/copy";
import {
  type DeadlineDisplay,
  eligibilityChips,
  formatAmount,
  formatDeadline,
  formatVerifiedAt,
} from "@/lib/opportunities/format";
import type { Opportunity } from "@/lib/supabase/types";

// Server Component card. No "use client" — the only interactive piece
// (the Save button) is a separate client island layered on in Phase 3.
//
// Card composition rules (per docs/research/opportunities-ux-synthesis.md):
//   - Deadline LIVES on the card face. Never in a modal.
//   - Color is paired with text on the urgency state ("12 days left" +
//     amber background, not just amber).
//   - The card itself is a list item; the link surface is the title.
//   - "closing today" banner across the top is `role="status"` so screen
//     readers announce it without being interrupted by a low-stakes alert.

type Props = { row: Opportunity };

const TYPE_LABEL: Record<Opportunity["type"], string> = {
  grant: "grant",
  residency: "residency",
  fellowship: "fellowship",
  call: "open call",
};

export function OpportunityCard({ row }: Props) {
  const deadline = formatDeadline(row.deadline, row.is_rolling);
  const amount = formatAmount(row.amount_min_cents, row.amount_max_cents, row.amount_display);
  const verified = formatVerifiedAt(row.last_verified_at);
  const chips = eligibilityChips(row);

  return (
    <Card className="flex h-full flex-col">
      {deadline.kind === "closing_today" ? <ClosingTodayBanner /> : null}

      <div className="flex items-start justify-between gap-3">
        <Badge tone="brand" aria-label={`opportunity type: ${TYPE_LABEL[row.type]}`}>
          {TYPE_LABEL[row.type]}
        </Badge>
        <DeadlinePill display={deadline} />
      </div>

      <CardTitle className="mt-4">
        {/* Open in a new tab — the artist usually wants the funder's page
            without losing the filtered m4a list they came from. */}
        <a
          href={row.source_url}
          target="_blank"
          rel="noopener"
          className="underline-offset-4 hover:underline focus-visible:underline"
        >
          {row.name}
        </a>
      </CardTitle>
      <CardEyebrow className="mt-2 normal-case">
        {OPPORTUNITIES_COPY.card.sourceLine(row.funder_name, verified)}
      </CardEyebrow>

      {amount ? <p className="mt-3 text-sm font-medium text-[var(--color-ink)]">{amount}</p> : null}

      <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{row.description_short}</p>

      {chips.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="eligibility">
          {chips.map((chip) => (
            <li key={chip.key}>
              <Badge tone="neutral">{chip.label}</Badge>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--color-rule)] pt-4">
        <a
          href={`/opportunities/${row.id}/event.ics`}
          className="text-xs text-[var(--color-ink-muted)] underline-offset-4 hover:underline focus-visible:underline"
          aria-label={OPPORTUNITIES_COPY.card.addToCalendar(row.name)}
        >
          add to calendar
        </a>
        <SaveButton id={row.id} name={row.name} />
      </div>
    </Card>
  );
}

function ClosingTodayBanner() {
  return (
    <div
      role="status"
      className="-mx-6 -mt-6 mb-4 rounded-t-[var(--radius-card)] bg-[var(--color-brand-soft)] px-6 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-ink)]"
    >
      {OPPORTUNITIES_COPY.card.deadline.closingToday}
    </div>
  );
}

function DeadlinePill({ display }: { display: DeadlineDisplay }) {
  // Pair the visible (sometimes abbreviated) label with a screen-reader
  // expansion so "Jul 15" becomes "deadline July 15" for assistive tech
  // without losing the compact visual treatment. Belt-and-suspenders for
  // the WCAG 1.4.1 / non-text contrast rules called out in
  // .cursor/rules/050-accessibility.mdc.
  const expanded =
    display.kind === "days_left"
      ? `deadline in ${display.days} day${display.days === 1 ? "" : "s"}`
      : display.kind === "closing_today"
        ? "deadline today"
        : display.kind === "rolling"
          ? "rolling deadline"
          : display.kind === "closed"
            ? "deadline passed"
            : `deadline ${display.label}`;

  const toneClass =
    display.tone === "urgent"
      ? "border-[var(--color-brand-deep)]/40 bg-[var(--color-brand-soft)] text-[var(--color-ink)]"
      : display.tone === "muted"
        ? "border-[var(--color-rule)] bg-[var(--color-paper-warm)] text-[var(--color-ink-muted)]"
        : "border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink)]";

  return (
    <span
      className={`shrink-0 rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-xs font-medium ${toneClass}`}
    >
      <span aria-hidden="true">{display.label}</span>
      <span className="sr-only">{expanded}</span>
    </span>
  );
}
