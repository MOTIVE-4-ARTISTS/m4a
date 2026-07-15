// Effective absolute origin for metadata, sitemap, robots, and JSON-LD.
//
// Priority:
//  1. NEXT_PUBLIC_SITE_URL — the canonical production/staging origin, set
//     explicitly when we own the domain.
//  2. VERCEL_URL — the per-deployment origin Vercel injects at build and
//     runtime. This lets a Preview emit correct absolute OG/canonical URLs
//     without copying a fresh URL into env settings for every deployment
//     (content-review preview goal: Eran sets only SITE_MODE).
//  3. localhost — local dev fallback.
//
// Read from raw process.env (not publicEnv) on purpose: publicEnv defaults
// NEXT_PUBLIC_SITE_URL to localhost, which would mask the VERCEL_URL fallback.
// VERCEL_URL is host-only (no scheme) and always served over https.
export function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit && explicit.length > 0) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL;
  if (vercel && vercel.length > 0) return `https://${vercel}`;

  return "http://localhost:3000";
}
