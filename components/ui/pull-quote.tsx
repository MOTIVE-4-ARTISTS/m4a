import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Pull quote — for the one sentence per editorial page that deserves its
// own visual weight. Audit §5 craft moves + §11 item 9 (the pull-quote
// move that breaks the templated `<blockquote>` default).
//
// Composition: viewport-relative display type, brand-deep ink, with a
// thick brand-yellow rule above. Optional attribution sits below at small
// scale in the muted ink color. The whole block has generous vertical
// padding so it reads as a pause, not as a continued paragraph.
//
// Use sparingly — one per page maximum. Its rarity is what gives it
// weight; a page with three pull quotes is a page with no pull quote.
export function PullQuote({
  children,
  attribution,
  className,
}: {
  children: ReactNode;
  attribution?: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "my-12 max-w-[40ch] border-t-2 border-[var(--color-brand)] pt-6 md:my-16",
        className,
      )}
    >
      <blockquote className="font-[family-name:var(--font-display)] text-3xl leading-[1.15] tracking-tight text-[var(--color-ink)] md:text-4xl">
        {children}
      </blockquote>
      {attribution ? (
        <figcaption className="mt-4 lowercase text-sm tracking-[0.16em] text-[var(--color-ink-muted)]">
          — {attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}
