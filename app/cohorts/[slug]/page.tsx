import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { reader } from "@/lib/content/reader";
import { MarkdocContent } from "@/lib/content/render-markdoc";

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

const programLabel: Record<string, string> = {
  air: "Artist in Residency",
  international: "International Exchange",
  support: "Artist Support",
  subsidy: "Discounted Space Subsidy",
};

export default async function CohortPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const entry = await reader.collections.cohorts.read(slug);
  if (!entry) notFound();

  const intro = await entry.intro();

  return (
    <Section>
      <ProseHero
        eyebrow={`${entry.year} · ${programLabel[entry.program] ?? entry.program}`}
        title={entry.title}
        {...(entry.sharingDate ? { lead: `Sharing: ${entry.sharingDate}` } : {})}
      />

      {entry.sponsor ? (
        <p className="mb-12 text-sm text-[var(--color-ink-muted)]">
          Supported by <span className="text-[var(--color-ink)]">{entry.sponsor}</span>
        </p>
      ) : null}

      <Prose className="mb-12">
        <MarkdocContent node={intro} />
      </Prose>

      {entry.artists && entry.artists.length > 0 ? (
        <>
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
            Cohort
          </p>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {entry.artists.map((artistSlug: string | null) => {
              if (!artistSlug) return null;
              return (
                <li key={artistSlug}>
                  <Link href={`/artists/${artistSlug}`}>
                    <Card className="h-full hover:border-[var(--color-brand-deep)]/40">
                      <CardEyebrow>Artist</CardEyebrow>
                      <CardTitle className="mt-2">{artistSlug.replace(/-/g, " ")}</CardTitle>
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
