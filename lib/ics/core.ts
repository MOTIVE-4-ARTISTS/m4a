// Shared iCalendar (RFC 5545) primitives.
//
// Extracted from lib/opportunities/ics.ts so both the opportunities
// (all-day deadlines) and events (timed) calendars share one tested
// implementation of the fiddly spec bits: CRLF termination, 75-octet line
// folding, TEXT escaping, UTC stamps, a stable per-row SEQUENCE, and the
// VCALENDAR wrapper.
//
// Spec primer (the bits we need):
//   - Lines are CRLF-terminated; calendar clients are strict about this.
//   - Lines >75 octets must be "folded" at 74 octets with CRLF + space.
//   - TEXT values escape `\` `;` `,` and newline.
//   - DTSTAMP is required (now, in UTC).
//   - METHOD:PUBLISH imports each VEVENT as a one-shot add, not a meeting
//     invitation that prompts for RSVP — what an artist wants when adding a
//     deadline or a sharing date to their calendar.
//
// We intentionally don't depend on a third-party ICS library: the spec is
// small, our needs are narrow, and a pure local implementation is easier to
// unit-test against literal RFC line counts.

export const CRLF = "\r\n";

// Escape per RFC 5545 §3.3.11 (TEXT). Backslash first to avoid
// double-escaping anything we wrote ourselves.
export function escapeText(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

// RFC 5545 §3.1 line folding: split a long content line into 74-octet
// continuation pieces separated by CRLF + a single space.
export function fold(line: string): string {
  if (line.length <= 75) return line;
  const out: string[] = [];
  let remaining = line;
  out.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length > 0) {
    out.push(` ${remaining.slice(0, 74)}`);
    remaining = remaining.slice(74);
  }
  return out.join(CRLF);
}

// UTC stamp form: YYYYMMDDTHHMMSSZ. Used for DTSTAMP everywhere and for the
// timed DTSTART/DTEND on events.
export function utcStamp(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  const s = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

// Compact YYYY-MM-DD -> YYYYMMDD for all-day VALUE=DATE fields.
export function compactDate(yyyyMmDd: string): string {
  return yyyyMmDd.replace(/-/g, "");
}

// Stable per-row sequence: 32-bit FNV-1a over a material string. Small,
// deterministic, no dependency. "If the row changed, the number changes."
export function sequenceFor(material: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < material.length; i += 1) {
    hash ^= material.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return Math.abs(hash | 0);
}

// Wrap pre-built VEVENT blocks in a VCALENDAR. `prodId` distinguishes the
// opportunities calendar from the events calendar in clients that show it.
export function wrapCalendar(vevents: string[], prodId: string): string {
  const head = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${prodId}`,
    "METHOD:PUBLISH",
    "CALSCALE:GREGORIAN",
  ];
  const tail = ["END:VCALENDAR"];
  return [...head, ...vevents, ...tail].join(CRLF) + CRLF;
}
