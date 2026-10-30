/**
 * The Cambridge Young Learners English syllabus, as data.
 *
 * Three qualifications, each with three papers, each paper with a fixed number
 * of parts and a fixed number of questions. This file is the single source of
 * truth for all of it: the public syllabus pages, the practice picker, the
 * shield scoring and the parent report all read from here, so a change to the
 * exam is one edit rather than a hunt through copy.
 *
 * Figures are from Cambridge's own format pages (verified October 2026):
 *   cambridgeenglish.org/exams-and-tests/qualifications/young-learners/paper/
 *
 * **`practisable` is the important field.** A great deal of YLE is picture
 * work — matching names to people in a big illustration, colouring objects,
 * describing differences between two scenes. This product has no illustration
 * pipeline, so those parts cannot be practised honestly here yet, and pretending
 * otherwise would be worse than saying so. Every part is marked for what it
 * actually needs, and the practice picker only offers what it can really do.
 */

export type PaperKind = "listening" | "reading-writing" | "speaking";

/** What a part needs in order to be practised online. */
export type Needs =
  | "text" // text only — fully practisable today
  | "audio" // spoken passage, no picture — the Listen Close engine covers this
  | "picture" // needs an illustration we cannot yet produce
  | "examiner"; // face-to-face speaking with a person

export type Part = {
  part: number;
  questions: number;
  /** What the child is asked to do, in the exam's own terms. */
  task: string;
  /** What this part is really testing, said plainly for a parent. */
  tests: string;
  needs: Needs;
};

export type Paper = {
  kind: PaperKind;
  /** Minutes, as published. Speaking is a range. */
  minutes: string;
  parts: Part[];
};

export type Level = {
  slug: "starters" | "movers" | "flyers";
  /** The official name, e.g. "A1 Movers". */
  name: string;
  cefr: string;
  /** Cambridge's guidance, kept vague on purpose — it is about level, not age. */
  typicalAges: string;
  blurb: string;
  papers: Paper[];
};

