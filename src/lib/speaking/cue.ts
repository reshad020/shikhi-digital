import { z } from "zod";
import { generateJson } from "@/lib/gemini";
import type { Level } from "@/lib/pool/serve";

/**
 * A speaking turn: one small thing to talk about out loud.
 *
 * Speaking is the skill this product is for and the one a learner avoids, so
 * the activity is shaped to remove every reason not to start. It is short, the
 * subject is concrete, and the child is handed the words before they are asked
 * to speak -- a blank prompt and a microphone is how a shy eleven-year-old
 * decides they are bad at English.
 *
 * The model answer exists for AFTER. Shown first it becomes a script to read,
 * which measures reading; shown afterwards it is the thing a learner compares
 * themselves against and the single most useful part of the exercise.
 */

const CueSchema = z.object({
  title: z.string().describe("Three or four words, for the card. e.g. 'Your best meal'."),
  topic: z.string().describe("Two or three words naming the subject area."),
  prompt: z
    .string()
    .describe("One sentence, addressed to the child, asking them to talk about something."),
  bullets: z
    .array(z.string())
    .min(3)
    .max(3)
    .describe(
      "Three things they could mention, each a short phrase. Scaffolding, not questions to answer in order.",
    ),
  usefulWords: z
    .array(z.string())
    .min(4)
    .max(8)
    .describe("Words or short phrases they are likely to need. Plain forms, no definitions."),
  modelAnswer: z
    .string()
    .describe(
      "What a good answer AT THIS LEVEL sounds like. Spoken English, contractions and all -- not written prose. Shown only after they have spoken.",
    ),
  secondsTarget: z
    .number()
    .int()
    .min(20)
    .max(90)
    .describe("How long they should aim to talk for."),
});

export type SpeakingCue = z.infer<typeof CueSchema>;

/** What a learner at each rung can actually do, in the terms the model needs. */
const LEVEL_BRIEF: Record<Level, string> = {
  "pre-a1":
    "Knows isolated words and a few fixed phrases. Can name things and say 'I like' or 'I have'. Cannot yet join clauses. Target 20-25 seconds and expect single sentences with long pauses. The subject must be something physically in front of them or part of daily life -- family, food, a pet, their room.",
  a1: "Can make simple sentences about familiar things, mostly present tense. Joins with 'and' and 'but'. Target 30 seconds. Subjects stay concrete and personal, but can include a past event if it is simple and recent.",
  a2: "Can tell a short story about something that happened, give a reason with 'because', and compare two things. Handles past and future in simple forms. Target 45 seconds. Can talk about something outside their own day -- a place, a person they admire, a wish.",
  b1: "Can explain an opinion and support it, describe experiences in some detail, and handle a topic they have not rehearsed. Target 60 seconds. Can take a mildly abstract subject -- what makes a good friend, whether something is fair -- as long as it connects to their own life.",
};

function buildSystem(level: Level) {
  return `You write short speaking tasks for a child between 8 and 13 who is learning English as an additional language. They will record themselves answering out loud.

## The learner
${LEVEL_BRIEF[level]}

Pitch everything -- the prompt, the bullets, the words, the model answer -- at exactly that. A task above the level produces silence, and a task below it is boring, and both teach nothing.

## The prompt
One sentence, speaking directly to the child ("Tell me about..."). It must be answerable by any child anywhere: no assumed holidays abroad, no assumed pets, no assumed family shape, no assumed money. "Tell me about a meal you like" works everywhere; "Tell me about your summer holiday" does not.

## The bullets
Three short phrases, each opening a different direction to go in. They are a way out of a blank mind, not a list of questions to answer in turn. Never phrase them as questions.

## usefulWords
The words this specific task needs that a learner at this level may not have ready. Plain dictionary forms, no definitions, no translations. Choose words that unlock the task rather than impressive ones.

## modelAnswer
Spoken English, not written English. Contractions, a false start if it helps it sound real, sentences of the length this level actually produces. It must be achievable by a good learner at this exact rung -- a model answer two levels up is discouraging, which is the opposite of what it is for.

## Subject matter
Everyday and concrete. Avoid anything frightening, anything about family circumstances, money, illness or religion, and anything needing knowledge of one particular country.`;
}

export async function generateCue({
  level,
  topicHint,
  avoid = [],
}: {
  level: Level;
  topicHint?: string;
  /** Titles already in the pool, so a seeding run does not repeat itself. */
  avoid?: string[];
}): Promise<{ data: SpeakingCue; model: string }> {
  const parts = [
    topicHint?.trim()
      ? `Write one speaking task, somewhere in the area of: ${topicHint.trim()}`
      : "Write one speaking task.",
    avoid.length > 0 ? `Do not write about any of these again:\n${avoid.join("\n")}` : "",
  ].filter(Boolean);

  return generateJson({
    schema: CueSchema,
    system: buildSystem(level),
    prompt: parts.join("\n\n"),
    // Variety matters more than consistency here: the failure mode of a
    // content bank is forty cue cards about a favourite animal.
    temperature: 1,
    maxOutputTokens: 2000,
  });
}

export { CueSchema };
