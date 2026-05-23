import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { SoftChevron } from "@/components/brand/marks";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { listArtists, listCohorts } from "@/lib/content/reader";
import { listOpportunities } from "@/lib/opportunities/read";
import { ORG } from "@/lib/org";
import { OPEN_PROGRAMS, PROGRAMS } from "@/lib/programs";

// Home page — artist-first, per the May 2026 design audit. Decisions
// live in docs/research/design-audit-2026-05.md §6 + §11. The composition
// from top to bottom:
//
//  1. Hero. "the artist comes first." as the h1. Brand-yellow on the
//     "browse opportunities" CTA (per ADR 0002's rare-yellow rule, now
//     applied to the artist action). Wordmark hangs past the container
//     edge on desktop — the intentional-misalignment beat from audit §5.
//  2. Application-status strip. The artist's first question is "is
//     anything open right now?" — answer it before they scroll. Sourced
//     from lib/programs.ts so the apply hub + home + future announcement
//     banner share a single registry.
//  3. Opportunities preview. 3 live rows from Supabase when configured;
//     the section self-suppresses when empty so we never ship a fake
//     placeholder.
//  4. Cohort spotlight. Named-artist peer-proof per audit §6 + Subagent
//     C synthesis. Today's spotlight is one cohort + one artist; the
//     same template grows as Keystatic adds more.
//  5. Program trio (drives from PROGRAMS — single source of truth).
//  6. Pendency line + single demoted "support" framing.

// 90-day window picks up anything urgent without dragging in every
// rolling program when the homepage really wants to feel current.
const HOME_OPPORTUNITY_WINDOW_DAYS = 90;

