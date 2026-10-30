import { z } from "zod";
import { generateJson } from "@/lib/gemini";
import { TECHNIQUES, type Technique } from "./techniques";
import type { GeneratedPuzzle } from "./generate";

/**
 * Checks that a generated puzzle actually contains the trick it claims to.
 *
 * Spot the Trick asks a child to find a manipulation in an artefact and name
 * it. The failure that matters is an artefact where the trick is **not
 * present**: a "chopped-off scale" chart whose axis starts at zero, a
 * "linked to" headline that says *causes*. A child then looks for something
 * that is not there, cannot find it, picks an answer, and is told they were
 * wrong. They learn that they are bad at this — which is the precise opposite
 * of the point.
 *
 * ## Two passes, because they catch different things
 *
 * `structuralProblems` is plain code. Some of these techniques are defined by
 * a number, and a number can simply be checked: a truncated axis means
 * `axisStart` is above the lowest bar, and no amount of asking a model is a
 * better test of that than the comparison itself. Code is also free, instant
 * and cannot be talked round.
 *
 * `verifyPuzzle` is a second model call for the rest — whether a headline
 * really implies cause from correlation, whether a survey question really
 * leads the answer. Those are judgements about language, which is the one
 * thing a model is better at than a regular expression.
 *
 * The code pass runs first, because when it fails there is no reason to pay
 * for the other one.
 */

/**
 * What can be checked by looking at the numbers.
 *
 * Returns the reasons it fails, empty when it passes. Only covers techniques
 * with a mechanical definition — the rest return nothing here and are left to
 * the model pass, rather than being waved through by a check that was never
 * looking at them.
 */
export function structuralProblems(
  puzzle: GeneratedPuzzle,
  technique: Technique,
): string[] {
  const problems: string[] = [];
  const { artefact } = puzzle;

  if (!technique.kinds.includes(artefact.kind)) {
    problems.push(`kind "${artefact.kind}" is not one this technique can use`);
  }

  if (artefact.kind === "chart") {
    if (artefact.bars.length < 3) {
      problems.push(`chart has ${artefact.bars.length} bars, needs at least 3`);
    }

    const values = artefact.bars.map((b) => b.value);
    const lowest = Math.min(...values);

    if (technique.slug === "truncated-axis") {
      // The entire technique is this one comparison. An axis at zero means
      // the chart is honest and the puzzle has no answer.
      if (artefact.axisStart <= 0) {
        problems.push("axis starts at zero, so the scale is not chopped off");
      } else if (artefact.axisStart >= lowest) {
        problems.push(
          `axisStart ${artefact.axisStart} is not below the shortest bar ${lowest}, so nothing would render`,
        );
      } else {
        // Present but too mild to see. If the shortest bar still fills most of
        // the chart, the distortion a child is asked to spot is not there.
        const span = Math.max(...values) - artefact.axisStart;
        const shortest = lowest - artefact.axisStart;
        if (span > 0 && shortest / span > 0.5) {
          problems.push("axis is chopped, but too little to distort anything");
        }
      }
    } else if (artefact.axisStart !== 0) {
      // A stray truncated axis makes a second, unlisted trick present, and the
      // child who spots it is marked wrong for being right.
      problems.push(
        `axisStart is ${artefact.axisStart} on a chart about "${technique.slug}", which adds a second trick`,
      );
    }

    if (technique.slug === "cherry-picked-window") {
      const years = artefact.bars.map((b) => Number(b.label)).filter(Number.isFinite);
      if (years.length === artefact.bars.length) {
        const gaps = years.slice(1).map((y, i) => y - years[i]);
        if (gaps.some((g) => g !== gaps[0])) {
          problems.push("year labels are not evenly spaced");
        }
      }
    }
  }

  if (artefact.kind === "headline" && !artefact.title.trim()) {
    problems.push("headline has no title");
  }

  if (artefact.kind === "survey" && artefact.options.length < 2) {
    problems.push(`survey has ${artefact.options.length} options, needs at least 2`);
  }

  if (!artefact.source.trim()) {
    problems.push("no source named");
  }

  // The artefact must not name its own trick. A chart titled "a misleading
  // scale" is not a puzzle.
  const haystack = [artefact.title, artefact.standfirst, artefact.body].join(" ").toLowerCase();
  for (const word of ["misleading", "manipulat", "deceptive", "trick", "cherry-pick"]) {
    if (haystack.includes(word)) {
      problems.push(`artefact gives itself away with "${word}"`);
    }
  }

  return problems;
}

