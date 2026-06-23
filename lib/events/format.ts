// Display formatting for events. Pure functions, no IO — easy to unit-test.
//
// All formatting renders in the event's own timezone (stored on the row,
// default America/New_York) so "June 20, 7:00 PM" reads as the wall-clock
// time at the venue regardless of where the visitor is. We pass the IANA
// zone to Intl.DateTimeFormat's timeZone option.

import type { EventRecord } from "@/lib/supabase/types";

type DateParts = Pick<EventRecord, "starts_at" | "ends_at" | "timezone">;

// "Saturday, June 20, 2026" — the day line.
export function formatEventDate(row: DateParts): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: row.timezone,
  }).format(new Date(row.starts_at));
}

// "7:00 – 9:00 PM EDT" or "7:00 PM EDT" when there's no end. Collapses a
// same-day range into one tz/meridiem suffix.
export function formatEventTime(row: DateParts): string {
  const start = new Date(row.starts_at);
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: row.timezone,
  });
  if (!row.ends_at) return timeFmt.format(start);

  const end = new Date(row.ends_at);
  const startBare = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: row.timezone,
  }).format(start);
  return `${startBare} – ${timeFmt.format(end)}`;
}

// Combined "Sat, Jun 20 · 7:00 PM" compact form for cards.
export function formatEventCompact(row: DateParts): string {
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: row.timezone,
  }).format(new Date(row.starts_at));
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: row.timezone,
  }).format(new Date(row.starts_at));
  return `${day} · ${time}`;
}

export function formatEventLocation(row: EventRecord): string {
  if (row.is_online) return "online";
  const parts = [row.location_name, row.location_address].filter((p): p is string =>
    Boolean(p?.trim()),
  );
  return parts.length > 0 ? parts.join(" · ") : "location TBA";
}
