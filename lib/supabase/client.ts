"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env/public";
import type { Database } from "./types";

// Browser Supabase client. Use sparingly — most data goes through Server
// Components or Server Actions. The browser client is reserved for
// realtime subscriptions (none yet) and auth flows that need to run on
// the client (the magic-link callback returns through here).
export function createClient() {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createBrowserClient<Database>(url, anonKey);
}
