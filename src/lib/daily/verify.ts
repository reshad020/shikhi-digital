import { z } from "zod";
import { generateJson } from "@/lib/gemini";
import { TELLS, TELL_HINTS } from "./tells";
import type { Challenge } from "./schema";

/**
 * Cross-examines a generated Fake or Real challenge.
 *
 * `/admin` already refuses to show a child anything a person has not
 * published, and the reason given for that rule is exact: a model will
 * eventually produce something confidently wrong. This is the same worry,
 * caught a step earlier — and on the one thing that matters most here.
 *
 * Fake or Real teaches a child to check claims. A challenge whose "true" claim
 * is false does not merely fail to teach that; it teaches the opposite, and it
 * does so while telling the child they were wrong for doubting it. That is the
 * worst outcome this feature has, and it is invisible on a quick read — a
 * confident, well-written, plausible falsehood looks exactly like a
 * confident, well-written, plausible fact.
 *
 * ## Why this is a second call rather than a bigger prompt
 *
 * Asking the same request to check its own work mostly produces agreement:
 * the claim is already in its context, phrased persuasively, as something it
 * just asserted. So the check runs as a separate request that is **not told
 * which claim is which**. The two claims arrive shuffled, labelled A and B,
 * and the model is asked to work out on its own which is false and to say
 * what it knows about each.
 *
 * Then the two are compared. If the checker picks the other claim, one of the
 * two passes is wrong — and since there is no way to tell which from here,
 * the challenge is dropped. Disagreement is the signal; being right about
 * which one is in error is not necessary.
 */

const Verdict = z.object({
  falseOne: z
    .enum(["A", "B"])
    .describe("Which of the two claims is the false one. You must choose one."),
  confident: z
    .boolean()
    .describe(
      "True only if you actually know this, from knowledge of the subject. False if you are inferring it from tone, phrasing or which one sounds more made-up.",
    ),
  aboutA: z.string().describe("One sentence: what you know about claim A and whether it holds."),
  aboutB: z.string().describe("One sentence: what you know about claim B and whether it holds."),
  tooEasy: z
    .boolean()
    .describe(
      "True ONLY if the false claim can be picked from how it is written rather than from what it says: much longer, hedged where the other is flat, or absurd on its face. A suspiciously round number or a stated cause is NOT too easy — those are what the child is learning to notice.",
    ),
  bestTell: z
    .enum(TELLS)
    .describe("From the fixed list, the clearest reason the claim you picked is false."),
  problems: z
    .array(z.string())
    .describe(
      "Anything that would make this unfair or unsuitable for a child aged 8 to 13. Empty array if nothing.",
    ),
});

export type ChallengeVerdict = {
  ok: boolean;
  /** Why it was rejected, for the run log. Empty when `ok`. */
  reasons: string[];
  /** Kept for the log even when accepted. */
  notes: string[];
};

const SYSTEM = `You are fact-checking two claims written for a children's game. Your job is to work out which one is false.

You are NOT told which is which. Decide from what you actually know.

## How to decide
Judge each claim on whether it is true, not on how it sounds. A true fact chosen for a game like this will usually be surprising — surprising is not evidence of falsehood. Equally, a false claim written for this game is designed to sound reasonable.

Set \`confident\` to true ONLY if you genuinely know the subject well enough to say. If you are picking based on which one feels more invented, set it to false. Saying you are unsure is far more useful here than guessing correctly.

## tooEasy
The whole point of the game is that the two claims are hard to tell apart — *as claims*. Set \`tooEasy\` to true when the false one can be picked without engaging with the subject at all: it is much longer, it is hedged where the other is flat, it gestures at "experts" where the other names an institution, or it is absurd on its face.

Do **not** set it for a claim whose falseness shows in the content itself. A number that is suspiciously round, a cause asserted from two things merely happening together, a quantity too large to be physical — these are exactly what the child is being taught to notice, and the game does not work if they are hidden. A false claim is supposed to be catchable by someone thinking clearly. It is only too easy if it is catchable by someone not thinking at all.

## bestTell
The clearest reason the claim you picked fails, from this fixed list:

${TELLS.map((t) => `- ${t}: ${TELL_HINTS[t]}`).join("\n")}

## problems
Note anything unfair or unsuitable for a child aged 8 to 13: frightening content, a real named living person, a claim that needs knowledge of one particular country, or a pair where both claims could defensibly be true.`;

