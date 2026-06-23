"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eventDraftSchema } from "@/lib/events/schema";
import { actionError, err, ok, type Result } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

// Admin CRUD Server Actions for events. Writes go through the cookie-bound
// server client; RLS (the "admins write events" policy in
// 0005_events.sql, keyed on admin_users) is the real security boundary.
// We re-check the session here defensively and return typed Results so the
// admin form renders success vs. error without a try/catch dance.
//
// See docs/checklists/server-action.md + docs/adr/0007-events-data-model.md.

export type EventActionOk = { readonly id: string; readonly slug: string };

// The DB columns are nullable, not optional — coerce every absent field to
// explicit null so create and update write identical, fully-specified rows
// (a partial update would otherwise leave stale values in place).
function draftToRow(
  draft: z.infer<typeof eventDraftSchema>,
): Database["public"]["Tables"]["events"]["Insert"] {
  return {
    slug: draft.slug,
    title: draft.title,
    event_type: draft.event_type,
    starts_at: new Date(draft.starts_at).toISOString(),
    ends_at: draft.ends_at ? new Date(draft.ends_at).toISOString() : null,
    timezone: draft.timezone,
    location_name: draft.location_name ?? null,
    location_address: draft.location_address ?? null,
    is_online: draft.is_online,
    online_url: draft.online_url ?? null,
    summary: draft.summary,
    description: draft.description ?? null,
    cohort_slug: draft.cohort_slug ?? null,
    program_id: draft.program_id ?? null,
    rsvp_url: draft.rsvp_url ?? null,
    rsvp_label: draft.rsvp_label ?? null,
    image_path: draft.image_path ?? null,
    is_published: draft.is_published,
    is_cancelled: draft.is_cancelled,
  };
}

type MutationChain = {
  insert: (v: Record<string, unknown>) => {
    select: (cols: string) => {
      single: () => Promise<{ data: EventActionOk | null; error: { message: string } | null }>;
    };
  };
  update: (v: Record<string, unknown>) => {
    eq: (
      k: string,
      val: string,
    ) => {
      select: (cols: string) => {
        single: () => Promise<{ data: EventActionOk | null; error: { message: string } | null }>;
      };
    };
  };
  delete: () => { eq: (k: string, val: string) => Promise<{ error: { message: string } | null }> };
};

async function requireAdminClient() {
  const supabase = await createClient();
  if (!supabase) {
    return { error: actionError("dependency_unavailable", "Database not configured.") } as const;
  }
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    return { error: actionError("unauthorized", "Sign in first.") } as const;
  }
  return { supabase } as const;
}

function table(supabase: unknown): MutationChain {
  return (supabase as { from: (t: string) => MutationChain }).from("events");
}

function revalidateEvent(slug: string): void {
  revalidatePath("/events");
  revalidatePath(`/events/${slug}`);
  revalidatePath("/admin/events");
}

export async function createEvent(raw: unknown): Promise<Result<EventActionOk>> {
  const parsed = eventDraftSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return err(actionError("invalid_input", first?.message ?? "Some fields weren't quite right."));
  }

  const gate = await requireAdminClient();
  if ("error" in gate) return err(gate.error);

  const { data, error } = await table(gate.supabase)
    .insert(draftToRow(parsed.data))
    .select("id, slug")
    .single();

  if (error || !data) {
    return err(actionError("server_error", error?.message ?? "Couldn't create the event."));
  }
  revalidateEvent(data.slug);
  return ok(data);
}

export async function updateEvent(id: string, raw: unknown): Promise<Result<EventActionOk>> {
  if (!z.string().uuid().safeParse(id).success) {
    return err(actionError("invalid_input", "Bad event id."));
  }
  const parsed = eventDraftSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return err(actionError("invalid_input", first?.message ?? "Some fields weren't quite right."));
  }

  const gate = await requireAdminClient();
  if ("error" in gate) return err(gate.error);

  const { data, error } = await table(gate.supabase)
    .update(draftToRow(parsed.data))
    .eq("id", id)
    .select("id, slug")
    .single();

  if (error || !data) {
    return err(actionError("server_error", error?.message ?? "Couldn't update the event."));
  }
  revalidateEvent(data.slug);
  return ok(data);
}

const publishSchema = z.object({ id: z.string().uuid(), slug: z.string(), published: z.boolean() });

export async function setEventPublished(
  input: z.infer<typeof publishSchema>,
): Promise<Result<{ id: string }>> {
  const parsed = publishSchema.safeParse(input);
  if (!parsed.success) return err(actionError("invalid_input", "Bad publish input."));

  const gate = await requireAdminClient();
  if ("error" in gate) return err(gate.error);

  const { error } = await (
    gate.supabase as unknown as {
      from: (t: string) => {
        update: (v: Record<string, unknown>) => {
          eq: (k: string, val: string) => Promise<{ error: { message: string } | null }>;
        };
      };
    }
  )
    .from("events")
    .update({ is_published: parsed.data.published })
    .eq("id", parsed.data.id);

  if (error) return err(actionError("server_error", error.message));
  revalidateEvent(parsed.data.slug);
  return ok({ id: parsed.data.id });
}

export async function deleteEvent(id: string): Promise<Result<{ id: string }>> {
  if (!z.string().uuid().safeParse(id).success) {
    return err(actionError("invalid_input", "Bad event id."));
  }

  const gate = await requireAdminClient();
  if ("error" in gate) return err(gate.error);

  const { error } = await table(gate.supabase).delete().eq("id", id);
  if (error) return err(actionError("server_error", error.message));
  revalidatePath("/events");
  revalidatePath("/admin/events");
  return ok({ id });
}