export const LEVELS: Level[] = [
  {
    slug: "starters",
    name: "Pre A1 Starters",
    cefr: "Pre A1",
    typicalAges: "usually 6–8",
    blurb:
      "The first step. Children meet written English, follow simple spoken instructions, and answer questions about themselves.",
    papers: [
      {
        kind: "listening",
        minutes: "about 20",
        parts: [
          {
            part: 1,
            questions: 5,
            task: "Listen and draw a line from each name to the right person in the picture.",
            tests: "Following a description of a person while holding several people in mind.",
            needs: "picture",
          },
          {
            part: 2,
            questions: 5,
            task: "Listen and write a name or a number.",
            tests: "Catching a spelled-out name or a number first time.",
            needs: "audio",
          },
          {
            part: 3,
            questions: 5,
            task: "Listen and tick the right picture, A, B or C.",
            tests: "Choosing between three near-identical options from one short exchange.",
            needs: "picture",
          },
          {
            part: 4,
            questions: 5,
            task: "Listen and colour the objects in the picture.",
            tests: "Holding an instruction about an object and a colour at the same time.",
            needs: "picture",
          },
        ],
      },
      {
        kind: "reading-writing",
        minutes: "20",
        parts: [
          {
            part: 1,
            questions: 5,
            task: "Look at the picture and decide if the sentence is right or wrong.",
            tests: "Reading a sentence closely enough to notice one wrong detail.",
            needs: "picture",
          },
          {
            part: 2,
            questions: 5,
            task: "Write yes or no about a picture.",
            tests: "The same skill again, now with the answer written out.",
            needs: "picture",
          },
          {
            part: 3,
            questions: 5,
            task: "Put the letters in order to spell the word.",
            tests: "Spelling from the wordlist, with the letters in front of you.",
            needs: "text",
          },
          {
            part: 4,
            questions: 5,
            task: "Choose a word from the box to fill each gap.",
            tests: "Reading a short factual text and picking the word that fits.",
            needs: "text",
          },
          {
            part: 5,
            questions: 5,
            task: "Look at the picture story and answer with one word.",
            tests: "Finding the one word that answers a question about a story.",
            needs: "picture",
          },
        ],
      },
      {
        kind: "speaking",
        minutes: "3–5",
        parts: [
          { part: 1, questions: 0, task: "Point at things and put cards on a picture.", tests: "Understanding spoken instructions.", needs: "examiner" },
          { part: 2, questions: 0, task: "Answer questions about a picture and describe objects.", tests: "Naming things and saying where they are.", needs: "examiner" },
          { part: 3, questions: 0, task: "Answer questions about small picture cards.", tests: "Short answers about everyday objects.", needs: "examiner" },
          { part: 4, questions: 0, task: "Answer questions about yourself.", tests: "Talking about your own life in simple sentences.", needs: "examiner" },
        ],
      },
    ],
  },

  {
    slug: "movers",
    name: "A1 Movers",
    cefr: "A1",
    typicalAges: "usually 8–11",
    blurb:
      "The middle step. Children read short stories and factual texts, take down information they hear, and write simple sentences of their own.",
    papers: [
      {
        kind: "listening",
        minutes: "about 25",
        parts: [
          {
            part: 1,
            questions: 5,
            task: "Draw a line from each name to the right person in the big picture.",
            tests: "Tracking several people at once from spoken description.",
            needs: "picture",
          },
          {
            part: 2,
            questions: 5,
            task: "Listen and write a missing word or number in each gap.",
            tests: "Taking down details accurately while someone is still talking.",
            needs: "audio",
          },
          {
            part: 3,
            questions: 5,
            task: "Match each named picture on the left to the right picture.",
            tests: "Holding a running dialogue in mind and matching as you go.",
            needs: "picture",
          },
          {
            part: 4,
            questions: 5,
            task: "Listen and tick the picture that answers the question.",
            tests: "Picking the answer out of a short exchange with distractors.",
            needs: "picture",
          },
          {
            part: 5,
            questions: 5,
            task: "Colour and write, following the instructions.",
            tests: "Prepositions of place, and following two-step instructions.",
            needs: "picture",
          },
        ],
      },
      {
        kind: "reading-writing",
        minutes: "30",
        parts: [
          {
            part: 1,
            questions: 5,
            task: "Match each definition to the right word.",
            tests: "Knowing the wordlist well enough to recognise a definition.",
            needs: "picture",
          },
          {
            part: 2,
            questions: 6,
            task: "Choose the right response, A, B or C, in a conversation.",
            tests: "Hearing a conversation in your head and knowing what fits next.",
            needs: "text",
          },
          {
            part: 3,
            questions: 6,
            task: "Fill the gaps in a text, then choose the best title.",
            tests: "Reading a whole text rather than hunting for single words.",
            needs: "text",
          },
          {
            part: 4,
            questions: 5,
            task: "Choose the right word from three options for each gap.",
            tests: "Grammar and word choice inside a real factual text.",
            needs: "text",
          },
          {
            part: 5,
            questions: 7,
            task: "Complete sentences about a three-part story.",
            tests: "Understanding a story well enough to summarise it in your own words.",
            needs: "picture",
          },
          {
            part: 6,
            questions: 6,
            task: "Complete the sentences and write about the picture.",
            tests: "Producing sentences, not just recognising them.",
            needs: "picture",
          },
        ],
      },
      {
        kind: "speaking",
        minutes: "5–7",
        parts: [
          { part: 1, questions: 0, task: "Find four differences between two pictures.", tests: "Describing and comparing out loud.", needs: "examiner" },
          { part: 2, questions: 0, task: "Continue a story from three pictures.", tests: "Telling a story in order, in sentences.", needs: "examiner" },
          { part: 3, questions: 0, task: "Say which picture is different, and why.", tests: "Giving a reason, not just an answer.", needs: "examiner" },
          { part: 4, questions: 0, task: "Answer questions about school, weekends and friends.", tests: "Talking about your own life.", needs: "examiner" },
        ],
      },
    ],
  },

  {
    slug: "flyers",
    name: "A2 Flyers",
    cefr: "A2",
    typicalAges: "usually 9–12",
    blurb:
      "The last step before the main Cambridge exams. Children handle longer texts, write a story of their own, and explain their thinking out loud.",
    papers: [
      {
        kind: "listening",
        minutes: "about 25",
        parts: [
          { part: 1, questions: 5, task: "Draw a line from each name to the right person.", tests: "Tracking several people at once from spoken description.", needs: "picture" },
          {
            part: 2,
            questions: 5,
            task: "Listen and write a missing word or number in each gap.",
            tests: "Taking down details accurately at speed.",
            needs: "audio",
          },
          { part: 3, questions: 5, task: "Match each named picture to the right picture.", tests: "Matching while a dialogue keeps moving.", needs: "picture" },
          { part: 4, questions: 5, task: "Tick the picture that answers the question.", tests: "Choosing between close options under time pressure.", needs: "picture" },
          { part: 5, questions: 5, task: "Colour and write, following the instructions.", tests: "Prepositions and multi-step instructions.", needs: "picture" },
        ],
      },
      {
        kind: "reading-writing",
        minutes: "40",
        parts: [
          {
            part: 1,
            questions: 10,
            task: "Write the right word next to each definition.",
            tests: "Recalling a word from its meaning — and spelling it.",
            needs: "text",
          },
          {
            part: 2,
            questions: 5,
            task: "Choose the right answer from a list, A to H, to complete a conversation.",
            tests: "Following a conversation with eight possible replies in play.",
            needs: "text",
          },
          {
            part: 3,
            questions: 6,
            task: "Choose the right word from the box for each gap and copy it.",
            tests: "Reading for meaning across a whole text.",
            needs: "text",
          },
          {
            part: 4,
            questions: 10,
            task: "Choose the right word from three options and write it in the gap.",
            tests: "Grammar inside a longer factual text.",
            needs: "text",
          },
          {
            part: 5,
            questions: 7,
            task: "Complete the sentences about the story, using one to four words.",
            tests: "Summarising a story accurately in your own words.",
            needs: "picture",
          },
          {
            part: 6,
            questions: 5,
            task: "Write the missing word in each of the five gaps.",
            tests: "Grammar with no options to choose from.",
            needs: "text",
          },
          {
            part: 7,
            questions: 1,
            task: "Write a story based on three pictures.",
            tests: "Writing something of your own, with a beginning, middle and end.",
            needs: "picture",
          },
        ],
      },
      {
        kind: "speaking",
        minutes: "7–9",
        parts: [
          { part: 1, questions: 0, task: "Find four differences between two pictures.", tests: "Describing and comparing out loud.", needs: "examiner" },
          { part: 2, questions: 0, task: "Ask and answer questions about pictures.", tests: "Asking questions, not only answering them.", needs: "examiner" },
          { part: 3, questions: 0, task: "Continue a story from three pictures.", tests: "Telling a story in order.", needs: "examiner" },
          { part: 4, questions: 0, task: "Answer questions about yourself.", tests: "Talking about your own life at length.", needs: "examiner" },
        ],
      },
    ],
  },
];

