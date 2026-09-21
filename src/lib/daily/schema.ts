import { z } from "zod";
import { TELLS } from "./tells";

/**
 * What the generator must produce for one day's Fake or Real.
 *
 * The two claims have to be genuinely hard to tell apart. A false claim that is
 * obviously silly teaches nothing — the child learns to spot absurdity, not to
 * check sources.
 */
export const ChallengeSchema = z.object({
  trueClaim: z
    .string()
    .describe("A surprising but verifiable fact, in one sentence a 10-year-old can read."),
  falseClaim: z
    .string()
    .describe(
      "A plausible-sounding false claim in the same style and length as the true one. Never absurd.",
    ),
  tell: z.enum(TELLS).describe("The single clearest reason the false claim is false."),
  distractorTells: z
    .array(z.enum(TELLS))
    .min(2)
    .max(3)
    .describe("Two or three other tells that do NOT apply here. Must not include the correct tell."),
  explanation: z
    .string()
    .describe(
      "Two short sentences shown after answering: why the false claim fails, and what is actually true.",
    ),
  sourceNote: z
    .string()
    .describe("Where the true claim comes from, in one short phrase. Never empty, never vague."),
});

export type Challenge = z.infer<typeof ChallengeSchema>;

export const BatchSchema = z.object({
  challenges: z.array(ChallengeSchema).min(1).max(7),
});
