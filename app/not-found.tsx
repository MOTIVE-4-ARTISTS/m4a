import Link from "next/link";

export const metadata = {
  title: "Page not found",
  description: "We couldn't find that page.",
};

// 404 page must remain a Server Component so it renders fast and indexable.
// The links surfaced are the ones we never want a lost visitor to miss:
// programs (the org's reason for being) and the donate path.
export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-[var(--container-page)] flex-col gap-6 px-6 py-24">
      <p className="text-sm uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">404</p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-5xl">
        That page has moved or doesn't exist.
      </h1>
      <p className="max-w-xl text-[var(--color-ink-muted)]">
        If you got here from a link on our site, let us know at{" "}
        <a className="underline" href="mailto:hello@motive4artists.org">
          hello@motive4artists.org
        </a>{" "}
        so we can fix it.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-brand)] px-6 py-3 text-base font-medium text-[var(--color-ink)] hover:bg-[var(--color-brand-deep)] hover:text-[var(--color-paper)]"
        >
          Home
        </Link>
        <Link
          href="/programs"
          className="inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--color-ink)] px-6 py-3 text-base font-medium text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
        >
          See our programs
        </Link>
        <Link
          href="/donate"
          className="inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--color-ink)] px-6 py-3 text-base font-medium text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
        >
          Donate
        </Link>
      </div>
    </section>
  );
}
