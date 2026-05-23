import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Long-form copy primitive. Used by every MDX-rendered page and any place
// that contains editorial text. Tuned to the brand's display + body fonts
// and reading line length (~65ch).
//
// Headings use --font-display (Quicksand) to echo the logomark; body uses
// --font-body (Inter) for legibility. Link styling defaults to underline-
// on-hover; the underline-offset gives the soft, editorial feel of the
// MOtiVE Brooklyn voice.
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-[65ch] text-[var(--color-ink)] leading-relaxed",
        // headings
        "[&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-3xl [&_h2]:tracking-tight [&_h2]:mt-12 [&_h2]:mb-4",
        "[&_h3]:font-[family-name:var(--font-display)] [&_h3]:text-xl [&_h3]:tracking-tight [&_h3]:mt-8 [&_h3]:mb-3",
        // paragraphs and lists
        "[&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:my-1",
        // emphasis
        "[&_strong]:font-medium [&_strong]:text-[var(--color-ink)]",
        "[&_em]:italic",
        // links: visible state required by WCAG 1.4.1 — never communicate
        // by color alone; always include an underline.
        "[&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[var(--color-brand-deep)] [&_a]:decoration-1 hover:[&_a]:decoration-2",
        // quotes
        "[&_blockquote]:border-l-2 [&_blockquote]:border-[var(--color-brand)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--color-ink-muted)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ProseHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-12">
      {eyebrow ? (
        <p className="mb-3 text-sm uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[1.05] tracking-tight md:text-5xl">
        {title}
      </h1>
      {lead ? (
        <p className="mt-4 max-w-[55ch] text-lg text-[var(--color-ink-muted)]">{lead}</p>
      ) : null}
      {children}
    </header>
  );
}
