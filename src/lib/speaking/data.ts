import "server-only";

import type { Level } from "@/lib/pool/serve";
import { LEVELS } from "@/lib/pool/serve";
import { serveSpeakingCue } from "./serve";

/**
 * Which rung to serve a child who has never been placed.
 *
 * Deliberately a flat default rather than a guess from `birth_year`. Age is a
 * poor proxy for English level in a second-language learner -- two twelve year
 * olds can sit three rungs apart -- and the two failure modes are not
 * symmetrical. Too easy is mildly boring and corrects itself within a session.
 * Too hard, on the skill a learner is already nervous about, is how a child
 * decides speaking is not for them.
 *
 * Replaced by the onboarding placement when that lands; nothing else needs to
 * change when it does.
 */
export const DEFAULT_LEVEL: Level = "a1";

export function isLevel(value: string | undefined): value is Level {
  return !!value && (LEVELS as readonly string[]).includes(value);
}

/** The next speaking cue for this child, from the shared pool. */
export function nextCue(childId: string, level: Level = DEFAULT_LEVEL, locale = "en") {
  return serveSpeakingCue({ childId, level, locale });
}
