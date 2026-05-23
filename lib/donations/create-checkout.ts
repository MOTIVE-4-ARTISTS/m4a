"use server";

import "server-only";
import { z } from "zod";
import { publicEnv } from "@/lib/env/public";
import { getStripe } from "@/lib/stripe/server";

// Server Action that creates a Stripe Embedded Checkout session and returns
// the `client_secret` to the browser. The client component renders Stripe's
// embedded UI using the secret.
//
// Mode contract:
//   - "one_time" creates a single PaymentIntent
//   - "monthly"  creates a Subscription with $X recurring monthly
//
// Until 501(c)(3) determination lands, the *primary* donate path on the
// site links out to The Field's fiscal-sponsor page; this Server Action is
// staged in test mode and the embedded UI surfaces a "test mode" notice
// (see <DonationCheckout /> client component). The day the determination
// letter arrives:
//   1. Apply for Stripe nonprofit rate (2.2% + $0.30)
//   2. Flip ORG.irsStatus -> "approved" in lib/org.ts
//   3. Remove the fiscal-sponsor primary CTA from /donate
//   4. This action becomes the primary path

const schema = z.object({
  mode: z.enum(["one_time", "monthly"]).default("one_time"),
  amountCents: z.number().int().min(500).max(5_000_000),
  email: z.string().email(),
  coverFee: z.boolean().default(false),
});

export type CreateCheckoutResult =
  | { ok: true; clientSecret: string }
  | { ok: false; message: string };

export async function createCheckout(input: z.infer<typeof schema>): Promise<CreateCheckoutResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid amount or email." };
  }
  const { mode, email, coverFee } = parsed.data;
  let { amountCents } = parsed.data;

  // Stripe's nonprofit rate is 2.2% + $0.30. If the donor opts to cover
  // the processing fee, gross up the charge so the org receives the
  // intended net (full original amount).
  if (coverFee) {
    amountCents = Math.round((amountCents + 30) / (1 - 0.022));
  }

  const stripe = getStripe();
  if (!stripe) {
    return {
      ok: false,
      message:
        "Donations are not yet configured — please use the fiscal-sponsor link on this page.",
    };
  }

  const baseUrl = publicEnv.NEXT_PUBLIC_SITE_URL;

  if (mode === "one_time") {
    // ui_mode "embedded" is supported by the Stripe API and current SDK
    // but the TS types haven't caught up in 22.1.1 (still typed as
    // "hosted" only). Cast at the boundary; runtime is fine.
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded" as never,
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation to MOtiVE 4 Artists Inc.",
              description:
                "Tax-deductible to the extent allowed by law. EIN and 501(c)(3) status displayed in the receipt.",
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      return_url: `${baseUrl}/donate/thanks?session_id={CHECKOUT_SESSION_ID}`,
      automatic_tax: { enabled: false },
    });
    if (!session.client_secret) {
      return { ok: false, message: "Could not create checkout session." };
    }
    return { ok: true, clientSecret: session.client_secret };
  }

  // Monthly subscription. We create a price ad-hoc so donors can pick any
  // amount; for fixed amounts you'd reference a saved Price id instead.
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    ui_mode: "embedded" as never,
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          recurring: { interval: "month" },
          product_data: {
            name: "Monthly donation to MOtiVE 4 Artists Inc.",
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    return_url: `${baseUrl}/donate/thanks?session_id={CHECKOUT_SESSION_ID}`,
  });
  if (!session.client_secret) {
    return { ok: false, message: "Could not create checkout session." };
  }
  return { ok: true, clientSecret: session.client_secret };
}
