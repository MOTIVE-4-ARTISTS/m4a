"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { promoteSubmission } from "@/lib/ingest/promote";
import { locationRequirementSchema, opportunityTypeSchema } from "@/lib/opportunities/schema";
import { actionError, err, ok, type Result } from "@/lib/result";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database, OpportunitySubmission } from "@/lib/supabase/types";

// Review-queue actions for /admin/opportunities. Authorization is the
// cookie-bound session (the admin layout already confirmed admin_users
// membership; we re-check the session here defensively). The actual writes
// run through the service-role admin client because they touch the
// service-role-only `opportunity_sources` table and the `opportunities`
// table — see lib/ingest/promote.ts.

type Reviewer = { email: string };

async function requireReviewer(): Promise<Reviewer | { error: ReturnType<typeof actionError> }> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: actionError("dependency_unavailable", "Database not configured.") };
  }
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return { error: actionError("unauthorized", "Sign in first.") };
  return { email: data.user.email ?? data.user.id };
}

async function loadSubmission(id: string): Promise<OpportunitySubmission | null> {
  const admin = createAdminClient();
  if (!admin) return null;
  type Chain = {
    select: (cols: string) => {
      eq: (
        k: string,
        v: string,
      ) => {
        single: () => Promise<{ data: OpportunitySubmission | null }>;
      };
    };
  };
  const table = (admin as unknown as { from: (t: string) => Chain }).from(
    "opportunity_submissions",
  );
  const { data } = await table.select("*").eq("id", id).single();
  return data;
}

async function markReviewed(
  id: string,
  status: "approved" | "rejected",
  reviewer: string,
  notes?: string,
): Promise<{ message: string } | null> {
  const admin = createAdminClient();
  if (!admin) return { message: "Database not configured." };
  type Chain = {
    update: (v: Database["public"]["Tables"]["opportunity_submissions"]["Update"]) => {
      eq: (k: string, v: string) => Promise<{ error: { message: string } | null }>;
    };
  };
  const table = (admin as unknown as { from: (t: string) => Chain }).from(
    "opportunity_submissions",
  );
  const { error } = await table
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewer,
      ...(notes ? { reviewer_notes: notes } : {}),
    })
    .eq("id", id);
  return error ? { message: error.message } : null;
}

function revalidate(): void {
  revalidatePath("/opportunities");
  revalidatePath("/admin/opportunities");
}

export async function approveSubmission(id: string): Promise<Result<{ opportunity_id: string }>> {
  if (!z.string().uuid().safeParse(id).success) {
    return err(actionError("invalid_input", "Bad submission id."));
  }
  const gate = await requireReviewer();
  if ("error" in gate) return err(gate.error);

  const sub = await loadSubmission(id);
  if (!sub) return err(actionError("not_found", "Submission not found."));
  if (sub.status !== "pending") {
    return err(actionError("conflict", `Already ${sub.status}.`));
  }

  const promoted = await promoteSubmission(sub, gate.email);
  if (!promoted.ok) {
    // Most common cause: a partial submission missing required fields. Tell
    // the reviewer to edit-then-approve rather than failing silently.
    return err(actionError("invalid_input", `Couldn't publish: ${promoted.reason}`));
  }

  const failed = await markReviewed(id, "approved", gate.email);
  if (failed) return err(actionError("server_error", failed.message));

  revalidate();
  return ok({ opportunity_id: promoted.opportunity_id });
}

export async function rejectSubmission(
  id: string,
  notes?: string,
): Promise<Result<{ id: string }>> {
  if (!z.string().uuid().safeParse(id).success) {
    return err(actionError("invalid_input", "Bad submission id."));
  }
  const gate = await requireReviewer();
  if ("error" in gate) return err(gate.error);

  const sub = await loadSubmission(id);
  if (!sub) return err(actionError("not_found", "Submission not found."));

  const failed = await markReviewed(id, "rejected", gate.email, notes?.trim() || undefined);
  if (failed) return err(actionError("server_error", failed.message));

  revalidate();
  return ok({ id });
}

