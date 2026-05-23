import { beforeEach, describe, expect, test, vi } from "vitest";

// Stripe webhook idempotency contract test.
//
// The real protection lives at the DB layer — `donations.stripe_event_id`
// has a UNIQUE index in supabase/migrations/0001_init.sql — so duplicate
// webhook deliveries (which Stripe makes routinely) cannot create two
// rows. The handler returns a 200 in both cases so Stripe stops retrying.
//
// This test exercises the handler's behavior given that DB shape: an
// insert that returns a `duplicate key` error must be treated as a
// success path, not a 500. Without that branch, a perfectly normal
// duplicate event would create a noisy 500 in Vercel logs.

const buildRequest = (rawBody: string, sig = "test_sig") =>
  new Request("https://m4a.test/api/stripe/webhook", {
    method: "POST",
    body: rawBody,
    headers: { "stripe-signature": sig },
  });

// In-memory recorder for what the handler attempted to do.
const inserts: Array<Record<string, unknown>> = [];
let nextInsertReturnsDuplicate = false;

function makeAdminClient() {
  return {
    from(_table: string) {
      return {
        upsert(_row: Record<string, unknown>, _opts: { onConflict: string }) {
          return {
            select() {
              return {
                single: async () => ({ data: { id: "donor_test" }, error: null }),
              };
            },
          };
        },
        insert(row: Record<string, unknown>) {
          inserts.push(row);
          if (nextInsertReturnsDuplicate) {
            return Promise.resolve({
              error: {
                message: "duplicate key value violates unique constraint",
              },
            });
          }
          return Promise.resolve({ error: null });
        },
      };
    },
  };
}

function makeStripe(eventId: string) {
  return {
    webhooks: {
      constructEvent: () => ({
        id: eventId,
        type: "checkout.session.completed" as const,
        created: 1_700_000_000,
        data: {
          object: {
            id: "cs_test_abc",
            amount_total: 5000,
            currency: "usd",
            mode: "payment",
            customer_email: "donor@example.com",
            customer_details: { email: "donor@example.com", name: "Donor" },
          },
        },
      }),
    },
  };
}

vi.mock("@/lib/stripe/server", () => ({
  getStripe: () => makeStripe(currentEventId),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => makeAdminClient(),
}));

vi.mock("@/lib/env/server", () => ({
  serverEnv: {
    STRIPE_WEBHOOK_SECRET: "whsec_test",
    RESEND_API_KEY: undefined,
    RESEND_FROM_EMAIL: "hello@motive4artists.org",
  },
}));

vi.mock("@/lib/email/send-receipt", () => ({
  sendDonationReceipt: vi.fn().mockResolvedValue(undefined),
}));

// `headers()` from next/headers requires a Next.js request context; the
// route handler resolves the stripe-signature through it rather than off
// req.headers, so we stub it here to surface the test signature.
vi.mock("next/headers", () => ({
  headers: async () => ({ get: (_name: string) => "test_sig" }),
}));

let currentEventId = "evt_first";

describe("Stripe webhook idempotency", () => {
  beforeEach(() => {
    inserts.length = 0;
    nextInsertReturnsDuplicate = false;
  });

  test("a first-time event inserts one donation and returns 200", async () => {
    const { POST } = await import("./route");
    currentEventId = "evt_one";
    const res = await POST(buildRequest("{}") as never);
    expect(res.status).toBe(200);
    expect(inserts).toHaveLength(1);
    expect(inserts[0]).toMatchObject({
      stripe_event_id: "evt_one",
      amount_cents: 5000,
      status: "succeeded",
    });
  });

  test("a duplicate event is acknowledged with 200 and does NOT 500", async () => {
    const { POST } = await import("./route");
    currentEventId = "evt_dupe";
    nextInsertReturnsDuplicate = true;
    const res = await POST(buildRequest("{}") as never);
    expect(res.status).toBe(200);
    expect(inserts).toHaveLength(1);
  });
});
