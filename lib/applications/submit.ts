"use server";

import "server-only";
import { actionError, err, ok, type Result } from "@/lib/result";
import { createAdminClient } from "@/lib/supabase/admin";
import { PROGRAM_TO_SCHEMA, type Program, programSchema } from "./schemas";

// Submit Server Action. Validates with the correct program schema, drops
// the honeypot row early, persists to Supabase via the admin client (the
// form is publicly accessible — RLS would block an anon insert).
//
// Returns a typed Result so the form can render success vs validation
// errors without a try/catch dance on the client.

export type SubmitOk = {
  readonly id: string;
  readonly message: string;
};

export async function submitApplication(program: Program, raw: unknown): Promise<Result<SubmitOk>> {
  // `program` arrives as a Server Action argument, so it's externally
  // controlled. Validate it against the known set before using it as a schema
  // key or in any log line — this prevents a crash on an unknown key and keeps
  // untrusted input out of log output and format strings.
  const programResult = programSchema.safeParse(program);
  if (!programResult.success) {
    return err(actionError("invalid_input", "Unknown application program."));
  }
  const safeProgram = programResult.data;

  const schema = PROGRAM_TO_SCHEMA[safeProgram];
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return err(
      actionError("invalid_input", first?.message ?? "Something in the form wasn't quite right."),
    );
  }

  // Honeypot trip — pretend success so bots don't learn we're filtering.
  // No DB write, no email. Log so we can tune the trap.
  if ("hp_field" in parsed.data && parsed.data.hp_field) {
    console.warn("[application] honeypot tripped", { program: safeProgram });
    return ok({
      id: "honeypot",
      message: "Thanks — we received your submission.",
    });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return err(
      actionError(
        "not_configured",
        "Applications aren't accepting submissions yet — email hello@motive4artists.org and we'll handle it manually.",
      ),
    );
  }

  // Strip identifying common fields off the payload to land in the
  // `payload` JSONB. Top-level columns hold the email/name for indexing
  // and admin filtering; everything else (project description, etc.)
  // goes into the JSONB for flexible querying with the GIN index.
  const { applicantEmail, applicantName, hp_field: _hp, ...rest } = parsed.data;

  const inserted = await (
    supabase as unknown as {
      from: (t: string) => {
        insert: (v: Record<string, unknown>) => {
          select: () => Promise<{
            data: Array<{ id: string }> | null;
            error: { message: string } | null;
          }>;
        };
      };
    }
  )
    .from("applications")
    .insert({
      program: safeProgram,
      applicant_email: applicantEmail,
      applicant_name: applicantName,
      payload: rest,
      status: "submitted",
    })
    .select();

  if (inserted.error) {
    console.error("[application] insert failed", {
      program: safeProgram,
      error: inserted.error,
    });
    return err(
      actionError(
        "submit_failed",
        "We couldn't save your application. Please try again or email hello@motive4artists.org.",
      ),
    );
  }

  const id = inserted.data?.[0]?.id ?? "pending";

  // TODO(eran, 2026-Q3): kick off Resend notification (applicant + admin).
  // Deferred until newsletter pipeline is wired so we don't duplicate
  // the Resend client initialization.

  return ok({
    id,
    message: "Thanks — we've got your submission. We read every application and will be in touch.",
  });
}
