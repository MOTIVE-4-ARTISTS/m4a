import { notFound } from "next/navigation";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { StatusForm } from "./status-form";

export const metadata = {
  title: "Admin · Application",
  robots: { index: false, follow: false },
};

const PROGRAM_LABEL: Record<string, string> = {
  residency: "Artist in Residency",
  international: "International Exchange",
  discounted_space: "Discounted Space Subsidy",
};

type Row = {
  id: string;
  program: string;
  applicant_email: string;
  applicant_name: string | null;
  payload: Record<string, unknown>;
  status: string;
  internal_notes: string | null;
  created_at: string;
};

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
            maybeSingle: () => Promise<{ data: Row | null }>;
          };
        };
      };
    }
  )
    .from("applications")
    .select(
      "id, program, applicant_email, applicant_name, payload, status, internal_notes, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  const row = result.data;
  if (!row) notFound();

  return (
    <>
      <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
        Application
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight">
        {row.applicant_name ?? row.applicant_email}
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)]">
        {PROGRAM_LABEL[row.program] ?? row.program} · submitted{" "}
        {new Date(row.created_at).toLocaleString()}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardEyebrow>Submission</CardEyebrow>
          <CardTitle className="mt-2">Application body</CardTitle>
          <dl className="mt-4 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="text-[var(--color-ink-muted)]">Email</dt>
            <dd>{row.applicant_email}</dd>
            {Object.entries(row.payload).map(([k, v]) => (
              <RenderRow key={k} field={k} value={v} />
            ))}
          </dl>
        </Card>

        <Card>
          <CardEyebrow>Decision</CardEyebrow>
          <CardTitle className="mt-2">Status</CardTitle>
          <div className="mt-4">
            <StatusForm
              id={row.id}
              currentStatus={row.status}
              currentNotes={row.internal_notes ?? ""}
            />
          </div>
        </Card>
      </div>
    </>
  );
}

function RenderRow({ field, value }: { field: string; value: unknown }) {
  const label = field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
  return (
    <>
      <dt className="text-[var(--color-ink-muted)]">{label}</dt>
      <dd className="whitespace-pre-wrap">
        {Array.isArray(value)
          ? value.map((v) => String(v)).join(", ")
          : typeof value === "object" && value !== null
            ? JSON.stringify(value, null, 2)
            : String(value)}
      </dd>
    </>
  );
}
