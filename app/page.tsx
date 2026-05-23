import Link from "next/link";

// Phase 0 landing — deliberately minimal. The real home (hero, program
// trio, latest-cohort spotlight, donate CTA) lands in Phase 2 alongside
// the design pass with Lilach.
export default function HomePage() {
  return (
    <article className="mx-auto max-w-[var(--container-page)] px-6 py-20">
      <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
        A space to move
      </p>

      <h1 className="mt-4 font-[var(--font-display)] text-5xl leading-tight tracking-tight md:text-6xl">
        MOtiVE 4 Artists supports movement-based artists through residencies, education, and public
        presentation.
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-[var(--color-ink-muted)]">
        The artist comes first. We meet each artist where they are, build the supportive structure
        they need, and give them the space and time to make the work that matters to them.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/programs"
          className="rounded-[var(--radius-card)] border border-[var(--color-ink)] px-5 py-3 text-sm hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
        >
          See our programs
        </Link>
        <Link
          href="/donate"
          className="rounded-[var(--radius-card)] bg-[var(--color-accent)] px-5 py-3 text-sm text-[var(--color-paper)] hover:opacity-90"
        >
          Support our work
        </Link>
      </div>

      <p className="mt-16 max-w-2xl text-sm text-[var(--color-ink-muted)]">
        MOtiVE 4 Artists Inc. is a New York-incorporated nonprofit corporation (March 2026). Federal
        501(c)(3) tax-exempt status is pending — IRS Form 1023-EZ submitted May 2026.
      </p>
    </article>
  );
}
