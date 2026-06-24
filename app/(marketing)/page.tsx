import Image from "next/image";
import Link from "next/link";
import { SoftChevron } from "@/components/brand/marks";
import { ArtistCarousel } from "@/components/content/artist-carousel";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { listArtists, listCohorts } from "@/lib/content/reader";
import { formatEventCompact, formatEventLocation } from "@/lib/events/format";
import { listEvents } from "@/lib/events/read";
import { listOpportunities } from "@/lib/opportunities/read";
import { ORG } from "@/lib/org";
import { OPEN_PROGRAMS, PROGRAMS } from "@/lib/programs";

// Home page — artist-first, per the May 2026 design audit. Decisions
// live in docs/research/design-audit-2026-05.md §6 + §11; the photography
// choices trace to docs/research/photo-mapping-2026-06.md. The composition
// from top to bottom:
//
//  1. Hero. "the artist comes first." as the h1, paired with a real photo of
//     the 68 Jay St studio — the audit's #1 gap was "no dancer/space imagery."
//     Brand-yellow stays reserved for the "browse opportunities" CTA.
//  2. Application-status strip. The artist's first question is "is
//     anything open right now?" — answer it before they scroll. Sourced
//     from lib/programs.ts so the apply hub + home + future announcement
//     banner share a single registry.
//  3. Opportunities preview. 3 live rows from Supabase when configured;
//     the section self-suppresses when empty so we never ship a fake
//     placeholder.
//  4. Cohort spotlight. Named-artist peer-proof per audit §6 — an
//     auto-rotating carousel of the *entire* current cohort
//     (<ArtistCarousel />), not a hand-picked sample of three.
//  5. Next-event teaser (quiet, self-suppressing).
//  6. Program trio (drives from PROGRAMS — single source of truth).
//  7. Founders band. The one authentic candid (the two founders painting the
//     studio) humanizes the page and carries the "built by artists" ethos.
//  8. Pendency line + single demoted "support" framing.

// 90-day window picks up anything urgent without dragging in every
// rolling program when the homepage really wants to feel current.
const HOME_OPPORTUNITY_WINDOW_DAYS = 90;

export default async function HomePage() {
  // Parallel fetch — independent reads, ~no benefit to serializing.
  const [opps, cohorts, artists, events] = await Promise.all([
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
    listEvents(),
  ]);

  const previewRows = opps.rows.slice(0, 3);

  // The single next upcoming event, surfaced as a quiet teaser. Renders
  // only when there's something on the calendar.
  const nextEvent = events.upcoming[0] ?? null;

  // Cohort spotlight: pick the most recent cohort by year (desc) and surface
  // the *whole* roster in an auto-rotating carousel — we show everyone, not a
  // "first three" slice. Quiet-fail if either is empty.
  const spotlightCohort = [...cohorts].sort((a, b) => b.entry.year - a.entry.year)[0];
  const spotlightArtists = spotlightCohort
    ? (spotlightCohort.entry.artists ?? [])
        .map((slug) => artists.find((a) => a.slug === slug))
        .filter((a): a is (typeof artists)[number] => a !== undefined)
    : [];

  return (
    <>
      {/* Hero. The brand mark already lives in the header, so the type leads;
          the studio photo (real 68 Jay St space) does the work the empty paper
          used to leave undone. Two columns on desktop, stacked on mobile with
          the image first so small screens still open on a photograph. */}
      <section
        aria-labelledby="hero-title"
        className="mx-auto max-w-[var(--container-page)] px-6 pt-12 pb-12 md:pt-20 md:pb-20"
      >
        <div className="grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="order-2 md:order-1">
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

          <div className="relative order-1 aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-paper-warm)] md:order-2 md:aspect-[5/4]">
            <Image
              src="/content/places/68jay-windows.jpg"
              alt="MOtiVE's studio at 68 Jay Street in Dumbo, Brooklyn — wood floor, tall windows, daylight"
              fill
              priority
              sizes="(min-width: 768px) 46vw, 100vw"
              className="object-cover"
            />
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

          <div className="mt-8">
            <ArtistCarousel
              ariaLabel={`${spotlightCohort.entry.title} — the cohort`}
              artists={spotlightArtists.map((a) => ({
                slug: a.slug,
                name: a.entry.name,
                headline: a.entry.headline,
                location: a.entry.location || "in residence",
                headshot: a.entry.headshot,
              }))}
            />
          </div>
        </section>
      ) : null}

      {/* Next event teaser. One quiet line pointing at the soonest event.
          Self-suppresses when nothing is upcoming. */}
      {nextEvent ? (
        <section
          aria-labelledby="next-event-title"
          className="border-t border-[var(--color-rule)] bg-[var(--color-paper-warm)]"
        >
          <div className="mx-auto flex max-w-[var(--container-page)] flex-col gap-3 px-6 py-10 md:flex-row md:items-baseline md:justify-between md:py-12">
            <div>
              <p className="lowercase text-sm tracking-[0.16em] text-[var(--color-accent-ink)]">
                next up
              </p>
              <h2
                id="next-event-title"
                className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight"
              >
                {nextEvent.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                {formatEventCompact(nextEvent)} · {formatEventLocation(nextEvent)}
              </p>
            </div>
            <Link
              href={`/events/${nextEvent.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
            >
              details + calendar
              <SoftChevron size={12} className="text-[var(--color-brand-deep)]" />
            </Link>
          </div>
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

      {/* Founders band. The single authentic candid in the archive — the two
          founders painting the studio by hand — does more for trust than any
          stock render. Image-led, two columns, to break the eyebrow+grid rhythm
          the page repeats above. Copy traces to Lilach's bio + the AGENTS voice. */}
      <section
        aria-labelledby="who-title"
        className="border-t border-[var(--color-rule)] bg-[var(--color-paper-warm)]"
      >
        <div className="mx-auto grid max-w-[var(--container-page)] items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-20 lg:gap-16">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-paper)]">
            <Image
              src="/content/about/founders-painting.jpg"
              alt="MOtiVE founders Lilach Orenstein and Meredith Glisson painting the Dumbo studio by hand"
              fill
              sizes="(min-width: 768px) 46vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="lowercase text-sm tracking-[0.18em] text-[var(--color-ink-muted)]">
              who's behind this
            </p>
            <h2
              id="who-title"
              className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl"
            >
              built by artists, for artists.
            </h2>
            <p className="mt-5 max-w-xl text-[var(--color-ink-muted)]">
              MOtiVE started with two artists painting an empty Dumbo studio by hand. That hands-on
              instinct still runs the programs — every residency begins with a one-on-one
              conversation about what the artist actually needs.
            </p>
            <div className="mt-8">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
              >
                our story
                <SoftChevron size={12} className="text-[var(--color-brand-deep)]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet legal-identity line + a single supporter framing. "Support
          our work" demoted from primary hero CTA per audit §6; the legal
          status line stays visible as an IRS substantiation / trust signal. */}
      <section className="border-t border-[var(--color-rule)]">
        <div className="mx-auto flex max-w-[var(--container-page)] flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between md:py-16">
          <p className="max-w-xl text-sm text-[var(--color-ink-muted)]">
            {ORG.legalName} is a New York-incorporated nonprofit corporation and a federally
            recognized 501(c)(3) tax-exempt organization (effective {ORG.taxExemptEffective}).
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
