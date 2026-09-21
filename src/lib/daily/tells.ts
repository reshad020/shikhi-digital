/**
 * The closed vocabulary of "tells" — the reasons a claim turns out to be false.
 *
 * Same pattern as `storyboard/art.ts` and `reasoning/moves.ts`: a fixed list the
 * model chooses from and the UI renders. Naming the tell is the actual learning
 * in Fake or Real; picking the false claim is just the hook.
 *
 * Each tell maps to a thinking move, so a daily 90-second habit feeds the same
 * progression the weekly report reads from.
 */
import type { StrongMove } from "@/lib/reasoning/moves";

export const TELLS = [
  "no-source",
  "vague-authority",
  "too-round-a-number",
  "impossible-scale",
  "too-good-to-be-true",
  "emotional-words",
  "single-example",
  "muddled-cause",
] as const;

export type Tell = (typeof TELLS)[number];

export const TELL_LABELS: Record<Tell, string> = {
  "no-source": "Nobody says where it came from",
  "vague-authority": '"Scientists say" with no name',
  "too-round-a-number": "The number is suspiciously round",
  "impossible-scale": "The size or amount cannot be right",
  "too-good-to-be-true": "It is exactly what someone wants to hear",
  "emotional-words": "It is written to make you feel something",
  "single-example": "One story is treated as proof",
  "muddled-cause": "Two things happening together is called cause",
};

/** Guidance for the generator, so tells are chosen meaningfully rather than at random. */
export const TELL_HINTS: Record<Tell, string> = {
  "no-source": "the claim gives no origin at all — no study, no place, no who",
  "vague-authority": "credits an unnamed group: scientists, experts, doctors",
  "too-round-a-number": "a figure like 'exactly 1 million' where real data is never that tidy",
  "impossible-scale": "a quantity, distance or speed that could not physically be true",
  "too-good-to-be-true": "promises an easy answer to a hard problem",
  "emotional-words": "leans on shocking or frightening wording instead of facts",
  "single-example": "generalises from one anecdote to everyone",
  "muddled-cause": "says one thing caused another when they merely happened together",
};

/** Which thinking move naming this tell demonstrates. */
export const TELL_TO_MOVE: Record<Tell, StrongMove> = {
  "no-source": "questioned-source",
  "vague-authority": "questioned-source",
  "too-round-a-number": "used-scale",
  "impossible-scale": "used-scale",
  "too-good-to-be-true": "spotted-assumption",
  "emotional-words": "spotted-assumption",
  "single-example": "considered-alternative",
  "muddled-cause": "considered-alternative",
};
