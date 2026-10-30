"use server";

import { storyById } from "../../../content/yle-stories";
import { gradeStory, MAX_STORY_CHARS, MIN_STORY_CHARS, type StoryVerdict } from "./story";

export type StoryResult =
  | { ok: true; verdict: StoryVerdict }
  | { ok: false; error: "tooShort" | "tooLong" | "notFound" | "service" };

/**
 * Marks one story.
 *
 * The prompt and its three moments are re-read from the catalogue by id — the
 * client sends only the id and the child's text, so a modified payload cannot
 * feed the marker an easier task than the one on screen.
 *
 * Nothing is stored yet. YLE practice is deliberately open to anyone without
 * an account, and the attempt tables are blocked behind a stale PostgREST
 * schema cache; saving is what an account will buy once both are resolved.
 */
export async function submitStory(input: {
  promptId: string;
  text: string;
}): Promise<StoryResult> {
  const text = input.text.trim();

  if (text.length < MIN_STORY_CHARS) return { ok: false, error: "tooShort" };
  if (text.length > MAX_STORY_CHARS) return { ok: false, error: "tooLong" };

  const prompt = storyById(input.promptId);
  if (!prompt) return { ok: false, error: "notFound" };

  try {
    const { verdict } = await gradeStory({
      title: prompt.title,
      moments: [...prompt.moments],
      childText: text,
    });
    return { ok: true, verdict };
  } catch (error) {
    console.error("[yle] story marking failed:", error);
    return { ok: false, error: "service" };
  }
}
