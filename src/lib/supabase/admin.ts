import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Service-role client. Bypasses row level security entirely.
 *
 * Use only where there is genuinely no user session to act on behalf of —
 * seeding, scheduled jobs, and the flagged-attempt review queue. Never import
 * this into anything reachable from a request handled on a user's behalf.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. This key bypasses RLS — server only, never NEXT_PUBLIC_.",
    );
  }

  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
