import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Edge middleware: refresh the Supabase session cookie on every request so
// admin routes don't see expired tokens after long sessions, and pass
// auth state forward to Server Components via the cookie store.
//
// Phase 6 will add CSP + rate-limit here too; both compose cleanly because
// middleware runs on every request before the route handler.
export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return res;

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

  // Refresh + read the current user; result is intentionally unused —
  // the side effect is the refreshed cookie on res.
  await supabase.auth.getUser();

  return res;
}

// Match every path except static assets and Next internals. Even though
// we only auth-check on /admin, we want session refresh everywhere so a
// browser tab left open overnight still has a live token when the user
// clicks an admin link.
export const config = {
  matcher: [
    // Skip Next internals + static files (matches Next docs idiom).
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|opengraph-image.png|brand/|content/|sitemap.xml|robots.txt|api/keystatic).*)",
  ],
};
