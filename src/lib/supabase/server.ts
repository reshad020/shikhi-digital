import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Server client bound to the caller's session.
 *
 * Everything the app does on behalf of a user goes through this, which means
 * the row level security policies in supabase/migrations are the actual access
 * control — not a backstop behind hand-written ownership checks.
 */
export async function createClient() {
  const store = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // The proxy refreshes the session, so this is safe to swallow.
          }
        },
      },
    },
  );
}

/**
 * The signed-in user, or null. Uses getUser() rather than getSession() because
 * getUser() revalidates the token with Supabase — a session cookie alone is not
 * proof of anything.
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** The signed-in user's profile row, or null. */
export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  return data;
}
