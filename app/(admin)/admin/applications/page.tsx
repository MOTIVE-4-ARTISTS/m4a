import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin · Applications",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  submitted: "New",
  under_review: "Under review",
  shortlist: "Shortlist",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

const PROGRAM_LABEL: Record<string, string> = {
  residency: "Residency",
  international: "Intl. Exchange",
  discounted_space: "Subsidy",
};

type Row = {
  id: string;
  program: string;
  applicant_email: string;
  applicant_name: string | null;
  status: string;
  created_at: string;
};

export default async function AdminApplicationsPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const result = await (
    supabase as unknown as {
      from: (t: string) => {
        select: (cols: string) => {
          order: (
            col: string,
            opts: { ascending: boolean },
          ) => {
            limit: (n: number) => Promise<{ data: Row[] | null }>;
          };
        };
      };
    }
  )
    .from("applications")
    .select("id, program, applicant_email, applicant_name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = result.data ?? [];

  return (
    <>
      <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">Admin</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight">
        Applications
      </h1>

      {rows.length === 0 ? (
        <Card className="mt-8">
          <p className="text-sm text-[var(--color-ink-muted)]">
            No applications yet. When applicants submit through{" "}
            <Link href="/apply" className="underline">
              /apply
            </Link>
            , they'll appear here.
          </p>
        </Card>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={`/admin/applications/${r.id}`} className="block">
                <Card className="hover:border-[var(--color-brand-deep)]/40">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <Badge tone="neutral">{PROGRAM_LABEL[r.program] ?? r.program}</Badge>
                      <span className="font-medium">{r.applicant_name ?? "—"}</span>
                      <span className="text-sm text-[var(--color-ink-muted)]">
                        {r.applicant_email}
                      </span>
                    </div>
                    <Badge tone={r.status === "submitted" ? "brand" : "neutral"}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                    Submitted {new Date(r.created_at).toLocaleString()}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
