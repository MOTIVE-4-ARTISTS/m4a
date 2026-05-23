import Image from "next/image";
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

// Initials monogram — same pattern as /team. Renders when an artist
// entry has no headshot in the Keystatic schema; we promised in the
// audit (recommendation §11 item 12 + asset playbook §1) that we'd
// never ship a flat text-only artist card again.
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
      className="flex h-full w-full items-center justify-center bg-[var(--color-brand-soft)] text-4xl text-[var(--color-brand-deep)] font-[family-name:var(--font-display)] font-semibold"
    >
      {initials}
    </div>
  );
}

export default async function ArtistsPage() {
  const artists = await listArtists();

  return (
    <Section>
      <ProseHero
        eyebrow="Artists"
        title="the artists we've supported."
        lead="bios update as the cohorts evolve. editorial content lives in our git-backed CMS."
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
          {artists.map(({ slug, entry }) => {
            // Keystatic image fields resolve to a string path when set,
            // null when empty. The headshot directory is /content/artists/
            // (see keystatic.config.ts) so we render via next/image with
            // a fixed aspect to keep the grid tidy.
            const headshot = entry.headshot;
            return (
              <li key={slug}>
                <Link href={`/artists/${slug}`} className="block h-full">
                  <Card className="flex h-full flex-col overflow-hidden p-0 hover:border-[var(--color-brand-deep)]/40">
                    <div className="relative aspect-[4/3] w-full">
                      {headshot ? (
                        <Image
                          src={headshot}
                          alt={entry.name || slug}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <ArtistInitials name={entry.name || slug} />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <CardEyebrow>{entry.location || "Artist"}</CardEyebrow>
                      <CardTitle className="mt-2">{entry.name || slug}</CardTitle>
                      {entry.headline ? (
                        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                          {entry.headline}
                        </p>
                      ) : null}
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
