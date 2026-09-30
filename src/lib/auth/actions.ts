"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; notice?: string };

const MIN_PASSWORD = 8;

/**
 * Only ever redirect to a path on this site — never to a URL a caller supplied.
 *
 * With nowhere specific to return to, an adult who has just typed a password
 * lands on the parent hub rather than in the child's lesson library. Children
 * have no logins here, so authenticating is by definition a grown-up action.
 */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/parent";
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "errInvalid" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // Deliberately one message for every failure. Distinguishing "no such account"
  // from "wrong password" tells a stranger which family emails are registered.
  if (error) return { error: "errInvalid" };

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const consented = formData.get("consent") === "on";

  if (!consented) return { error: "errConsent" };
  if (password.length < MIN_PASSWORD) return { error: "errWeak" };
  if (!email) return { error: "errInvalid" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    if (/already|registered|exists/i.test(error.message)) return { error: "errEmailInUse" };
    if (/password/i.test(error.message)) return { error: "errWeak" };
    return { error: "errGeneric" };
  }

  // With email confirmation switched on, signUp returns a user but no session.
  if (!data.session) return { notice: "checkEmail" };

  revalidatePath("/", "layout");
  redirect("/children");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/signin");
}
