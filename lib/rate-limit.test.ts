import { beforeEach, describe, expect, it, vi } from "vitest";

import { _resetForTests, take } from "./rate-limit";

beforeEach(() => {
  _resetForTests();
  vi.useRealTimers();
});

describe("take", () => {
  it("allows N consecutive calls within a window", () => {
    for (let i = 0; i < 5; i += 1) {
      const r = take({ key: "ip:1.2.3.4", maxPerWindow: 5, windowMs: 60_000 });
      expect(r.ok).toBe(true);
    }
  });

  it("rejects the N+1th call within a window", () => {
    for (let i = 0; i < 3; i += 1) {
      take({ key: "ip:1.2.3.4", maxPerWindow: 3, windowMs: 60_000 });
    }
    const r = take({ key: "ip:1.2.3.4", maxPerWindow: 3, windowMs: 60_000 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.retryAfterMs).toBeGreaterThan(0);
  });

  it("recovers when the window expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-22T12:00:00Z"));

    take({ key: "ip:5.5.5.5", maxPerWindow: 1, windowMs: 60_000 });
    expect(take({ key: "ip:5.5.5.5", maxPerWindow: 1, windowMs: 60_000 }).ok).toBe(false);

    vi.setSystemTime(new Date("2026-05-22T12:01:01Z"));
    expect(take({ key: "ip:5.5.5.5", maxPerWindow: 1, windowMs: 60_000 }).ok).toBe(true);
  });

  it("keeps buckets independent per key", () => {
    take({ key: "ip:a", maxPerWindow: 1, windowMs: 60_000 });
    const second = take({ key: "ip:b", maxPerWindow: 1, windowMs: 60_000 });
    expect(second.ok).toBe(true);
  });
});
