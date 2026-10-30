import "server-only";

import { serveFromPool, type Level, type Served } from "@/lib/pool/serve";
import { CueSchema, generateCue, type SpeakingCue } from "./cue";

/**
 * Names the payload schema inside `content_pool`. Changing this string orphans
 * every row already stored under the old one, so don't.
 */
export const CUE_KIND = "cue-card";

/**
 * One speaking task for this child, at this level.
 *
 * The whole pool/generate decision lives in `serveFromPool`; all this layer
 * owns is which schema and which prompt belong to speaking. That is the shape
 * every other skill should follow when it moves onto the pool -- the day a
 * second skill needs its own copy of the rotation rule, the rule has been put
 * in the wrong place.
 */
export function serveSpeakingCue(opts: {
  childId: string;
  level: Level;
  locale?: string;
  /** Pin a subject area. Omit for anything at this level. */
  topic?: string;
}): Promise<Served<SpeakingCue>> {
  return serveFromPool({
    childId: opts.childId,
    key: {
      skill: "speaking",
      level: opts.level,
      kind: CUE_KIND,
      locale: opts.locale,
      topic: opts.topic,
    },
    schema: CueSchema,
    generate: () => generateCue({ level: opts.level, topicHint: opts.topic }),
  });
}
