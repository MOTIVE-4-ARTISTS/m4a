import Link from "next/link";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { listArtists } from "@/lib/content/reader";

export const metadata = {
  title: "Artists",
  description:
    "Movement-based artists we've supported across residencies, exchanges, and the discounted space subsidy.",
};

export default async function ArtistsPage() {
  const artists = await listArtists();

  return (
    <Section>
      <ProseHero
        eyebrow="Artists"
        title="The artists we've supported."
        lead="Bios update as the cohorts evolve. Editorial content lives in our git-backed CMS."
      />

      {artists.length === 0 ? (
        <p className="mt-12 text-[var(--color-ink-muted)]">
          No artists in the directory yet. Editors can add them via{" "}
          <Link href="/keystatic" className="underline">
            the CMS
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {artists.map(({ slug, entry }) => (
            <li key={slug}>
              <Link href={`/artists/${slug}`} className="block h-full">
                <Card className="h-full hover:border-[var(--color-brand-deep)]/40">
                  <CardEyebrow>{entry.location || "Artist"}</CardEyebrow>
                  <CardTitle className="mt-2">{entry.name || slug}</CardTitle>
                  {entry.headline ? (
                    <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{entry.headline}</p>
                  ) : null}
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
