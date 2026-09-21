import { z } from "zod";
import { MOODS, MOTIFS, PALETTES, PROPS } from "./art";

/**
 * The contract between the model, the database and the player UI.
 *
 * Everything is required and there are no discriminated unions: Gemini's
 * structured-output support covers a subset of JSON Schema, and a flat,
 * fully-required shape is the one that comes back reliably. `interaction` uses
 * a `kind` field with both payloads always present — for a "reveal" the
 * `choices` array is empty, for a "choice" `revealAnswer` is an empty string.
 */

const Choice = z.object({
  text: z.string().describe("The answer as a child would read it. Under 12 words."),
  isCorrect: z.boolean(),
  feedback: z
    .string()
    .describe(
      "One warm sentence shown after picking this. Never says 'wrong' — explains gently.",
    ),
});

const SceneArt = z.object({
  palette: z.enum(PALETTES),
  motif: z.enum(MOTIFS).describe("The single clearest symbol for this scene."),
  props: z.array(z.enum(PROPS)).min(1).max(3),
  mood: z.enum(MOODS),
});

const Interaction = z.object({
  kind: z
    .enum(["reveal", "choice"])
    .describe(
      "'reveal' hides a fact behind a tap. 'choice' asks a quick question with 2-3 options.",
    ),
  prompt: z.string().describe("The question or teaser. One short sentence."),
  revealAnswer: z
    .string()
    .describe("For kind='reveal', the fact revealed on tap. Empty string for 'choice'."),
  choices: z
    .array(Choice)
    .max(3)
    .describe("For kind='choice', 2-3 options with exactly one correct. Empty for 'reveal'."),
});

const Scene = z.object({
  id: z.string().describe("Short kebab-case id, unique within the storyboard."),
  title: z.string().describe("A punchy scene title, 2-5 words."),
  narration: z
    .string()
    .describe(
      "2-4 very short sentences a 7-11 year old can read aloud. Simple words, warm voice.",
    ),
  art: SceneArt,
  imagePrompt: z
    .string()
    .describe(
      "A one-sentence illustration brief for a future image model. Friendly cartoon style, no text in image.",
    ),
  interaction: Interaction,
});

const QuizQuestion = z.object({
  id: z.string().describe("Short kebab-case id, unique within the quiz."),
  question: z.string().describe("One clear question answerable from the scenes."),
  hint: z.string().describe("A gentle nudge shown if the child asks for help."),
  options: z
    .array(Choice)
    .min(2)
    .max(4)
    .describe("2-4 options with exactly one correct."),
  /**
   * Keystone questions ask the child to explain themselves. Deliberately rationed:
   * demanding a justification for every answer exhausts an eight-year-old, and an
   * exhausted child stops writing anything worth reading.
   */
  defend: z
    .boolean()
    .default(false)
    .describe(
      "True for exactly 2 questions in the quiz — the ones where the reasoning matters more than the fact.",
    ),
  defendPrompt: z
    .string()
    .default("")
    .describe(
      "For defend=true, the question that asks them to explain their thinking, e.g. 'What made you pick that one?'. Empty string when defend is false.",
    ),
});

export const StoryboardSchema = z.object({
  title: z.string().describe("Kid-friendly lesson title, under 8 words."),
  hook: z.string().describe("One sentence that makes a child want to start."),
  bigIdea: z
    .string()
    .describe("The single thing to remember, in one child-sized sentence."),
  heroEmoji: z.string().describe("One emoji that represents the subject."),
  scenes: z.array(Scene).min(4).max(7),
  glossary: z
    .array(
      z.object({
        word: z.string(),
        kidDefinition: z.string().describe("Explained in under 15 simple words."),
      }),
    )
    .min(2)
    .max(5),
  quiz: z.array(QuizQuestion).min(3).max(6),
  celebration: z.object({
    headline: z.string().describe("Cheerful congratulations, under 8 words."),
    funFact: z.string().describe("One surprising, true detail from the source text."),
  }),
});

export type Storyboard = z.infer<typeof StoryboardSchema>;
export type StoryScene = Storyboard["scenes"][number];
export type StoryChoice = z.infer<typeof Choice>;
export type QuizItem = Storyboard["quiz"][number];

/**
 * Parses a storyboard read back out of the database. Returns null if invalid.
 *
 * Accepts either shape: Postgres `jsonb` comes back already decoded, while a
 * string may still arrive from a fixture or an older row.
 */
export function parseStoryboard(raw: unknown): Storyboard | null {
  if (raw == null) return null;
  try {
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    const result = StoryboardSchema.safeParse(value);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