export async function verifyChallenge(
  challenge: Challenge,
): Promise<ChallengeVerdict> {
  // Shuffled, so position carries no information. A checker that always sees
  // the true claim first would learn nothing except where we put it.
  const trueIsA = Math.random() < 0.5;
  const a = trueIsA ? challenge.trueClaim : challenge.falseClaim;
  const b = trueIsA ? challenge.falseClaim : challenge.trueClaim;

  const { data } = await generateJson({
    schema: Verdict,
    system: SYSTEM,
    prompt: `Claim A: ${a}\n\nClaim B: ${b}\n\nWhich is false?`,
    // Low: this is a judgement, not an invention. Variation here is noise.
    temperature: 0.2,
    maxOutputTokens: 4000,
  });

  const pickedFalse = data.falseOne === "A" ? a : b;
  const agrees = pickedFalse === challenge.falseClaim;

  const reasons: string[] = [];
  const notes: string[] = [
    `A: ${data.aboutA}`,
    `B: ${data.aboutB}`,
  ];

  if (!agrees) {
    // The important one. Either the generator mislabelled the pair, or the
    // checker is wrong about a real fact — and a child cannot be shown a
    // question when we cannot say which.
    reasons.push("checker picked the other claim as the false one");
  } else if (!data.confident) {
    // Agreement from a checker that admits it was guessing is worth very
    // little, and the cost of being wrong here is a child taught a falsehood.
    reasons.push("checker agreed but was not confident");
  }

  if (data.tooEasy) {
    reasons.push("false claim gives itself away");
  }

  for (const problem of data.problems) {
    if (problem.trim()) reasons.push(problem.trim());
  }

  // A disagreement about the tell is not fatal — two of the listed tells can
  // genuinely both describe one claim — so it is logged rather than rejected.
  if (agrees && data.bestTell !== challenge.tell) {
    notes.push(`tell: generator said ${challenge.tell}, checker said ${data.bestTell}`);
  }

  return { ok: reasons.length === 0, reasons, notes };
}

/**
 * Balance checks on the pair, in code.
 *
 * These catch the failure the first dry run exposed, which neither the
 * generator's instructions nor the model checker noticed: the false claim
 * opened "Top wildlife experts recently reported that..." while the true claim
 * was a flat statement of fact.
 *
 * Both were accurately labelled, and the tell — vague-authority — was the
 * right one. The pair was still unfair, because a child does not need to think
 * about sources to win it. They need to notice which sentence is hedged. That
 * is a format cue, it works on every question written this way, and it
 * transfers to nothing: real false claims are not politely marked with
 * "experts say".
 *
 * The rule this encodes: for a tell about sourcing to be worth naming, the
 * contrast must be **vague attribution against specific attribution**, not
 * attribution against none.
 */

/**
 * Credits somebody without naming them.
 *
 * This list can be closed, which is the only reason the check below works.
 * Vagueness has a small vocabulary — there are not many ways to gesture at an
 * authority without naming one, and "experts", "scientists" and "researchers"
 * cover most of them.
 *
 * The opposite is not true, and an earlier version of this file got it wrong
 * by trying: it also kept a list of words that meant a *specific* source
 * (university, institute, laboratory...) and rejected any pair where only one
 * claim matched either list. Specific attribution is open-vocabulary — it is
 * whatever the organisation happens to be called — so the list could never be
 * complete. It rejected "a forestry survey by the United States Forest
 * Service" against "a forestry survey by the Swedish University of
 * Agricultural Sciences" as unbalanced, because it knew the word "university"
 * and not "Forest Service". Both claims cited a real named body; the pair was
 * exactly right. Rejecting good material is worse than passing doubtful
 * material to a human, because nobody ever sees what was thrown away.
 */
const VAGUE_AUTHORITY =
  /\b(experts?|scientists?|researchers?|doctors?|specialists?|authorities|studies show|research shows)\b/i;

const HEDGES = /\b(recently|reportedly|apparently|said to|claims? to|is believed|some say)\b/i;

export function balanceProblems(challenge: Challenge): string[] {
  const problems: string[] = [];
  const { trueClaim: t, falseClaim: f } = challenge;

  // Vague authority on one side only. This is the format cue worth catching:
  // when the false claim says "experts say" and the true one does not, the
  // child can win without thinking about the subject at all.
  //
  // Two specific attributions are fine, and so are none. The fair version of
  // this tell is vague against *specific*, and that is the prompt's job to
  // arrange rather than this function's to detect.
  if (VAGUE_AUTHORITY.test(f) !== VAGUE_AUTHORITY.test(t)) {
    const which = VAGUE_AUTHORITY.test(f) ? "false" : "true";
    problems.push(
      `only the ${which} claim gestures at unnamed authority — the pair gives itself away on format`,
    );
  }

  if (HEDGES.test(f) !== HEDGES.test(t)) {
    const which = HEDGES.test(f) ? "false" : "true";
    problems.push(`only the ${which} claim is hedged`);
  }

  // Matched in length, as the prompt asks. A sentence half again as long as
  // its partner is visibly the odd one out before it is read.
  const [shorter, longer] = [t.length, f.length].sort((a, b) => a - b);
  if (longer > shorter * 1.5) {
    problems.push(`claims differ in length by more than half (${t.length} vs ${f.length} chars)`);
  }

  if (!challenge.sourceNote.trim()) {
    problems.push("no sourceNote");
  } else if (/^(scientists|experts|researchers|the internet|studies)\b/i.test(challenge.sourceNote.trim())) {
    problems.push(`sourceNote "${challenge.sourceNote}" is exactly the vagueness this game teaches against`);
  }

  return problems;
}
