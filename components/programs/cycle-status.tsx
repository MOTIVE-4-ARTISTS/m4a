import Link from "next/link";
import { SoftChevron } from "@/components/brand/marks";
import type { Program } from "@/lib/programs";

// Per-program cycle-status panel. Sits at the top of each /programs/<x>
// page so an artist sees "is this open right now?" within the first
// viewport without scrolling into prose. Audit recommendation §6 + §11
// item 11 — the application-timeline-transparency pattern from MacDowell,
// Triskelion, Skowhegan, CPR.
//
// Renders the status verbatim from lib/programs.ts (single source of
// truth with the apply hub and the home status strip). When the program
// is open, the panel CTA is "apply" in brand yellow; when closed, the
// CTA is a subscribe-to-notification link to /connect.
//
// One panel per page, near the hero. Quiet styling (paper-warm with a
// thin accent-ink rule on the left) so it reads as informational rather
// than promotional — promotional CTAs already live in the page's own
// Button row beneath the prose.

export function CycleStatus({ program }: { program: Program }) {
  return (
    <aside
      aria-label="application cycle status"
      className="my-8 border-l-2 border-[var(--color-accent-ink)] bg-[var(--color-paper-warm)] px-5 py-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div>
          <p className="lowercase text-xs tracking-[0.18em] text-[var(--color-accent-ink)]">
            {program.open ? "applications open now" : "applications status"}
          </p>
          <p className="mt-1 text-sm text-[var(--color-ink)]">{program.status}</p>
        </div>
        <Link
          href={program.open ? program.applyHref : "/connect"}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
        >
          {program.open ? "apply" : "get notified when it opens"}
          <SoftChevron size={12} className="text-[var(--color-brand-deep)]" />
        </Link>
      </div>
    </aside>
  );
}
