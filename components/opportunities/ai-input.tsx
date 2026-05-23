"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useTransition } from "react";

import { OPPORTUNITIES_COPY } from "@/lib/opportunities/copy";
import { serializeFilters } from "@/lib/opportunities/filters";
import {
  DEADLINE_WINDOW_DAYS,
  type FilterPreset,
  type OpportunityFilters,
} from "@/lib/opportunities/schema";
import {
  type TranslateProfileResult,
  translateProfile,
} from "@/lib/opportunities/translate-profile";
import { VALIDATION_LIMITS } from "@/lib/validation";

// AI input island. Posts to the translateProfile Server Action via
// useActionState; on success, applies the returned FilterPreset to the
// URL (router.replace) so the SSR page re-renders with the new filters.
//
// The action's success path returns both the preset AND a hash of the
// description; the hash is logged client-side only as a development aid
// (and is the same hash the server logged — handy when tracing prompts
// without ever storing the plaintext).
//
// We deliberately don't try to merge AI filters with existing manual
// filters. The "find matches" button is a reset action: it overwrites
// the current filter set with what the AI inferred. The "clear AI
// filters" link below the preset chips restores the page defaults.

const initial: TranslateProfileResult | null = null;

export function AiInput() {
  const router = useRouter();
  const textareaId = useId();
  const helpId = useId();
  const [state, formAction, isPending] = useActionState(translateProfile, initial);
  const [, startTransition] = useTransition();

  // When the action returns a successful preset, navigate. We don't
  // render the result here; the page itself will re-render with the
  // new filter chips set to active.
  useEffect(() => {
    if (state?.ok) {
      const filters = presetToFilters(state.value.filters);
      const query = serializeFilters(filters).toString();
      const url = query.length > 0 ? `/opportunities?${query}` : "/opportunities";
      startTransition(() => router.replace(url, { scroll: false }));
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor={textareaId} className="block text-sm font-medium text-[var(--color-ink)]">
          {OPPORTUNITIES_COPY.ai.label}
        </label>
        <textarea
          id={textareaId}
          name="description"
          rows={2}
          maxLength={VALIDATION_LIMITS.ARTIST_DESCRIPTION_MAX}
          placeholder={OPPORTUNITIES_COPY.ai.placeholder}
          aria-describedby={helpId}
          className="mt-2 block w-full rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-2 text-base text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus-visible:border-[var(--color-brand-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-deep)]/40"
        />
        <p id={helpId} className="mt-1 text-xs text-[var(--color-ink-muted)]">
          a sentence or two. we don't store what you type.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-brand)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-brand-deep)] hover:text-[var(--color-paper)] disabled:cursor-progress disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-deep)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)]"
        >
          {isPending ? OPPORTUNITIES_COPY.ai.submitting : OPPORTUNITIES_COPY.ai.submit}
        </button>

        {/* Live region for the error path. Success is implicit (the
            filter chips above light up); error is announced here. */}
        <p role="status" aria-live="polite" className="text-sm text-[var(--color-ink-muted)]">
          {state && !state.ok ? state.error.message : ""}
        </p>
      </div>
    </form>
  );
}

// Translate the AI's null-means-no-opinion preset into our concrete
// filter object. Where the preset says null, we use the page default
// (all-empty arrays, free_only=true, include_rolling=true).
//
// The AI returns deadline_window as a string token ("this_week" /
// "this_month" / "next_3_months") — Gemini's structured-output API
// requires string enums — and we map back to the numeric URL value
// (7/30/90) here.
function presetToFilters(preset: FilterPreset): OpportunityFilters {
  return {
    types: preset.types ?? [],
    deadline_window_days:
      preset.deadline_window != null ? DEADLINE_WINDOW_DAYS[preset.deadline_window] : null,
    include_rolling: preset.include_rolling ?? true,
    eligibility: preset.eligibility ?? [],
    locations: preset.locations ?? [],
    disciplines: preset.disciplines ?? [],
    career_stages: preset.career_stages ?? [],
    equity_tags: preset.equity_tags ?? [],
    free_only: preset.free_only ?? true,
  };
}
