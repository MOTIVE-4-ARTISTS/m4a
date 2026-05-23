import type { Metadata } from "next";

import { AiInput } from "@/components/opportunities/ai-input";
import { ExportButtons } from "@/components/opportunities/export-buttons";
import { FilterChips } from "@/components/opportunities/filter-chips";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { ProseHero } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { OPPORTUNITIES_COPY } from "@/lib/opportunities/copy";
import { parseSearchParams } from "@/lib/opportunities/filters";
import { formatVerifiedAt } from "@/lib/opportunities/format";
import { listOpportunities } from "@/lib/opportunities/read";

// Why dynamic: the page reads searchParams and renders a database-backed
// list. The default cache mode would fold all filter combinations together,
// which is wrong for this surface. Each filter combination is a distinct
// render — cheap, server-rendered, and never cached at the page level. The
// underlying Supabase query is the bottleneck, and at ≤500 rows it returns
// in single-digit ms.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: OPPORTUNITIES_COPY.pageTitle,
  description: OPPORTUNITIES_COPY.pageDescription,
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseSearchParams(params);
  const { rows, lastVerifiedAt, notConfigured } = await listOpportunities(filters);
  const freshness = renderFreshness(lastVerifiedAt, rows.length);

  return (
    <Section>
      <ProseHero
        eyebrow={OPPORTUNITIES_COPY.hero.eyebrow}
        title={OPPORTUNITIES_COPY.hero.title}
        lead={OPPORTUNITIES_COPY.hero.lead}
      />

      {notConfigured ? <NotConfigured /> : null}

      <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-warm)] p-5 md:p-6">
        <AiInput />
      </div>

      <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-warm)] p-5 md:p-6">
        <FilterChips resultCount={rows.length} />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <p aria-live="polite" className="text-sm text-[var(--color-ink-muted)]">
          {OPPORTUNITIES_COPY.filters.result(rows.length)}
          {freshness ? (
            <>
              {" "}
              · <span>{freshness}</span>
            </>
          ) : null}
        </p>
        <ExportButtons />
      </div>

      <p className="mt-3 text-xs text-[var(--color-ink-muted)]">{OPPORTUNITIES_COPY.footerTrust}</p>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-label="opportunities">
          {rows.map((row) => (
            <li key={row.id}>
              <OpportunityCard row={row} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function renderFreshness(lastVerifiedAt: string | null, count: number): string | null {
  if (count === 0) return null;
  if (lastVerifiedAt === null) return null;
  // formatVerifiedAt returns "verified today" / "verified 3 days ago" etc.
  // We strip the leading "verified " to flow naturally into the inline copy
  // ("showing 12 opportunities · updated today").
  return formatVerifiedAt(lastVerifiedAt).replace(/^verified /, "updated ");
}

function EmptyState() {
  return (
    <div className="mt-12 rounded-[var(--radius-card)] border border-dashed border-[var(--color-rule)] bg-[var(--color-paper-warm)] p-8 text-center">
      <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-ink)]">
        {OPPORTUNITIES_COPY.emptyState.title}
      </p>
      <p className="mt-3 text-[var(--color-ink-muted)]">{OPPORTUNITIES_COPY.emptyState.lead}</p>
    </div>
  );
}

function NotConfigured() {
  return (
    <div
      role="status"
      className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-warm)] p-5 text-sm text-[var(--color-ink-muted)]"
    >
      this directory is being set up. once supabase is connected, opportunities will appear here
      automatically.
    </div>
  );
}
