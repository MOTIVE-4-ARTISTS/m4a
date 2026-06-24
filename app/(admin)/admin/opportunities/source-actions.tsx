"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { reviewProposedSource } from "./actions";

// Triage control for one meta-agent-proposed source. "track this" records the
// intent (an engineer still wires the adapter/newsletter); "dismiss" clears it.
export function SourceActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function decide(decision: "accepted" | "dismissed") {
    setBusy(true);
    const result = await reviewProposedSource(id, decision);
    setBusy(false);
    if (result.ok) router.refresh();
    else window.alert(result.error.message);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => decide("accepted")}
        className="rounded-[var(--radius-pill)] border border-[var(--color-rule)] px-3 py-1 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-paper-warm)] hover:text-[var(--color-ink)] disabled:opacity-60"
      >
        {busy ? "…" : "track this"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => decide("dismissed")}
        className="rounded-[var(--radius-pill)] border border-[var(--color-rule)] px-3 py-1 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] disabled:opacity-60"
      >
        dismiss
      </button>
    </div>
  );
}
