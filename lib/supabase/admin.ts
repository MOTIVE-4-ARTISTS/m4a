import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env/public";
import { serverEnv } from "@/lib/env/server";
import type { Database } from "./types";

// Service-role Supabase client. RLS is bypassed. ONLY for:
//   - Stripe webhook handlers writing donations
//   - Resend confirmation handlers writing subscribers
//   - Background admin scripts
//
// Never import this from a Client Component (server-only blocks that).
// Never expose the service-role key in any client-bundled module.
export function createAdminClient() {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = serverEnv.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
