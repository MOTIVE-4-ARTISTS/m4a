import { describe, expect, it } from "vitest";
import { compactDate, escapeText, fold, sequenceFor, utcStamp, wrapCalendar } from "./core";

describe("escapeText", () => {
  it("escapes backslash first, then comma/semicolon/newline per RFC 5545", () => {
    expect(escapeText("Path: C:\\Users\\notes; line 2, end\nnext")).toBe(
      "Path: C:\\\\Users\\\\notes\\; line 2\\, end\\nnext",
    );
  });
});

describe("fold", () => {
  it("leaves short lines untouched", () => {
    expect(fold("BEGIN:VEVENT")).toBe("BEGIN:VEVENT");
  });

  it("folds lines over 75 octets with CRLF + leading space", () => {
    const out = fold("x".repeat(300));
    expect(out).toMatch(/\r\n /);
    // First piece is 75 chars; no fold marker before then.
    expect(out.slice(0, 75)).toBe("x".repeat(75));
  });
});

describe("utcStamp", () => {
  it("renders YYYYMMDDTHHMMSSZ in UTC", () => {
    expect(utcStamp(new Date("2026-06-20T19:00:00-04:00"))).toBe("20260620T230000Z");
  });
});

describe("compactDate", () => {
  it("strips hyphens from a YYYY-MM-DD date", () => {
    expect(compactDate("2026-07-15")).toBe("20260715");
  });
});

describe("sequenceFor", () => {
  it("is stable for the same material", () => {
    expect(sequenceFor("a|b|c")).toBe(sequenceFor("a|b|c"));
  });

  it("changes when material changes", () => {
    expect(sequenceFor("a|b|c")).not.toBe(sequenceFor("a|b|d"));
  });

  it("stays within a positive 32-bit range", () => {
    const n = sequenceFor("anything");
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeLessThanOrEqual(2 ** 31 - 1);
  });
});

describe("wrapCalendar", () => {
  it("wraps VEVENTs with the given PRODID and METHOD:PUBLISH, CRLF-terminated", () => {
    const out = wrapCalendar(["BEGIN:VEVENT\r\nEND:VEVENT"], "-//x//y//EN");
    expect(out.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(out).toContain("PRODID:-//x//y//EN");
    expect(out).toContain("METHOD:PUBLISH");
    expect(out.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(out.endsWith("\r\n")).toBe(true);
  });
});
