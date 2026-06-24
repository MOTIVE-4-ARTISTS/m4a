import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatAmount, formatDeadline } from "@/lib/opportunities/format";
import { LOCATION_REQUIREMENTS, OPPORTUNITY_TYPES } from "@/lib/opportunities/schema";
import { createClient } from "@/lib/supabase/server";
import type { OpportunitySubmission, ProposedSource } from "@/lib/supabase/types";
import { type EditableSubmission, ReviewActions } from "./review-actions";
import { SourceActions } from "./source-actions";

export const metadata = {
  title: "Admin · Opportunities review",
  robots: { index: false, follow: false },
};

// The human's whole job in the autonomous loop: skim the queue of
// AI-discovered / community-submitted opportunities and approve, edit, or
// reject. High-confidence rows from trusted channels never reach here —
// they auto-publish. This queue is everything the pipeline wasn't sure
// about. Reads via the cookie client (admins-read RLS in 0007); the
// approve/reject writes run service-role in the Server Actions.

const KIND_LABEL: Record<string, string> = {
  community: "community submission",
  dedup_review: "possible duplicate",
  low_confidence: "needs review",
  discovery: "web discovery",
};

export default async function AdminOpportunitiesPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const result = await (
    supabase as unknown as {
      from: (t: string) => {
        select: (cols: string) => {
          eq: (
            k: string,
            v: string,
          ) => {
            order: (
              col: string,
              opts: { ascending: boolean; nullsFirst?: boolean },
            ) => {
              order: (
                col: string,
                opts: { ascending: boolean },
              ) => {
                limit: (n: number) => Promise<{ data: OpportunitySubmission[] | null }>;
              };
            };
          };
        };
      };
    }
  )
    .from("opportunity_submissions")
    .select("*")
    .eq("status", "pending")
    .order("extraction_confidence", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = result.data ?? [];

  const proposed = await (
    supabase as unknown as {
      from: (t: string) => {
        select: (cols: string) => {
          eq: (
            k: string,
            v: string,
          ) => {
            order: (
              col: string,
              opts: { ascending: boolean },
            ) => {
              limit: (n: number) => Promise<{ data: ProposedSource[] | null }>;
            };
          };
        };
      };
    }
  )
    .from("proposed_sources")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(50);

  const proposedSources = proposed.data ?? [];

  return (
    <>
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Admin</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight">
          Opportunities review
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-ink-muted)]">
          The ingest pipeline auto-publishes high-confidence opportunities from trusted sources.
          Everything it wasn&apos;t sure about lands here for a one-click decision.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card className="mt-8">
          <p className="text-sm text-[var(--color-ink-muted)]">
            Nothing in the queue. The pipeline is either caught up or hasn&apos;t found anything new
            since the last review.
          </p>
        </Card>
      ) : (
        <ul className="mt-8 space-y-4">
          {rows.map((r) => {
            const deadline = formatDeadline(r.deadline, r.is_rolling);
            const amount = formatAmount(r.amount_min_cents, r.amount_max_cents, r.amount_display);
            const confidence =
              r.extraction_confidence == null
                ? null
                : `${Math.round(r.extraction_confidence * 100)}%`;
            return (
              <li key={r.id}>
                <Card>
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <Badge tone="neutral">{r.type}</Badge>
                      <span className="font-medium">{r.name}</span>
                      <span className="text-sm text-[var(--color-ink-muted)]">
                        from {r.funder_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="brand">
                        {KIND_LABEL[r.submission_kind] ?? r.submission_kind}
                      </Badge>
                      {confidence ? <Badge tone="neutral">confidence {confidence}</Badge> : null}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-ink-muted)]">
                    <span>{deadline.label}</span>
                    {amount ? <span>· {amount}</span> : null}
                    <span>· {r.location_requirement ?? "location n/a"}</span>
                    <a
                      href={r.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-[var(--color-ink)]"
                    >
                      source ↗
                    </a>
                  </div>

                  {r.description_short ? (
                    <p className="mt-2 text-sm text-[var(--color-ink)]">{r.description_short}</p>
                  ) : (
                    <p className="mt-2 text-sm italic text-[var(--color-ink-muted)]">
                      No description extracted — edit before approving.
                    </p>
                  )}

                  {r.reviewer_notes ? (
                    <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                      why it&apos;s here: {r.reviewer_notes}
                    </p>
                  ) : null}

                  <ReviewActions submission={toEditable(r)} />
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {proposedSources.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
            Proposed sources
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-muted)]">
            Funders and aggregators the discoverer thinks we should track. Accepting one is an
            engineering follow-up (wire an adapter or subscribe its newsletter).
          </p>
          <ul className="mt-4 space-y-3">
            {proposedSources.map((s) => (
              <li key={s.id}>
                <Card tone="warm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline hover:text-[var(--color-ink)]"
                      >
                        {s.name} ↗
                      </a>
                      {s.rationale ? (
                        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{s.rationale}</p>
                      ) : null}
                    </div>
                    <SourceActions id={s.id} />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

// Narrow the full DB row to the editable shape the client form expects,
// coercing the submission's nullable fields to safe defaults.
function toEditable(r: OpportunitySubmission): EditableSubmission {
  const type = (OPPORTUNITY_TYPES as readonly string[]).includes(r.type) ? r.type : "grant";
  const location =
    r.location_requirement &&
    (LOCATION_REQUIREMENTS as readonly string[]).includes(r.location_requirement)
      ? r.location_requirement
      : "national";
  return {
    id: r.id,
    name: r.name,
    funder_name: r.funder_name,
    type: type as EditableSubmission["type"],
    deadline: r.deadline,
    is_rolling: r.is_rolling,
    amount_display: r.amount_display,
    location_requirement: location as EditableSubmission["location_requirement"],
    eligibility_individual: r.eligibility_individual ?? false,
    eligibility_fiscal_sponsor: r.eligibility_fiscal_sponsor ?? false,
    eligibility_501c3: r.eligibility_501c3 ?? false,
    application_fee_cents: r.application_fee_cents ?? 0,
    description_short: r.description_short ?? "",
    source_url: r.source_url,
  };
}
