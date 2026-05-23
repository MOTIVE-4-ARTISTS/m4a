import { Section } from "@/components/ui/section";

// Card-shaped skeletons. Mirrors the real card rhythm (small chip row +
// title + funder line + body + chip row) so the hand-off from skeleton
// to real content doesn't shift the page. Eight placeholders matches the
// typical "above the fold on desktop" count.
//
// Stable string keys (rather than `i` from Array.from) keep React's
// reconciler happy and satisfy biome's noArrayIndexKey lint.
const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export default function Loading() {
  return (
    <Section>
      <div className="animate-pulse">
        <div className="h-3 w-24 rounded bg-[var(--color-rule)]" />
        <div className="mt-4 h-10 w-3/4 rounded bg-[var(--color-rule)]" />
        <div className="mt-3 h-10 w-2/3 rounded bg-[var(--color-rule)]" />
        <div className="mt-10 h-32 rounded-[var(--radius-card)] bg-[var(--color-rule)]/40" />
        <ul
          aria-busy="true"
          aria-label="loading opportunities"
          className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {SKELETON_KEYS.map((key) => (
            <li
              key={key}
              className="rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper)] p-6"
            >
              <div className="h-5 w-20 rounded-full bg-[var(--color-rule)]" />
              <div className="mt-4 h-6 w-4/5 rounded bg-[var(--color-rule)]" />
              <div className="mt-2 h-4 w-3/5 rounded bg-[var(--color-rule)]" />
              <div className="mt-4 h-4 w-1/3 rounded bg-[var(--color-rule)]" />
              <div className="mt-3 h-4 w-4/5 rounded bg-[var(--color-rule)]" />
              <div className="mt-3 h-4 w-3/5 rounded bg-[var(--color-rule)]" />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
