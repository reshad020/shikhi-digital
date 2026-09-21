"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";
import { clearActiveChild, setActiveChild } from "./children";

export type ChildFormState = { error?: string };

export async function createChild(
  _prev: ChildFormState,
  formData: FormData,
): Promise<ChildFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const birthYear = Number(formData.get("birthYear"));
  const avatar = String(formData.get("avatar") ?? "star");
  const locale = String(formData.get("locale") ?? routing.defaultLocale);

  if (name.length < 1 || name.length > 40) return { error: "errName" };
  if (!Number.isInteger(birthYear) || birthYear < 1990 || birthYear > 2030) {
    return { error: "errYear" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // parent_id must be the caller: the insert policy checks it, so a forged
  // value is rejected by the database rather than trusted here.
  const { data, error } = await supabase
    .from("children")
    .insert({
      parent_id: user.id,
      name,
      birth_year: birthYear,
      avatar,
      locale: routing.locales.includes(locale as never) ? locale : routing.defaultLocale,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "errGeneric" };

  await setActiveChild(data.id);
  revalidatePath("/", "layout");
  return {};
}

export async function selectChild(childId: string) {
  await setActiveChild(childId);
  revalidatePath("/", "layout");
}

export async function removeChild(childId: string) {
  const supabase = await createClient();
  // Cascades to every attempt and report belonging to this child.
  await supabase.from("children").delete().eq("id", childId);
  await clearActiveChild();
  revalidatePath("/", "layout");
}
