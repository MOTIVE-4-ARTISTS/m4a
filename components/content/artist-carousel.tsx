import { ArtistTile } from "@/components/content/artist-tile";
import { Carousel } from "@/components/ui/carousel";

// Cohort/roster carousel. A thin server wrapper over the generic <Carousel />
// so the portrait <ArtistTile /> stays server-rendered (no extra client JS for
// the tiles themselves) while the carousel shell hydrates for autoplay +
// controls. Use anywhere we'd otherwise pick a "sample" of a roster — it shows
// the *whole* cohort, rotating, instead of slicing to the first three.
//
// Customisation: `autoplayMs` (0 = manual only) and `itemClassName` (slides per
// view) pass straight through to <Carousel />.
export type CarouselArtist = {
  slug: string;
  name: string;
  headline: string;
  location: string;
  headshot: string | null;
};

export function ArtistCarousel({
  artists,
  ariaLabel,
  eyebrow,
  autoplayMs,
  itemClassName,
}: {
  artists: CarouselArtist[];
  ariaLabel: string;
  eyebrow?: string;
  autoplayMs?: number;
  itemClassName?: string;
}) {
  if (artists.length === 0) return null;

  return (
    <Carousel
      ariaLabel={ariaLabel}
      {...(autoplayMs !== undefined ? { autoplayMs } : {})}
      {...(itemClassName !== undefined ? { itemClassName } : {})}
      slides={artists.map((a) => ({
        id: a.slug,
        node: (
          <ArtistTile
            slug={a.slug}
            name={a.name}
            headline={a.headline}
            location={a.location}
            headshot={a.headshot}
            {...(eyebrow ? { eyebrow } : {})}
          />
        ),
      }))}
    />
  );
}
