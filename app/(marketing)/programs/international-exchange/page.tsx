import Image from "next/image";
import Link from "next/link";
import { CycleStatus } from "@/components/programs/cycle-status";
import { Button } from "@/components/ui/button";
import { HairlineRule } from "@/components/ui/hairline-rule";
import { Prose, ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { listArtists, listExchanges, listPartners } from "@/lib/content/reader";
import { PROGRAMS } from "@/lib/programs";
import { isReviewMode } from "@/lib/site-mode";

// The exchange is anchored to Bergen Dansesenter; their own
// /internasjonalt-samarbeid page documents the partnership from the
// Norwegian side (artist statements, year-by-year roster). Linking it is
// the reciprocal-credibility move — a peer org publicly vouching for the
// program — and it keeps us from re-hosting copy we don't own.
const BERGEN_EXCHANGE_URL = "https://bergendansesenter.no/internasjonalt-samarbeid";

export const metadata = {
  title: "International Exchange",
  description:
    "Long-term partnerships connecting movement-based artists in New York with peer organizations abroad. Travel both directions.",
};

const PROGRAM = PROGRAMS.find((p) => p.id === "international");

export default async function InternationalExchangePage() {
  const review = isReviewMode();
  const [exchanges, artists, partners] = await Promise.all([
    listExchanges(),
    listArtists(),
    listPartners(),
  ]);

  const artistName = new Map(artists.map((a) => [a.slug, a.entry.name || a.slug]));
  const partnerName = new Map(partners.map((p) => [p.slug, p.entry.name]));
  const partnerUrl = new Map(partners.map((p) => [p.slug, p.entry.url]));

  const orderedExchanges = [...exchanges].sort((a, b) => b.entry.year - a.entry.year);

  // Only partners with artwork get the logo treatment; the rest are still
  // credited inline on each exchange. Keeps the section honest as more
  // partner logos land without code changes.
  const featuredPartners = partners.filter((p) => Boolean(p.entry.logo));

  const PartnerHeading = ({ slug, fallback }: { slug: string | null; fallback: string }) => {
    const label = slug ? (partnerName.get(slug) ?? fallback) : fallback;
    const href = slug ? partnerUrl.get(slug) : null;
    return (
      <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
          >
            {label}
          </a>
        ) : (
          label
        )}
      </h2>
    );
  };

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

      {featuredPartners.length > 0 ? (
        <section aria-labelledby="partners-heading" className="mt-12">
          <p
            id="partners-heading"
            className="lowercase text-sm tracking-[0.18em] text-[var(--color-ink-muted)]"
          >
            partner organizations
          </p>
          <HairlineRule variant="short" className="mt-4 mb-8 border-[var(--color-brand)]" />
          <ul className="flex flex-col gap-6">
            {featuredPartners.map(({ slug, entry }) => (
              <li
                key={slug}
                className="grid overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-rule)] md:grid-cols-[minmax(0,17rem)_1fr]"
              >
                <div className="flex items-center justify-center bg-[var(--color-accent-ink)] p-8">
                  {entry.logo ? (
                    <Image
                      src={entry.logo}
                      alt={entry.name}
                      width={1500}
                      height={325}
                      className="h-auto w-full max-w-[13rem] object-contain"
                    />
                  ) : null}
                </div>
                <div className="p-6">
                  <h3 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
                    {entry.name}
                  </h3>
                  {entry.country ? (
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{entry.country}</p>
                  ) : null}
                  {entry.description ? (
                    <p className="mt-3 max-w-[55ch] text-sm text-[var(--color-ink)]">
                      {entry.description}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    {entry.url ? (
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
                      >
                        {new URL(entry.url).host.replace(/^www\./, "")} ↗
                      </a>
                    ) : null}
                    {slug === "bergen-dansesenter" ? (
                      <a
                        href={BERGEN_EXCHANGE_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
                      >
                        the exchange, from their side ↗
                      </a>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
                  <PartnerHeading slug={entry.partner} fallback={entry.title} />
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

      <figure className="mt-12 max-w-[60ch] border-l-2 border-[var(--color-brand)] pl-5">
        <blockquote className="font-[family-name:var(--font-display)] text-xl leading-snug tracking-tight text-[var(--color-ink)]">
          “I will leave residency here with not only a deeper understanding of my craft, but also a
          wealth of connections, information, new sources of inspiration, memories and archives
          generated across the two-week working period.”
        </blockquote>
        <figcaption className="mt-3 text-sm text-[var(--color-ink-muted)]">
          <Link
            href="/artists/neva-guido"
            className="text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
          >
            Neva Guido
          </Link>
          , MOtiVE artist in Bergen, 2023 ·{" "}
          <a
            href={BERGEN_EXCHANGE_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-ink)] underline decoration-[var(--color-brand-deep)] decoration-1 underline-offset-4 hover:decoration-2"
          >
            more reflections at Bergen Dansesenter ↗
          </a>
        </figcaption>
      </figure>

      <Prose className="mt-12">
        <h2>If you're an organization interested in partnering</h2>
        <p>
          Email <Link href="/connect">hello@motive4artists.org</Link>. We're a small team and we
          read everything.
        </p>

        <h2>If you're an artist applying for an upcoming exchange</h2>
        <p>
          When applications are open you'll find the form at{" "}
          {review ? (
            <code>/apply/international</code>
          ) : (
            <Link href="/apply/international">/apply/international</Link>
          )}
          .
        </p>
      </Prose>

      <div className="mt-10 flex gap-3">
        <Button as={Link} href="/artists" intent="ink" size="md">
          Browse past artists
        </Button>
        {review ? null : (
          <Button as={Link} href="/apply/international" intent="ghost" size="md">
            Application portal
          </Button>
        )}
      </div>
    </Section>
  );
}
