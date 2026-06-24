"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOCATION_REQUIREMENTS, OPPORTUNITY_TYPES } from "@/lib/opportunities/schema";
import { approveSubmission, editAndApprove, rejectSubmission } from "./actions";

// The reviewer's controls for one queued submission. Approve publishes as-is;
// Reject drops it; Edit reveals a compact form to fix the fields that most
// often need a human touch, then publishes the corrected row.

export type EditableSubmission = {
  id: string;
  name: string;
  funder_name: string;
  type: (typeof OPPORTUNITY_TYPES)[number];
  deadline: string | null;
  is_rolling: boolean;
  amount_display: string | null;
  location_requirement: (typeof LOCATION_REQUIREMENTS)[number];
  eligibility_individual: boolean;
  eligibility_fiscal_sponsor: boolean;
  eligibility_501c3: boolean;
  application_fee_cents: number;
  description_short: string;
  source_url: string;
};

export function ReviewActions({ submission }: { submission: EditableSubmission }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "approve" | "reject" | "edit">(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditableSubmission>(submission);

  async function run(
    kind: "approve" | "reject" | "edit",
    fn: () => Promise<{ ok: boolean; error?: { message: string } }>,
  ) {
    setBusy(kind);
    const result = await fn();
    setBusy(null);
    if (result.ok) {
      router.refresh();
    } else {
      window.alert(result.error?.message ?? "Something went wrong.");
    }
  }

  if (editing) {
    return (
      <form
        className="mt-4 space-y-3 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-warm)] p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void run("edit", () =>
            editAndApprove(submission.id, {
              name: form.name,
              funder_name: form.funder_name,
              type: form.type,
              deadline: form.is_rolling ? null : form.deadline || null,
              is_rolling: form.is_rolling,
              amount_display: form.amount_display?.trim() ? form.amount_display.trim() : null,
              location_requirement: form.location_requirement,
              eligibility_individual: form.eligibility_individual,
              eligibility_fiscal_sponsor: form.eligibility_fiscal_sponsor,
              eligibility_501c3: form.eligibility_501c3,
              application_fee_cents: form.application_fee_cents,
              description_short: form.description_short,
              source_url: form.source_url,
            }),
          );
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Program name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Funder">
            <input
              className={inputClass}
              value={form.funder_name}
              onChange={(e) => setForm({ ...form, funder_name: e.target.value })}
            />
          </Field>
          <Field label="Type">
            <select
              className={inputClass}
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as EditableSubmission["type"] })
              }
            >
              {OPPORTUNITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Location requirement">
            <select
              className={inputClass}
              value={form.location_requirement}
              onChange={(e) =>
                setForm({
                  ...form,
                  location_requirement: e.target
                    .value as EditableSubmission["location_requirement"],
                })
              }
            >
              {LOCATION_REQUIREMENTS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Deadline (YYYY-MM-DD)">
            <input
              className={inputClass}
              type="date"
              value={form.deadline ?? ""}
              disabled={form.is_rolling}
              onChange={(e) => setForm({ ...form, deadline: e.target.value || null })}
            />
          </Field>
          <Field label="Amount (display)">
            <input
              className={inputClass}
              value={form.amount_display ?? ""}
              placeholder="$5,000"
              onChange={(e) => setForm({ ...form, amount_display: e.target.value })}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_rolling}
            onChange={(e) => setForm({ ...form, is_rolling: e.target.checked })}
          />
          rolling (no fixed deadline)
        </label>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.eligibility_individual}
              onChange={(e) => setForm({ ...form, eligibility_individual: e.target.checked })}
            />
            individual
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.eligibility_fiscal_sponsor}
              onChange={(e) => setForm({ ...form, eligibility_fiscal_sponsor: e.target.checked })}
            />
            fiscal sponsor
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.eligibility_501c3}
              onChange={(e) => setForm({ ...form, eligibility_501c3: e.target.checked })}
            />
            501(c)(3)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.application_fee_cents === 0}
              onChange={(e) =>
                setForm({
                  ...form,
                  application_fee_cents: e.target.checked
                    ? 0
                    : submission.application_fee_cents || 1,
                })
              }
            />
            free to apply
          </label>
        </div>

        <Field label="Card description (≤200 chars)">
          <textarea
            className={`${inputClass} min-h-16`}
            maxLength={200}
            value={form.description_short}
            onChange={(e) => setForm({ ...form, description_short: e.target.value })}
          />
        </Field>
        <Field label="Source URL">
          <input
            className={inputClass}
            value={form.source_url}
            onChange={(e) => setForm({ ...form, source_url: e.target.value })}
          />
        </Field>

        <div className="flex items-center gap-2 pt-1">
          <button type="submit" disabled={busy !== null} className={`${btnBase} ${btnApprove}`}>
            {busy === "edit" ? "…" : "save + publish"}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => {
              setEditing(false);
              setForm(submission);
            }}
            className={`${btnBase} ${btnGhost}`}
          >
            cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => void run("approve", () => approveSubmission(submission.id))}
        className={`${btnBase} ${btnApprove}`}
      >
        {busy === "approve" ? "…" : "approve + publish"}
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => setEditing(true)}
        className={`${btnBase} ${btnGhost}`}
      >
        edit
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => {
          if (window.confirm("Reject this submission?")) {
            void run("reject", () => rejectSubmission(submission.id));
          }
        }}
        className={`${btnBase} ${btnReject}`}
      >
        {busy === "reject" ? "…" : "reject"}
      </button>
    </div>
  );
}

const inputClass =
  "w-full rounded-[var(--radius-input,0.5rem)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-1.5 text-sm";
const btnBase =
  "rounded-[var(--radius-pill)] px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60";
const btnApprove =
  "bg-[var(--color-brand)] text-[var(--color-ink)] hover:bg-[var(--color-brand-deep)] hover:text-[var(--color-paper)]";
const btnGhost =
  "border border-[var(--color-rule)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]";
const btnReject =
  "border border-[var(--color-rule)] text-[var(--color-ink-muted)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the form control is always passed in as `children`, inside the label.
    <label className="block text-xs">
      <span className="mb-1 block uppercase tracking-[0.15em] text-[var(--color-ink-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
