import { generateJson } from "@/lib/gemini";
import { locales, type Locale } from "@/i18n/routing";
import { TELLS, TELL_HINTS } from "./tells";
import { BatchSchema, type Challenge } from "./schema";

function buildSystem(locale: Locale) {
  const language = locales.find((l) => l.code === locale)?.label ?? "English";
  const tells = TELLS.map((t) => `- ${t}: ${TELL_HINTS[t]}`).join("\n");

  return `You write a daily "Fake or Real" challenge for children aged 8 to 13.

Each challenge is two claims. One is true and surprising. One is false but believable. The child picks the false one, then names WHY it is false.

Write every learner-facing string in ${language}.

## The hard part, and the whole point
The false claim must be genuinely difficult to distinguish from the true one. If it is absurd, the child learns to spot silliness rather than to check sources, and the exercise is worthless. Match the two claims in length, tone, subject area and specificity. A reader who did not know the answer should be able to argue for either.

## The true claim
Must be actually true and checkable. Prefer surprising-but-real facts about science, history, animals, space, or how things work. Never anything about a named living person. Never anything a child would find frightening.

## sourceNote
One short phrase naming where the true fact comes from — a field, an organisation, a kind of study. It must be specific enough to be looked up. Never "scientists" or "the internet". This is required: a game about checking claims cannot itself fail to say where its claim came from.

## tell
The single clearest reason the FALSE claim fails, chosen from this fixed list:

${tells}

## distractorTells
Two or three other tells from the same list that genuinely do NOT apply to this false claim. Never include the correct tell. Never pick one that could also arguably be right — an ambiguous set makes a correct answer feel wrong.

## explanation
Two short sentences: why the false claim fails, then what is actually true. Warm, never smug. Do not say "wrong".`;
}

export async function generateChallenges({
  locale,
  count,
  avoid,
}: {
  locale: Locale;
  count: number;
  /** Recent true claims, so a batch does not repeat what is already scheduled. */
  avoid: string[];
}): Promise<{ challenges: Challenge[]; model: string }> {
  const avoidBlock = avoid.length
    ? `\n\nDo not reuse or closely paraphrase any of these facts already scheduled:\n${avoid
        .map((a) => `- ${a}`)
        .join("\n")}`
    : "";

  const { data, model } = await generateJson({
    schema: BatchSchema,
    system: buildSystem(locale),
    prompt: `Write ${count} Fake or Real challenges, each on a different subject.${avoidBlock}`,
    temperature: 0.95,
    maxOutputTokens: 8000,
  });

  // The model is told not to, but a distractor colliding with the answer would
  // make a correct pick score wrong — cheap to enforce rather than trust.
  const challenges = data.challenges.map((c) => ({
    ...c,
    distractorTells: c.distractorTells.filter((t) => t !== c.tell),
  }));

  return { challenges, model };
}
