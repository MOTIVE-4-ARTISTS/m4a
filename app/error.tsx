"use client";

import Link from "next/link";
import { useEffect } from "react";

// Root-segment error boundary required by Next.js App Router. Errors thrown
// from a Server Component below this point fall through here; without a
// boundary the user sees Next's default white-screen overlay, which on a
// donations page is the worst possible failure mode (people abandon).
// Sentry wiring lives in Phase 4 (see .cursor/rules/000-charter.mdc); for
// now we log error.digest so it can be correlated with Vercel runtime logs.
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[root error boundary]", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <section className="mx-auto flex max-w-[var(--container-page)] flex-col gap-6 px-6 py-24">
      <p className="text-sm uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
        Something interrupted us
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-5xl">
        This page didn't load the way it was supposed to.
      </h1>
      <p className="max-w-xl text-[var(--color-ink-muted)]">
        It's on our side, not yours. You can try again, head back to the home page, or email{" "}
        <a className="underline" href="mailto:hello@motive4artists.org">
          hello@motive4artists.org
        </a>{" "}
        if this keeps happening.
      </p>
      {error.digest ? (
        <p className="text-xs text-[var(--color-ink-muted)]">Reference: {error.digest}</p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-brand)] px-6 py-3 text-base font-medium text-[var(--color-ink)] hover:bg-[var(--color-brand-deep)] hover:text-[var(--color-paper)]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--color-ink)] px-6 py-3 text-base font-medium text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
