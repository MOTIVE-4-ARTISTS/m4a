// Single source of truth for the "review preview" deployment mode.
//
// Why this exists: we want to publish a shareable Vercel Preview of the
// text/design surface *before* any backend account (Supabase, Stripe,
// Resend, Every.org, Sentry, Turnstile, Gemini) is provisioned. Every route
// that would either 500, silently discard data, or misrepresent a live
// service is hidden behind a real 404 and its entry points are removed from
// the chrome. Flip the whole deployment with one public env var.
//
// Deliberately dependency-free (no zod, no publicEnv import) so it is safe to
// import from the Edge middleware bundle AND directly unit-testable by
// toggling process.env — the value is read at call time, never cached at
// module load. NEXT_PUBLIC_* is inlined at build for statically generated
// pages, which is exactly what we want when Vercel sets the flag for the
// entire deployment; lib/env/public.ts validates the value (enum) so a typo
// fails the build instead of silently serving the full site.

type SiteMode = "full" | "review";

function siteMode(): SiteMode {
  return process.env.NEXT_PUBLIC_SITE_MODE === "review" ? "review" : "full";
}

export function isReviewMode(): boolean {
  return siteMode() === "review";
}

// Route prefixes hidden with a real 404 while in review mode. Each entry
// matches the exact path and any deeper path under it. Ordering is
// irrelevant; the set is matched with a prefix test, not a regex, so it
// stays trivial to reason about and to test.
//
//  - /donate, /apply       — money + application flows (need Stripe/Supabase)
//  - /opportunities        — ingest pipeline + submission/export routes
//  - /events               — the no-database fallback reads as a real event
//  - /lab                  — internal experiments, not review-ready
//  - /admin, /keystatic     — auth + CMS surfaces
//  - /api                  — every route handler, incl. Keystatic + webhooks
export const REVIEW_BLOCKED_PREFIXES = [
  "/donate",
  "/apply",
  "/opportunities",
  "/events",
  "/lab",
  "/admin",
  "/keystatic",
  "/api",
] as const;

export function isBlockedInReview(pathname: string): boolean {
  return REVIEW_BLOCKED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

// Shown on every reviewable page (marketing layout) and asserted by the
// deployed-preview smoke test. Sets expectations so reviewers don't file
// "the donate button is missing" — the missing surfaces are the point.
export const REVIEW_BANNER_TEXT =
  "Internal content and design review. Interactive services are intentionally disabled; visual identity is provisional.";
