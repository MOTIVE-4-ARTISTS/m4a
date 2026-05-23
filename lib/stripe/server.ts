import "server-only";
import Stripe from "stripe";
import { serverEnv } from "@/lib/env/server";

// Lazy Stripe client. We don't instantiate at module load so the bundle
// builds in environments without Stripe credentials (preview deploys,
// initial scaffold, contributor checkouts).
//
// Caller pattern:
//   const stripe = getStripe();
//   if (!stripe) return { ok: false, message: "Donations not configured" };
let cached: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (cached !== undefined) return cached;
  if (!serverEnv.STRIPE_SECRET_KEY) {
    cached = null;
    return cached;
  }
  cached = new Stripe(serverEnv.STRIPE_SECRET_KEY, {
    // Stripe rotates the API version frequently; pin so we don't get
    // surprise breaking changes on a dependency bump. Update intentionally
    // by reviewing the changelog and running the regression suite.
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
    appInfo: {
      name: "motive4artists.org",
      version: "0.1.0",
      url: "https://motive4artists.org",
    },
  });
  return cached;
}
