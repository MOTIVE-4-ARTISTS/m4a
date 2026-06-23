import { describe, expect, it } from "vitest";
import type { EventRecord } from "@/lib/supabase/types";
import { buildEventCalendar, buildEventVevent } from "./ics";

function row(overrides: Partial<EventRecord> = {}): EventRecord {
  return {
    id: "22222222-2222-2222-2222-222222222222",
    slug: "2026-air-sharing",
    title: "2026 AIR Sharing",
    event_type: "sharing",
    starts_at: "2026-06-20T23:00:00Z",
    ends_at: "2026-06-21T01:00:00Z",
    timezone: "America/New_York",
    location_name: "MOtiVE Brooklyn",
    location_address: "68 Jay Street, Studio 621, Brooklyn",
    is_online: false,
    online_url: null,
    summary: "Public sharing from the 2026 cohort.",
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
    ...overrides,
  };
}

const FIXED_NOW = new Date("2026-05-22T10:00:00Z");

describe("buildEventVevent", () => {
  it("emits a TIMED event (DTSTART with a time, not VALUE=DATE)", () => {
    const out = buildEventVevent(row(), FIXED_NOW);
    expect(out).toContain("DTSTART:20260620T230000Z");
    expect(out).toContain("DTEND:20260621T010000Z");
    expect(out).not.toContain("VALUE=DATE");
  });

  it("anchors the UID to the event id + the m4a domain", () => {
    const out = buildEventVevent(row({ id: "abc-9" }), FIXED_NOW);
    expect(out).toContain("UID:event-abc-9@motive4artists.org");
  });

  it("includes a LOCATION line built from venue name + address", () => {
    const out = buildEventVevent(row(), FIXED_NOW);
    expect(out).toContain("LOCATION:MOtiVE Brooklyn\\, 68 Jay Street\\, Studio 621\\, Brooklyn");
  });

  it("uses the online url for LOCATION when the event is online", () => {
    const out = buildEventVevent(
      row({ is_online: true, online_url: "https://zoom.us/j/123", location_name: null }),
      FIXED_NOW,
    );
    expect(out).toContain("LOCATION:Online — https://zoom.us/j/123");
  });

  it("defaults to a 2-hour block when there is no ends_at", () => {
    const out = buildEventVevent(row({ ends_at: null }), FIXED_NOW);
    expect(out).toContain("DTSTART:20260620T230000Z");
    expect(out).toContain("DTEND:20260621T010000Z");
  });

  it("marks cancelled events with STATUS:CANCELLED", () => {
    const out = buildEventVevent(row({ is_cancelled: true }), FIXED_NOW);
    expect(out).toContain("STATUS:CANCELLED");
  });

  it("omits STATUS for live events", () => {
    expect(buildEventVevent(row(), FIXED_NOW)).not.toContain("STATUS:");
  });

  it("emits a stable SEQUENCE per row content, bumping when a field changes", () => {
    const a = buildEventVevent(row(), FIXED_NOW);
    const b = buildEventVevent(row(), FIXED_NOW);
    const c = buildEventVevent(row({ starts_at: "2026-06-21T23:00:00Z" }), FIXED_NOW);
    const seq = (s: string) => s.match(/SEQUENCE:(\d+)/)?.[1];
    expect(seq(a)).toBe(seq(b));
    expect(seq(a)).not.toBe(seq(c));
  });
});

describe("buildEventCalendar", () => {
  it("wraps with the events PRODID and METHOD:PUBLISH", () => {
    const text = buildEventCalendar([row()], FIXED_NOW);
    expect(text.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(text).toContain("PRODID:-//motive4artists.org//events//EN");
    expect(text).toContain("METHOD:PUBLISH");
    expect(text.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
  });
});
