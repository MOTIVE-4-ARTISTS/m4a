import Image from "next/image";
import { notFound } from "next/navigation";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { reader } from "@/lib/content/reader";
import { MarkdocContent } from "@/lib/content/render-markdoc";

type Params = { slug: string };

export async function generateStaticParams() {
  const slugs = await reader.collections.artists.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const entry = await reader.collections.artists.read(slug);
  if (!entry) return { title: "Artist" };

  // Use the proper-case name from the frontmatter; the slug is kebab-lowercase
  // ASCII for URL hygiene and is the wrong thing to surface to humans.
  return {
    title: entry.name || slug,
    description: entry.headline || `Artist profile: ${entry.name || slug}`,
  };
}

export default async function ArtistPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const entry = await reader.collections.artists.read(slug);
  if (!entry) notFound();

  const bio = await entry.bio();

  return (
    <Section>
      <div className="grid items-start gap-12 md:grid-cols-[1fr_2fr]">
        {entry.headshot ? (
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-rule)]">
            <Image
              src={`/content/artists/${entry.headshot}`}
              alt={entry.name || slug}
              width={600}
              height={750}
              className="h-auto w-full"
            />
          </div>
        ) : null}

        <div>
          <ProseHero
            eyebrow={entry.location ? `Artist · ${entry.location}` : "Artist"}
            title={entry.name || slug}
            {...(entry.headline ? { lead: entry.headline } : {})}
          />

          {entry.disciplines && entry.disciplines.length > 0 ? (
            <ul className="mb-8 flex flex-wrap gap-2">
              {entry.disciplines.map((d: string) => (
                <li
                  key={d}
                  className="rounded-[var(--radius-pill)] border border-[var(--color-rule)] bg-[var(--color-paper-warm)] px-3 py-1 text-xs uppercase tracking-[0.15em] text-[var(--color-ink-muted)]"
                >
                  {d}
                </li>
              ))}
            </ul>
          ) : null}

          <Prose>
            <MarkdocContent node={bio} />
          </Prose>

          {entry.links && entry.links.length > 0 ? (
            <ul className="mt-8 flex flex-wrap gap-3 text-sm">
              {entry.links.map((link) =>
                link.url ? (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      rel="noopener"
                      target="_blank"
                      className="underline decoration-[var(--color-brand-deep)] underline-offset-4"
                    >
                      {link.label}
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
