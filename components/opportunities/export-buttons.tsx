"use client";

import { useState } from "react";

import { OPPORTUNITIES_COPY } from "@/lib/opportunities/copy";

import { useSaved } from "./save-store";

// Page-level export controls. Renders nothing until the artist has
// either configured filters worth sharing or saved at least one
// opportunity — we don't show a "Copy link" button when the only thing
// to copy is the bare /opportunities URL.

const FEEDBACK_DURATION_MS = 2000;

type FeedbackKind = "link-copied" | "ics-sent" | null;

export function ExportButtons() {
  const { ids } = useSaved();
  const [feedback, setFeedback] = useState<FeedbackKind>(null);

  // We listen for the saved-changed broadcast inside useSaved itself, so
  // `ids` re-renders here as the artist clicks Save on cards.
  const hasSaved = ids.length > 0;

  async function copyLink(): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      flash("link-copied");
    } catch {
      // Older browsers / iOS private mode: fall back to legacy execCommand.
      const ta = document.createElement("textarea");
      ta.value = window.location.href;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        flash("link-copied");
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  function downloadIcs(): void {
    if (typeof window === "undefined" || !hasSaved) return;
    const params = new URLSearchParams({ ids: ids.join(",") });
    // Letting the browser navigate to the .ics URL is the most
    // calendar-app-friendly path: the OS prompts the user with their
    // calendar of choice. window.open with target=_self avoids leaving
    // the page state.
    window.open(`/opportunities/export.ics?${params.toString()}`, "_self");
    flash("ics-sent");
  }

  function flash(kind: FeedbackKind): void {
    setFeedback(kind);
    window.setTimeout(() => setFeedback(null), FEEDBACK_DURATION_MS);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={copyLink}
        className={EXPORT_BUTTON_CLASS}
        aria-label={OPPORTUNITIES_COPY.page.copyLink}
      >
        {OPPORTUNITIES_COPY.page.copyLink}
      </button>
      <button
        type="button"
        onClick={downloadIcs}
        disabled={!hasSaved}
        className={EXPORT_BUTTON_CLASS}
        aria-label={
          hasSaved
            ? `${OPPORTUNITIES_COPY.page.exportIcs} (${ids.length})`
            : "save opportunities to export them to your calendar"
        }
      >
        {OPPORTUNITIES_COPY.page.exportIcs}
        {hasSaved ? <span className="ml-1 text-xs">({ids.length})</span> : null}
      </button>
      {/* Polite live region for the success confirmation — fires only on
          flash; the visible text disappears after FEEDBACK_DURATION_MS so
          the page stays calm. */}
      <p role="status" aria-live="polite" className="text-xs text-[var(--color-ink-muted)]">
        {feedback === "link-copied"
          ? OPPORTUNITIES_COPY.page.copyLinkConfirmation
          : feedback === "ics-sent"
            ? OPPORTUNITIES_COPY.page.exportIcsConfirmation(ids.length)
            : ""}
      </p>
    </div>
  );
}

const EXPORT_BUTTON_CLASS =
  "inline-flex min-h-[44px] items-center rounded-[var(--radius-pill)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-1.5 text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-paper-warm)] hover:text-[var(--color-ink)] disabled:opacity-50 disabled:hover:bg-[var(--color-paper)] disabled:hover:text-[var(--color-ink-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-deep)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)]";
