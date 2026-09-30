"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Turns the Sunday email on or off for the signed-in parent.
 *
 * Runs with the caller's session, so the boundary is the existing
 * "update own profile" policy rather than anything written here — and that
 * policy already pins `role` in its `with check`, so this cannot become a
 * route to promoting yourself.
 *
 * No profile id is accepted from the caller. The row is chosen by
 * `auth.uid()` on the server; a caller cannot name a different one.
 */
export async function setWeeklyEmail(enabled: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("profiles").update({ weekly_email: enabled }).eq("id", user.id);

  // The switch appears on the hub and on every report, so both must refresh.
  revalidatePath("/[locale]/parent", "page");
  revalidatePath("/[locale]/report/[childId]", "page");
}
