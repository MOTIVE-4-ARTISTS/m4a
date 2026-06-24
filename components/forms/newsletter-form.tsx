"use client";

import { useActionState } from "react";
import { SoftChevron } from "@/components/brand/marks";
import { Button } from "@/components/ui/button";
import { type SubscribeResult, subscribe } from "@/lib/newsletter/subscribe";

// useActionState gives us progressive enhancement (works without JS) plus
// optimistic / pending UI when JS is available. Result<T, E> from the action
// is rendered through one branch so a screen reader announces the same
// content the visual user sees. See .cursor/rules/050-accessibility.mdc.
//
// Two visual registers off one action:
//   - "card"   — the full, labelled form used inside a content card (/connect).
//   - "inline" — a single underlined field with a chevron submit, for chrome
//     like the footer where a boxed form reads as templated, not editorial.
export function NewsletterForm({
  source,
  variant = "card",
  className,
}: {
  source?: string;
  variant?: "card" | "inline";
  className?: string;
}) {
  const [state, formAction, isPending] = useActionState<SubscribeResult | null, FormData>(
    subscribe,
    null,
  );

  const message = state == null ? null : state.ok ? state.value.message : state.error.message;
  const isError = state != null && !state.ok;

  if (variant === "inline") {
    return (
      <form action={formAction} className={className} aria-describedby="newsletter-status-inline">
        {source ? <input type="hidden" name="source" value={source} /> : null}
        <label htmlFor="newsletter-email-inline" className="sr-only">
          Email address
        </label>
        <div className="flex items-center gap-2 border-b border-[var(--color-rule)] transition-colors focus-within:border-[var(--color-ink)]">
          <input
            id="newsletter-email-inline"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="your email"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-muted)]"
          />
          <button
            type="submit"
            disabled={isPending}
            aria-label="Subscribe to the newsletter"
            className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-brand-deep)] disabled:opacity-50"
          >
            <SoftChevron size={14} />
          </button>
        </div>
        <p
          id="newsletter-status-inline"
          aria-live="polite"
          className={`mt-2 min-h-[1.25em] text-xs ${
            isError ? "text-[var(--color-brand-deep)]" : "text-[var(--color-ink-muted)]"
          }`}
        >
          {message ?? null}
        </p>
      </form>
    );
  }

  return (
    <form
      action={formAction}
      className={`space-y-3 ${className ?? ""}`}
      aria-describedby="newsletter-status"
    >
      {source ? <input type="hidden" name="source" value={source} /> : null}
      <label htmlFor="newsletter-email" className="block text-sm font-medium">
        Email
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="flex-1 rounded-[var(--radius-pill)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-brand-deep)]"
          placeholder="you@example.com"
        />
        <Button type="submit" intent="brand" size="md" disabled={isPending}>
          {isPending ? "Subscribing…" : "Subscribe"}
        </Button>
      </div>

      <p
        id="newsletter-status"
        aria-live="polite"
        className={`min-h-[1.5em] text-sm ${
          isError ? "text-[var(--color-brand-deep)]" : "text-[var(--color-ink-muted)]"
        }`}
      >
        {message ?? null}
      </p>
    </form>
  );
}
