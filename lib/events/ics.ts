// iCalendar (RFC 5545) builder for the /events feature.
//
// Shares the spec primitives with opportunities via lib/ics/core.ts; this
// module owns the event-specific VEVENT shape: a TIMED event (DTSTART with
// a time, unlike opportunities' all-day deadlines).
//
// We emit DTSTART/DTEND as UTC (Z) stamps converted from the stored
// timestamptz. Calendar clients localise to the viewer's zone, so we don't
// need a VTIMEZONE block in v1. Cancelled events carry STATUS:CANCELLED so
// a re-import removes the event from the user's calendar.
//
// When an event has no ends_at, we default to a 2-hour block — a sane
// calendar duration for a sharing/talk that beats emitting a zero-length
// event some clients render oddly.

import { CRLF, escapeText, fold, sequenceFor, utcStamp, wrapCalendar } from "@/lib/ics/core";
import type { EventRecord } from "@/lib/supabase/types";

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;

function locationLine(row: EventRecord): string | null {
  if (row.is_online) {
    return row.online_url ? `Online — ${row.online_url}` : "Online";
  }
  const parts = [row.location_name, row.location_address].filter((p): p is string =>
    Boolean(p?.trim()),
  );
  return parts.length > 0 ? parts.join(", ") : null;
}

export function buildEventVevent(row: EventRecord, now: Date = new Date()): string {
  const start = new Date(row.starts_at);
  const end = row.ends_at ? new Date(row.ends_at) : new Date(start.getTime() + DEFAULT_DURATION_MS);

  const lines: string[] = [];
  lines.push("BEGIN:VEVENT");
  lines.push(`UID:event-${row.id}@motive4artists.org`);
  lines.push(`DTSTAMP:${utcStamp(now)}`);
  lines.push(`DTSTART:${utcStamp(start)}`);
  lines.push(`DTEND:${utcStamp(end)}`);
  lines.push(`SUMMARY:${escapeText(row.title)}`);
  lines.push(`URL:https://motive4artists.org/events/${row.slug}`);

  const location = locationLine(row);
  if (location) {
    lines.push(`LOCATION:${escapeText(location)}`);
  }

  lines.push(
    `DESCRIPTION:${escapeText(`${row.summary}\n\nVia motive4artists.org/events/${row.slug}`)}`,
  );

  if (row.is_cancelled) {
    lines.push("STATUS:CANCELLED");
  }

  // Bump SEQUENCE when any field a calendar cares about changes.
  lines.push(
    `SEQUENCE:${sequenceFor(
      `${row.starts_at}|${row.ends_at ?? "-"}|${row.title}|${location ?? "-"}|${row.is_cancelled}`,
    )}`,
  );
  lines.push("END:VEVENT");

  return lines.map(fold).join(CRLF);
}

export function buildEventCalendar(rows: EventRecord[], now: Date = new Date()): string {
  const vevents = rows.map((row) => buildEventVevent(row, now));
  return wrapCalendar(vevents, "-//motive4artists.org//events//EN");
}
