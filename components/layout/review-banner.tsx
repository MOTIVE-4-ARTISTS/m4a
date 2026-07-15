import { REVIEW_BANNER_TEXT } from "@/lib/site-mode";

// Sits at the very top of every reviewable page while the site is deployed
// in review mode. High-contrast ink-on-paper (not brand-yellow, which stays
// reserved for artist actions per ADR 0002) so it reads as a system notice,
// not marketing. Renders only when the marketing layout decides we're in
// review mode; it carries no mode logic of its own.
export function ReviewBanner() {
  return (
    <div
      role="note"
      aria-label="Preview notice"
      className="border-b border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]"
    >
      <p className="mx-auto max-w-[var(--container-page)] px-6 py-2 text-center text-xs leading-relaxed tracking-[0.02em] sm:text-sm">
        {REVIEW_BANNER_TEXT}
      </p>
    </div>
  );
}
