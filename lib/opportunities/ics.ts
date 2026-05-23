// iCalendar (RFC 5545) builder for the /opportunities feature.
//
// Spec primer (the bits we need):
//   - Lines are CRLF-terminated; calendar clients are strict about this.
//   - Lines >75 octets must be "folded" at 74 octets with CRLF + space.
//   - TEXT values escape `\` `;` `,` and newline.
//   - All-day events use DTSTART;VALUE=DATE:YYYYMMDD (no time component).
//   - UID must be globally unique and stable per event; we anchor on the
//     opportunity UUID + our domain so re-imports update in place.
//   - DTSTAMP is required (now, in UTC).
//   - SEQUENCE is bumped when an event mutates — we use a sha1-style hash
//     of the mutable fields (deadline + name + source_url) so the same
//     row exported twice produces the same SEQUENCE without us tracking
//     "last exported version" state anywhere.
//
// We intentionally don't depend on a third-party ICS library: the spec is
// small, our needs are narrow (single VEVENT shape, all-day deadlines),
// and a pure local implementation is easier to unit-test against literal
// RFC line counts.

import type { Opportunity } from "@/lib/supabase/types";

const CRLF = "\r\n";

// Escape per RFC 5545 §3.3.11 (TEXT). Backslash first to avoid
// double-escaping anything we wrote ourselves.
function escapeText(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

// RFC 5545 §3.1 line folding: split a long content line into 74-octet
// continuation pieces separated by CRLF + a single space. Calendar
// clients silently reject lines longer than ~1000 chars; folding makes
// us safe for arbitrarily long DESCRIPTIONs.
function fold(line: string): string {
  if (line.length <= 75) return line;
  const out: string[] = [];
  let remaining = line;
  // First piece can be 75 chars; continuation pieces must start with a
  // single whitespace, which counts toward the 75-octet ceiling.
  out.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length > 0) {
    out.push(` ${remaining.slice(0, 74)}`);
    remaining = remaining.slice(74);
  }
  return out.join(CRLF);
}

function utcStamp(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  const s = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

function compactDate(yyyyMmDd: string): string {
  return yyyyMmDd.replace(/-/g, "");
}

// Add one day to a YYYY-MM-DD string (used for DTEND, which is exclusive
// in iCalendar all-day semantics — Jul 15 deadline → DTSTART=20260715,
// DTEND=20260716).
function nextDay(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  if (!y || !m || !d) throw new Error(`Bad date: ${yyyyMmDd}`);
  const date = new Date(Date.UTC(y, m - 1, d + 1));
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

// Stable per-row sequence: 32-bit FNV-1a over the mutable fields. Small,
// deterministic, no dependency. We never need cryptographic strength —
// we just need "if the row changed, the number changes."
function sequenceFor(row: Pick<Opportunity, "deadline" | "name" | "source_url">): number {
  const material = `${row.deadline ?? "-"}|${row.name}|${row.source_url}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < material.length; i += 1) {
    hash ^= material.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Keep within 0..2^31-1 so it serialises cleanly in calendar apps.
  return Math.abs(hash | 0);
}

const TYPE_DISPLAY: Record<Opportunity["type"], string> = {
  grant: "GRANT",
  residency: "RESIDENCY",
  fellowship: "FELLOWSHIP",
  call: "OPEN CALL",
};

// Build one VEVENT (without the wrapping VCALENDAR). Returns null when
// the row has no fixed deadline — rolling programs aren't calendarable.
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
  lines.push(`SEQUENCE:${sequenceFor(row)}`);
  lines.push("END:VEVENT");

  return lines.map(fold).join(CRLF);
}

// METHOD:PUBLISH is the deliberate choice so calendar clients import each
// deadline as a one-shot add (not a meeting invitation that prompts for
// RSVP) — matches what an artist wants when they add a grant deadline.
export function buildCalendar(rows: Opportunity[], now: Date = new Date()): string {
  const events = rows
    .map((row) => buildVevent(row, now))
    .filter((event): event is string => event !== null);

  const head = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//motive4artists.org//opportunities//EN",
    "METHOD:PUBLISH",
    "CALSCALE:GREGORIAN",
  ];
  const tail = ["END:VCALENDAR"];

  return [...head, ...events, ...tail].join(CRLF) + CRLF;
}
