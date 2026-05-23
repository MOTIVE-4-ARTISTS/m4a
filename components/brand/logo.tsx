import Image from "next/image";
import Link from "next/link";

// Canonical logomark. The PNG lives at public/brand/logo.png (1024x1024 square,
// yellow surface with white wordmark). Used here as a raster mark; a future
// SVG redraw is tracked in docs/adr/ — see Phase 1 design pass.
//
// IMPORTANT contrast rule: the white-on-yellow inside the logomark is brand
// art, not functional text. Do not stretch this treatment to any other UI
// surface — functional copy on the brand yellow must use --color-ink.

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<Size, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 80,
  xl: 160,
};

export function Logomark({
  size = "sm",
  className,
  priority,
}: {
  size?: Size;
  className?: string;
  priority?: boolean;
}) {
  const px = SIZE_PX[size];
  return (
    <Image
      src="/brand/logo.png"
      alt="MOtiVE 4 Artists"
      width={px}
      height={px}
      priority={priority ?? false}
      className={className}
    />
  );
}

// Header / footer composition: small logomark beside a text wordmark so that
// the alt text + visual mark both convey the brand to assistive tech readers
// and visual readers respectively. The wordmark itself is decorative (hidden
// from screen readers because <Logomark>'s alt already announces the brand).
export function BrandLockup({ className, size = "sm" }: { className?: string; size?: Size }) {
  return (
    <Link href="/" aria-label="MOtiVE 4 Artists — home" className={className}>
      <span className="inline-flex items-center gap-3">
        <Logomark size={size} className="rounded-[var(--radius-card)] shadow-sm" />
        <span
          aria-hidden
          className="font-[family-name:var(--font-display)] text-lg leading-none tracking-tight text-[var(--color-ink)]"
        >
          MOtiVE <span className="text-[var(--color-brand-deep)]">4</span> Artists
        </span>
      </span>
    </Link>
  );
}
