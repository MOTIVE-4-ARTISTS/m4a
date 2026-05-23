import Image from "next/image";
import Link from "next/link";
import { BRAND_ASSETS, WORDMARK_ASPECT } from "@/lib/brand/assets";

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
  // Rendered width in CSS pixels. Height derives from the locked aspect
  // ratio in WORDMARK_ASPECT so the wordmark never stretches.
  width: number;
  className?: string;
  // Pass `priority` on the LCP wordmark (header + hero on the home page).
  // Leave undefined for incidental uses (footer, marketing pages below
  // the fold) so we don't fight Next.js' preload budget.
  priority?: boolean | undefined;
};

export function Wordmark({ width, className, priority }: WordmarkProps) {
  const height = Math.round((width * WORDMARK_ASPECT.height) / WORDMARK_ASPECT.width);
  return (
    <Image
      src={BRAND_ASSETS.wordmark.src}
      alt={BRAND_ASSETS.wordmark.alt}
      width={width}
      height={height}
      priority={priority ?? false}
      className={className}
    />
  );
}

// Square treatment of the same mark — only for genuinely-square surfaces
// (avatars, social profile images, square OG variants). For the favicon /
// apple-touch / OG fallback, prefer the files in `app/` which Next.js
// auto-discovers; this component is for in-page usage.
type SquareProps = {
  size: number;
  className?: string | undefined;
  priority?: boolean | undefined;
};

export function LogomarkSquare({ size, className, priority }: SquareProps) {
  return (
    <Image
      src={BRAND_ASSETS.square.src}
      alt={BRAND_ASSETS.square.alt}
      width={size}
      height={size}
      priority={priority ?? false}
      className={className}
    />
  );
}

// Header / footer "click the logo to go home" treatment. The wordmark
// itself carries the alt text, so the <Link> gets `aria-label` for AT
// users and the image is the sole visual.
export function BrandLockup({
  width = 168,
  className,
  priority,
}: {
  width?: number;
  className?: string | undefined;
  priority?: boolean | undefined;
}) {
  return (
    <Link
      href="/"
      aria-label="MOtiVE 4 Artists — home"
      className={className}
      // The wordmark already includes generous padding inside the artwork,
      // so we don't add extra spacing on the link itself.
    >
      <Wordmark width={width} priority={priority} className="block h-auto" />
    </Link>
  );
}
