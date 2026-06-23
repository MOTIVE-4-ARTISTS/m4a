"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteEvent } from "../actions";

// Destructive delete with a confirm step. Deleting an event is rare (most
// of the time you cancel it — which keeps the record + emits STATUS:CANCELLED
// to anyone who already added it to their calendar). Delete is for genuine
// mistakes / test rows.
export function DeleteEventButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (
      !window.confirm(
        `Delete "${title}"? This can't be undone. To keep the record but hide it, set it to draft or cancelled instead.`,
      )
    ) {
      return;
    }
    setBusy(true);
    const result = await deleteEvent(id);
    setBusy(false);
    if (result.ok) {
      router.push("/admin/events");
      router.refresh();
    } else {
      window.alert(result.error.message);
    }
  }

  return (
    <Button type="button" intent="ink" size="sm" onClick={onDelete} disabled={busy}>
      {busy ? "Deleting…" : "Delete"}
    </Button>
  );
}
