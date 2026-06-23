import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { EventRecord } from "@/lib/supabase/types";

// Server-side reader for the /events feature.
//
// Mirrors lib/opportunities/read.ts: a single round-trip, published rows
// only, split into upcoming/past in JS. The events page expects a small
// dataset (a handful of events a year), so post-fetch splitting is simpler
// and cheaper to debug than two SQL queries.
//
// Degrades gracefully when Supabase env is unset (notConfigured=true) so
// the page can render its static fallback rather than a 500.

export type EventsPage = {
  upcoming: EventRecord[];
  past: EventRecord[];
  notConfigured: boolean;
};

// Static fallback shown only when Supabase env is unset (pre-provision /
// local dev without the stack). Mirrors the one real known event so the
// route never empties and detail links don't 404. Owned here — not in the
// page — so the list, the detail page, and the per-event ICS route all
// resolve the same fallback consistently. Once Supabase is configured this
// is never reached.
export const FALLBACK_EVENTS: EventRecord[] = [
  {
    id: "fallback-2026-air-sharing",
    slug: "2026-air-sharing",
    title: "2026 Artist-in-Residency Sharing",
    event_type: "sharing",
    starts_at: "2026-06-20T23:00:00Z",
    ends_at: "2026-06-21T01:00:00Z",
    timezone: "America/New_York",
    location_name: "MOtiVE Brooklyn",
    location_address: "68 Jay Street, Studio 621, Brooklyn",
    is_online: false,
    online_url: null,
    summary: "Public sharing from the 2026 AIR cohort. Full schedule and RSVP closer to the date.",
    description: null,
    cohort_slug: "2026-air",
    program_id: "residency",
    rsvp_url: null,
    rsvp_label: null,
    image_path: null,
    is_published: true,
    is_cancelled: false,
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-01T00:00:00Z",
  },
];

function splitByTime(
  rows: EventRecord[],
  now: Date,
): { upcoming: EventRecord[]; past: EventRecord[] } {
  const nowMs = now.getTime();
  const upcoming: EventRecord[] = [];
  const past: EventRecord[] = [];
  for (const row of rows) {
    const boundary = new Date(row.ends_at ?? row.starts_at).getTime();
    if (boundary >= nowMs) {
      upcoming.push(row);
    } else {
      past.push(row);
    }
  }
  past.reverse();
  return { upcoming, past };
}

type ListChain = {
  select: (cols: string) => ListChain;
  order: (col: string, opts: { ascending: boolean }) => ListChain;
  limit: (n: number) => Promise<{ data: EventRecord[] | null; error: { message: string } | null }>;
};

export async function listEvents(now: Date = new Date()): Promise<EventsPage> {
  const supabase = await createClient();
  if (!supabase) {
    // "Upcoming" keys off the end of the event when it has one (an event
    // mid-run today is still upcoming until it actually ends); otherwise
    // off the start. Same split logic for fallback + live rows.
    const { upcoming, past } = splitByTime(FALLBACK_EVENTS, now);
    return { upcoming, past, notConfigured: true };
  }

  // RLS already restricts anon reads to published rows; the explicit filter
  // is therefore unnecessary at the DB layer, but we keep the ordering
  // here and split in JS below.
  const table = (supabase as unknown as { from: (t: string) => ListChain }).from("events");
  const { data, error } = await table
    .select("*")
    .order("starts_at", { ascending: true })
    .limit(500);

  if (error) {
    console.error("[events.read] query failed", error);
    return { upcoming: [], past: [], notConfigured: false };
  }

  const { upcoming, past } = splitByTime(data ?? [], now);
  return { upcoming, past, notConfigured: false };
}

export async function getEventBySlug(slug: string): Promise<EventRecord | null> {
  const supabase = await createClient();
  if (!supabase) {
    return FALLBACK_EVENTS.find((e) => e.slug === slug) ?? null;
  }

  type Chain = {
    select: (cols: string) => Chain;
    eq: (col: string, val: unknown) => Chain;
    maybeSingle: () => Promise<{ data: EventRecord | null; error: { message: string } | null }>;
  };

  const table = (supabase as unknown as { from: (t: string) => Chain }).from("events");
  const { data, error } = await table.select("*").eq("slug", slug).maybeSingle();

  if (error) {
    console.error("[events.get] query failed", error);
    return null;
  }
  return data;
}
