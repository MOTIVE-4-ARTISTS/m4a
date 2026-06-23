import { z } from "zod";

// Single source of truth for the field constraints that drive Zod schemas,
// HTML input attributes (`maxLength`), and tests. Scattering these as
// literals across forms is the most common source of "the client says 200,
// the server says 100" bugs and the most common thing an AI agent silently
// drifts on across sessions. Keep this short and opinionated; add a constant
// only when it's referenced from two places, and the second reference is
// somewhere the limit actually matters (an actual schema, not a comment).
//
// See docs/checklists/server-action.md for the canonical Server Action wiring.

export const VALIDATION_LIMITS = {
  // RFC 5321 hard upper bound; we never need more than this and a longer
  // value almost always indicates abuse or a copy-paste accident.
  EMAIL_MAX: 254,

  // Display-name fields (donor name, applicant name). Long enough for hyphenated
  // surnames and a middle name; short enough that abuse stands out.
  NAME_MAX: 100,

  // Free-form notes / "tell us about your work" — generous but bounded so a
  // single submission can't blow past Resend or Supabase row limits.
  MESSAGE_MAX: 4_000,

  // Hidden form "source" tag we attach to newsletter/contact forms to know
  // which surface they came from (`/donate`, `/connect`, footer, etc.).
  SOURCE_MAX: 64,

  // Donations are in cents. $1 floor matches Stripe's minimum-charge
  // threshold; $1M cap is a sanity ceiling — anything above this should
  // route through a personal conversation, not a web form.
  DONATION_MIN_CENTS: 100,
  DONATION_MAX_CENTS: 1_000_000_00,

  // URL slugs for artists, cohorts, press items. Lowercase, hyphen-separated,
  // no leading/trailing hyphens; bounded so we don't have to worry about
  // Postgres index bloat or routing oddities.
  SLUG_MAX: 64,
  SLUG_REGEX: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

  // Free-text artist self-description fed to the /opportunities AI input.
  // 500 chars is comfortably above "1–3 sentences" (the prompt instructs
  // the artist) and well below the LLM context budget, so the prompt
  // cost stays predictable. See docs/adr/0004-ai-provider.md §privacy.
  ARTIST_DESCRIPTION_MAX: 500,

  // Events (admin-authored). Title is a headline; summary is the card
  // blurb; description is the long-form body. Bounded so a single row
  // can't blow past Supabase limits or break card layouts.
  EVENT_TITLE_MAX: 160,
  EVENT_SUMMARY_MAX: 400,
  EVENT_DESCRIPTION_MAX: 8_000,
  // Display fields on the event (venue name + address, RSVP button label).
  EVENT_LOCATION_MAX: 200,
  EVENT_RSVP_LABEL_MAX: 60,
} as const;

// Friendly default messages are baked into the shared schemas so every form
// that uses them displays the same, donor-tested copy. Override at the call
// site only when the surface has a different voice (we don't, today).
export const emailSchema = z
  .string({ message: "Please enter a valid email" })
  .trim()
  .min(1, "Please enter a valid email")
  .max(VALIDATION_LIMITS.EMAIL_MAX, "That email address is too long.")
  .email("Please enter a valid email");

export const nameSchema = z.string().trim().min(1).max(VALIDATION_LIMITS.NAME_MAX);

export const messageSchema = z.string().trim().max(VALIDATION_LIMITS.MESSAGE_MAX);

export const sourceSchema = z.string().max(VALIDATION_LIMITS.SOURCE_MAX);

export const slugSchema = z
  .string()
  .max(VALIDATION_LIMITS.SLUG_MAX)
  .regex(VALIDATION_LIMITS.SLUG_REGEX, "Use lowercase letters, numbers, and hyphens only.");

export const donationAmountCentsSchema = z
  .number()
  .int()
  .min(VALIDATION_LIMITS.DONATION_MIN_CENTS)
  .max(VALIDATION_LIMITS.DONATION_MAX_CENTS);