export default async function HomePage() {
  // Parallel fetch — three independent reads, ~no benefit to serializing.
  const [opps, cohorts, artists] = await Promise.all([
    listOpportunities({
      types: [],
      locations: [],
      eligibility: [],
      disciplines: [],
      career_stages: [],
      equity_tags: [],
      deadline_window_days: HOME_OPPORTUNITY_WINDOW_DAYS,
      include_rolling: false,
      free_only: false,
    }),
    listCohorts(),
    listArtists(),
  ]);

  const previewRows = opps.rows.slice(0, 3);

  // Cohort spotlight: pick the most recent cohort by year (desc), surface
  // up to 3 of its artists as named tiles. Quiet-fail if either is empty.
  const spotlightCohort = [...cohorts].sort((a, b) => b.entry.year - a.entry.year)[0];
  const spotlightArtists = spotlightCohort
    ? (spotlightCohort.entry.artists ?? [])
        .map((slug) => artists.find((a) => a.slug === slug))
        .filter((a): a is (typeof artists)[number] => a !== undefined)
        .slice(0, 3)
    : [];

  return (
    <>
      {/* Hero. Asymmetric grid: type left (1.3fr), wordmark right (1fr).
          The wordmark on md+ translates ~24-40px past the page-container
          edge — the audit's "one element bleeds off the screen" craft
          beat (§5 craft move #12). The artwork's own brand-yellow surface
          handles the edge gracefully; nothing looks clipped. */}
      <section
        aria-labelledby="hero-title"
        className="mx-auto max-w-[var(--container-page)] overflow-x-clip px-6 pt-16 pb-12 md:pt-24 md:pb-20"
      >
        <div className="grid items-end gap-12 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="lowercase text-sm tracking-[0.18em] text-[var(--color-ink-muted)]">
              for nyc's movement artists
            </p>

            <h1
              id="hero-title"
              className="mt-5 font-[family-name:var(--font-display)] text-5xl leading-[1.02] tracking-tight md:text-6xl lg:text-7xl"
            >
              <span className="text-[var(--color-ink)]">the artist comes first.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-[var(--color-ink-muted)]">
              residencies, international exchange, and subsidized studio space — built around what
              each artist actually needs, not a template.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button as={Link} href="/opportunities" intent="brand" size="lg">
                browse opportunities
              </Button>
              <Button as={Link} href="/apply" intent="ink" size="lg">
                apply for a residency
              </Button>
            </div>
          </div>

          <div className="justify-self-center md:translate-x-6 md:justify-self-end lg:translate-x-10">
            <Wordmark width={360} priority className="h-auto" />
          </div>
        </div>
      </section>

      {/* Application-status strip — the artist's first question, answered
          before they scroll. Renders only when there's at least one open
          program; if everything's closed, we render the "next opening"
          framing instead (Skowhegan's "notify me" pattern). */}
      <section
        aria-labelledby="status-title"
        className="border-t border-[var(--color-rule)] bg-[var(--color-paper)]"
      >
        <div className="mx-auto flex max-w-[var(--container-page)] flex-col gap-4 px-6 py-8 md:flex-row md:items-baseline md:justify-between md:py-10">
          <p
            id="status-title"
            className="lowercase text-sm tracking-[0.16em] text-[var(--color-accent-ink)]"
          >
            {OPEN_PROGRAMS.length > 0 ? "applications open now" : "next applications opening"}
          </p>
          <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-3 text-sm">
            {(OPEN_PROGRAMS.length > 0 ? OPEN_PROGRAMS : PROGRAMS).map((p) => (
              <li key={p.id} className="flex items-baseline gap-2">
                <Link
                  href={p.applyHref}
                  className="text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
                >
                  {p.title.toLowerCase()}
                </Link>
                <span className="text-[var(--color-ink-muted)]">{p.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Opportunities preview — only renders when Supabase has live data.
          We keep the absence quiet (no "no opportunities yet" empty state)
          because a missing strip is honest; a manufactured one is not. */}
      {previewRows.length > 0 ? (
        <section
          aria-labelledby="opps-title"
          className="border-t border-[var(--color-rule)] bg-[var(--color-paper-warm)]"
        >
          <div className="mx-auto max-w-[var(--container-page)] px-6 py-16 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="lowercase text-sm tracking-[0.16em] text-[var(--color-accent-ink)]">
                  what's open right now
                </p>
                <h2
                  id="opps-title"
                  className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl"
                >
                  nyc dance opportunities we're tracking.
                </h2>
              </div>
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
              >
                browse all
                <SoftChevron size={12} className="text-[var(--color-brand-deep)]" />
              </Link>
            </div>

            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {previewRows.map((row) => (
                <li key={row.id}>
                  <a href={row.source_url} rel="noopener" target="_blank" className="block h-full">
                    <Card className="h-full hover:border-[var(--color-brand-deep)]/40">
                      <CardEyebrow>{row.type}</CardEyebrow>
                      <CardTitle className="mt-2">{row.name}</CardTitle>
                      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                        from {row.funder_name}
                      </p>
                      <p className="mt-3 line-clamp-3 text-sm text-[var(--color-ink)]">
                        {row.description_short}
                      </p>
                    </Card>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Cohort spotlight. Named-artist trust signal — peer proof carries
          more weight than funder logos for an artist deciding whether to
          apply (audit §6 + Subagent C). Self-suppresses when no cohort
          has loaded yet; one cohort + one artist still reads as honest. */}
      {spotlightCohort && spotlightArtists.length > 0 ? (
        <section
          aria-labelledby="cohort-title"
          className="mx-auto max-w-[var(--container-page)] px-6 py-16 md:py-20"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="lowercase text-sm tracking-[0.16em] text-[var(--color-accent-ink)]">
                who's working with us this season
              </p>
              <h2
                id="cohort-title"
                className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl"
              >
                {spotlightCohort.entry.title.toLowerCase()}.
              </h2>
              {spotlightCohort.entry.sponsor ? (
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                  supported by {spotlightCohort.entry.sponsor}
                  {spotlightCohort.entry.sharingDate
                    ? ` · sharing ${spotlightCohort.entry.sharingDate}`
                    : null}
                </p>
              ) : null}
            </div>
            <Link
              href={`/cohorts/${spotlightCohort.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
            >
              see the cohort
              <SoftChevron size={12} className="text-[var(--color-brand-deep)]" />
            </Link>
          </div>

          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {spotlightArtists.map((a) => (
              <li key={a.slug}>
                <Link href={`/artists/${a.slug}`} className="block h-full">
                  <Card className="h-full hover:border-[var(--color-brand-deep)]/40">
                    <CardEyebrow>artist · {a.entry.location || "in residence"}</CardEyebrow>
                    <CardTitle className="mt-2">{a.entry.name}</CardTitle>
                    {a.entry.headline ? (
                      <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
                        {a.entry.headline}
                      </p>
                    ) : null}
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Program trio. Drives from lib/programs.ts (single source of
          truth with the apply hub + status strip above). Lowercased on
          render to match the home register without duplicating strings. */}
      <section aria-labelledby="programs-title" className="border-t border-[var(--color-rule)]">
        <div className="mx-auto max-w-[var(--container-page)] px-6 py-16 md:py-20">
          <p className="lowercase text-sm tracking-[0.18em] text-[var(--color-ink-muted)]">
            what we do
          </p>
          <h2
            id="programs-title"
            className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl"
          >
            three programs, one principle.
          </h2>
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {PROGRAMS.map((p) => (
              <li key={p.id}>
                <Link href={p.programHref} className="block h-full">
                  <Card className="h-full hover:border-[var(--color-brand-deep)]/40">
                    <CardEyebrow>flagship</CardEyebrow>
                    <CardTitle className="mt-2">{p.title.toLowerCase()}</CardTitle>
                    <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{p.blurb}</p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Quiet pendency line + a single supporter framing. "Support our
          work" demoted from primary hero CTA per audit §6; the legal
          pendency disclosure stays visible while the 1023-EZ is in
          review (IRS substantiation framing). */}
      <section className="border-t border-[var(--color-rule)]">
        <div className="mx-auto flex max-w-[var(--container-page)] flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between md:py-16">
          <p className="max-w-xl text-sm text-[var(--color-ink-muted)]">
            {ORG.legalName} is a New York-incorporated nonprofit corporation (March 2026). Federal
            501(c)(3) tax-exempt status is pending — IRS Form 1023-EZ submitted May 2026.
          </p>
          <p className="text-sm text-[var(--color-ink)]">
            believe in this work?{" "}
            <Link
              href="/donate"
              className="underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
            >
              every dollar goes to artists
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
