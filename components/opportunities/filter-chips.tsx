"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useId, useMemo, useTransition } from "react";

import { OPPORTUNITIES_COPY } from "@/lib/opportunities/copy";
import { parseSearchParams, serializeFilters } from "@/lib/opportunities/filters";
import type { OpportunityFilters } from "@/lib/opportunities/schema";

// The 5 always-visible surface filters from the UX synthesis. Each chip is
// a real <button> so the keyboard / screen-reader path is the same as for
// any other button on the page. Updates go through the URL via
// router.replace — the page re-renders server-side with the new filter
// set, so the result list and the count are always in sync with the
// chips (no client-side state drift).
//
// We intentionally use replace(), not push(), so the back button takes the
// artist out of /opportunities entirely rather than walking back through
// every chip toggle. The chips are not navigation; they are search state.

const TYPE_OPTIONS = [
  { value: "grant", label: "grant" },
  { value: "residency", label: "residency" },
  { value: "fellowship", label: "fellowship" },
  { value: "call", label: "open call" },
] as const;

const DEADLINE_OPTIONS = [
  { value: 7 as const, label: OPPORTUNITIES_COPY.filters.deadline.thisWeek },
  { value: 30 as const, label: OPPORTUNITIES_COPY.filters.deadline.thisMonth },
  { value: 90 as const, label: OPPORTUNITIES_COPY.filters.deadline.next90 },
] as const;

const ELIGIBILITY_OPTIONS = [
  { value: "individual", label: OPPORTUNITIES_COPY.filters.eligibility.individual },
  { value: "fiscal_sponsor", label: OPPORTUNITIES_COPY.filters.eligibility.fiscalSponsor },
  { value: "501c3", label: OPPORTUNITIES_COPY.filters.eligibility.org501c3 },
] as const;

const LOCATION_OPTIONS = [
  { value: "nyc", label: OPPORTUNITIES_COPY.filters.location.nyc },
  { value: "nyc_metro", label: OPPORTUNITIES_COPY.filters.location.nycMetro },
  { value: "ny_state", label: OPPORTUNITIES_COPY.filters.location.nyState },
  { value: "national", label: OPPORTUNITIES_COPY.filters.location.national },
  { value: "international", label: OPPORTUNITIES_COPY.filters.location.international },
] as const;

const CHIP_BASE =
  "inline-flex items-center rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm font-medium transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-deep)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)]";
const CHIP_OFF =
  "border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-warm)] hover:text-[var(--color-ink)]";
const CHIP_ON = "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]";

type ChipButtonProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
};

function ChipButton({ active, onClick, children, ariaLabel }: ChipButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`${CHIP_BASE} ${active ? CHIP_ON : CHIP_OFF}`}
    >
      {children}
    </button>
  );
}

export function FilterChips({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const liveRegionId = useId();
  const [isPending, startTransition] = useTransition();

  // The chips render against the URL truth. We re-parse on every render
  // (cheap — just a Zod parse) instead of mirroring to local state, so
  // there's no chance of state-divergence between chips and the SSR list.
  const filters = useMemo<OpportunityFilters>(() => {
    const obj: Record<string, string> = {};
    for (const [k, v] of searchParams.entries()) obj[k] = v;
    return parseSearchParams(obj);
  }, [searchParams]);

  function apply(next: OpportunityFilters): void {
    const query = serializeFilters(next).toString();
    const url = query.length > 0 ? `/opportunities?${query}` : "/opportunities";
    startTransition(() => router.replace(url, { scroll: false }));
  }

  function toggleArrayValue<T extends string>(current: readonly T[], value: T): T[] {
    return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  }

  return (
    <div className="space-y-4">
      <FilterGroup label={OPPORTUNITIES_COPY.filters.type.label}>
        {TYPE_OPTIONS.map((opt) => (
          <ChipButton
            key={opt.value}
            active={filters.types.includes(opt.value)}
            onClick={() => apply({ ...filters, types: toggleArrayValue(filters.types, opt.value) })}
          >
            {opt.label}
          </ChipButton>
        ))}
      </FilterGroup>

      <FilterGroup label={OPPORTUNITIES_COPY.filters.deadline.label}>
        {DEADLINE_OPTIONS.map((opt) => (
          <ChipButton
            key={opt.value}
            active={filters.deadline_window_days === opt.value}
            onClick={() =>
              apply({
                ...filters,
                deadline_window_days: filters.deadline_window_days === opt.value ? null : opt.value,
              })
            }
          >
            {opt.label}
          </ChipButton>
        ))}
        <ChipButton
          active={filters.include_rolling}
          onClick={() => apply({ ...filters, include_rolling: !filters.include_rolling })}
        >
          {OPPORTUNITIES_COPY.filters.deadline.rolling}
        </ChipButton>
      </FilterGroup>

      <FilterGroup label={OPPORTUNITIES_COPY.filters.eligibility.label}>
        {ELIGIBILITY_OPTIONS.map((opt) => (
          <ChipButton
            key={opt.value}
            active={filters.eligibility.includes(opt.value)}
            onClick={() =>
              apply({
                ...filters,
                eligibility: toggleArrayValue(filters.eligibility, opt.value),
              })
            }
          >
            {opt.label}
          </ChipButton>
        ))}
      </FilterGroup>

      <FilterGroup label={OPPORTUNITIES_COPY.filters.location.label}>
        {LOCATION_OPTIONS.map((opt) => (
          <ChipButton
            key={opt.value}
            active={filters.locations.includes(opt.value)}
            onClick={() =>
              apply({
                ...filters,
                locations: toggleArrayValue(filters.locations, opt.value),
              })
            }
          >
            {opt.label}
          </ChipButton>
        ))}
      </FilterGroup>

      <FilterGroup label={OPPORTUNITIES_COPY.filters.free.label}>
        <ChipButton
          active={filters.free_only}
          onClick={() => apply({ ...filters, free_only: !filters.free_only })}
          ariaLabel={filters.free_only ? "free to apply: on" : "free to apply: off"}
        >
          {filters.free_only ? "on" : "off"}
        </ChipButton>
      </FilterGroup>

      {/* Live region for screen-reader announcement of result-count change.
          We render the count both visibly (server side, in the page header)
          and inside this live region; the visible copy is the authoritative
          render, this one fires only on filter-change for accessibility. */}
      <p id={liveRegionId} role="status" aria-live="polite" className="sr-only">
        {isPending ? "filtering…" : OPPORTUNITIES_COPY.filters.result(resultCount)}
      </p>
    </div>
  );
}

// Native <fieldset> + <legend> is the semantic grouping element a11y tools
// expect for related controls. The Tailwind reset (m-0 border-0 p-0)
// strips the browser's default fieldset chrome so the layout matches the
// rest of the page; <legend> renders as the row label.
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
        {label}
      </legend>
      <ChipRow>{children}</ChipRow>
    </fieldset>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2 md:gap-2.5">{children}</div>;
}
