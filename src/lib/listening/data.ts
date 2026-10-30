import "server-only";
import { createClient } from "@/lib/supabase/server";

export type ListeningOption = { text: string; isCorrect: boolean; feedback: string };

/**
 * What the player is allowed to know.
 *
 * Note what is absent: `transcript`, and the `isCorrect` / `feedback` on every
 * option. The transcript is the thing being listened to — shipping it to the
 * browser would turn a listening exercise into a reading one for any child who
 * opens the page source, and more importantly for any child who simply reads
 * it off a screen reader. Correctness is resolved server-side on submit, the
 * same way Spot the Trick withholds the technique.
 */
export type PlayablePassage = {
  id: string;
  topic: string;
  recallQuestion: string;
  recallOptions: string[];
  inferenceQuestion: string;
  inferenceOptions: string[];
  defendPrompt: string;
};

/** The next passage this child has not heard, oldest first. */
export async function getNextPassage(
  childId: string,
  locale: string,
): Promise<PlayablePassage | null> {
  const supabase = await createClient();

  const { data: done } = await supabase
    .from("listening_attempts")
    .select("passage_id")
    .eq("child_id", childId);

  const heard = (done ?? []).map((r) => r.passage_id);

  // Deterministic, oldest first: a render-time random pick makes the page
  // non-idempotent, and working through the catalogue in order is better for
  // a child than being handed the same passage twice by chance.
  let query = supabase
    .from("listening_passages")
    .select("id, topic, recall_question, recall_options, inference_question, inference_options, defend_prompt")
    .eq("status", "ready")
    .eq("locale", locale)
    .order("created_at", { ascending: true })
    .limit(1);

  if (heard.length > 0) query = query.not("id", "in", `(${heard.join(",")})`);

  const { data } = await query;
  const row = data?.[0];
  if (!row) return null;

  const strip = (raw: unknown) =>
    (Array.isArray(raw) ? (raw as ListeningOption[]) : []).map((o) => o.text);

  return {
    id: row.id,
    topic: row.topic,
    recallQuestion: row.recall_question,
    recallOptions: strip(row.recall_options),
    inferenceQuestion: row.inference_question,
    inferenceOptions: strip(row.inference_options),
    defendPrompt: row.defend_prompt,
  };
}

/**
 * The spoken text, fetched only when the child presses play.
 *
 * Kept out of the page payload on purpose and served by a server action
 * instead, so the words arrive at the moment they are needed rather than
 * sitting in the HTML waiting to be read.
 */
export async function getTranscriptForPlayback(passageId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listening_passages")
    .select("transcript")
    .eq("id", passageId)
    .eq("status", "ready")
    .maybeSingle();
  return data?.transcript ?? null;
}

export async function countListened(childId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("listening_attempts")
    .select("id", { count: "exact", head: true })
    .eq("child_id", childId);
  return count ?? 0;
}
