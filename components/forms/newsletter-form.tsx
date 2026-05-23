"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { type SubscribeResult, subscribe } from "@/lib/newsletter/subscribe";

// Newsletter form. Uses React's useActionState for progressive enhancement:
// works without JS, but with JS we get the optimistic / pending UI.
// Single visible <label> per input (WCAG 1.3.1) and an aria-live region for
// the result message so screen readers announce success/failure.
export function NewsletterForm({ source }: { source?: string }) {
  const [state, formAction, isPending] = useActionState<SubscribeResult | null, FormData>(
    subscribe,
    null,
  );

  return (
    <form action={formAction} className="space-y-3" aria-describedby="newsletter-status">
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
          state?.ok === false ? "text-[var(--color-brand-deep)]" : "text-[var(--color-ink-muted)]"
        }`}
      >
        {state?.message ?? null}
      </p>
    </form>
  );
}
