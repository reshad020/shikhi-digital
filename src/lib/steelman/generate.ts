import { z } from "zod";
import { generateJson } from "@/lib/gemini";
import { locales, type Locale } from "@/i18n/routing";

/**
 * Invents a claim worth disagreeing about.
 *
 * The hard part is not writing a claim; it is writing one where both sides are
 * genuinely holdable by a nine-year-old. A prompt where one answer is obviously
 * right produces a strawman from every child, and then the grader punishes them
 * for the prompt's failure.
 *
 * So the generator is required to produce the strongest point for *both* sides
 * up front. If it cannot write a real case for each, the claim is not suitable
 * and a human reviewer can see that immediately in the draft.
 */

const DraftSchema = z.object({
  claim: z
    .string()
    .describe("The disagreement, in one sentence a 9-year-old would have an opinion about."),
  context: z
    .string()
    .describe(
      "One or two neutral sentences of background. Must not hint at which side is better.",
    ),
  sideA: z.string().describe("One side, five words or fewer, phrased as its holders would."),
  sideB: z.string().describe("The opposing side, five words or fewer, phrased the same way."),
  bestForA: z
    .string()
    .describe("The single strongest point for side A, in one or two sentences a child could grasp."),
  bestForB: z.string().describe("The single strongest point for side B, to the same standard."),
});

export type SteelmanDraft = z.infer<typeof DraftSchema>;

function buildSystem(locale: Locale) {
  const language = locales.find((l) => l.code === locale)?.label ?? "English";

  return `You write prompts for an exercise where children aged 8 to 13 argue the side of a disagreement they personally do NOT hold.

Write everything in ${language}.

## What makes a usable claim
- Children this age must have a real, first-hand opinion about it. School, family rules, animals, fairness between friends, screens, sport, money, what is worth doing. Not foreign policy.
- Both sides must be genuinely holdable. If a thoughtful adult would say one side is simply correct, the claim is unusable — children will produce strawmen and be marked down for your mistake.
- It must not be a factual question in disguise. "Is the earth round" is not a disagreement.

## What to avoid completely
- Anything touching religion, politics, sexuality, race, illness, death, or a child's own family circumstances. A child should never be asked to argue against something that is true of them or their household.
- Anything where one side requires defending cruelty, exclusion or harm. The exercise is arguing in good faith with someone reasonable, not defending the indefensible.
- Claims that shame a common childhood situation (single parents, not having money, not having a pet, being bad at sport).

## bestForA / bestForB
The strongest point each side actually makes — the one that would give the other side pause. These are shown to the child only AFTER they have written their own argument, so they can see whether they found it. Do not hedge them, and do not make one obviously weaker than the other; if you cannot write a real case for both, choose a different claim.

## context
Neutral background. If a reader can tell which side you prefer, rewrite it.`;
}

export async function generateSteelmanPrompt({
  locale,
  topicHint,
}: {
  locale: Locale;
  /** Optional nudge from the admin, e.g. "school rules". */
  topicHint?: string;
}): Promise<{ draft: SteelmanDraft; model: string }> {
  const prompt = topicHint?.trim()
    ? `Write one claim for this exercise, somewhere in the area of: ${topicHint.trim()}`
    : "Write one claim for this exercise.";

  const { data, model } = await generateJson({
    schema: DraftSchema,
    system: buildSystem(locale),
    prompt,
    // Higher than the graders: the failure mode here is twenty prompts about
    // phones at school, so variety is worth some inconsistency.
    temperature: 1,
    maxOutputTokens: 2000,
  });

  return { draft: data, model };
}
