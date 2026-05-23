// Root loading skeleton. Next.js wraps the segment's tree in <Suspense>
// using this fallback; without it the previous route stays on screen until
// the new one resolves, which on a donation flow looks like nothing happened
// after the click. Skeleton mirrors the page-hero rhythm so the layout
// shift on resolve is minimal.
export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading"
      className="mx-auto max-w-[var(--container-page)] animate-pulse px-6 py-16 md:py-24"
    >
      <div className="h-3 w-24 rounded bg-[var(--color-rule)]" />
      <div className="mt-6 h-10 w-3/4 rounded bg-[var(--color-rule)]" />
      <div className="mt-3 h-10 w-2/3 rounded bg-[var(--color-rule)]" />
      <div className="mt-8 h-4 w-1/2 rounded bg-[var(--color-rule)]" />
      <div className="mt-3 h-4 w-2/5 rounded bg-[var(--color-rule)]" />
      <div className="mt-12 flex gap-3">
        <div className="h-12 w-44 rounded-[var(--radius-pill)] bg-[var(--color-rule)]" />
        <div className="h-12 w-40 rounded-[var(--radius-pill)] bg-[var(--color-rule)]" />
      </div>
    </section>
  );
}
