import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Small status / category pill. Used for program tags, cohort years, etc.
type Tone = "neutral" | "brand" | "ink";

const toneClass: Record<Tone, string> = {
  neutral:
    "bg-[var(--color-paper-warm)] border border-[var(--color-rule)] text-[var(--color-ink-muted)]",
  brand:
    "bg-[var(--color-brand-soft)] border border-[var(--color-brand-deep)]/30 text-[var(--color-ink)]",
  ink: "bg-[var(--color-ink)] text-[var(--color-paper)]",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
