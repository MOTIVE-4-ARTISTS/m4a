// Server-side secrets. Importing this module from a Client Component is a
// build-time error thanks to `server-only`.
//
// Each field starts as `.optional()` because the scaffold ships before any
// third-party account is provisioned. Tighten the schema (drop `.optional()`)
// for a field the moment its feature lands — see Phase 4 for Stripe, Phase 5
// for Turnstile, etc.

import "server-only";
import { z } from "zod";

const schema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().default("hello@motive4artists.org"),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
  SENTRY_ORG: z.string().min(1).optional(),
  SENTRY_PROJECT: z.string().min(1).optional(),

  // /opportunities. All three start optional so the scaffold keeps building
  // before the ingest pipeline and the AI integration are provisioned. The
  // call sites surface a typed `dependency_unavailable` Result error when the
  // key they need is missing, instead of crashing the request.
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(1).optional(),
  OPPORTUNITIES_INBOX_WEBHOOK_SECRET: z.string().min(1).optional(),
});

export const serverEnv = schema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
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
