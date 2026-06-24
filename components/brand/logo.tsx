import Image from "next/image";
import Link from "next/link";
import { BRAND_ASSETS } from "@/lib/brand/assets";

type WordmarkVariant = "wordmark" | "wordmarkTight" | "wordmarkBrand";

// MOtiVE 4 Artists logo system.
//
// The official mark is a horizontal wordmark — "MOtiVE / △ / ARTists" on
// the brand yellow surface. Because the artwork already contains the full
// brand name, we never pair it with separate "MOtiVE 4 Artists" text in
// the UI; that would duplicate the wordmark and look like a knock-off.
//
// All paths and dimensions live in `lib/brand/assets.ts` — DO NOT add new
// places that reference `/brand/...` directly. If you need a new size or
// crop, add it to BRAND_ASSETS so future swaps stay surgical.
//
// Contrast rule (carried from globals.css): the white-on-yellow inside the
// artwork is brand art, not functional text. Any *functional* copy on a
// brand-yellow surface must use --color-ink.

type WordmarkProps = {
  // Rendered width in CSS pixels. Height derives from the chosen asset's
  // intrinsic ratio so the wordmark never stretches.
  width: number;
  className?: string;
  // Pass `priority` on the LCP wordmark (header + hero on the home page).
  // Leave undefined for incidental uses (footer, marketing pages below
  // the fold) so we don't fight Next.js' preload budget.
  priority?: boolean | undefined;
  // "wordmarkTight" is the padding-trimmed crop for slim placements (header);
  // "wordmark" is the full-padding master for larger standalone use.
  variant?: WordmarkVariant;
};

export function Wordmark({ width, className, priority, variant = "wordmark" }: WordmarkProps) {
  const asset = BRAND_ASSETS[variant];
  const height = Math.round((width * asset.height) / asset.width);
  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={width}
      height={height}
      priority={priority ?? false}
      className={className}
    />
  );
}

// Header / footer "click the logo to go home" treatment. The wordmark
// itself carries the alt text, so the <Link> gets `aria-label` for AT
// users and the image is the sole visual.
//
// Default is "wordmarkBrand" — the transparent brand-yellow letterforms — so
// the mark blends into the cream paper surface instead of sitting on a yellow
// plate (the old "floating sticker"). See ADR 0002 change log 2026-06-23.
export function BrandLockup({
  width = 68,
  className,
  priority,
  variant = "wordmarkBrand",
}: {
  width?: number;
  className?: string | undefined;
  priority?: boolean | undefined;
  variant?: WordmarkVariant;
}) {
  return (
    <Link href="/" aria-label="MOtiVE 4 Artists — home" className={className}>
      <Wordmark width={width} priority={priority} variant={variant} className="block h-auto" />
    </Link>
  );
}
