import { z } from "zod";
import { generateJson } from "@/lib/gemini";
import type { ItemKind, PracticeSet } from "./items";
import { levelBySlug, type Level } from "./syllabus";

/**
 * Generates YLE practice sets.
 *
 * The hard part is not producing questions, it is producing questions that
 * belong to a *specific part of a specific paper*. A generic "A2 English
 * exercise" is worse than useless for exam preparation: a child practises the
 * wrong shape, then meets the real paper and finds it unfamiliar. So the
 * prompt is assembled per part from `syllabus.ts`, the question count is fixed
 * to the real one, and the task wording is the exam's own.
 *
 * Three rules are enforced in the prompt and then checked in code, because a
 * model will break all three cheerfully:
 *
 * 1. **Distractors must be wrong for a learnable reason.** A joke option turns
 *    a three-way question into a two-way guess.
 * 2. **Exactly one option is correct.** Two correct answers make a question
 *    unanswerable and a child who spots it loses confidence in everything.
 * 3. **Every note gives the rule**, not the answer. "'How many' asks for a
 *    number" transfers to the real paper; "the answer is two" does not.
 */

const Option = z.object({
  text: z.string().describe("The option as it would appear on the paper."),
  isCorrect: z.boolean(),
});

const GeneratedQuestion = z.object({
  prompt: z
    .string()
    .describe("The sentence, line of dialogue or definition. Use ___ for a gap."),
  answer: z.string().describe("The correct answer exactly as it should be typed or chosen."),
  options: z
    .array(Option)
    .describe("For choice tasks, every option including the correct one. Empty for typed answers."),
  note: z
    .string()
    .describe(
      "ONE sentence giving the RULE behind the answer, not the answer. It must help on a different question of the same type.",
    ),
});

const GeneratedSet = z.object({
  title: z.string().describe("Four to seven words naming the topic, e.g. 'Choose a word: the zoo'."),
  passage: z
    .string()
    .describe(
      "For gap-fill tasks, the shared text with ___ marking each gap in order. Empty string if the task has no shared text.",
    ),
  wordBox: z
    .array(z.string())
    .describe(
      "For word-box tasks, the words to choose from including two distractors. Empty array otherwise.",
    ),
  questions: z.array(GeneratedQuestion),
});

export type GeneratedSetData = z.infer<typeof GeneratedSet>;

/** What each item kind demands, in the words the exam itself uses. */
const KIND_BRIEF: Record<ItemKind, string> = {
  spelling:
    "Each question gives a short clue about a word. The answer is a single word the child must spell. Use only concrete, picturable nouns. No options.",
  "word-box":
    "Write ONE short text with a gap for each question, marked ___ in order. Provide a word box containing every answer plus exactly two extra words that do not fit anywhere. No per-question options.",
  "dialogue-choice":
    "Each question is one line spoken by a person. The three options are possible replies. Exactly one fits; the other two are grammatically fine but answer a different question.",
  "dialogue-match":
    "Each question is one line of an ongoing conversation between two people. Options are possible replies; the conversation must still make sense read top to bottom.",
  "option-gap":
    "Write ONE short factual text with a gap for each question, marked ___ in order. Each question offers three options for its gap. Distractors must be the same part of speech as the answer.",
  definition:
    "Each question is a definition of one word, written the way a child's dictionary would. The answer is that single word, typed. No options.",
  "missing-word":
    "Write ONE short text, often a letter or a message, with a gap for each question marked ___ in order. The answers are grammar words a child must supply with no options: articles, prepositions, auxiliaries, pronouns.",
};

function buildSystem(level: Level, part: number, kind: ItemKind, task: string, count: number) {
  return `You write practice material for the Cambridge ${level.name} exam (${level.cefr}), for children ${level.typicalAges}.

You are writing **Part ${part}** only. The real task is:

> ${task}

${KIND_BRIEF[kind]}

Produce exactly ${count} questions. Not more, not fewer — the real paper has ${count}.

## Language level
Stay inside what a ${level.cefr} child knows. Short sentences. Everyday topics: school, family, animals, food, weather, sport, holidays, the town. Nothing that needs cultural knowledge of one particular country, and nothing frightening.

## Distractors
Wrong options must be wrong for a reason a child can learn from, and must be the same part of speech and roughly the same length as the answer. Never write a silly option: a joke choice turns a three-way question into a two-way guess, and the child learns nothing from eliminating it.

Exactly ONE option may be correct. Check each question again before you finish — two defensible answers makes a question unanswerable.

## The note — this is the most important field
One sentence giving the RULE, not the answer.

Good: "'How many' asks for a number."
Good: "'So small that...' shows the reason for what happened next."
Bad: "The answer is two." — that teaches nothing.
Bad: "Because it is correct." — that is not a rule.

The test is simple: would this sentence help on a *different* question of the same type? If not, rewrite it.

## Spelling
Every answer must be spelled correctly, in British English. Spelling is something the exam actually tests.`;
}

