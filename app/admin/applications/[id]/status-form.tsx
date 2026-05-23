"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateApplicationStatus } from "./actions";

const STATUSES = [
  "submitted",
  "under_review",
  "shortlist",
  "accepted",
  "declined",
  "withdrawn",
] as const;

type Status = (typeof STATUSES)[number];

function isStatus(s: string): s is Status {
  return (STATUSES as readonly string[]).includes(s);
}

export function StatusForm({
  id,
  currentStatus,
  currentNotes,
}: {
  id: string;
  currentStatus: string;
  currentNotes: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(currentNotes);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    if (!isStatus(status)) {
      setMessage("Invalid status value.");
      setSaving(false);
      return;
    }
    const result = await updateApplicationStatus({ id, status, notes });
    setSaving(false);
    setMessage(result.ok ? "Saved." : result.error.message);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="status" className="block text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-2 w-full rounded-[var(--radius-pill)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-4 py-2 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium">
          Internal notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          className="mt-2 w-full rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-2 text-sm"
        />
      </div>

      <Button type="submit" intent="brand" size="sm" disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </Button>

      {message ? (
        <p role="status" className="text-xs text-[var(--color-ink-muted)]">
          {message}
        </p>
      ) : null}
    </form>
  );
}
