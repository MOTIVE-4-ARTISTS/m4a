import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Edge middleware composes three concerns in one place:
//   1. Refresh Supabase session cookie so long-lived admin tabs don't hit
//      expired tokens on the next click.
//   2. Apply a Content Security Policy (see buildCsp for the static-vs-nonce
//      tradeoff and docs/adr/0008-csp-static-tradeoff.md).
//   3. Apply baseline security headers (HSTS in prod, Referrer-Policy,
//      Permissions-Policy, X-Frame-Options, X-Content-Type-Options).
//
// In-memory rate limiting is intentionally NOT here — at the edge runtime
// memory is per-isolate and resets too aggressively. Donations already
// dedupe at the DB (unique stripe_event_id); applications have a honeypot.
// When we need real distributed rate limiting we'll add Upstash Ratelimit
// (KV-backed); an ADR is queued for that.

function buildCsp(): string {
  const isDev = process.env.NODE_ENV !== "production";

  // CSP design + tradeoff (see docs/adr/0008-csp-static-tradeoff.md):
  // We deliberately do NOT use a per-request script nonce. Next.js statically
  // prerenders most pages, so a nonce minted per request in middleware can
  // never match the build-time nonce baked into the cached HTML — the browser
  // then blocks every script and the app never hydrates (forms dead, reveal
  // animations stuck hidden). Keeping static generation (the right call for a
  // content marketing site) means script-src uses 'self' + 'unsafe-inline'.
  // Residual XSS risk is low: we render no untrusted user-supplied HTML and
  // React escapes by default; every other directive stays strict (object-src
  // none, frame-ancestors none, base-uri/form-action self). Dev additionally
  // needs 'unsafe-eval' (React fast-refresh) and 'ws:' (Turbopack HMR),
  // both dropped in prod.
  const stripeOrigins = "https://js.stripe.com https://*.stripe.com";
  const supabaseOrigins = "https://*.supabase.co https://*.supabase.in";

  const scriptSrc = isDev
    ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${stripeOrigins}`
    : `script-src 'self' 'unsafe-inline' ${stripeOrigins}`;

  const connectSrc = isDev
    ? `connect-src 'self' ${supabaseOrigins} ${stripeOrigins} https://api.resend.com https://us.i.posthog.com ws: wss:`
    : `connect-src 'self' ${supabaseOrigins} ${stripeOrigins} https://api.resend.com https://us.i.posthog.com`;

  const directives = [
    `default-src 'self'`,
    scriptSrc,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    connectSrc,
    `frame-src ${stripeOrigins}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ];

  // Only force HTTPS upgrades when the deployment is actually served over
  // HTTPS. Under HTTP (local prod builds, Lighthouse CI on 127.0.0.1) this
  // directive upgrades the navigation to https:// with no TLS server to answer,
  // so the page never paints (Lighthouse NO_FCP). Production sets an https
  // NEXT_PUBLIC_SITE_URL, so the directive still ships where it matters.
  if ((process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https")) {
    directives.push(`upgrade-insecure-requests`);
  }

  return directives.join("; ");
}

export async function middleware(req: NextRequest) {
  const csp = buildCsp();

  const res = NextResponse.next();

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
