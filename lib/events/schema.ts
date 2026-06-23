import { z } from "zod";
import { PROGRAMS } from "@/lib/programs";
import { slugSchema, VALIDATION_LIMITS } from "@/lib/validation";

// Zod hub for the /events feature. The admin CRUD form, its Server
// Actions, and the seed importer all parse against `eventDraftSchema` so
// when the SQL DDL (supabase/migrations/0005_events.sql) changes, this is
// the second file that changes and the rest fails fast.
//
// See:
//   - supabase/migrations/0005_events.sql       (source of truth)
//   - docs/adr/0007-events-data-model.md         (why it looks this way)
//   - docs/checklists/server-action.md           (how this composes)

export const EVENT_TYPES = ["sharing", "gathering", "workshop", "performance", "talk"] as const;
export const eventTypeSchema = z.enum(EVENT_TYPES);
export type EventTypeValue = z.infer<typeof eventTypeSchema>;

// Human labels for the type — used by the admin form select + the public
// card eyebrow. Lowercase to match the site voice.
export const EVENT_TYPE_LABEL: Record<EventTypeValue, string> = {
  sharing: "sharing",
  gathering: "gathering",
  workshop: "workshop",
  performance: "performance",
  talk: "talk",
};

// program_id cross-link: must be one of the flagship program ids (or empty).
// Kept in sync with lib/programs.ts rather than duplicating the union.
const PROGRAM_IDS = PROGRAMS.map((p) => p.id) as [string, ...string[]];

// Empty-string-to-undefined helper for optional text fields coming off an
// HTML form (a blank input posts "" not undefined).
const optionalText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(max).optional(),
  );

const optionalUrl = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().url().optional(),
);

// ISO timestamp from a datetime-local input (the admin form). We accept the
// broad ISO shape and let the DB store it as timestamptz; the refine guards
// the end-after-start invariant the SQL also enforces.
const isoDatetime = z.string().min(1, "Pick a date and time.");

export const eventDraftSchema = z
  .object({
    slug: slugSchema,
    title: z
      .string()
      .trim()
      .min(1, "Give the event a title.")
      .max(VALIDATION_LIMITS.EVENT_TITLE_MAX),
    event_type: eventTypeSchema.default("sharing"),
    starts_at: isoDatetime,
    ends_at: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.string().optional(),
    ),
    timezone: z.string().trim().min(1).default("America/New_York"),
    location_name: optionalText(VALIDATION_LIMITS.EVENT_LOCATION_MAX),
    location_address: optionalText(VALIDATION_LIMITS.EVENT_LOCATION_MAX),
    is_online: z.boolean().default(false),
    online_url: optionalUrl,
    summary: z
      .string()
      .trim()
      .min(1, "Write a one-line summary.")
      .max(VALIDATION_LIMITS.EVENT_SUMMARY_MAX),
    description: optionalText(VALIDATION_LIMITS.EVENT_DESCRIPTION_MAX),
    cohort_slug: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      slugSchema.optional(),
    ),
    program_id: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.enum(PROGRAM_IDS).optional(),
    ),
    rsvp_url: optionalUrl,
    rsvp_label: optionalText(VALIDATION_LIMITS.EVENT_RSVP_LABEL_MAX),
    image_path: optionalText(300),
    is_published: z.boolean().default(false),
    is_cancelled: z.boolean().default(false),
  })
  .refine((data) => !data.ends_at || new Date(data.ends_at) >= new Date(data.starts_at), {
    message: "End time must be on or after the start time.",
    path: ["ends_at"],
  });
