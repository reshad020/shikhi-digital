import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Child } from "@/lib/supabase/types";

const ACTIVE_CHILD_COOKIE = "shikhi_child";

/**
 * Children belonging to the signed-in parent.
 *
 * The parent_id filter is deliberate and not redundant. The RLS policy on
 * `children` also admits admins, because the admin tool needs to see across
 * families — but this function feeds the family-facing chooser, where "my
 * children" must mean exactly that. Without the filter, an admin using the
 * product as a parent sees every child in the database.
 */
export async function listChildren(): Promise<Child[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true });
  return data ?? [];
}

/** One of the signed-in parent's own children. Scoped for the same reason as above. */
export async function getChild(id: string): Promise<Child | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("children")
    .select("*")
    .eq("id", id)
    .eq("parent_id", user.id)
    .maybeSingle();
  return data;
}

/**
 * Whose turn it is on this device. Falls back to the only child when a family
 * has just one, so a single-child household never sees a chooser.
 */
export async function getActiveChild(): Promise<Child | null> {
  const selected = (await cookies()).get(ACTIVE_CHILD_COOKIE)?.value;

  if (selected) {
    // Still re-read through RLS: a stale or copied cookie proves nothing.
    const child = await getChild(selected);
    if (child) return child;
  }

  const children = await listChildren();
  return children.length === 1 ? children[0] : null;
}

export async function setActiveChild(childId: string) {
  const store = await cookies();
  store.set(ACTIVE_CHILD_COOKIE, childId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearActiveChild() {
  (await cookies()).delete({ name: ACTIVE_CHILD_COOKIE, path: "/" });
}
