"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createEvent, updateEvent } from "@/app/(admin)/admin/events/actions";
import { Button } from "@/components/ui/button";
import { EVENT_TYPES } from "@/lib/events/schema";
import { PROGRAMS } from "@/lib/programs";
import type { EventRecord } from "@/lib/supabase/types";
import { VALIDATION_LIMITS } from "@/lib/validation";

// Admin create/edit form for events. Controlled state, submits through the
// createEvent / updateEvent Server Actions (which re-validate with
// eventDraftSchema + enforce RLS). Datetime conversion happens here, on the
// client, so the admin's browser timezone resolves the wall-clock instant —
// the common case is an NYC admin authoring NYC events. See the ADR for the
// timezone simplification.

// ISO (UTC) -> "YYYY-MM-DDTHH:MM" in the browser's local time, for editing.
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// "YYYY-MM-DDTHH:MM" (local) -> full ISO string with offset resolved.
function toIso(local: string): string {
  return local ? new Date(local).toISOString() : "";
}

type FieldState = {
  slug: string;
  title: string;
  event_type: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  location_name: string;
  location_address: string;
  is_online: boolean;
  online_url: string;
  summary: string;
  description: string;
  cohort_slug: string;
  program_id: string;
  rsvp_url: string;
  rsvp_label: string;
  image_path: string;
  is_published: boolean;
  is_cancelled: boolean;
};

function initial(event: EventRecord | null): FieldState {
  return {
    slug: event?.slug ?? "",
    title: event?.title ?? "",
    event_type: event?.event_type ?? "sharing",
    starts_at: toLocalInput(event?.starts_at ?? null),
    ends_at: toLocalInput(event?.ends_at ?? null),
    timezone: event?.timezone ?? "America/New_York",
    location_name: event?.location_name ?? "",
    location_address: event?.location_address ?? "",
    is_online: event?.is_online ?? false,
    online_url: event?.online_url ?? "",
    summary: event?.summary ?? "",
    description: event?.description ?? "",
    cohort_slug: event?.cohort_slug ?? "",
    program_id: event?.program_id ?? "",
    rsvp_url: event?.rsvp_url ?? "",
    rsvp_label: event?.rsvp_label ?? "",
    image_path: event?.image_path ?? "",
    is_published: event?.is_published ?? false,
    is_cancelled: event?.is_cancelled ?? false,
  };
}

const inputClass =
  "mt-1.5 w-full rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-2 text-sm";

export function EventForm({ event }: { event?: EventRecord | null }) {
  const router = useRouter();
  const [f, setF] = useState<FieldState>(initial(event ?? null));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function set<K extends keyof FieldState>(key: K, value: FieldState[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      ...f,
      starts_at: toIso(f.starts_at),
      ends_at: f.ends_at ? toIso(f.ends_at) : "",
    };

    const result = event ? await updateEvent(event.id, payload) : await createEvent(payload);

    setSaving(false);
    if (result.ok) {
      router.push("/admin/events");
      router.refresh();
    } else {
      setMessage(result.error.message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Title
          <input
            value={f.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={VALIDATION_LIMITS.EVENT_TITLE_MAX}
            required
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Slug
          <input
            value={f.slug}
            onChange={(e) => set("slug", e.target.value)}
            maxLength={VALIDATION_LIMITS.SLUG_MAX}
            placeholder="2026-air-sharing"
            required
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block text-sm font-medium">
          Type
          <select
            value={f.event_type}
            onChange={(e) => set("event_type", e.target.value)}
            className={inputClass}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Starts
          <input
            type="datetime-local"
            value={f.starts_at}
            onChange={(e) => set("starts_at", e.target.value)}
            required
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Ends (optional)
          <input
            type="datetime-local"
            value={f.ends_at}
            onChange={(e) => set("ends_at", e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="block text-sm font-medium">
        Summary
        <textarea
          value={f.summary}
          onChange={(e) => set("summary", e.target.value)}
          maxLength={VALIDATION_LIMITS.EVENT_SUMMARY_MAX}
          rows={2}
          required
          className={inputClass}
        />
      </label>

      <label className="block text-sm font-medium">
        Description (optional)
        <textarea
          value={f.description}
          onChange={(e) => set("description", e.target.value)}
          maxLength={VALIDATION_LIMITS.EVENT_DESCRIPTION_MAX}
          rows={6}
          className={inputClass}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Venue name
          <input
            value={f.location_name}
            onChange={(e) => set("location_name", e.target.value)}
            maxLength={VALIDATION_LIMITS.EVENT_LOCATION_MAX}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Venue address
          <input
            value={f.location_address}
            onChange={(e) => set("location_address", e.target.value)}
            maxLength={VALIDATION_LIMITS.EVENT_LOCATION_MAX}
            className={inputClass}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={f.is_online}
            onChange={(e) => set("is_online", e.target.checked)}
          />
          Online event
        </label>
        {f.is_online ? (
          <label className="flex-1 text-sm font-medium">
            Online URL
            <input
              type="url"
              value={f.online_url}
              onChange={(e) => set("online_url", e.target.value)}
              className={inputClass}
            />
          </label>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Cohort slug (optional)
          <input
            value={f.cohort_slug}
            onChange={(e) => set("cohort_slug", e.target.value)}
            placeholder="2026-air"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Program (optional)
          <select
            value={f.program_id}
            onChange={(e) => set("program_id", e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            {PROGRAMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          RSVP URL (optional)
          <input
            type="url"
            value={f.rsvp_url}
            onChange={(e) => set("rsvp_url", e.target.value)}
            placeholder="https://…"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          RSVP button label (optional)
          <input
            value={f.rsvp_label}
            onChange={(e) => set("rsvp_label", e.target.value)}
            maxLength={VALIDATION_LIMITS.EVENT_RSVP_LABEL_MAX}
            placeholder="RSVP on Eventbrite"
            className={inputClass}
          />
        </label>
      </div>

      <label className="block text-sm font-medium">
        Image path (optional)
        <input
          value={f.image_path}
          onChange={(e) => set("image_path", e.target.value)}
          placeholder="/content/events/2026-air-sharing.jpg"
          className={inputClass}
        />
      </label>

      <div className="flex flex-wrap items-center gap-6 border-t border-[var(--color-rule)] pt-5">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={f.is_published}
            onChange={(e) => set("is_published", e.target.checked)}
          />
          Published (visible on the public site)
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={f.is_cancelled}
            onChange={(e) => set("is_cancelled", e.target.checked)}
          />
          Cancelled
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" intent="brand" size="md" disabled={saving}>
          {saving ? "Saving…" : event ? "Save changes" : "Create event"}
        </Button>
        <Button as="a" href="/admin/events" intent="ghost" size="md">
          Cancel
        </Button>
      </div>

      {message ? (
        <p role="status" className="text-sm text-[var(--color-brand-deep)]">
          {message}
        </p>
      ) : null}
    </form>
  );
}
