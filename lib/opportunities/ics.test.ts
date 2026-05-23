import { describe, expect, it } from "vitest";

import type { Opportunity } from "@/lib/supabase/types";
import { buildCalendar, buildVevent } from "./ics";

function row(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    canonical_key: "test-funder/test-program/2026",
    name: "Test Choreographer Grant",
    funder_name: "Test Funder, Inc.",
    funder_slug: "test-funder",
    type: "grant",
    deadline: "2026-07-15",
    is_rolling: false,
    application_window: null,
    amount_min_cents: 100_000,
    amount_max_cents: 500_000,
    amount_display: null,
    eligibility_individual: true,
    eligibility_fiscal_sponsor: false,
    eligibility_501c3: false,
    location_requirement: "nyc",
    application_fee_cents: 0,
    discipline_tags: ["dance"],
    genre_tags: [],
    career_stage: ["emerging"],
    equity_tags: [],
    description_short: "Project support; no fee.",
    source_url: "https://example.org/apply",
    application_platform: "submittable",
    is_archived: false,
    archived_reason: null,
    last_verified_at: new Date("2026-05-20T12:00:00Z").toISOString(),
    verified_by: "editor:test",
    embedding: null,
    created_at: new Date("2026-05-01T00:00:00Z").toISOString(),
    updated_at: new Date("2026-05-01T00:00:00Z").toISOString(),
    ...overrides,
  };
}

const FIXED_NOW = new Date("2026-05-22T10:00:00Z");

describe("buildVevent", () => {
  it("emits the RFC 5545 required fields", () => {
    const out = buildVevent(row(), FIXED_NOW);
    expect(out).not.toBeNull();
    const text = out as string;
    for (const required of [
      "BEGIN:VEVENT",
      "END:VEVENT",
      "DTSTAMP:",
      "DTSTART;",
      "DTEND;",
      "SUMMARY:",
      "URL:",
      "UID:",
    ]) {
      expect(text.includes(required)).toBe(true);
    }
  });

  it("expresses the deadline as an all-day event (no time component) with exclusive DTEND", () => {
    const out = buildVevent(row({ deadline: "2026-07-15" }), FIXED_NOW) as string;
    expect(out).toContain("DTSTART;VALUE=DATE:20260715");
    // All-day iCalendar events use exclusive end semantics: end-date is
    // the day AFTER the deadline, not the deadline itself.
    expect(out).toContain("DTEND;VALUE=DATE:20260716");
  });

  it("anchors the UID to opportunity id + the m4a domain so re-imports update in place", () => {
    const out = buildVevent(row({ id: "abc-123" }), FIXED_NOW) as string;
    expect(out).toContain("UID:opportunity-abc-123@motive4artists.org");
  });

  it("escapes commas, semicolons, and backslashes per RFC 5545", () => {
    const out = buildVevent(
      row({
        name: "Grant, Special; Edition",
        description_short: "Path: C:\\Users\\notes; line 2",
      }),
      FIXED_NOW,
    ) as string;
    expect(out).toContain("SUMMARY:Grant\\, Special\\; Edition — GRANT");
    expect(out).toContain("C:\\\\Users\\\\notes\\; line 2");
  });

  it("returns null for rolling opportunities (no calendarable date)", () => {
    expect(buildVevent(row({ deadline: null, is_rolling: true }), FIXED_NOW)).toBeNull();
  });

  it("emits a stable SEQUENCE per row content — same row, same hash", () => {
    const a = buildVevent(row(), FIXED_NOW) as string;
    const b = buildVevent(row(), FIXED_NOW) as string;
    const seqA = a.match(/SEQUENCE:(\d+)/)?.[1];
    const seqB = b.match(/SEQUENCE:(\d+)/)?.[1];
    expect(seqA).toBeDefined();
    expect(seqA).toBe(seqB);
  });

  it("bumps SEQUENCE when deadline changes — the calendar client refreshes", () => {
    const a = buildVevent(row({ deadline: "2026-07-15" }), FIXED_NOW) as string;
    const b = buildVevent(row({ deadline: "2026-08-15" }), FIXED_NOW) as string;
    const seqA = a.match(/SEQUENCE:(\d+)/)?.[1];
    const seqB = b.match(/SEQUENCE:(\d+)/)?.[1];
    expect(seqA).not.toBe(seqB);
  });

  it("folds lines longer than 75 octets with CRLF + space (RFC 5545 §3.1)", () => {
    const long = "x".repeat(300);
    const out = buildVevent(row({ description_short: long }), FIXED_NOW) as string;
    // Some line in the output must contain a CRLF followed by a single
    // space, which is the fold marker.
    expect(out).toMatch(/\r\n /);
  });
});

describe("buildCalendar", () => {
  it("wraps VEVENTs in a valid VCALENDAR with method PUBLISH", () => {
    const text = buildCalendar([row()], FIXED_NOW);
    expect(text.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(text.includes("METHOD:PUBLISH")).toBe(true);
    expect(text.includes("PRODID:-//motive4artists.org//opportunities//EN")).toBe(true);
    expect(text.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
  });

  it("skips rolling rows silently rather than emitting a malformed VEVENT", () => {
    const text = buildCalendar(
      [row(), row({ id: "2", deadline: null, is_rolling: true })],
      FIXED_NOW,
    );
    // Two VEVENTs would have two BEGIN:VEVENT markers; we expect one.
    expect(text.split("BEGIN:VEVENT").length - 1).toBe(1);
  });

  it("emits CRLF line endings — calendar clients are strict", () => {
    const text = buildCalendar([row()], FIXED_NOW);
    expect(text).toContain("\r\n");
    expect(text.includes("\n\n")).toBe(false);
  });
});
