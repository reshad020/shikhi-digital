"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Turns the Sunday email on or off for the signed-in parent.
 *
 * Runs with the caller's session, so the boundary is the policy in
 * `20260911110000_weekly_email.sql` rather than anything written here — and
 * that policy is backed by a column-level grant, because row level security
 * alone would have let a parent update `role` on their own row and promote
 * themselves to admin.
 *
 * No child id and no profile id is accepted from the form. The row is chosen
 * by `auth.uid()` on the server; a caller cannot even name a different one.
 */
export async function setWeeklyEmail(formData: FormData) {
  const enabled = String(formData.get("enabled")) === "true";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("profiles").update({ weekly_email: enabled }).eq("id", user.id);

  revalidatePath("/[locale]/report/[childId]", "page");
}