export async function generatePracticeSet({
  levelSlug,
  paper,
  part,
  kind,
  count,
  task,
  topicHint,
  avoid = [],
}: {
  levelSlug: "starters" | "movers" | "flyers";
  paper: "listening" | "reading-writing";
  part: number;
  kind: ItemKind;
  count: number;
  task: string;
  topicHint?: string;
  /** Titles already in the library, so a batch does not repeat itself. */
  avoid?: string[];
}): Promise<{ set: Omit<PracticeSet, "id">; model: string }> {
  const level = levelBySlug(levelSlug);
  if (!level) throw new Error(`Unknown level: ${levelSlug}`);

  const prompt = [
    topicHint?.trim()
      ? `Write one set, on the topic of: ${topicHint.trim()}`
      : "Write one set.",
    avoid.length > 0 ? `Do not reuse these topics:\n${avoid.join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const { data, model } = await generateJson({
    schema: GeneratedSet,
    system: buildSystem(level, part, kind, task, count),
    prompt,
    // Enough variety that twenty sets are not all about the zoo, but not so
    // much that the level slips.
    temperature: 0.9,
    // Thinking tokens count toward this, and a truncated response is
    // unparseable JSON rather than a short set — at 4000 the larger parts
    // (Flyers part 4 is ten questions plus a passage plus ten notes) were
    // failing on length alone, which looked like a model problem and was not.
    maxOutputTokens: 10_000,
  });

  const problems = validate(data, kind, count);
  if (problems.length > 0) {
    throw new Error(`Generated set rejected: ${problems.join("; ")}`);
  }

  const needsOptions = kind === "dialogue-choice" || kind === "dialogue-match" || kind === "option-gap";

  return {
    model,
    set: {
      level: levelSlug,
      paper,
      part,
      kind,
      title: data.title,
      instruction: task,
      passage: data.passage?.trim() ? data.passage : undefined,
      wordBox: data.wordBox?.length ? data.wordBox : undefined,
      questions: data.questions.map((q, i) => ({
        id: `q${i + 1}`,
        prompt: q.prompt,
        answer: q.answer,
        options: needsOptions ? q.options.map((o) => o.text) : undefined,
        note: q.note,
      })),
    },
  };
}

/**
 * The checks the prompt asks for, enforced.
 *
 * A model that has been told three times to produce exactly five questions
 * will still occasionally produce six, and a set with the wrong count is not
 * practice for the real part. Rejecting costs one retry; publishing costs a
 * child's trust in the material.
 */
function validate(data: GeneratedSetData, kind: ItemKind, count: number): string[] {
  const problems: string[] = [];

  if (data.questions.length !== count) {
    problems.push(`expected ${count} questions, got ${data.questions.length}`);
  }

  const needsOptions = kind === "dialogue-choice" || kind === "dialogue-match" || kind === "option-gap";
  const needsPassage = kind === "word-box" || kind === "option-gap" || kind === "missing-word";

  if (needsPassage) {
    const gaps = (data.passage.match(/___/g) ?? []).length;
    if (gaps !== data.questions.length) {
      problems.push(`passage has ${gaps} gaps for ${data.questions.length} questions`);
    }
  }

  if (kind === "word-box") {
    const box = data.wordBox.map((w) => w.toLowerCase());
    const missing = data.questions.filter((q) => !box.includes(q.answer.toLowerCase()));
    if (missing.length > 0) problems.push(`${missing.length} answer(s) not in the word box`);
    if (data.wordBox.length <= data.questions.length) {
      problems.push("word box has no distractors");
    }
  }

  data.questions.forEach((q, i) => {
    if (!q.note?.trim()) problems.push(`q${i + 1} has no note`);

    if (needsOptions) {
      const correct = q.options.filter((o) => o.isCorrect);
      if (correct.length !== 1) {
        problems.push(`q${i + 1} has ${correct.length} correct options`);
      }
      if (q.options.length < 3) problems.push(`q${i + 1} has only ${q.options.length} options`);
      if (correct[0] && correct[0].text.trim() !== q.answer.trim()) {
        problems.push(`q${i + 1}: answer does not match the option marked correct`);
      }
      // Duplicates make one option unpickable and the question ambiguous.
      const seen = new Set(q.options.map((o) => o.text.trim().toLowerCase()));
      if (seen.size !== q.options.length) problems.push(`q${i + 1} has duplicate options`);
    }
  });

  return problems;
}
