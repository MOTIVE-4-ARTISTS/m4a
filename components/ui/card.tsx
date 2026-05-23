import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Card is the editorial unit for collections (artists, cohorts, programs).
// Hairline border + warm background; the rare "brand" variant uses the
// soft tint for a single callout per section.
type Tone = "default" | "warm" | "brand";

const toneClass: Record<Tone, string> = {
  default: "bg-[var(--color-paper)] border border-[var(--color-rule)]",
  warm: "bg-[var(--color-paper-warm)] border border-[var(--color-rule)]",
  brand: "bg-[var(--color-brand-soft)] border border-[var(--color-brand-deep)]/30",
};

export function Card({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] p-6 transition-shadow hover:shadow-sm",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("font-[family-name:var(--font-display)] text-xl tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function CardEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn("text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]", className)}
    >
      {children}
    </p>
  );
}
