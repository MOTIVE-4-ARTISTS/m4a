import Link from "next/link";
import { CycleStatus } from "@/components/programs/cycle-status";
import { Button } from "@/components/ui/button";
import { HairlineRule } from "@/components/ui/hairline-rule";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { listArtists, listExchanges, listPartners } from "@/lib/content/reader";
import { PROGRAMS } from "@/lib/programs";

export const metadata = {
  title: "International Exchange",
  description:
    "Long-term partnerships connecting movement-based artists in New York with peer organizations abroad. Travel both directions.",
};

const PROGRAM = PROGRAMS.find((p) => p.id === "international");

export default async function InternationalExchangePage() {
  const [exchanges, artists, partners] = await Promise.all([
    listExchanges(),
    listArtists(),
    listPartners(),
  ]);

  const artistName = new Map(artists.map((a) => [a.slug, a.entry.name || a.slug]));
  const partnerName = new Map(partners.map((p) => [p.slug, p.entry.name]));

  const orderedExchanges = [...exchanges].sort((a, b) => b.entry.year - a.entry.year);

  const ArtistLinks = ({ slugs }: { slugs: readonly (string | null)[] | undefined }) => (
    <>
      {(slugs ?? [])
        .filter((s): s is string => Boolean(s))
        .map((s, i, arr) => (
          <span key={s}>
            <Link
              href={`/artists/${s}`}
              className="text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
            >
              {artistName.get(s) ?? s}
            </Link>
            {i < arr.length - 1 ? ", " : ""}
          </span>
        ))}
    </>
  );

  return (
    <Section>
      <ProseHero
        eyebrow="Programs · International Exchange"
        title="partnerships that move both directions."
        lead="we connect artists to international venues, companies, and systems of support — and host their artists when they come to New York."
      />
      {PROGRAM ? <CycleStatus program={PROGRAM} /> : null}
      <Prose>
        <p>
          We believe in the benefits of international exchange not only for artwork but for social
          change. We give artists the platform to travel the world in making and presenting their
          work, and we host the artists who travel here. Creating long-lasting relationships is
          important to us.
        </p>
      </Prose>

      {orderedExchanges.length > 0 ? (
        <div className="mt-12">
          <p className="lowercase text-sm tracking-[0.18em] text-[var(--color-ink-muted)]">
            the exchanges
          </p>
          <HairlineRule variant="short" className="mt-4 mb-8 border-[var(--color-brand)]" />
          <ul className="flex flex-col gap-8">
            {orderedExchanges.map(({ slug, entry }) => (
              <li key={slug} className="grid gap-2 md:grid-cols-[auto_1fr] md:gap-8">
                <div className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-accent-ink)]">
                  {entry.year}
                </div>
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
                    {entry.partner ? (partnerName.get(entry.partner) ?? entry.title) : entry.title}
                  </h2>
                  {entry.dates ? (
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{entry.dates}</p>
                  ) : null}
                  <dl className="mt-3 grid gap-1 text-sm">
                    {(entry.incomingArtists ?? []).filter(Boolean).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        <dt className="lowercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                          to nyc:
                        </dt>
                        <dd>
                          <ArtistLinks slugs={entry.incomingArtists} />
                        </dd>
                      </div>
                    ) : null}
                    {(entry.outgoingArtists ?? []).filter(Boolean).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        <dt className="lowercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                          abroad:
                        </dt>
                        <dd>
                          <ArtistLinks slugs={entry.outgoingArtists} />
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  {entry.work || entry.support ? (
                    <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                      {entry.work ? <em>{entry.work}</em> : null}
                      {entry.work && entry.support ? " · " : null}
                      {entry.support ? `supported by ${entry.support}` : null}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Prose className="mt-12">
        <h2>If you're an organization interested in partnering</h2>
        <p>
          Email <Link href="/connect">hello@motive4artists.org</Link>. We're a small team and we
          read everything.
        </p>

        <h2>If you're an artist applying for an upcoming exchange</h2>
        <p>
          When applications are open you'll find the form at{" "}
          <Link href="/apply/international">/apply/international</Link>.
        </p>
      </Prose>

      <div className="mt-10 flex gap-3">
        <Button as={Link} href="/artists" intent="ink" size="md">
          Browse past artists
        </Button>
        <Button as={Link} href="/apply/international" intent="ghost" size="md">
          Application portal
        </Button>
      </div>
    </Section>
  );
}
