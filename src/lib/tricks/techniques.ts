import type { StrongMove } from "@/lib/reasoning/moves";
import { EMPTY_ARTEFACT, type Artefact, type ArtefactKind } from "./types";

/**
 * The closed catalogue of manipulation techniques.
 *
 * This file does double duty by design: it is the vocabulary the puzzle
 * generator picks from, and it is the source content for the public
 * /spot-the-trick pages (SEO_PLAN hub C). Named techniques are the opening in
 * that hub — Common Sense Media and Nat Geo own "how to spot fake news", but
 * nobody owns "truncated y axis" as a page a child can understand.
 *
 * Prose lives here rather than in a CMS because each entry is also a schema.org
 * definition and an answer-engine quote target. Structure in code, prose in
 * review.
 */

export type Technique = {
  slug: string;
  /** Shown in the game and as the H1 of the public page. */
  label: string;
  /** One sentence, quotable standalone. GEO citability rule 2. */
  definition: string;
  /** The question a child should learn to ask. */
  askYourself: string;
  /** 2-4 concrete checks. Renders as the ordered list on the public page. */
  howToSpot: string[];
  /** Why it works on people — the bit listicles leave out. */
  whyItWorks: string;
  /** Which artefact kinds this technique can be demonstrated with. */
  kinds: ArtefactKind[];
  proves: StrongMove;
  /** A worked example, shown on the public page. Hand-written and checked. */
  example: Artefact;
};

