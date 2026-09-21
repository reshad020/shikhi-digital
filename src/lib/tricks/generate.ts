import { z } from "zod";
import { generateJson } from "@/lib/gemini";
import { locales, type Locale } from "@/i18n/routing";
import { TECHNIQUES, type Technique } from "./techniques";

const ArtefactSchema = z.object({
  kind: z.enum(["chart", "headline", "survey"]),
  title: z.string().describe("Chart title, headline text, or the survey question."),
  source: z.string().describe("A made-up but plausible outlet or organisation name."),
  bars: z
    .array(z.object({ label: z.string(), value: z.number() }))
    .max(4)
    .describe("For kind='chart', 3-4 bars. Empty array otherwise."),
  axisStart: z
    .number()
    .describe(
      "For kind='chart', where the value scale starts. Use a number well above the lowest bar ONLY when the technique is the chopped-off scale; otherwise 0.",
    ),
  unit: z.string().describe("Short unit such as % or k. Empty when not a chart."),
  standfirst: z.string().describe("For kind='headline', the subheading. Empty otherwise."),
  body: z
    .string()
    .describe(
      "For kind='headline', 1-2 sentences of article text that quietly reveal the trick. Empty otherwise.",
    ),
  options: z
    .array(z.string())
    .max(4)
    .describe("For kind='survey', 2-4 answer options. Empty otherwise."),
});

const PuzzleSchema = z.object({
  artefact: ArtefactSchema,
  explanation: z
    .string()
    .describe(
      "Two short sentences to the child: what the trick did here, and what the honest version would show.",
    ),
});

export type GeneratedPuzzle = z.infer<typeof PuzzleSchema>;

function buildSystem(technique: Technique, locale: Locale) {
  const language = locales.find((l) => l.code === locale)?.label ?? "English";

  return `You invent a realistic-looking artefact — a chart, a news headline, or a survey question — that demonstrates ONE specific manipulation technique, for children aged 8 to 13 to examine.

Write every learner-facing string in ${language}.

## The technique to demonstrate
**${technique.label}** — ${technique.definition}

Why it works: ${technique.whyItWorks}

## Rules
- The artefact must look like something a child could genuinely encounter. Invent the outlet or organisation name; never use a real one, and never name a real person.
- The trick must be **present in the data**, not described in words. A chart with a chopped-off scale must actually have a high axisStart. A headline using "linked to" must actually contain those words.
- Do not label, hint at, or explain the trick inside the artefact itself. The child is supposed to find it.
- Keep the subject light: school, animals, sport, weather, food, screen time. Never politics, illness, disaster or anything frightening.
- Numbers must be internally consistent. If bars are labelled by year, use consecutive years.

## kind
Use one of: ${technique.kinds.join(", ")}.

## Unused fields
Set every field that does not apply to this kind to an empty string, an empty array, or 0. Never omit a field.

## explanation
Two short sentences, warm and plain: what this artefact did, and what an honest version would have shown instead. Never say "wrong". Never scold the reader for being fooled.`;
}

export async function generatePuzzle({
  technique,
  locale,
}: {
  technique: Technique;
  locale: Locale;
}): Promise<{ puzzle: GeneratedPuzzle; options: string[]; model: string }> {
  const { data, model } = await generateJson({
    schema: PuzzleSchema,
    system: buildSystem(technique, locale),
    prompt: `Invent one artefact demonstrating "${technique.label}".`,
    temperature: 0.95,
    maxOutputTokens: 4000,
  });

  // Distractors are chosen here rather than by the model: it has no reason to
  // pick ones that are genuinely wrong, and an ambiguous option set makes a
  // correct answer feel like a mistake.
  const distractors = TECHNIQUES.filter((t) => t.slug !== technique.slug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((t) => t.slug);

  const options = [technique.slug, ...distractors].sort(() => Math.random() - 0.5);

  return { puzzle: data, options, model };
}
