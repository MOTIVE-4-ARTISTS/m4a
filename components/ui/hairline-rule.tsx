import { cn } from "@/lib/cn";

// Hairline rule — a soft, editorial alternative to the alternating
// section-tone pattern. 0.5px effective thickness, ink-charcoal at 30%
// opacity (matches the page's `--color-rule` token), used as a soft
// transition between editorial blocks instead of a full-width color
// band. Audit recommendation §11 item 8 + §5 craft move #5.
//
// Variants:
//  - "full"     spans the full container width (default; section separator)
//  - "short"    a small ~96px line — used between hero and body on
//               editorial pages where a full-width rule would be too loud
//  - "centered" same as short but center-aligned (alternative end glyph)
type Variant = "full" | "short" | "centered";

const variantClass: Record<Variant, string> = {
  full: "w-full",
  short: "w-24",
  centered: "mx-auto w-24",
};

export function HairlineRule({
  variant = "full",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <hr
      className={cn(
        "border-0 border-t border-[var(--color-rule)]",
        variantClass[variant],
        className,
      )}
    />
  );
}
