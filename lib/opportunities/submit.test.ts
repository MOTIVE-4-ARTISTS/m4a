import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => null),
}));

vi.mock("@/lib/env/server", () => ({
  serverEnv: { TURNSTILE_SECRET_KEY: undefined },
}));

import { submitOpportunity } from "./submit";

function form(fields: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (Array.isArray(v)) {
      for (const item of v) fd.append(k, item);
    } else {
      fd.set(k, v);
    }
  }
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("submitOpportunity", () => {
  it("rejects missing required fields", async () => {
    const r = await submitOpportunity(null, form({}));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("invalid_input");
  });

  it("rejects a non-http source_url", async () => {
    const r = await submitOpportunity(
      null,
      form({
        name: "Test",
        funder_name: "Some Funder",
        type: "grant",
        source_url: "ftp://example.com/whatever",
        description_short: "this description is at least twenty characters long.",
      }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("invalid_input");
  });

  it("rejects a description shorter than 20 chars (under the per-card character budget)", async () => {
    const r = await submitOpportunity(
      null,
      form({
        name: "Test",
        funder_name: "Some Funder",
        type: "grant",
        source_url: "https://example.com/",
        description_short: "too short",
      }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("invalid_input");
  });

  it("returns success-shaped honeypot output when hp_field is filled — never blocks bots overtly", async () => {
    const r = await submitOpportunity(
      null,
      form({
        name: "Test",
        funder_name: "Some Funder",
        type: "grant",
        source_url: "https://example.com/",
        description_short: "this description is at least twenty characters long.",
        hp_field: "some-bot-filled-this",
      }),
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.submission_id).toBe("honeypot");
  });

  it("returns dependency_unavailable when Supabase is not configured", async () => {
    const r = await submitOpportunity(
      null,
      form({
        name: "Test",
        funder_name: "Some Funder",
        type: "grant",
        source_url: "https://example.com/",
        description_short: "this description is at least twenty characters long.",
      }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("dependency_unavailable");
  });
});
