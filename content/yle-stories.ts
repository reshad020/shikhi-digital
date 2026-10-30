/**
 * Flyers Part 7 story prompts.
 *
 * The real paper gives three pictures. These give three moments in words,
 * which is an honest adaptation rather than a reproduction — and the practice
 * page says so, because a child should know which half of the task they are
 * rehearsing.
 *
 * Each arc is chosen so the middle moment contains a *problem*. Without one, a
 * child writes three sentences that happen in sequence and never writes a
 * story, which is exactly what Part 7 is marking.
 */

export type StoryPrompt = {
  id: string;
  title: string;
  /** Beginning, middle, end. The middle always carries the trouble. */
  moments: [string, string, string];
  /** Shown before writing: the shape of a good answer, never the words. */
  tip: string;
};

export const STORY_PROMPTS: StoryPrompt[] = [
  {
    id: "the-old-key",
    title: "The Old Key",
    moments: [
      "Ravi is digging in the garden and finds a small rusty key.",
      "He tries the key in the door of the old shed, but it will not turn.",
      "His grandmother comes outside and tells him what the key really opens.",
    ],
    tip: "Say what Ravi felt, not only what he did. One feeling word changes a list into a story.",
  },
  {
    id: "the-wrong-bag",
    title: "The Wrong Bag",
    moments: [
      "Lena gets off the bus and realises she is carrying someone else's bag.",
      "Inside the bag there is a lunchbox, a book, and a photograph of a dog.",
      "The next morning she finds the owner.",
    ],
    tip: "Use a time word to move between the moments: then, after that, the next morning.",
  },
  {
    id: "the-noise-upstairs",
    title: "The Noise Upstairs",
    moments: [
      "Tom is doing his homework when he hears a loud noise above him.",
      "He goes upstairs slowly and sees that the window is open.",
      "A bird is sitting on the lamp, and Tom has to get it out.",
    ],
    tip: "Keep it in the past: heard, went, saw. Mixing in the present is the easiest mark to lose.",
  },
  {
    id: "the-last-ticket",
    title: "The Last Ticket",
    moments: [
      "Amara runs to the cinema and buys the very last ticket.",
      "When she sits down, she sees her best friend outside with no ticket.",
      "Amara decides what to do.",
    ],
    tip: "The ending needs to answer the middle. What she decides is the whole story.",
  },
];

export function storyById(id: string) {
  return STORY_PROMPTS.find((s) => s.id === id) ?? null;
}