export const TECHNIQUES: Technique[] = [
  {
    slug: "truncated-axis",
    label: "The chopped-off scale",
    definition:
      "A truncated axis is a chart whose value scale starts somewhere above zero, which makes small differences look enormous.",
    askYourself: "Where does the bottom of this chart start?",
    howToSpot: [
      "Find the lowest number on the side of the chart. If it is not zero, be careful.",
      "Work out the real gap between the bars, using the numbers rather than their heights.",
      "Ask whether that gap would still look dramatic if the chart started at zero.",
    ],
    whyItWorks:
      "People read charts by comparing shapes, not by reading numbers. A bar twice as tall feels twice as big, even when the numbers are almost identical.",
    kinds: ["chart"],
    proves: "used-scale",
    example: {
      ...EMPTY_ARTEFACT,
      kind: "chart",
      title: "Reading scores are collapsing at Hillside School",
      source: "Hillside Parents' Newsletter",
      unit: "%",
      axisStart: 78,
      bars: [
        { label: "2023", value: 82 },
        { label: "2024", value: 81 },
        { label: "2025", value: 80 },
        { label: "2026", value: 79 },
      ],
    },
  },
  {
    slug: "missing-denominator",
    label: "The number with nothing to compare it to",
    definition:
      "A missing denominator is a big-sounding count given without the total it came out of, so there is no way to judge whether it is big at all.",
    askYourself: "Out of how many?",
    howToSpot: [
      "Look for the total. A count on its own — '400 people' — tells you almost nothing.",
      "Turn it into a fraction if you can: 400 out of 500 is very different from 400 out of 4 million.",
      "Check whether two numbers being compared come from groups of the same size.",
    ],
    whyItWorks:
      "Large numbers feel alarming by themselves. Supplying the total takes an extra sentence, and leaving it out is the easiest way to make an ordinary figure sound extraordinary.",
    kinds: ["chart", "headline"],
    proves: "used-scale",
    example: {
      ...EMPTY_ARTEFACT,
      kind: "headline",
      title: "400 pupils caught using AI to write homework",
      source: "The Daily Register",
      standfirst: "Schools across the county are said to be struggling.",
      body: "The figure covers every secondary school in the county across a full academic year. The county has 61,000 secondary pupils.",
    },
  },
  {
    slug: "linked-to-headlines",
    label: '"Linked to"',
    definition:
      "A 'linked to' headline reports that two things were found together and lets the reader assume one caused the other.",
    askYourself: "Did it say caused, or did it say linked?",
    howToSpot: [
      "Watch for the words linked to, associated with, tied to, and connected to.",
      "Ask whether something else could explain both things at once.",
      "Check whether anyone actually tested the cause, or only counted what happened.",
    ],
    whyItWorks:
      "Our minds build stories out of sequences. Two facts placed side by side turn into cause and effect on their own, without the headline ever having to claim it.",
    kinds: ["headline"],
    proves: "considered-alternative",
    example: {
      ...EMPTY_ARTEFACT,
      kind: "headline",
      title: "Eating breakfast linked to better exam results",
      source: "Morning Health News",
      standfirst: "Researchers followed 3,000 teenagers for a year.",
      body: "The study counted who ate breakfast and who did well in exams. It did not change anyone's breakfast to find out what would happen.",
    },
  },
  {
    slug: "loaded-questions",
    label: "The question that pushes",
    definition:
      "A loaded question is worded so that one answer feels obviously right, which means the result was decided before anyone was asked.",
    askYourself: "Could I disagree with this without sounding unreasonable?",
    howToSpot: [
      "Read the question as if you held the opposite view. Does it insult you?",
      "Look for words that carry a judgement: unfair, wasteful, sensible, dangerous.",
      "Check whether the options cover what people actually think, or only two extremes.",
    ],
    whyItWorks:
      "Most people want to give an agreeable answer. A question that makes one side sound foolish collects the result its author wanted and still gets to be called a survey.",
    kinds: ["survey"],
    proves: "spotted-assumption",
    example: {
      ...EMPTY_ARTEFACT,
      kind: "survey",
      title: "Should the council keep wasting your parents' money on the empty new cycle lane?",
      source: "Riverton Community Poll",
      options: ["No, stop the waste", "Yes, keep wasting it"],
    },
  },
  {
    slug: "cherry-picked-window",
    label: "The carefully chosen time",
    definition:
      "A cherry-picked window is a chart showing only the stretch of time that supports the point, with the rest cut away.",
    askYourself: "What happened just before this chart begins?",
    howToSpot: [
      "Look at the first and last dates. Is it an odd, specific stretch?",
      "Ask why it starts there — a starting point is a choice somebody made.",
      "Look for the longest version of the same data you can find.",
    ],
    whyItWorks:
      "Almost any trend can be found inside a long enough record. Choosing where to begin is the quietest way to change a story without stating a single false fact.",
    kinds: ["chart"],
    proves: "questioned-source",
    example: {
      ...EMPTY_ARTEFACT,
      kind: "chart",
      title: "Ice cream sales are falling fast",
      source: "Seaside Traders Association",
      unit: "k",
      axisStart: 0,
      bars: [
        { label: "Aug", value: 42 },
        { label: "Sep", value: 30 },
        { label: "Oct", value: 18 },
        { label: "Nov", value: 9 },
      ],
    },
  },
  {
    slug: "scary-headline",
    label: "The headline the article does not support",
    definition:
      "A mismatched headline promises something far more dramatic than anything the article underneath actually says.",
    askYourself: "Does the story prove what the headline claimed?",
    howToSpot: [
      "Read past the headline before deciding what you think.",
      "Look for hedging words further down: may, might, could, in some cases.",
      "Ask whether the headline reports what happened or what someone worries might happen.",
    ],
    whyItWorks:
      "Headlines are written to be clicked and are often written by someone other than the reporter. Most people share them without reading further, so the headline becomes the story.",
    kinds: ["headline"],
    proves: "questioned-source",
    example: {
      ...EMPTY_ARTEFACT,
      kind: "headline",
      title: "Common playground game could be banned within weeks",
      source: "Evening Bulletin",
      standfirst: "Parents demand answers.",
      body: "One school has asked pupils not to play the game at lunchtime while a broken fence is repaired. No council or government has proposed any ban.",
    },
  },
];

export const TECHNIQUE_SLUGS = TECHNIQUES.map((t) => t.slug);

export function getTechnique(slug: string) {
  return TECHNIQUES.find((t) => t.slug === slug) ?? null;
}

export function techniquesFor(kind: ArtefactKind) {
  return TECHNIQUES.filter((t) => t.kinds.includes(kind));
}
