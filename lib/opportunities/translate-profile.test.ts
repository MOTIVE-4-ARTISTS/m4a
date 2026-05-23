import { beforeEach, describe, expect, it, vi } from "vitest";

// Hoisted mock state — Vitest hoists `vi.mock` calls above imports, so any
// `let` we want to control from inside the factory must also be hoisted.
const { mockTranslate, TranslateProfileError } = vi.hoisted(() => {
  class TPE extends Error {
    readonly kind: "no_provider" | "model_failure";
    constructor(kind: "no_provider" | "model_failure", message: string) {
      super(message);
      this.kind = kind;
      this.name = "TranslateProfileError";
    }
  }
  return {
    mockTranslate: vi.fn<(d: string) => Promise<unknown>>(),
    TranslateProfileError: TPE,
  };
});

vi.mock("@/lib/ai/translate-profile", () => ({
  translateProfileToFilters: mockTranslate,
  TranslateProfileError,
}));

vi.mock("next/headers", () => ({
  // Each test can set its own IP to exercise the rate limiter; default is
  // unique per call so cross-test isolation is automatic.
  headers: vi.fn(async () => ({
    get: (name: string) => (name === "x-forwarded-for" ? `1.2.3.${Date.now() % 250}` : null),
  })),
}));

import { _resetForTests } from "@/lib/rate-limit";
import { translateProfile } from "./translate-profile";

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  _resetForTests();
  mockTranslate.mockReset();
});

describe("translateProfile", () => {
  it("rejects a missing description as invalid_input", async () => {
    const r = await translateProfile(null, form({}));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("invalid_input");
  });

  it("rejects a too-short description", async () => {
    const r = await translateProfile(null, form({ description: "dance" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("invalid_input");
  });

  it("rejects a description longer than ARTIST_DESCRIPTION_MAX", async () => {
    const r = await translateProfile(null, form({ description: "x".repeat(600) }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("invalid_input");
  });

  it("returns ok with the LLM's preset and a deterministic description hash on the happy path", async () => {
    mockTranslate.mockResolvedValueOnce({
      types: ["grant"],
      deadline_window_days: 30,
      include_rolling: null,
      eligibility: ["individual"],
      locations: ["nyc"],
      disciplines: ["dance"],
      career_stages: ["emerging"],
      equity_tags: null,
      free_only: true,
    });

    const desc = "brooklyn choreographer, no fiscal sponsor, looking for stipended grants";
    const r = await translateProfile(null, form({ description: desc }));

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.filters.types).toEqual(["grant"]);
      // 16-char sha256 prefix. We pin the length, not the value — the
      // exact hash is tested incidentally by changing the input below.
      expect(r.value.description_hash).toMatch(/^[0-9a-f]{16}$/);

      const repeat = await translateProfile(null, form({ description: desc }));
      if (repeat.ok) {
        expect(repeat.value.description_hash).toBe(r.value.description_hash);
      }
    }
  });

  it("returns dependency_unavailable when the AI provider isn't configured", async () => {
    mockTranslate.mockRejectedValueOnce(
      new TranslateProfileError("no_provider", "Gemini key missing"),
    );
    const r = await translateProfile(
      null,
      form({ description: "brooklyn choreographer looking for grants" }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("dependency_unavailable");
  });

  it("returns server_error when the model itself blows up", async () => {
    mockTranslate.mockRejectedValueOnce(new TranslateProfileError("model_failure", "timed out"));
    const r = await translateProfile(
      null,
      form({ description: "brooklyn choreographer looking for grants" }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("server_error");
  });

  it("rate-limits the same IP after 5 calls in a minute", async () => {
    const { headers } = await import("next/headers");
    vi.mocked(headers).mockImplementation(
      async () =>
        ({ get: (name: string) => (name === "x-forwarded-for" ? "9.9.9.9" : null) }) as Awaited<
          ReturnType<typeof headers>
        >,
    );

    mockTranslate.mockResolvedValue({
      types: null,
      deadline_window_days: null,
      include_rolling: null,
      eligibility: null,
      locations: null,
      disciplines: null,
      career_stages: null,
      equity_tags: null,
      free_only: null,
    });

    for (let i = 0; i < 5; i += 1) {
      const ok = await translateProfile(
        null,
        form({ description: "brooklyn choreographer looking for grants" }),
      );
      expect(ok.ok).toBe(true);
    }

    const sixth = await translateProfile(
      null,
      form({ description: "brooklyn choreographer looking for grants" }),
    );
    expect(sixth.ok).toBe(false);
    if (!sixth.ok) expect(sixth.error.code).toBe("rate_limited");
  });
});
