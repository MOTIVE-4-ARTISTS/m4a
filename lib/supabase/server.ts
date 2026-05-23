import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env/public";
import type { Database } from "./types";

// Server-side Supabase client (use in Server Components, Server Actions,
// and Route Handlers). Cookie passthrough means RLS sessions follow the
// caller's auth state.
//
// We deliberately return null when Supabase env is unconfigured (e.g.
// during the first deploy before Supabase is provisioned). Every caller
// must handle the null case — typically by surfacing "this feature is
// not yet available" rather than crashing the request.
export async function createClient() {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In Server Components we can't actually set cookies. Failing
        // silently here matches the @supabase/ssr docs: route handlers
        // and Server Actions ARE able to write, and that's where the
        // session-refresh paths run from.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // ignored
        }
      },
    },
  });
}
