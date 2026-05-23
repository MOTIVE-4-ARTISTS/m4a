import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./container";

// Vertical-rhythm primitive. Pairs with Container for the page grid.
// `tone="warm"` paints the section in the brand's paper-warm surface to
// break up otherwise visually identical blocks; "brand" is reserved for
// the rare callout (donate teaser, announcement banner).
type Tone = "default" | "warm" | "brand";

const toneClass: Record<Tone, string> = {
  default: "bg-[var(--color-paper)]",
  warm: "bg-[var(--color-paper-warm)]",
  brand: "bg-[var(--color-brand-soft)]",
};

export function Section({
  children,
  tone = "default",
  className,
  containerClassName,
  as: As = "section",
  ariaLabelledby,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  containerClassName?: string;
  as?: "section" | "header" | "footer" | "article" | "aside" | "div";
  ariaLabelledby?: string;
}) {
  return (
    <As
      aria-labelledby={ariaLabelledby}
      className={cn("py-16 md:py-24", toneClass[tone], className)}
    >
      <Container className={containerClassName}>{children}</Container>
    </As>
  );
}
