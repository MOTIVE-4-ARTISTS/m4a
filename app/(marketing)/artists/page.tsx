import Link from "next/link";
import { SoftChevron } from "@/components/brand/marks";
import { ArtistTile } from "@/components/content/artist-tile";
import { HairlineRule } from "@/components/ui/hairline-rule";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { listArtists, listCohorts, listExchanges } from "@/lib/content/reader";
import { COHORT_PROGRAM_LABEL, type CohortProgram } from "@/lib/programs";

export const metadata = {
  title: "Artists",
  description:
    "Artists we've supported across residencies, the international exchange, and the discounted space subsidy — grouped by cohort.",
};

// The directory is browsed by cohort, not as one flat A-Z wall: an artist's
// most legible context is "who they came up with." Sections run newest-first;
// each year-cohort is one program's intake, and the International Exchange (a
// bilateral, partner-anchored thing) gets its own section rather than being
// flattened into a fake cohort. Order within a year puts the residency first.
const PROGRAM_ORDER: Record<CohortProgram, number> = {
  air: 0,
  support: 1,
  subsidy: 2,
  international: 3,
};

export default async function ArtistsPage() {
  const [artists, cohorts, exchanges] = await Promise.all([
    listArtists(),
    listCohorts(),
    listExchanges(),
  ]);

  const bySlug = new Map(artists.map((a) => [a.slug, a]));
  const resolve = (slugs: readonly (string | null)[] | undefined) =>
    (slugs ?? [])
      .filter((s): s is string => Boolean(s))
      .map((s) => bySlug.get(s))
      .filter((a): a is (typeof artists)[number] => a !== undefined);

  const cohortSections = [...cohorts]
    .sort((a, b) => {
      if (b.entry.year !== a.entry.year) return b.entry.year - a.entry.year;
      return (
        (PROGRAM_ORDER[a.entry.program as CohortProgram] ?? 9) -
        (PROGRAM_ORDER[b.entry.program as CohortProgram] ?? 9)
      );
    })
    .map((c) => ({
      key: c.slug,
      href: `/cohorts/${c.slug}`,
      year: c.entry.year,
      label: COHORT_PROGRAM_LABEL[c.entry.program as CohortProgram] ?? c.entry.program,
      members: resolve(c.entry.artists),
    }))
    .filter((s) => s.members.length > 0);

  // Exchange artists, de-duplicated across all exchange instances.
  const exchangeArtists = (() => {
    const seen = new Set<string>();
    const out: (typeof artists)[number][] = [];
    for (const e of [...exchanges].sort((a, b) => b.entry.year - a.entry.year)) {
      for (const a of [...resolve(e.entry.incomingArtists), ...resolve(e.entry.outgoingArtists)]) {
        if (!seen.has(a.slug)) {
          seen.add(a.slug);
          out.push(a);
        }
      }
    }
    return out;
  })();

  return (
    <Section>
      <ProseHero
        eyebrow="Artists"
        title="the artists we've supported."
        lead="grouped by the cohort they came up with — residencies, the international exchange, and the discounted space subsidy."
      />

      {cohortSections.length === 0 && exchangeArtists.length === 0 ? (
        <p className="mt-12 text-[var(--color-ink-muted)]">
          No artists in the directory yet. Editors can add them via{" "}
          <Link href="/keystatic" className="underline">
            the CMS
          </Link>
          .
        </p>
      ) : null}

      {cohortSections.map((section) => (
        <section key={section.key} className="mt-16 first:mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl">
              <span className="text-[var(--color-accent-ink)]">{section.year}</span>{" "}
              <span className="lowercase text-[var(--color-ink-muted)]">{section.label}</span>
            </h2>
            <Link
              href={section.href}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
            >
              the cohort
              <SoftChevron size={11} className="text-[var(--color-brand-deep)]" />
            </Link>
          </div>
          <HairlineRule variant="short" className="mt-4 mb-8 border-[var(--color-brand)]" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {section.members.map((a) => (
              <li key={a.slug}>
                <ArtistTile
                  slug={a.slug}
                  name={a.entry.name || a.slug}
                  headline={a.entry.headline}
                  location={a.entry.location}
                  headshot={a.entry.headshot}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {exchangeArtists.length > 0 ? (
        <section className="mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl lowercase text-[var(--color-ink-muted)]">
              international exchange
            </h2>
            <Link
              href="/programs/international-exchange"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
            >
              the exchange
              <SoftChevron size={11} className="text-[var(--color-brand-deep)]" />
            </Link>
          </div>
          <HairlineRule variant="short" className="mt-4 mb-8 border-[var(--color-brand)]" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {exchangeArtists.map((a) => (
              <li key={a.slug}>
                <ArtistTile
                  slug={a.slug}
                  name={a.entry.name || a.slug}
                  headline={a.entry.headline}
                  location={a.entry.location}
                  headshot={a.entry.headshot}
                  eyebrow="exchange artist"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Section>
  );
}
