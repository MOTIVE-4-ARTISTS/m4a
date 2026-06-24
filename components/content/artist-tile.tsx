import Image from "next/image";
import Link from "next/link";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";

// Portrait-first artist tile. Peer proof carries more weight than funder
// logos for an artist deciding whether to apply (design audit §6), and a real
// face does that work a text card can't. Used in the home cohort spotlight and
// the artists directory. Fixed 4:5 frame normalizes the mixed portrait/landscape
// source crops so a grid of mismatched headshots still reads as one set;
// object-top keeps faces in frame when a landscape shot is cropped tall.
type ArtistTileProps = {
  slug: string;
  name: string;
  headline?: string | null;
  location?: string | null;
  headshot?: string | null;
  eyebrow?: string;
};

export function ArtistTile({
  slug,
  name,
  headline,
  location,
  headshot,
  eyebrow = "artist",
}: ArtistTileProps) {
  return (
    <Link href={`/artists/${slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden p-0 hover:border-[var(--color-brand-deep)]/40">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--color-brand-soft)]">
          {headshot ? (
            <Image
              src={headshot}
              alt={name}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center font-[family-name:var(--font-display)] text-5xl text-[var(--color-brand-deep)]/50">
              {name.charAt(0)}
            </span>
          )}
        </div>
        <div className="p-6">
          <CardEyebrow>{location ? `${eyebrow} · ${location}` : eyebrow}</CardEyebrow>
          <CardTitle className="mt-2">{name}</CardTitle>
          {headline ? (
            <p className="mt-3 line-clamp-3 text-sm text-[var(--color-ink-muted)]">{headline}</p>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
