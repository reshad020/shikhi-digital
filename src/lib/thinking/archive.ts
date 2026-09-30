import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isStrongMove, type StrongMove, type ThinkingMove } from "@/lib/reasoning/moves";
import { pickQuote, type AttemptRow } from "@/lib/report/analyse";

/**
 * Everything a child has written, given back to them.
 *
 * This data has always existed and the child has never once seen it. They
 * write an explanation, read a single verdict screen, and it is gone; the rows
 * go on to feed the rank engine, the safety queue, and a weekly report quoted
 * to their parent. The person whose words they are was the only one who never
 * got to read them back.
 *
 * That is the wrong way round for a product whose entire claim is that what a
 * child writes matters more than which box they ticked. Being read closely is
 * the thing that makes a child bother to write properly next time — and being
 * able to see that someone did is what makes it land.
 *
 * `firsts` is the emotional core: the first time each kind of thinking showed
 * up in their writing, dated. Not a badge for an action, a record of a moment.
 */

export type ThinkingEntry = {
  id: string;
  source: "defend" | "steelman";
  /** The child's own words, exactly as stored. Never rewritten. */
  text: string;
  quality: "developing" | "solid" | "excellent";
  moves: ThinkingMove[];
  /** What the grader said back — the proof somebody read it. */
  response: string;
  pushback: string;
  /** The lesson it came from, or the claim they argued. */
  about: string;
  at: Date;
  /** Strong moves appearing here for the first time ever. */
  firsts: StrongMove[];
};

export type Archive = {
  entries: ThinkingEntry[];
  /** Ranked by the same rule the parent report uses to choose its quote. */
  best: ThinkingEntry | null;
  /** First appearance of each strong move, oldest first. */
  firsts: { move: StrongMove; at: Date; entryId: string }[];
  totalWords: number;
};

function asMoves(raw: unknown): ThinkingMove[] {
  return Array.isArray(raw) ? (raw as ThinkingMove[]) : [];
}

export async function getArchive(childId: string): Promise<Archive> {
  const supabase = await createClient();

  const [reasoning, steelman] = await Promise.all([
    supabase
      .from("reasoning_attempts")
      .select("id, text, quality, moves, response, pushback, created_at, question_id, lessons(subject)")
      .eq("child_id", childId)
      .order("created_at", { ascending: true }),
    supabase
      .from("steelman_attempts")
      .select("id, text, quality, moves, response, pushback, created_at, steelman_prompts(claim)")
      .eq("child_id", childId)
      .order("created_at", { ascending: true }),
  ]);

  const merged: (ThinkingEntry & { questionId: string })[] = [
    ...(reasoning.data ?? []).map((r) => ({
      id: r.id,
      source: "defend" as const,
      text: r.text,
      quality: r.quality as ThinkingEntry["quality"],
      moves: asMoves(r.moves),
      response: r.response,
      pushback: r.pushback,
      about: (r.lessons as { subject: string } | null)?.subject ?? "",
      at: new Date(r.created_at),
      firsts: [] as StrongMove[],
      questionId: r.question_id,
    })),
    ...(steelman.data ?? []).map((r) => ({
      id: r.id,
      source: "steelman" as const,
      text: r.text,
      quality: r.quality as ThinkingEntry["quality"],
      moves: asMoves(r.moves),
      response: r.response,
      pushback: r.pushback,
      about: (r.steelman_prompts as { claim: string } | null)?.claim ?? "",
      at: new Date(r.created_at),
      firsts: [] as StrongMove[],
      questionId: "",
    })),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());

  // Walk oldest to newest so "first time" means first time ever, not first
  // time on this page.
  const seen = new Set<StrongMove>();
  const firsts: Archive["firsts"] = [];
  for (const entry of merged) {
    for (const move of entry.moves) {
      if (!isStrongMove(move) || seen.has(move)) continue;
      seen.add(move);
      entry.firsts.push(move);
      firsts.push({ move, at: entry.at, entryId: entry.id });
    }
  }

  // The same ranking the weekly report uses to choose its quote, so the piece
  // a child is proudest of is the piece their parent read about.
  const rankable: AttemptRow[] = merged.map((e) => ({
    id: e.id,
    text: e.text,
    quality: e.quality,
    moves: JSON.stringify(e.moves),
    createdAt: e.at,
    questionId: e.questionId,
  }));
  const bestId = pickQuote(rankable)?.id ?? null;

  return {
    entries: [...merged].reverse(),
    best: merged.find((e) => e.id === bestId) ?? null,
    firsts,
    totalWords: merged.reduce((sum, e) => sum + e.text.trim().split(/\s+/).filter(Boolean).length, 0),
  };
}
