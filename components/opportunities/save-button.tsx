"use client";

import { OPPORTUNITIES_COPY } from "@/lib/opportunities/copy";

import { useSaved } from "./save-store";

// Per-card save toggle. The visible label switches between "save" and
// "saved" depending on state; aria-pressed mirrors the boolean so screen
// readers announce the toggle state without us writing custom copy.

export function SaveButton({ id, name }: { id: string; name: string }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(id);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={
        saved ? OPPORTUNITIES_COPY.card.unsaveLabel(name) : OPPORTUNITIES_COPY.card.saveLabel(name)
      }
      onClick={() => toggle(id)}
      className={
        // 44px min target per .cursor/rules/050-accessibility.mdc.
        "inline-flex min-h-[44px] items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-deep)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)] " +
        (saved
          ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]"
          : "border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-warm)] hover:text-[var(--color-ink)]")
      }
    >
      <SaveMark filled={saved} />
      <span>{saved ? "saved" : "save"}</span>
    </button>
  );
}

// Custom save mark, NOT a Lucide bookmark. The shape echoes the
// wordmark's sail-triangle glyph (open triangle + a diagonal crossing
// line — the brand's only piece of shape language). Filled when saved,
// outlined when not — same visual grammar as the wordmark itself.
// The May 2026 design audit (Subagent B + recommendation §11 item 9)
// flagged generic Lucide icons as the single highest-signal AI fingerprint
// on the site; this is the swap.
function SaveMark({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 2 L11.5 12 L2.5 12 Z" />
      <path d="M3 8 L11 8" />
    </svg>
  );
}
