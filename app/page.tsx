import Link from "next/link";
import { Logomark } from "@/components/brand/logo";

// Phase 0 landing page. The proper home (cohort spotlight, program trio,
// latest-event teaser, fiscal-sponsor disclosure block) lands in Phase 2.
//
// Design intent here:
//  - The brand yellow appears in exactly TWO places — the logomark on the
//    right and the primary "Support our work" CTA. Everything else is the
//    calm warm-paper / charcoal base. This is the visual restraint rule for
//    the whole site: yellow earns attention by being rare.
//  - "A space to move" is the carried-over voice from MOtiVE Brooklyn.
//  - The pendency line is required by IRS substantiation framing while the
//    1023-EZ is in review; ComplianceFooter handles the legal footer line.
export default function HomePage() {
  return (
    <article className="mx-auto max-w-[var(--container-page)] px-6 py-16 md:py-24">
      <div className="grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
            A space to move
          </p>

          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-[1.05] tracking-tight md:text-6xl">
            <span className="text-[var(--color-ink)]">MOtiVE </span>
            <span className="text-[var(--color-brand-deep)]">4</span>
            <span className="text-[var(--color-ink)]"> Artists</span>{" "}
            <span className="text-[var(--color-ink-muted)]">supports</span> movement-based artists
            through residencies, education, and public presentation.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-[var(--color-ink-muted)]">
            The artist comes first. We meet each artist where they are, build the supportive
            structure they need, and give them the space and time to make the work that matters to
            them.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/donate"
              className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-brand)] px-6 py-3 text-base font-medium text-[var(--color-ink)] hover:bg-[var(--color-brand-deep)] hover:text-[var(--color-paper)]"
            >
              Support our work
            </Link>
            <Link
              href="/programs"
              className="inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--color-ink)] px-6 py-3 text-base font-medium text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
            >
              See our programs
            </Link>
          </div>
        </div>

        {/* Logomark used at hero scale, framed in its own card with a hairline
            rule so it reads as "the mark," not a background wash. */}
        <div className="justify-self-center md:justify-self-end">
          <div className="rounded-[1rem] border border-[var(--color-rule)] bg-[var(--color-paper)] p-3 shadow-sm">
            <Logomark size="xl" priority className="rounded-[0.75rem]" />
          </div>
        </div>
      </div>

      <p className="mt-20 max-w-2xl text-sm text-[var(--color-ink-muted)]">
        MOtiVE 4 Artists Inc. is a New York-incorporated nonprofit corporation (March 2026). Federal
        501(c)(3) tax-exempt status is pending — IRS Form 1023-EZ submitted May 2026.
      </p>
    </article>
  );
}
