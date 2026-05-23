import { describe, expect, it } from "vitest";
import { subscribe } from "./subscribe";

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("subscribe", () => {
  it("rejects a missing email with a typed invalid_input error", async () => {
    const r = await subscribe(null, form({}));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      // We only assert on `code` here: the human-readable `message` comes
      // from Zod's first issue and varies by failure mode (missing vs.
      // malformed). Asserting on specific copy would pin us to Zod's
      // wording and break on minor library bumps.
      expect(r.error.code).toBe("invalid_input");
    }
  });

  it("rejects a malformed email", async () => {
    const r = await subscribe(null, form({ email: "not-an-email" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("invalid_input");
  });

  it("accepts a valid email and returns a queued message in pre-Resend mode", async () => {
    const r = await subscribe(null, form({ email: "donor@example.com" }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.message.length).toBeGreaterThan(0);
    }
  });

  it("ignores an oversized source tag rather than passing it through unchecked", async () => {
    const r = await subscribe(null, form({ email: "donor@example.com", source: "x".repeat(200) }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("invalid_input");
  });
});
