/**
 * YLE practice items.
 *
 * Every type here is **objectively scorable**: the answer is a word from a
 * fixed set, or an exact string, and marking needs no model. That is not a
 * limitation, it is the design — the whole of YLE Reading & Writing except the
 * Flyers story task is marked this way by Cambridge too, and building it any
 * other way would make practice slow, expensive and unavailable whenever an
 * API is down.
 *
 * Answers are compared with `normalise`, which is deliberately forgiving about
 * case, spacing and surrounding punctuation and deliberately strict about
 * spelling. Spelling is a thing the exam actually tests; accepting "freind"
 * would quietly teach a child that it passes.
 */

export type ItemKind =
  | "spelling" // Starters R&W 3 — letters jumbled, spell the word
  | "word-box" // Starters 4, Movers 3, Flyers 3 — one word box, several gaps
  | "dialogue-choice" // Movers R&W 2 — pick A/B/C reply
  | "dialogue-match" // Flyers R&W 2 — pick from a longer list of replies
  | "option-gap" // Movers 4, Flyers 4 — three options per gap
  | "definition" // Flyers R&W 1 — write the word from its meaning
  | "missing-word"; // Flyers R&W 6 — write the missing word, no options

export type Question = {
  id: string;
  /** The sentence, line of dialogue, or definition. `___` marks the gap. */
  prompt: string;
  /** The accepted answer. Compared after `normalise`. */
  answer: string;
  /** Extra answers that are also right, e.g. a/an, or a common variant. */
  alsoAccept?: string[];
  /** For the choice kinds only. Must contain `answer`. */
  options?: string[];
  /** Shown after answering, win or lose. Never says "wrong". */
  note: string;
};

export type PracticeSet = {
  id: string;
  level: "starters" | "movers" | "flyers";
  paper: "listening" | "reading-writing";
  /** Which part of that paper this set rehearses. */
  part: number;
  kind: ItemKind;
  title: string;
  /** The instruction, phrased the way the exam phrases it. */
  instruction: string;
  /** Shared text for gap-fill sets. `___` marks each gap, in order. */
  passage?: string;
  /** The word box, for `word-box`. Includes distractors, as the exam does. */
  wordBox?: string[];
  questions: Question[];
};

/**
 * Forgiving about presentation, strict about spelling.
 *
 * Trailing full stops, stray spaces and capitals are not what is being tested
 * and marking them wrong teaches a child to distrust answers they got right.
 */
export function normalise(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"]+$/g, "")
    .replace(/\s+/g, " ");
}

export function isCorrect(question: Question, given: string) {
  const got = normalise(given);
  if (!got) return false;
  if (got === normalise(question.answer)) return true;
  return (question.alsoAccept ?? []).some((a) => normalise(a) === got);
}

/** Letters for a spelling question, shuffled deterministically from the id. */
export function jumble(word: string, seed: string) {
  const letters = word.toLowerCase().split("");
  // A fixed shuffle per question: a render-time random would reorder the
  // letters on every keystroke, which is unusable.
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  for (let i = letters.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }

  // A jumble that happens to spell the word gives the answer away.
  if (letters.join("") === word.toLowerCase() && letters.length > 1) {
    [letters[0], letters[1]] = [letters[1], letters[0]];
  }
  return letters;
}

/**
 * Bounds for the Flyers Part 7 story.
 *
 * Here rather than beside the grader because the editor needs them too, and
 * `story.ts` is `server-only` — importing it from a client component pulls the
 * whole Gemini client into the browser bundle, which is exactly what that
 * marker exists to prevent.
 */
export const MIN_STORY_CHARS = 40;
export const MAX_STORY_CHARS = 900;
