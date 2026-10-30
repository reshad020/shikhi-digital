"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Sets how many practice sets a day one child is aiming for.
 *
 * Runs with the caller's session, so the boundary is the existing
 * "parents write their own children" policy rather than anything written here:
 * passing somebody else's child id updates nothing, because row level security
 * will not match the row. The id has to be accepted from the caller — a parent
 * may have several children — which is exactly why the check belongs in the
 * database and not in this function.
 *
 * The range is clamped here as well as in the column, so a value out of bounds
 * becomes a sensible number rather than an error page in front of a parent.
 */
export async function setDailyGoal(formData: FormData) {
  const childId = String(formData.get("childId") ?? "");
  if (!childId) return;

  const raw = Number(formData.get("goal"));
  const goal = Number.isFinite(raw) ? Math.min(Math.max(Math.round(raw), 1), 10) : 2;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("children").update({ daily_goal: goal }).eq("id", childId);

  revalidatePath("/[locale]/parent", "page");
  revalidatePath("/[locale]/yle/progress", "page");
}
