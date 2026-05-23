import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Edge middleware composes three concerns in one place:
//   1. Refresh Supabase session cookie so long-lived admin tabs don't hit
//      expired tokens on the next click.
//   2. Apply a strict, nonce-based Content Security Policy so any XSS
//      attempt has no `unsafe-inline` budget to abuse.
//   3. Apply baseline security headers (HSTS in prod, Referrer-Policy,
//      Permissions-Policy, X-Frame-Options, X-Content-Type-Options).
//
// In-memory rate limiting is intentionally NOT here — at the edge runtime
// memory is per-isolate and resets too aggressively. Donations already
// dedupe at the DB (unique stripe_event_id); applications have a honeypot.
// When we need real distributed rate limiting we'll add Upstash Ratelimit
// (KV-backed); an ADR is queued for that.

function generateNonce(): string {
  // crypto.randomUUID is available in the edge runtime.
  return crypto.randomUUID().replaceAll("-", "").slice(0, 24);
}

function buildCsp(nonce: string): string {
  // 'strict-dynamic' lets nonced scripts load further scripts without
  // enumerating every Stripe / PostHog domain. Modern browsers honor it;
  // older browsers fall back to the explicit allow-list below.
  const stripeOrigins = "https://js.stripe.com https://*.stripe.com";
  const supabaseOrigins = "https://*.supabase.co https://*.supabase.in";
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${stripeOrigins}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `connect-src 'self' ${supabaseOrigins} ${stripeOrigins} https://api.resend.com https://us.i.posthog.com`,
    `frame-src ${stripeOrigins}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

export async function middleware(req: NextRequest) {
  const nonce = generateNonce();
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return res;

  // Refresh the Supabase session cookie. Side effect only — the user
  // value is intentionally unused here.
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          req.cookies.set(name, value);
        }
        for (const { name, value, options } of cookiesToSet) {
          res.cookies.set(name, value, options);
        }
      },
    },
  });
  await supabase.auth.getUser();

  return res;
}

// Match every path except static assets and Next internals. Even though
// we only auth-check on /admin, we want session refresh + CSP on every
// page so an admin tab left open overnight still has a live token.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|opengraph-image.png|brand/|content/|sitemap.xml|robots.txt|api/keystatic).*)",
  ],
};