// The fields a reviewer can fix before approving. Tags / amount min-max are
// kept from the original extraction; this covers the fields that most often
// need a human touch (deadline, amount blurb, eligibility, location, copy).
const editSchema = z.object({
  name: z.string().trim().min(1).max(200),
  funder_name: z.string().trim().min(1).max(200),
  type: opportunityTypeSchema,
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  is_rolling: z.boolean(),
  amount_display: z.string().trim().max(120).nullable(),
  location_requirement: locationRequirementSchema,
  eligibility_individual: z.boolean(),
  eligibility_fiscal_sponsor: z.boolean(),
  eligibility_501c3: z.boolean(),
  application_fee_cents: z.number().int().min(0),
  description_short: z.string().trim().min(1).max(200),
  source_url: z.string().url(),
});

export async function editAndApprove(
  id: string,
  raw: unknown,
): Promise<Result<{ opportunity_id: string }>> {
  if (!z.string().uuid().safeParse(id).success) {
    return err(actionError("invalid_input", "Bad submission id."));
  }
  const parsed = editSchema.safeParse(raw);
  if (!parsed.success) {
    return err(
      actionError("invalid_input", parsed.error.issues[0]?.message ?? "Some fields need fixing."),
    );
  }
  const gate = await requireReviewer();
  if ("error" in gate) return err(gate.error);

  const sub = await loadSubmission(id);
  if (!sub) return err(actionError("not_found", "Submission not found."));
  if (sub.status !== "pending") return err(actionError("conflict", `Already ${sub.status}.`));

  // Persist the edits to the submission row first (audit trail), then promote
  // the merged record.
  const admin = createAdminClient();
  if (!admin) return err(actionError("dependency_unavailable", "Database not configured."));
  type Chain = {
    update: (v: Database["public"]["Tables"]["opportunity_submissions"]["Update"]) => {
      eq: (k: string, v: string) => Promise<{ error: { message: string } | null }>;
    };
  };
  const table = (admin as unknown as { from: (t: string) => Chain }).from(
    "opportunity_submissions",
  );
  const { error: updateErr } = await table.update(parsed.data).eq("id", id);
  if (updateErr) return err(actionError("server_error", updateErr.message));

  const merged: OpportunitySubmission = { ...sub, ...parsed.data };
  const promoted = await promoteSubmission(merged, gate.email);
  if (!promoted.ok) {
    return err(actionError("invalid_input", `Couldn't publish: ${promoted.reason}`));
  }

  const failed = await markReviewed(id, "approved", gate.email);
  if (failed) return err(actionError("server_error", failed.message));

  revalidate();
  return ok({ opportunity_id: promoted.opportunity_id });
}

// Phase 5: triage a funder/aggregator the meta-agent proposed. "accepted"
// just records the decision (wiring an adapter or newsletter subscription is
// a separate engineering step); "dismissed" clears it from the queue.
export async function reviewProposedSource(
  id: string,
  decision: "accepted" | "dismissed",
): Promise<Result<{ id: string }>> {
  if (!z.string().uuid().safeParse(id).success) {
    return err(actionError("invalid_input", "Bad source id."));
  }
  if (decision !== "accepted" && decision !== "dismissed") {
    return err(actionError("invalid_input", "Bad decision."));
  }
  const gate = await requireReviewer();
  if ("error" in gate) return err(gate.error);

  const admin = createAdminClient();
  if (!admin) return err(actionError("dependency_unavailable", "Database not configured."));
  type Chain = {
    update: (v: Database["public"]["Tables"]["proposed_sources"]["Update"]) => {
      eq: (k: string, v: string) => Promise<{ error: { message: string } | null }>;
    };
  };
  const table = (admin as unknown as { from: (t: string) => Chain }).from("proposed_sources");
  const { error } = await table
    .update({ status: decision, reviewed_at: new Date().toISOString(), reviewed_by: gate.email })
    .eq("id", id);
  if (error) return err(actionError("server_error", error.message));

  revalidatePath("/admin/opportunities");
  return ok({ id });
}