const Verdict = z.object({
  technique: z
    .enum(TECHNIQUES.map((t) => t.slug) as [string, ...string[]])
    .describe("Which technique this artefact actually demonstrates most clearly."),
  present: z
    .boolean()
    .describe("True if the trick is genuinely in the artefact rather than only described."),
  selfEvident: z
    .boolean()
    .describe("True if the artefact labels, hints at or explains its own trick."),
  problems: z
    .array(z.string())
    .describe("Anything unfair or unsuitable for a child aged 8 to 13. Empty array if nothing."),
});

export type PuzzleVerdict = { ok: boolean; reasons: string[]; notes: string[] };

/**
 * Asks a fresh request which technique the artefact demonstrates.
 *
 * Deliberately not told which one was intended — being handed the answer is
 * the quickest way to get agreement with it. If it names a different
 * technique, the options the child picks from contain two defensible answers
 * and the puzzle is unfair whichever way it is marked.
 */
export async function verifyPuzzle(
  puzzle: GeneratedPuzzle,
  technique: Technique,
): Promise<PuzzleVerdict> {
  const list = TECHNIQUES.map((t) => `- ${t.slug}: ${t.definition}`).join("\n");
  const { artefact } = puzzle;

  const described = [
    `Kind: ${artefact.kind}`,
    `Title: ${artefact.title}`,
    `Source: ${artefact.source}`,
    artefact.standfirst && `Standfirst: ${artefact.standfirst}`,
    artefact.body && `Body: ${artefact.body}`,
    artefact.bars.length > 0 &&
      `Bars: ${artefact.bars.map((b) => `${b.label}=${b.value}${artefact.unit}`).join(", ")}`,
    artefact.bars.length > 0 && `Value scale starts at: ${artefact.axisStart}`,
    artefact.options.length > 0 && `Options: ${artefact.options.join(" / ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  const { data } = await generateJson({
    schema: Verdict,
    system: `You examine an artefact — a chart, a headline or a survey question — and name the manipulation technique it demonstrates.

Choose from this fixed list:

${list}

## present
True only if the trick is actually in the artefact. A headline that says two things are "linked" demonstrates the technique; a headline that plainly states one caused the other does not, whatever it was meant to show. A chart whose scale starts at zero is not a chopped-off scale.

## selfEvident
These artefacts are puzzles. True if this one names, hints at or explains its own trick anywhere, which would leave the child nothing to find.

## problems
Anything that makes this unsuitable for a child aged 8 to 13: frightening subject matter, a real named person or organisation, numbers that contradict each other, or an artefact that demonstrates two techniques at once.`,
    prompt: `${described}\n\nWhich technique does this demonstrate?`,
    temperature: 0.2,
    maxOutputTokens: 4000,
  });

  const reasons: string[] = [];
  const notes: string[] = [];

  if (!data.present) reasons.push("checker says the trick is not actually in the artefact");
  if (data.selfEvident) reasons.push("artefact explains its own trick");
  if (data.technique !== technique.slug) {
    reasons.push(`checker read it as "${data.technique}", not "${technique.slug}"`);
  }
  for (const problem of data.problems) {
    if (problem.trim()) reasons.push(problem.trim());
  }

  if (reasons.length === 0) notes.push(`reads as ${data.technique}`);

  return { ok: reasons.length === 0, reasons, notes };
}
