"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setEventPublished } from "./actions";

// Inline publish/unpublish toggle on the events list — lets an admin flip
// visibility without opening the editor. Optimistic-ish: we disable while
// the action runs, then refresh the server component to reflect truth.
export function PublishToggle({
  id,
  slug,
  published,
}: {
  id: string;
  slug: string;
  published: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onToggle() {
    setBusy(true);
    const result = await setEventPublished({ id, slug, published: !published });
    setBusy(false);
    if (result.ok) {
      router.refresh();
    } else {
      window.alert(result.error.message);
    }
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={busy}
      className="rounded-[var(--radius-pill)] border border-[var(--color-rule)] px-3 py-1 text-xs font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-paper-warm)] hover:text-[var(--color-ink)] disabled:opacity-60"
    >
      {busy ? "…" : published ? "unpublish" : "publish"}
    </button>
  );
}
