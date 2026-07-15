import Link from "next/link";
import { SoftChevron } from "@/components/brand/marks";
import { ArtistCarousel } from "@/components/content/artist-carousel";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { listArtists, listCohorts } from "@/lib/content/reader";
import { formatEventCompact, formatEventLocation } from "@/lib/events/format";
import { listEvents } from "@/lib/events/read";
import { listOpportunities } from "@/lib/opportunities/read";
import { OPEN_PROGRAMS, PROGRAMS, type ProgramId } from "@/lib/programs";
import { isReviewMode } from "@/lib/site-mode";

// The home page leads with the artist-first conviction, not institutional
// status or a picture of a room. The current cohort supplies the human proof
// lower on the page; the physical-space origin stays on /about/story, where the
// LLC/nonprofit transition has enough context.

// 90-day window picks up anything urgent without dragging in every
// rolling program when the homepage really wants to feel current.
const HOME_OPPORTUNITY_WINDOW_DAYS = 90;

// The application registry contains three intake programs. Pedagogies is a
// public program without a form, so the homepage adds it to the complete
// program overview without forcing it into application-status logic.
const HOME_PROGRAMS = [
  ...PROGRAMS,
  {
    id: "pedagogies",
    title: "Pedagogies",
    programHref: "/programs/pedagogies",
    blurb: "Bring a class or teaching practice; we'll help you shape, produce, and share it.",
  },
] as const;

const PROGRAM_NEEDS = {
  residency: { index: "01", need: "time to make" },
  international: { index: "02", need: "connection across borders" },
  discounted_space: { index: "03", need: "room to work" },
  pedagogies: { index: "04", need: "space to teach" },
} satisfies Record<ProgramId, { index: string; need: string }>;

