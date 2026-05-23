import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Magic-link callback. Supabase sends ?code=... in the URL; we exchange it
// for a session (which sets the auth cookies via the server client) and
// then redirect into /admin.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";

  if (!code) {
    return NextResponse.redirect(new URL("/admin/login?reason=bad_link", req.url));
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/admin/login?reason=not_configured", req.url));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/admin/login?reason=bad_link", req.url));
  }

  return NextResponse.redirect(new URL(next, req.url));
}
