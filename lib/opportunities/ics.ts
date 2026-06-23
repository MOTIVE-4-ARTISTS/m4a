// iCalendar (RFC 5545) builder for the /opportunities feature.
//
// The fiddly spec primitives (CRLF, folding, TEXT escaping, UTC stamp,
// SEQUENCE, VCALENDAR wrapper) live in lib/ics/core.ts and are shared with
// the events calendar. This module owns only the opportunity-specific
// VEVENT shape: an all-day event anchored on the funder deadline.
//
// All-day semantics: DTSTART;VALUE=DATE:YYYYMMDD with no time component,
// and DTEND is exclusive (Jul 15 deadline -> DTSTART=20260715,
// DTEND=20260716). Rolling programs have no fixed deadline and are not
// calendarable — buildVevent returns null for them.

import {
  CRLF,
  compactDate,
  escapeText,
  fold,
  sequenceFor,
  utcStamp,
  wrapCalendar,
} from "@/lib/ics/core";
import type { Opportunity } from "@/lib/supabase/types";

// Add one day to a YYYY-MM-DD string (DTEND is exclusive for all-day).
function nextDay(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  if (!y || !m || !d) throw new Error(`Bad date: ${yyyyMmDd}`);
  const date = new Date(Date.UTC(y, m - 1, d + 1));
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

const TYPE_DISPLAY: Record<Opportunity["type"], string> = {
  grant: "GRANT",
  residency: "RESIDENCY",
  fellowship: "FELLOWSHIP",
  call: "OPEN CALL",
};

// Build one VEVENT (without the wrapping VCALENDAR). Returns null when the
// row has no fixed deadline — rolling programs aren't calendarable.
export function buildVevent(row: Opportunity, now: Date = new Date()): string | null {
  if (!row.deadline) return null;

  const lines: string[] = [];
  lines.push("BEGIN:VEVENT");
  lines.push(`UID:opportunity-${row.id}@motive4artists.org`);
  lines.push(`DTSTAMP:${utcStamp(now)}`);
  lines.push(`DTSTART;VALUE=DATE:${compactDate(row.deadline)}`);
  lines.push(`DTEND;VALUE=DATE:${compactDate(nextDay(row.deadline))}`);
  lines.push(`SUMMARY:${escapeText(`${row.name} — ${TYPE_DISPLAY[row.type]}`)}`);
  lines.push(`URL:${row.source_url}`);
  lines.push(
    `DESCRIPTION:${escapeText(
      `${row.description_short}\n\nFunder: ${row.funder_name}\nVia motive4artists.org/opportunities`,
    )}`,
  );
  lines.push(`SEQUENCE:${sequenceFor(`${row.deadline ?? "-"}|${row.name}|${row.source_url}`)}`);
  lines.push("END:VEVENT");

  return lines.map(fold).join(CRLF);
}

export function buildCalendar(rows: Opportunity[], now: Date = new Date()): string {
  const events = rows
    .map((row) => buildVevent(row, now))
    .filter((event): event is string => event !== null);
  return wrapCalendar(events, "-//motive4artists.org//opportunities//EN");
}
