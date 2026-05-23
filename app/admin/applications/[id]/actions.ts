"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionError, err, ok, type Result } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["submitted", "under_review", "shortlist", "accepted", "declined", "withdrawn"]),
  notes: z.string().max(20_000),
});

// Status + notes update. RLS on `applications` ensures only admin_users can
// write; we still re-check session here defensively.
export async function updateApplicationStatus(
  input: z.infer<typeof schema>,
): Promise<Result<{ id: string }>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return err(actionError("invalid_input", "Bad status or notes input."));
  }

  const supabase = await createClient();
  if (!supabase) return err(actionError("not_configured", "Database not configured."));

  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return err(actionError("unauthorized", "Sign in first."));

  const decidedAt =
    parsed.data.status === "accepted" || parsed.data.status === "declined"
      ? new Date().toISOString()
      : null;

  const { error: updateErr } = await (
    supabase as unknown as {
      from: (t: string) => {
        update: (v: Record<string, unknown>) => {
          eq: (k: string, v: string) => Promise<{ error: { message: string } | null }>;
        };
      };
    }
  )
    .from("applications")
    .update({
      status: parsed.data.status,
      internal_notes: parsed.data.notes,
      decided_at: decidedAt,
    })
    .eq("id", parsed.data.id);

  if (updateErr) {
    return err(actionError("update_failed", updateErr.message));
  }

  revalidatePath(`/admin/applications/${parsed.data.id}`);
  revalidatePath("/admin/applications");
  return ok({ id: parsed.data.id });
}
