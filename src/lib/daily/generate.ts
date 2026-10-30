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

**Both claims must be written in the same voice.** This is the rule most often broken, and breaking it quietly ruins the challenge:

- If one claim credits somebody — "experts", "researchers", a named university — then the other must credit somebody too. One sentence saying "Top experts recently reported that..." beside a plain statement of fact can be answered without thinking about the subject at all. The child learns that hedged sentences are false, which is a cue about writing style and transfers to nothing.
- The same goes for hedges: recently, reportedly, apparently, is believed to. Either both claims have them or neither does.
- Keep the two within a few words of the same length.

When the tell is \`vague-authority\` or \`no-source\`, the honest contrast is **vague attribution against specific attribution**: the false claim says "scientists have found", the true claim says "a 2019 study at the University of Exeter found". Not one with a source and one without.

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
  avoidTells = [],
}: {
  locale: Locale;
  count: number;
  /**
   * Tells already leaned on in this run.
   *
   * Left alone a batch settles on two or three favourites, and a child who
   * meets five challenges running whose answer is "vague-authority" has
   * learned the shape of our questions rather than how to check a claim.
   */
  avoidTells?: string[];
  /** Recent true claims, so a batch does not repeat what is already scheduled. */
  avoid: string[];
}): Promise<{ challenges: Challenge[]; model: string }> {
  const avoidBlock = avoid.length
    ? `\n\nDo not reuse or closely paraphrase any of these facts already scheduled:\n${avoid
        .map((a) => `- ${a}`)
        .join("\n")}`
    : "";

  const tellBlock = avoidTells.length
    ? `\n\nThese tells have come up a lot already. Use different ones here:\n${avoidTells
        .map((t) => `- ${t}`)
        .join("\n")}`
    : "";

  const { data, model } = await generateJson({
    schema: BatchSchema,
    system: buildSystem(locale),
    prompt: `Write ${count} Fake or Real challenges, each on a different subject, and each using a different tell.${avoidBlock}${tellBlock}`,
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
