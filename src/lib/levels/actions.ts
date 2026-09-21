"use server";

import { getChild } from "@/lib/data/children";
import { markRankSeen } from "./compute";

/** Acknowledges a promotion. Ownership is re-checked; the client only names it. */
export async function acknowledgeRank(childId: string, rankSlug: string) {
  const child = await getChild(childId);
  if (!child) return;
  await markRankSeen(child.id, rankSlug);
}
