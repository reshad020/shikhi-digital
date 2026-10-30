"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Signing out is all that is left here.
 *
 * The email-and-password `signIn` and `signUp` actions were deleted along with
 * the form that called them. They were not left behind unused: a server action
 * is a reachable POST endpoint whether or not anything renders a button for it,
 * and an account-creating endpoint that no longer has a working confirmation
 * email behind it is worth removing rather than merely hiding.
 *
 * Signing IN now happens entirely in the browser via `signInWithOAuth` — see
 * (auth)/google-button.tsx — and the session is established by the Supabase
 * redirect to /auth/callback.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/signin");
}
