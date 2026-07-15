// Server-side secrets. Importing this module from a Client Component is a
// build-time error thanks to `server-only`.
//
// Each field starts as `.optional()` because the scaffold ships before any
// third-party account is provisioned. Tighten the schema (drop `.optional()`)
// for a field the moment its feature lands — see Phase 4 for Stripe, Phase 5
// for Turnstile, etc.

import "server-only";
import { z } from "zod";

// Empty strings in .env files are a common gotcha — dotenv reads `KEY=` as
// `process.env.KEY === ""`, but our `.optional()` fields want either a real
// value or `undefined`. This preprocessor maps `""` → `undefined` so a
// blank line in `.env.local` behaves like a missing key. Apply to every
// optional string field below.
const optionalString = (inner: z.ZodString = z.string().min(1)) =>
  z.preprocess((v) => (v === "" ? undefined : v), inner.optional());

const schema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: optionalString(),
  STRIPE_SECRET_KEY: optionalString(),
  STRIPE_WEBHOOK_SECRET: optionalString(),
  RESEND_API_KEY: optionalString(),
  RESEND_FROM_EMAIL: z.string().email().default("hello@motive4artists.org"),
  // The EIN is public record, but server-only placement enforces the decision
  // that it appears in receipts rather than site chrome or client bundles.
  ORG_EIN: optionalString(),
  TURNSTILE_SECRET_KEY: optionalString(),
  SENTRY_DSN: optionalString(z.string().url()),
  SENTRY_AUTH_TOKEN: optionalString(),
  SENTRY_ORG: optionalString(),
  SENTRY_PROJECT: optionalString(),

  // /opportunities. All three start optional so the scaffold keeps building
  // before the ingest pipeline and the AI integration are provisioned. The
  // call sites surface a typed `dependency_unavailable` Result error when the
  // key they need is missing, instead of crashing the request.
  GOOGLE_GENERATIVE_AI_API_KEY: optionalString(),
  CRON_SECRET: optionalString(),
  OPPORTUNITIES_INBOX_WEBHOOK_SECRET: optionalString(),
});

export const serverEnv = schema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  ORG_EIN: process.env.ORG_EIN,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  SENTRY_DSN: process.env.SENTRY_DSN,
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
  OPPORTUNITIES_INBOX_WEBHOOK_SECRET: process.env.OPPORTUNITIES_INBOX_WEBHOOK_SECRET,
});

export type ServerEnv = z.infer<typeof schema>;
