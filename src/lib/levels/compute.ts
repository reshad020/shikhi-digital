import "server-only";
import { createClient } from "@/lib/supabase/server";
import { STRONG_MOVES, isStrongMove, type StrongMove } from "@/lib/reasoning/moves";
import { TELL_TO_MOVE, type Tell } from "@/lib/daily/tells";
import { getTechnique } from "@/lib/tricks/techniques";
import type { Profile } from "./ranks";

/**
 * One progression, fed by every activity in the product.
 *
 * The three features contribute differently on purpose:
 *
 * - **Defend Your Answer** supplies both breadth (which moves appeared) and
 *   depth (how good the explanation was). Only written explanations can move
 *   the quality counters — you cannot reach a high rank by tapping.
 * - **Steelman Arena** supplies breadth and depth on the same terms, and is
 *   the only source of the `steelmanned` move. Since the top rank requires
 *   every strong move, that makes it the only route to Steelmanner — which is
 *   the point: you should not be able to hold the rank without having done
 *   the thing it is named after.
 * - **Fake or Real** and **Spot the Trick** supply breadth only, and only when
 *   the child names the right reason. Picking correctly by luck credits nothing.
 *
 * Computed from source rows rather than stored as a running total, so it cannot
 * drift out of sync with what the child actually did.
 */
export async function computeProfile(childId: string): Promise<Profile> {
  const supabase = await createClient();

  const moveCounts = Object.fromEntries(STRONG_MOVES.map((m) => [m, 0])) as Record<
    StrongMove,
    number
  >;
  let goodExplanations = 0;
  let excellentExplanations = 0;
  let totalActivities = 0;

  const [reasoning, steelman, daily, puzzles] = await Promise.all([
    supabase.from("reasoning_attempts").select("moves, quality").eq("child_id", childId),
    supabase.from("steelman_attempts").select("moves, quality").eq("child_id", childId),
    supabase
      .from("challenge_attempts")
      .select("tell_correct, chosen_tell")
      .eq("child_id", childId),
    supabase
      .from("puzzle_attempts")
      .select("correct, trick_puzzles(technique)")
      .eq("child_id", childId),
  ]);

  // The two written activities are counted together and identically: a
  // steelman argument IS an explanation the child wrote, so it moves the
  // quality counters on exactly the same terms as a defended answer.
  const written = [...(reasoning.data ?? []), ...(steelman.data ?? [])];

  for (const row of written) {
    totalActivities++;
    if (row.quality === "solid" || row.quality === "excellent") goodExplanations++;
    if (row.quality === "excellent") excellentExplanations++;

    const moves = Array.isArray(row.moves) ? (row.moves as string[]) : [];
    for (const move of moves) {
      if (isStrongMove(move)) moveCounts[move]++;
    }
  }

  for (const row of daily.data ?? []) {
    totalActivities++;
    // Only a correctly named tell counts. Guessing the false claim right is luck.
    if (!row.tell_correct) continue;
    const move = TELL_TO_MOVE[row.chosen_tell as Tell];
    if (move) moveCounts[move]++;
  }

  for (const row of puzzles.data ?? []) {
    totalActivities++;
    if (!row.correct) continue;
    const slug = (row.trick_puzzles as { technique: string } | null)?.technique;
    const move = slug ? getTechnique(slug)?.proves : undefined;
    if (move) moveCounts[move]++;
  }

  const distinctMoves = STRONG_MOVES.filter((m) => moveCounts[m] > 0).length;

  return {
    moveCounts,
    distinctMoves,
    goodExplanations,
    excellentExplanations,
    totalActivities,
  };
}

/**
 * Records the rank the child has been shown, so a promotion can be celebrated
 * exactly once. Stored server-side rather than in the browser so a child who
 * levels up on a tablet is not congratulated again on a laptop.
 */
export async function markRankSeen(childId: string, rankSlug: string) {
  const supabase = await createClient();
  await supabase.from("children").update({ seen_rank: rankSlug }).eq("id", childId);
}
