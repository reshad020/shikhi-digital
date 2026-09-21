import "server-only";
import { createClient } from "@/lib/supabase/server";

/** What the arena needs. Note the absence of `best_for_a` / `best_for_b`. */
export type ArenaPrompt = {
  id: string;
  claim: string;
  context: string;
  sideA: string;
  sideB: string;
};

/**
 * The next claim this child has not argued yet, oldest first.
 *
 * Deterministic rather than random for the same two reasons as Spot the Trick:
 * a render-time `Math.random` makes the page non-idempotent, and working
 * through the catalogue in order is better for a child than being handed the
 * same claim twice by chance.
 *
 * **The strongest points are deliberately not selected here.** They are the
 * answer to the exercise, and shipping them in the page payload would let a
 * curious child read the best argument before writing their own — which is
 * exactly the thing the activity is asking them to find. They are read back
 * server-side on submit, the same way Spot the Trick withholds the technique.
 */
export async function getNextPrompt(
  childId: string,
  locale: string,
): Promise<ArenaPrompt | null> {
  const supabase = await createClient();

  const { data: done } = await supabase
    .from("steelman_attempts")
    .select("prompt_id")
    .eq("child_id", childId);

  const seen = (done ?? []).map((r) => r.prompt_id);

  let query = supabase
    .from("steelman_prompts")
    .select("id, claim, context, side_a, side_b")
    .eq("status", "ready")
    .eq("locale", locale)
    .order("created_at", { ascending: true })
    .limit(1);

  if (seen.length > 0) query = query.not("id", "in", `(${seen.join(",")})`);

  const { data } = await query;
  const row = data?.[0];
  if (!row) return null;

  return {
    id: row.id,
    claim: row.claim,
    context: row.context,
    sideA: row.side_a,
    sideB: row.side_b,
  };
}

/** How many claims this child has argued. Used for the empty and done states. */
export async function countAttempts(childId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("steelman_attempts")
    .select("id", { count: "exact", head: true })
    .eq("child_id", childId);
  return count ?? 0;
}