export default async function HomePage() {
  // Review preview hides the surfaces that link into not-yet-launched routes
  // (Apply, Resources/Opportunities, Support, the events teaser). Content that
  // links only to allowed routes (cohorts, programs, story) stays.
  const review = isReviewMode();

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
      <section
        aria-labelledby="hero-title"
        className="overflow-hidden border-b border-[var(--color-rule)]"
      >
        <div className="mx-auto max-w-[var(--container-page)] px-6 pt-10 md:pt-14">
          <div className="flex justify-end border-t border-[var(--color-rule)] pt-4">
            <p className="text-xs lowercase tracking-[0.14em] text-[var(--color-ink-muted)]">
              starting in new york city · working across borders
            </p>
          </div>

          <h1
            id="hero-title"
            className="mt-8 max-w-[12ch] font-[family-name:var(--font-display)] text-[clamp(3.7rem,10vw,8.75rem)] leading-[0.88] tracking-[-0.055em]"
          >
            <span className="block">the artist</span>
            <span className="block md:ml-[0.72em]">comes first.</span>
          </h1>

          <div className="mt-9 grid gap-8 border-t border-[var(--color-rule)] pt-6 pb-10 md:grid-cols-[1fr_auto] md:items-end md:pb-12">
            <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-ink-muted)]">
              we shape residencies, exchanges, resources, and subsidized space around each artist's
              practice. the work begins with the artist, not the room.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {review ? (
                <>
                  <Button as={Link} href="/programs" intent="brand" size="lg">
                    explore the programs
                  </Button>
                  <Button as={Link} href="/artists" intent="ink" size="lg">
                    meet the artists
                  </Button>
                </>
              ) : (
                <>
                  <Button as={Link} href="/opportunities" intent="brand" size="lg">
                    browse resources
                  </Button>
                  <Button as={Link} href="/apply" intent="ink" size="lg">
                    see what's open
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Application-status strip — the artist's first question, answered
          before they scroll. Renders only when there's at least one open
          program; if everything's closed, we render the "next opening"
          framing instead (Skowhegan's "notify me" pattern). Hidden in review
          mode: every link here points at a blocked /apply/* route. */}
      {review ? null : (
        <section aria-labelledby="status-title" className="bg-[var(--color-paper)]">
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
      )}

      {/* Opportunities preview — only renders when Supabase has live data.
          We keep the absence quiet (no "no opportunities yet" empty state)
          because a missing strip is honest; a manufactured one is not.
          Also suppressed in review mode (every card links to /opportunities). */}
      {previewRows.length > 0 && !review ? (
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
                  artist opportunities we're tracking.
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
          Self-suppresses when nothing is upcoming. Hidden in review mode: the
          no-database fallback surfaces a real-looking event linking to the
          blocked /events route. */}
      {nextEvent && !review ? (
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

      <section aria-labelledby="programs-title" className="border-t border-[var(--color-rule)]">
        <div className="mx-auto grid max-w-[var(--container-page)] gap-10 px-6 py-16 md:grid-cols-[0.72fr_1.28fr] md:gap-16 md:py-24">
          <div>
            <p className="lowercase text-sm tracking-[0.18em] text-[var(--color-ink-muted)]">
              four programs, one principle
            </p>
            <h2
              id="programs-title"
              className="mt-3 max-w-md font-[family-name:var(--font-display)] text-4xl leading-tight tracking-tight md:text-5xl"
            >
              the structure follows the artist.
            </h2>
            <p className="mt-5 max-w-md text-[var(--color-ink-muted)]">
              time to make, connection across borders, room to work, and space to teach — four forms
              of support, each shaped through conversation.
            </p>
          </div>

          <ul className="border-t border-[var(--color-rule)]">
            {HOME_PROGRAMS.map((p) => (
              <li key={p.id} className="border-b border-[var(--color-rule)]">
                <Link
                  href={p.programHref}
                  className="group grid grid-cols-[2rem_1fr_auto] gap-4 py-6 md:grid-cols-[3rem_1fr_auto] md:py-8"
                >
                  <span className="pt-1 text-xs tabular-nums text-[var(--color-ink-muted)]">
                    {PROGRAM_NEEDS[p.id].index}
                  </span>
                  <div>
                    <p className="text-xs lowercase tracking-[0.16em] text-[var(--color-accent-ink)]">
                      {PROGRAM_NEEDS[p.id].need}
                    </p>
                    <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight">
                      {p.title.toLowerCase()}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-muted)]">{p.blurb}</p>
                  </div>
                  <SoftChevron
                    size={16}
                    className="mt-1 text-[var(--color-brand-deep)] transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="approach-title"
        className="bg-[var(--color-accent-ink)] text-[var(--color-paper)]"
      >
        <div className="mx-auto grid max-w-[var(--container-page)] gap-12 px-6 py-16 md:grid-cols-[0.68fr_1.32fr] md:py-24 lg:gap-20">
          <div>
            <p className="lowercase text-sm tracking-[0.18em] text-[var(--color-paper)]/60">
              how we work
            </p>
            <ol className="mt-8 space-y-4 border-t border-[var(--color-paper)]/20 pt-5 text-lg">
              <li className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="text-sm text-[var(--color-paper)]/55">01</span>
                <span>listen first.</span>
              </li>
              <li className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="text-sm text-[var(--color-paper)]/55">02</span>
                <span>build together.</span>
              </li>
              <li className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="text-sm text-[var(--color-paper)]/55">03</span>
                <span>let the artist define success.</span>
              </li>
            </ol>
          </div>
          <div>
            <h2
              id="approach-title"
              className="max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-tight tracking-tight md:text-6xl"
            >
              we begin with a conversation, not a package.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-paper)]/75">
              every residency, exchange, and subsidy starts by asking what the artist is trying to
              make and what is getting in the way. then we shape time, mentorship, connections,
              resources, and space around that work.
            </p>
            <Link
              href="/about/values"
              className="mt-9 inline-flex items-center gap-2 text-sm font-medium underline decoration-[var(--color-paper)]/45 underline-offset-4 hover:decoration-[var(--color-paper)]"
            >
              the values behind the work
              <SoftChevron size={12} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
