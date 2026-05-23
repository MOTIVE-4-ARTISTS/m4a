"use client";

import Link from "next/link";
import { useEffect } from "react";

// Segment-scoped boundary so a Supabase outage on /opportunities doesn't
// crash the whole site — the rest of the App Router tree stays mounted
// behind the layout. Same shape as app/error.tsx for visual continuity.
export default function OpportunitiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[opportunities error boundary]", {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  return (
    <section className="mx-auto flex max-w-[var(--container-page)] flex-col gap-6 px-6 py-24">
      <p className="text-sm uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
        opportunities
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-5xl">
        the directory hit a snag.
      </h1>
      <p className="max-w-xl text-[var(--color-ink-muted)]">
        it's on our side. try again in a moment, or email{" "}
        <a className="underline" href="mailto:hello@motive4artists.org">
          hello@motive4artists.org
        </a>{" "}
        if this keeps happening.
      </p>
      {error.digest ? (
        <p className="text-xs text-[var(--color-ink-muted)]">reference: {error.digest}</p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-brand)] px-6 py-3 text-base font-medium text-[var(--color-ink)] hover:bg-[var(--color-brand-deep)] hover:text-[var(--color-paper)]"
        >
          try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--color-ink)] px-6 py-3 text-base font-medium text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
        >
          back to home
        </Link>
      </div>
    </section>
  );
}
