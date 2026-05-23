import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";

// Phase 0 landing page. The proper home (cohort spotlight, program trio,
// latest-event teaser, fiscal-sponsor disclosure block) lands in Phase 2.
//
// Design intent here:
//  - The brand yellow appears in exactly TWO places — the wordmark and the
//    primary "Support our work" CTA. Everything else is the calm warm-paper
//    / charcoal base. This is the visual restraint rule for the whole site:
//    yellow earns attention by being rare.
//  - "A space to move" is the carried-over voice from MOtiVE Brooklyn.
//  - The pendency line is required by IRS substantiation framing while the
//    1023-EZ is in review; ComplianceFooter handles the legal footer line.
export default function HomePage() {
  return (
    <article className="mx-auto max-w-[var(--container-page)] px-6 py-16 md:py-24">
      <div className="grid items-center gap-12 md:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
            A space to move
          </p>

          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
            <span className="text-[var(--color-ink)]">
              MOtiVE 4 Artists supports movement-based artists
            </span>{" "}
            <span className="text-[var(--color-ink-muted)]">
              through residencies, education, and public presentation.
            </span>
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

        {/* Hero wordmark — the artwork already includes the brand yellow
            surface, so we don't wrap it in another colored card. The thin
            rule + soft shadow lets it sit on warm paper without floating. */}
        <div className="justify-self-center md:justify-self-end">
          <Wordmark
            width={420}
            priority
            className="h-auto rounded-[var(--radius-card)] border border-[var(--color-rule)] shadow-sm"
          />
        </div>
      </div>

      <p className="mt-20 max-w-2xl text-sm text-[var(--color-ink-muted)]">
        MOtiVE 4 Artists Inc. is a New York-incorporated nonprofit corporation (March 2026). Federal
        501(c)(3) tax-exempt status is pending — IRS Form 1023-EZ submitted May 2026.
      </p>
    </article>
  );
}
