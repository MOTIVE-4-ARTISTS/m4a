// Public, build-time-inlined env vars. Safe to import from any component
// (server or client) because Next.js statically replaces NEXT_PUBLIC_* at
// build time.
//
// Server-only secrets live in ./server.ts and are guarded with `server-only`.

import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  // Deployment surface gate. "review" hides every not-yet-launched,
  // service-dependent route (donations, applications, opportunities,
  // events, admin, CMS) so a Vercel Preview can be shared for content and
  // design review without provisioning any backend. See lib/site-mode.ts.
  // Enum on purpose: a typo (e.g. "reveiw") must fail the build loudly
  // rather than silently serve the full, half-wired site.
  NEXT_PUBLIC_SITE_MODE: z.enum(["full", "review"]).default("full"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  NEXT_PUBLIC_EIN: z.string().min(1).optional(),
});

export const publicEnv = schema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SITE_MODE: process.env.NEXT_PUBLIC_SITE_MODE,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  NEXT_PUBLIC_EIN: process.env.NEXT_PUBLIC_EIN,
});

export type PublicEnv = z.infer<typeof schema>;
