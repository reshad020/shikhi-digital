import { z } from "zod";
import { generateJson } from "@/lib/gemini";
import { locales, type Locale } from "@/i18n/routing";

/**
 * Writes a passage meant to be *heard*, not read.
 *
 * That distinction drives every constraint below. Text written for the eye
 * leans on paragraphs, parentheses and long subordinate clauses — a listener
 * has none of those, cannot scan back, and loses the thread the moment a
 * sentence nests three levels deep. So the generator is pushed towards short
 * sentences, concrete nouns, and one idea at a time.
 *
 * The two questions are deliberately different kinds. Recall alone is a memory
 * test; inference alone is unanswerable if you missed the facts. Together they
 * separate "did not hear it" from "heard it but did not think about it", which
 * is exactly the distinction a parent cannot make from a score.
 */

const Option = z.object({
  text: z.string().describe("Short enough to hold in your head after hearing the passage."),
  isCorrect: z.boolean(),
  feedback: z.string().describe("One warm sentence. Never the words wrong, incorrect or no."),
});

const PassageSchema = z.object({
  title: z.string().describe("Four words or fewer. Shown only AFTER listening."),
  topic: z.string().describe("Two or three words for the card, e.g. 'Ocean animals'."),
  transcript: z
    .string()
    .describe(
      "120-900 characters of spoken-style prose. Short sentences, concrete nouns, one idea at a time. No headings, no lists, no parentheses, no numerals written as digits.",
    ),
  recallQuestion: z.string().describe("Something stated plainly in the passage."),
  recallOptions: z.array(Option).min(3).max(3),
  inferenceQuestion: z
    .string()
    .describe("Something the passage implies but never states. Answerable only by thinking."),
  inferenceOptions: z.array(Option).min(3).max(3),
  defendPrompt: z
    .string()
    .describe("One short question asking the child why they chose their inference answer."),
});

export type PassageDraft = z.infer<typeof PassageSchema>;

function buildSystem(locale: Locale) {
  const language = locales.find((l) => l.code === locale)?.label ?? "English";

  return `You write short passages to be READ ALOUD to a child between 8 and 13, who will hear them once or twice with no text on screen.

Write everything in ${language}.

## Writing for the ear
A listener cannot scan back, cannot see punctuation, and loses a sentence that nests. So:
- Short sentences. One idea each.
- Concrete nouns and strong verbs. Avoid abstractions a listener must hold open.
- No parentheses, no bullet points, no headings, no subheadings.
- Spell numbers as words ("twenty-seven", not "27") — a speech engine reads digits unevenly.
- No "firstly / secondly / in conclusion". That is essay furniture, not speech.
- Name a thing before you say something about it. "The octopus has three hearts" is easy; "Three hearts, which the octopus has," is not.

Read your draft back in your head at speaking pace. If you lose the thread, a child will.

## Subject matter
Real and surprising: animals, space, how ordinary things work, history that turns on one decision, how people figured something out. Something a child would repeat at dinner.

Avoid anything frightening, anything about a child's own family circumstances, and anything requiring prior knowledge of a specific country's schooling.

## recallQuestion
Answerable directly from the passage, by someone who was paying attention. Not a trick, not a detail nobody would retain — the kind of thing a person who listened would simply know.

## inferenceQuestion
The important one. It must be answerable ONLY by thinking about what was said, and the answer must NOT appear in the passage. Good inference questions ask why something happened, what it suggests, or what would follow. A child who merely memorised the words cannot answer it.

Each question gets exactly three options: one right, two that a thoughtful child could plausibly pick. Never make the wrong options silly — a joke option means the question is really a two-way guess.

## feedback
One warm sentence per option, spoken to the child, saying what their choice shows rather than marking it. Never use the words "wrong", "incorrect" or "no".

## defendPrompt
One short question asking why they chose their answer to the inference question. It is handed to a grader that reads their reasoning, so it must invite a reason rather than a restatement.`;
}

export async function generatePassage({
  locale,
  topicHint,
  avoid = [],
}: {
  locale: Locale;
  topicHint?: string;
  /** Titles already in the catalogue, so a batch does not repeat itself. */
  avoid?: string[];
}): Promise<{ draft: PassageDraft; model: string }> {
  const parts = [
    topicHint?.trim()
      ? `Write one passage, somewhere in the area of: ${topicHint.trim()}`
      : "Write one passage.",
    avoid.length > 0 ? `Do not write about any of these again:\n${avoid.join("\n")}` : "",
  ].filter(Boolean);

  const { data, model } = await generateJson({
    schema: PassageSchema,
    system: buildSystem(locale),
    prompt: parts.join("\n\n"),
    // Higher than the graders: twenty passages about octopuses is the failure
    // mode here, and variety is worth some inconsistency.
    temperature: 1,
    maxOutputTokens: 3000,
  });

  return { draft: data, model };
}
