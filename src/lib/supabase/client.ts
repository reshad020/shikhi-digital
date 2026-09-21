"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/** Browser-side client. Reads the session from cookies written by the server. */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
