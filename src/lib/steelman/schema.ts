import { z } from "zod";
import { THINKING_MOVES } from "@/lib/reasoning/moves";

/**
 * What the steelman grader returns.
 *
 * Note what is absent, again: any judgement of which side is *correct*. Most
 * of these claims have no correct side, and on the ones that arguably do, the
 * child is being graded on arguing the side they rejected. A grader that
 * leaked an opinion about the claim itself would quietly teach children which
 * views this product approves of, which is a far worse product than a slightly
 * less accurate one.
 */
export const SteelmanVerdictSchema = z.object({
  fairness: z
    .enum(["strawman", "partial", "fair", "generous"])
    .describe(
      "How the other side would react on reading this. 'strawman' = they would not recognise themselves, or it is secretly an argument against them. 'partial' = a real but minor point of theirs. 'fair' = a point they would actually make. 'generous' = they would wish they had put it that way.",
    ),
  quality: z
    .enum(["developing", "solid", "excellent"])
    .describe(
      "How good the REASONING is. A fluent restatement of the claim with no reason behind it is 'developing', however well written.",
    ),
  moves: z
    .array(z.enum(THINKING_MOVES))
    .min(1)
    .max(3)
    .describe(
      "The thinking moves actually present. Award 'steelmanned' only at fairness 'fair' or 'generous'.",
    ),
  response: z
    .string()
    .describe(
      "Two short sentences to the child. Name the specific strongest thing in their argument first, quoting their words. Never praise them for agreeing with anyone.",
    ),
  pushback: z
    .string()
    .describe(
      "One short question pushing them one step further into the side they are arguing — never back towards their own view.",
    ),
  flagged: z
    .boolean()
    .describe(
      "True only if the text shows distress, describes harm, or is abusive. Not for silly, rude or off-topic answers.",
    ),
});

export type SteelmanVerdict = z.infer<typeof SteelmanVerdictSchema>;

/** Same bounds as Defend Your Answer: real room to argue, still cost-bounded. */
export const MAX_STEELMAN_CHARS = 600;
export const MIN_STEELMAN_CHARS = 20;

/** Ordered weakest to strongest, for the UI and for any future analysis. */
export const FAIRNESS_ORDER = ["strawman", "partial", "fair", "generous"] as const;
export type Fairness = (typeof FAIRNESS_ORDER)[number];
