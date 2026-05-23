import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

// Hoist the LLM + upsert mocks so the dynamic imports below see them.
const { mockExtract, mockUpsert } = vi.hoisted(() => ({
  mockExtract: vi.fn<(b: string, l: string) => Promise<unknown[]>>(),
  mockUpsert: vi.fn<() => Promise<unknown>>(),
}));

vi.mock("@/lib/ai/extract-opportunities-batch", () => ({
  extractOpportunitiesBatch: mockExtract,
  ExtractOpportunitiesBatchError: class extends Error {
    readonly kind: "no_provider" | "model_failure" = "model_failure";
  },
}));

vi.mock("@/lib/ingest/upsert", () => ({
  upsertFromExtraction: mockUpsert,
}));

vi.mock("@/lib/env/server", () => ({
  serverEnv: { OPPORTUNITIES_INBOX_WEBHOOK_SECRET: "test-secret" },
}));

function signed(body: string, secret = "test-secret"): string {
  return createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

async function postWithSignature(body: string, signature: string) {
  // NextRequest is a wrapper around Request; the route only reads
  // text() + headers, so a plain Request satisfies the test fully and
  // avoids pulling in Next's full server context.
  const req = new Request("http://localhost/api/inbound/email", {
    method: "POST",
    headers: { "webhook-signature": signature, "content-type": "application/json" },
    body,
  });
  // Lazy-import the route AFTER mocks are set up.
  const { POST } = await import("./route");
  return POST(req as unknown as Parameters<typeof POST>[0]);
}

describe("/api/inbound/email", () => {
  it("rejects unsigned requests with 401", async () => {
    const body = JSON.stringify({ from: "person@nyfa.org", html: "<p>hi</p>" });
    const res = await postWithSignature(body, "");
    expect(res.status).toBe(401);
  });

  it("rejects bad signatures with 401", async () => {
    const body = JSON.stringify({ from: "person@nyfa.org", html: "<p>hi</p>" });
    const res = await postWithSignature(body, "deadbeef".repeat(8));
    expect(res.status).toBe(401);
  });

  it("accepts a valid signature with the sha256= prefix", async () => {
    mockExtract.mockResolvedValueOnce([]);
    const body = JSON.stringify({
      from: "newsletter@nyfa.org",
      subject: "test",
      text: "hello hello hello hello hello hello hello hello",
    });
    const res = await postWithSignature(body, `sha256=${signed(body)}`);
    // 200 OK with extracted=0
    expect(res.status).toBe(200);
  });

  it("routes nyfa.org senders to the nyfa_classifieds source tag", async () => {
    mockExtract.mockResolvedValueOnce([]);
    const body = JSON.stringify({
      from: "newsletter@nyfa.org",
      subject: "test",
      text: "long enough body to bypass the 50-char ignore gate hello hello hello",
    });
    const res = await postWithSignature(body, signed(body));
    const json = (await res.json()) as { source?: string };
    expect(json.source).toBe("nyfa_classifieds");
  });

  it("ignores emails whose body is under the 50-char floor", async () => {
    const body = JSON.stringify({ from: "newsletter@nyfa.org", text: "hi" });
    const res = await postWithSignature(body, signed(body));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { message?: string };
    expect(json.message).toMatch(/too short/);
  });
});
