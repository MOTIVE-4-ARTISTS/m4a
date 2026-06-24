import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SoftChevron } from "@/components/brand/marks";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { HairlineRule } from "@/components/ui/hairline-rule";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { reader } from "@/lib/content/reader";
import { MarkdocContent } from "@/lib/content/render-markdoc";
import { COHORT_PROGRAM_HREF, COHORT_PROGRAM_LABEL, type CohortProgram } from "@/lib/programs";

type Params = { slug: string };

export async function generateStaticParams() {
  const slugs = await reader.collections.cohorts.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const entry = await reader.collections.cohorts.read(slug);
  if (!entry) return { title: "Cohort" };
  return {
    title: entry.title,
    description: `Cohort: ${entry.title}${entry.sponsor ? ` (supported by ${entry.sponsor})` : ""}`,
  };
}

// Program label + the optional public program page for a cohort's family
// come from the shared registry in lib/programs.ts so cohorts, programs,
// and the apply hub stay in sync.
function programLabelFor(program: string): string {
  return COHORT_PROGRAM_LABEL[program as CohortProgram] ?? program;
}

function CohortArtistInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center bg-[var(--color-brand-soft)] text-4xl text-[var(--color-brand-deep)] font-[family-name:var(--font-display)] font-semibold"
    >
      {initials}
    </div>
  );
}

export default async function CohortPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const entry = await reader.collections.cohorts.read(slug);
  if (!entry) notFound();

  const intro = await entry.intro();

  // Resolve artist relationships in parallel. Each entry in entry.artists
  // is a slug (or null for unset). We read the full artist entry for each
  // valid slug so the cohort tile can show the real name, headshot, and
  // headline rather than the title-cased slug fallback the previous
  // version of this page shipped with.
  const cohortArtists = await Promise.all(
    (entry.artists ?? [])
      .filter((s): s is string => Boolean(s))
      .map(async (artistSlug) => ({
        slug: artistSlug,
        entry: await reader.collections.artists.read(artistSlug),
      })),
  );
  const resolved = cohortArtists.filter((a) => a.entry !== null);

  const programHref = COHORT_PROGRAM_HREF[entry.program as CohortProgram];

  return (
    <Section>
      <ProseHero
        eyebrow={`${entry.year} · ${programLabelFor(entry.program)}`}
        title={entry.title.toLowerCase()}
        {...(entry.sharingDate ? { lead: `sharing · ${entry.sharingDate}` } : {})}
      />

      {entry.sponsor ? (
        <p className="mb-8 lowercase text-sm tracking-[0.16em] text-[var(--color-accent-ink)]">
          supported by <span className="normal-case text-[var(--color-ink)]">{entry.sponsor}</span>
        </p>
      ) : null}

      {programHref ? (
        <p className="mb-8 text-sm">
          <Link
            href={programHref}
            className="inline-flex items-baseline gap-2 text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
          >
            about the {programLabelFor(entry.program)} program
            <SoftChevron size={11} className="text-[var(--color-brand-deep)]" />
          </Link>
        </p>
      ) : null}

      <HairlineRule variant="short" className="mb-12 border-[var(--color-brand)]" />

      <Prose className="mb-16">
        <MarkdocContent node={intro} />
      </Prose>

      {resolved.length > 0 ? (
        <>
          <p className="mb-4 lowercase text-sm tracking-[0.18em] text-[var(--color-ink-muted)]">
            the cohort
          </p>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resolved.map(({ slug: artistSlug, entry: a }) => {
              if (!a) return null;
              const name = a.name || artistSlug;
              return (
                <li key={artistSlug}>
                  <Link href={`/artists/${artistSlug}`} className="block h-full">
                    <Card className="flex h-full flex-col overflow-hidden p-0 hover:border-[var(--color-brand-deep)]/40">
                      <div className="relative aspect-[4/5] w-full">
                        {a.headshot ? (
                          <Image
                            src={a.headshot}
                            alt={name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <CohortArtistInitials name={name} />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <CardEyebrow>{a.location || "artist"}</CardEyebrow>
                        <CardTitle className="mt-2">{name}</CardTitle>
                        {a.headline ? (
                          <p className="mt-2 line-clamp-3 text-sm text-[var(--color-ink-muted)]">
                            {a.headline}
                          </p>
                        ) : null}
                        <span className="mt-4 inline-flex items-baseline gap-1.5 text-xs text-[var(--color-brand-deep)]">
                          see profile
                          <SoftChevron size={10} className="text-[var(--color-brand-deep)]" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </Section>
  );
}
