import { StoryboardSchema, type Storyboard } from "./schema";
import { buildSystemInstruction, buildUserPrompt } from "./prompt";
import { generateJson } from "@/lib/gemini";
import type { Locale } from "@/i18n/routing";

export { AiError as StoryboardError, DEFAULT_MODEL } from "@/lib/gemini";

export type GenerateResult = { storyboard: Storyboard; model: string };

export async function generateStoryboard({
  subject,
  sourceText,
  locale,
}: {
  subject: string;
  sourceText: string;
  locale: Locale;
}): Promise<GenerateResult> {
  const { data, model } = await generateJson({
    schema: StoryboardSchema,
    system: buildSystemInstruction(locale),
    prompt: buildUserPrompt(subject, sourceText),
    // Warm and varied rather than clinical, but still on-schema.
    temperature: 0.85,
    maxOutputTokens: 16000,
  });

  return { storyboard: data, model };
}
