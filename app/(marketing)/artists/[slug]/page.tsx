import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SoftChevron, StarMark } from "@/components/brand/marks";
import { HairlineRule } from "@/components/ui/hairline-rule";
import { Prose } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { listCohortsForArtist, listExchangesForArtist, reader } from "@/lib/content/reader";
import { MarkdocContent } from "@/lib/content/render-markdoc";
import { COHORT_PROGRAM_LABEL, type CohortProgram } from "@/lib/programs";

type Params = { slug: string };

// Keystatic's image field already includes the publicPath prefix on the
// returned string. The previous version of this page double-prefixed it
// ("/content/artists//content/artists/foo.jpg") which broke any artist
// that had a real headshot uploaded. Now matches the /artists list page
// pattern: pass entry.headshot through to next/image as-is.

export async function generateStaticParams() {
  const slugs = await reader.collections.artists.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const entry = await reader.collections.artists.read(slug);
  if (!entry) return { title: "Artist" };
  return {
    title: entry.name || slug,
    description: entry.headline || `Artist profile: ${entry.name || slug}`,
  };
}

function ArtistInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center bg-[var(--color-brand-soft)] text-6xl text-[var(--color-brand-deep)] font-[family-name:var(--font-display)] font-semibold"
    >
      {initials}
    </div>
  );
}

export default async function ArtistPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const entry = await reader.collections.artists.read(slug);
  if (!entry) notFound();

  const bio = await entry.bio();
  const name = entry.name || slug;

  // Backlinks: which cohort(s) + exchange(s) this artist took part in. Derived
  // from the rosters (the artist schema doesn't store membership) so the
  // profile shows the artist's history without a second source of truth.
  const [memberCohorts, memberExchanges] = await Promise.all([
    listCohortsForArtist(slug),
    listExchangesForArtist(slug),
  ]);
  const appearances = [
    ...memberCohorts.map((c) => ({
      key: `c-${c.slug}`,
      href: `/cohorts/${c.slug}`,
      year: c.entry.year,
      label: COHORT_PROGRAM_LABEL[c.entry.program as CohortProgram] ?? c.entry.program,
    })),
    ...memberExchanges.map((e) => ({
      key: `e-${e.slug}`,
      href: "/programs/international-exchange",
      year: e.entry.year,
      label: "International Exchange",
    })),
  ].sort((a, b) => b.year - a.year);

  return (
    <Section>
      <div className="grid items-start gap-12 md:grid-cols-[2fr_3fr]">
        {/* Portrait column. 4:5 vertical aspect — the editorial standard
            for arts-org artist portraits (Jacob's Pillow, NY Live Arts,
            Gibney all use this ratio). Border + soft shadow gives it a
            "tipped-in print" feel even when the source is a phone photo. */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-rule)]">
          {entry.headshot ? (
            <Image
              src={entry.headshot}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
              priority
            />
          ) : (
            <ArtistInitials name={name} />
          )}
        </div>

        <div>
          <p className="lowercase text-sm tracking-[0.18em] text-[var(--color-accent-ink)]">
            artist{entry.location ? ` · ${entry.location}` : ""}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-[1.05] tracking-tight md:text-5xl">
            {name}
          </h1>
          {entry.pronouns ? (
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{entry.pronouns}</p>
          ) : null}
          {entry.headline ? (
            <p className="mt-6 max-w-[40ch] text-xl leading-snug text-[var(--color-ink)]">
              {entry.headline}
            </p>
          ) : null}

          {entry.disciplines && entry.disciplines.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {entry.disciplines.map((d: string) => (
                <li
                  key={d}
                  className="lowercase rounded-[var(--radius-pill)] border border-[var(--color-rule)] bg-[var(--color-paper-warm)] px-3 py-1 text-xs tracking-[0.14em] text-[var(--color-ink-muted)]"
                >
                  {d}
                </li>
              ))}
            </ul>
          ) : null}

          <HairlineRule variant="short" className="my-8 border-[var(--color-brand)]" />

          <Prose>
            <MarkdocContent node={bio} />
          </Prose>

          {entry.links && entry.links.length > 0 ? (
            <>
              <p className="mt-12 lowercase text-xs tracking-[0.18em] text-[var(--color-ink-muted)]">
                elsewhere
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {entry.links.map((link) =>
                  link.url ? (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        rel="noopener"
                        target="_blank"
                        className="inline-flex items-baseline gap-2 text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
                      >
                        {link.label}
                        <SoftChevron size={11} className="text-[var(--color-brand-deep)]" />
                      </a>
                    </li>
                  ) : null,
                )}
              </ul>
            </>
          ) : null}

          {appearances.length > 0 ? (
            <>
              <p className="mt-12 lowercase text-xs tracking-[0.18em] text-[var(--color-ink-muted)]">
                appeared in
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {appearances.map((ap) => (
                  <li key={ap.key}>
                    <Link
                      href={ap.href}
                      className="inline-flex items-baseline gap-2 text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
                    >
                      <span className="text-[var(--color-accent-ink)]">{ap.year}</span>
                      <span className="lowercase">{ap.label}</span>
                      <SoftChevron size={11} className="text-[var(--color-brand-deep)]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>

      {/* End glyph — the audit's "second-layer reward" detail. Same
          treatment used on /about/vision so the punctuation feels
          consistent across long editorial pages. */}
      <div className="mt-16 flex justify-center">
        <StarMark size={20} className="text-[var(--color-brand-deep)]" />
      </div>
    </Section>
  );
}
