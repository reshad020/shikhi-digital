import { z } from "zod";
import { THINKING_MOVES } from "./moves";

/**
 * What the grader returns. Note what is absent: any judgement of whether the
 * multiple-choice answer was right. The app already knows that, and mixing the
 * two is exactly the mistake this feature exists to avoid.
 */
export const VerdictSchema = z.object({
  quality: z
    .enum(["developing", "solid", "excellent"])
    .describe(
      "How good the REASONING is, ignoring whether the answer was right. A correct answer with no reason is 'developing'.",
    ),
  moves: z
    .array(z.enum(THINKING_MOVES))
    .min(1)
    .max(3)
    .describe("The thinking moves actually present in the child's words. Do not be generous."),
  response: z
    .string()
    .describe(
      "Two short sentences to the child. Name the specific good thing they did first, then correct any mistake gently. Never say 'wrong'.",
    ),
  pushback: z
    .string()
    .describe(
      "One short question that stretches them one step further. It must be answerable from the story they just read.",
    ),
  flagged: z
    .boolean()
    .describe(
      "True only if the text shows distress, describes harm, or is abusive. Not for silly or off-topic answers.",
    ),
});

export type Verdict = z.infer<typeof VerdictSchema>;

/** Hard cap on child input. Long enough for real reasoning, short enough to bound cost and abuse. */
export const MAX_REASONING_CHARS = 600;
export const MIN_REASONING_CHARS = 10;
