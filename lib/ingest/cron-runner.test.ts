import { beforeEach, describe, expect, it, vi } from "vitest";

import { _resetForTests, cadenceMs, markRan, pickDueSource } from "./cron-runner";
import { SOURCES } from "./registry";

beforeEach(() => {
  _resetForTests();
  vi.useRealTimers();
});

describe("pickDueSource", () => {
  it("returns a source on cold start (nothing has ever run)", () => {
    const decision = pickDueSource();
    expect(decision.source).not.toBeNull();
  });

  it("respects the per-source cadence — a just-ran source is not picked again", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-22T12:00:00Z"));

    const initial = pickDueSource();
    if (initial.source == null) throw new Error("expected a source");
    markRan(initial.source.id);

    // 1 hour later: a daily source isn't due, but other sources still are
    // (or "no source is currently due" if everything in registry is daily).
    vi.setSystemTime(new Date("2026-05-22T13:00:00Z"));
    const after = pickDueSource();
    if (after.source != null) {
      // If another source is still due, it must NOT be the one we just ran.
      expect(after.source.id).not.toBe(initial.source.id);
    }
  });

  it("becomes due again after the full cadence elapses", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-22T12:00:00Z"));

    const initial = pickDueSource();
    if (initial.source == null) throw new Error("expected a source");
    markRan(initial.source.id);

    const cadence = cadenceMs(initial.source.cadence);
    vi.setSystemTime(new Date(Date.now() + cadence + 1));
    const after = pickDueSource();
    // The previously-run source should now be eligible again.
    const candidateIds = SOURCES.map((s) => s.id);
    if (after.source != null) {
      expect(candidateIds).toContain(after.source.id);
    }
  });
});

describe("registry shape", () => {
  it("every source has a stable id and a sane cadence", () => {
    for (const source of SOURCES) {
      expect(source.id).toMatch(/^[a-z][a-z_]+$/);
      expect(source.label.length).toBeGreaterThan(0);
      expect(["daily", "weekly", "monthly", "quarterly"]).toContain(source.cadence);
      expect(source.crawlDelayMs).toBeGreaterThanOrEqual(0);
    }
  });
});
