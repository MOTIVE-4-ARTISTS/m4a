import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sendDonationReceipt } from "@/lib/email/send-receipt";
import { serverEnv } from "@/lib/env/server";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe webhook handler. Signature-verified, idempotent at the DB layer.
//
// Why an API route (not a Server Action): inbound webhooks arrive without
// our auth context and need raw-body access for signature verification.
//
// Idempotency: we de-dupe on `stripe_event_id` via a unique index on
// the `donations` table (see supabase/migrations/0001_init.sql). Stripe
// may deliver the same event multiple times; we accept and ignore dupes.
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = serverEnv.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    // Pre-config: tell Stripe to retry less aggressively while we're
    // setting up. 503 = "service unavailable, try again."
    return NextResponse.json({ ok: false, message: "Webhook not configured" }, { status: 503 });
  }

  const sig = (await headers()).get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ ok: false, message: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: `Bad signature: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  // The events we actually care about. Everything else we acknowledge
  // (200 OK) but ignore — keeps Stripe's retry queue clean.
  if (event.type !== "checkout.session.completed" && event.type !== "invoice.payment_succeeded") {
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    // Stripe will retry on 503; we don't want to lose donation events
    // because Supabase isn't connected yet.
    return NextResponse.json({ ok: false, message: "Database not configured" }, { status: 503 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_details?.email ?? session.customer_email;
    const amountCents = session.amount_total ?? 0;

    if (!email || amountCents <= 0) {
      // Nothing to receipt. Acknowledge so Stripe doesn't retry.
      return NextResponse.json({ ok: true, skipped: "missing email or amount" });
    }

    // Upsert donor by email. Service role bypasses RLS. The cast bypasses
    // hand-written Database typings until we wire `supabase gen types`
    // (Phase 6); the underlying SQL contract is the authoritative shape.
    const donorsTable = (
      supabase as unknown as {
        from: (t: string) => {
          upsert: (
            v: Record<string, unknown>,
            opts: { onConflict: string },
          ) => {
            select: () => { single: () => Promise<{ data: { id: string } | null }> };
          };
        };
      }
    ).from("donors");

    const { data: donor } = await donorsTable
      .upsert({ email, name: session.customer_details?.name ?? null }, { onConflict: "email" })
      .select()
      .single();

    const donationsTable = (
      supabase as unknown as {
        from: (t: string) => {
          insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
        };
      }
    ).from("donations");

    const { error: insertErr } = await donationsTable.insert({
      donor_id: donor?.id ?? null,
      stripe_session_id: session.id,
      stripe_event_id: event.id,
      amount_cents: amountCents,
      currency: session.currency ?? "usd",
      recurring: session.mode === "subscription",
      status: "succeeded",
    });

    // Unique-index violations on stripe_event_id are expected on dupe
    // deliveries; everything else is a real error worth retrying.
    if (insertErr && !insertErr.message.includes("duplicate key")) {
      console.error("[stripe-webhook] donation insert failed", insertErr);
      return NextResponse.json({ ok: false, message: insertErr.message }, { status: 500 });
    }

    // Send IRS-compliant receipt. Failures here are logged but do not
    // fail the webhook — Stripe is the source of truth for the gift.
    void sendDonationReceipt({
      to: email,
      ...(session.customer_details?.name ? { name: session.customer_details.name } : {}),
      amountCents,
      currency: session.currency ?? "usd",
      date: new Date(event.created * 1000),
      recurring: session.mode === "subscription",
      sessionId: session.id,
    }).catch((e) => console.error("[stripe-webhook] receipt send failed", e));

    return NextResponse.json({ ok: true });
  }

  // invoice.payment_succeeded covers subsequent renewals of monthly
  // subscriptions. Identical handling to checkout.session.completed for
  // bookkeeping purposes; the initial subscription event is the same path.
  return NextResponse.json({ ok: true, type: event.type });
}
