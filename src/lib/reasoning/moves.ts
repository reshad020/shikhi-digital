/**
 * The closed vocabulary of thinking moves the grader may report.
 *
 * These are the atoms of the whole product: progression, the parent report's
 * "one skill climbing, one being avoided", and eventually the Thinking Levels
 * all read from this list. Keep it small enough that a parent can understand
 * every entry without a glossary.
 *
 * Adding a move is safe. Removing one breaks stored attempts, so retire in the
 * UI rather than deleting.
 */

/** Moves that show reasoning happening. */
export const STRONG_MOVES = [
  "gave-evidence",
  "spotted-assumption",
  "considered-alternative",
  "used-scale",
  "questioned-source",
  "admitted-uncertainty",
  "made-connection",
  // Trained by Steelman Arena, and only there. The top rank is named after
  // this move, so the ladder was incoherent without a way to earn it.
  "steelmanned",
] as const;

/** Moves that show reasoning being skipped. Not failures — just the next thing to teach. */
export const WEAK_MOVES = ["restated-answer", "guessed", "appealed-to-authority"] as const;

export const THINKING_MOVES = [...STRONG_MOVES, ...WEAK_MOVES] as const;

export type ThinkingMove = (typeof THINKING_MOVES)[number];
export type StrongMove = (typeof STRONG_MOVES)[number];

export const MOVE_HINTS: Record<ThinkingMove, string> = {
  "gave-evidence": "pointed at something specific from the story as support",
  "spotted-assumption": "noticed something the question took for granted",
  "considered-alternative": "offered another explanation that would also fit",
  "used-scale": "reasoned with a number, a size, a duration or a comparison",
  "questioned-source": "asked who said it, or how anyone could know",
  "admitted-uncertainty": "said honestly which part they were unsure about",
  "made-connection": "linked this to something else they know",
  "steelmanned": "argued the other side's case as well as someone who believes it would",
  "restated-answer": "repeated the answer in different words without a reason",
  "guessed": "said outright that they guessed, or gave no reason at all",
  "appealed-to-authority": "relied only on someone saying so, with nothing else",
};

/** Shown to the child and in the parent report. Plain language, no jargon. */
export const MOVE_LABELS: Record<ThinkingMove, string> = {
  "gave-evidence": "Gave evidence",
  "spotted-assumption": "Spotted an assumption",
  "considered-alternative": "Thought of another explanation",
  "used-scale": "Reasoned with numbers",
  "questioned-source": "Questioned the source",
  "admitted-uncertainty": "Was honest about doubt",
  "made-connection": "Connected two ideas",
  "steelmanned": "Argued the other side",
  "restated-answer": "Restated the answer",
  "guessed": "Guessed",
  "appealed-to-authority": "Relied on who said it",
};

export function isStrongMove(move: string): move is StrongMove {
  return (STRONG_MOVES as readonly string[]).includes(move);
}