export function levelBySlug(slug: string) {
  return LEVELS.find((l) => l.slug === slug) ?? null;
}

export const PAPER_LABELS: Record<PaperKind, string> = {
  listening: "Listening",
  "reading-writing": "Reading & Writing",
  speaking: "Speaking",
};

/** Total questions in a paper, derived rather than restated. */
export function paperQuestions(paper: Paper) {
  return paper.parts.reduce((sum, p) => sum + p.questions, 0);
}

/**
 * Shields.
 *
 * Cambridge reports each paper out of five shields, fifteen across the three.
 * There is no pass or fail — which is the single most reassuring fact about
 * YLE for an anxious parent, and most preparation sites bury it.
 *
 * Cambridge does not publish the raw-score boundaries, so this is an honest
 * approximation for practice only, and every surface that shows it says so.
 * Treating a practice score as the real thing would be exactly the kind of
 * invented number this product refuses elsewhere.
 */
export const MAX_SHIELDS_PER_PAPER = 5;
export const MAX_SHIELDS_TOTAL = 15;

export function shieldsFor(correct: number, total: number): number {
  if (total <= 0) return 0;
  const pct = correct / total;
  // Cambridge's own guidance is that around three shields shows the level has
  // been reached, so the curve is set to put a solid-but-imperfect paper there.
  if (pct >= 0.9) return 5;
  if (pct >= 0.75) return 4;
  if (pct >= 0.55) return 3;
  if (pct >= 0.35) return 2;
  return 1;
}

/** Parts this product can honestly practise online right now. */
export function practisableParts(level: Level) {
  return level.papers.flatMap((paper) =>
    paper.parts
      .filter((part) => part.needs === "text" || part.needs === "audio")
      .map((part) => ({ paper: paper.kind, ...part })),
  );
}
