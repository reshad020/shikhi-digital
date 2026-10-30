/**
 * Maths You Can See — the structure.
 *
 * The premise is that most children who "cannot do maths" can do the maths
 * perfectly well once they can *see* what the symbols are describing. A child
 * who finds 3 x 4 meaningless has no trouble counting a tray of buns three
 * rows deep — the arithmetic was never the problem, the notation was.
 *
 * So every question here is attached to a picture that is **generated from the
 * numbers themselves**: a number line, a rectangle of dots, a divided bar, a
 * hundred-grid. Nothing is drawn by hand or by a model, which means the
 * picture can never disagree with the question, and a new question costs
 * nothing to make.
 *
 * It also means marking needs no model at all. Every answer is a number or a
 * fraction, compared exactly — so a child can work through fifty questions and
 * the only limit is their attention.
 *
 * ## Why there is no prose in this file
 *
 * Only the shape of each question lives here: the picture, the answer, which
 * forms of the answer to accept. Every word a child reads — topic names,
 * prompts, notes — comes from `messages/*.json` under `maths.topics`. Unlike
 * the YLE material, which is English by definition because the exam is in
 * English, maths is not about English at all: a Hindi-speaking child should
 * meet "जोड़", not "Adding", and the numbers are identical either way.
 *
 * The answers deliberately stay here and stay untranslated. They are numbers
 * and fractions, so they are the same in every locale, and keeping them out of
 * the catalogue means no translation can accidentally change what is correct.
 */

/** The picture, described by the numbers it is drawn from. */
export type Visual =
  | {
      /** A line with a jump drawn over it. Addition, subtraction, negatives. */
      model: "number-line";
      from: number;
      to: number;
      start: number;
      /** Positive jumps right, negative jumps left. */
      jump: number;
      /** Tick spacing. Defaults to 1. */
      step?: number;
      /** Hide the landing label so the child has to work out where they land. */
      hideEnd?: boolean;
      /**
       * Hide the size of the jump instead, for "how far apart are these?"
       * questions. Exactly one of the two should be set: whichever number the
       * question asks for is the one the picture must not print.
       */
      hideJump?: boolean;
    }
  | {
      /** Rows and columns of dots. Multiplication, division, factors. */
      model: "array";
      rows: number;
      cols: number;
      /** Label the rows and the columns, to show what the dimensions mean. */
      showDimensions?: boolean;
    }
  | {
      /** One bar cut into equal parts. Fractions, and the same bar as a whole. */
      model: "bar";
      parts: number;
      shaded: number;
      /** A quantity the whole bar is worth, for "what is one part?" questions. */
      label?: string;
    }
  | {
      /** Two bars of the same length, for comparing fractions. */
      model: "bar-compare";
      top: { parts: number; shaded: number };
      bottom: { parts: number; shaded: number };
    }
  | {
      /** A hundred square. Percentages, and decimals as hundredths. */
      model: "grid";
      shaded: number;
    };

export type MathsQuestion = {
  /** Also the catalogue key: `maths.topics.<slug>.q.<id>.prompt`. */
  id: string;
  visual: Visual;
  /** Exact answer. Fractions are written "3/4". Never translated. */
  answer: string;
  /** Also accepted — equivalent forms, usually. */
  alsoAccept?: string[];
  /**
   * When present the question is multiple choice. These values are canonical
   * and are what gets matched against `answer`; what the child sees is the
   * translation of `maths.choice.<value>`, so marking never depends on locale.
   */
  options?: string[];
};

export type Topic = {
  /** Also the catalogue key: `maths.topics.<slug>.name`. */
  slug: string;
  emoji: string;
  questions: MathsQuestion[];
};

/** Normalises an answer: forgiving about spaces, strict about value. */
export function normaliseMaths(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/^\+/, "")
      // A typographic minus, an en dash and a hyphen all mean the same thing,
      // and which one a child produces depends on their keyboard rather than
      // on whether they understand negative numbers.
      .replace(/[−–—]/g, "-")
  );
}

export function isMathsCorrect(question: MathsQuestion, given: string) {
  const got = normaliseMaths(given);
  if (!got) return false;
  if (got === normaliseMaths(question.answer)) return true;
  return (question.alsoAccept ?? []).some((a) => normaliseMaths(a) === got);
}

export const TOPICS: Topic[] = [
  {
    slug: "addition",
    emoji: "➕",
    questions: [
      {
        id: "a1",
        visual: { model: "number-line", from: 0, to: 10, start: 3, jump: 4, hideEnd: true },
        answer: "7",
      },
      {
        id: "a2",
        visual: { model: "number-line", from: 0, to: 20, start: 8, jump: 7, step: 2, hideEnd: true },
        answer: "15",
      },
      {
        id: "a3",
        visual: { model: "number-line", from: 0, to: 20, start: 9, jump: 6, hideEnd: true },
        answer: "15",
      },
      {
        id: "a4",
        visual: { model: "number-line", from: 0, to: 10, start: 6, jump: 3, hideEnd: true },
        answer: "9",
      },
    ],
  },

  {
    slug: "subtraction",
    emoji: "➖",
    questions: [
      {
        id: "s1",
        visual: { model: "number-line", from: 0, to: 10, start: 9, jump: -4, hideEnd: true },
        answer: "5",
      },
      {
        id: "s2",
        visual: { model: "number-line", from: 0, to: 20, start: 15, jump: -8, hideEnd: true },
        answer: "7",
      },
      {
        // The answer is the size of the gap, so the gap is what the picture
        // withholds — the 13 has to stay visible for the question to work.
        id: "s3",
        visual: { model: "number-line", from: 0, to: 20, start: 7, jump: 6, hideJump: true },
        answer: "6",
      },
      {
        id: "s4",
        visual: { model: "number-line", from: -5, to: 5, start: 2, jump: -5, hideEnd: true },
        answer: "-3",
      },
    ],
  },

  {
    slug: "multiplication",
    emoji: "✖️",
    questions: [
      {
        id: "m1",
        visual: { model: "array", rows: 3, cols: 4, showDimensions: true },
        answer: "12",
      },
      {
        // Deliberately the same twelve dots as m1, turned. Noticing that is
        // the whole question, which is why it comes immediately after.
        id: "m2",
        visual: { model: "array", rows: 4, cols: 3, showDimensions: true },
        answer: "12",
      },
      { id: "m3", visual: { model: "array", rows: 6, cols: 5 }, answer: "30" },
      { id: "m4", visual: { model: "array", rows: 7, cols: 4 }, answer: "28" },
      { id: "m5", visual: { model: "array", rows: 4, cols: 6 }, answer: "6" },
    ],
  },

  {
    slug: "fractions",
    emoji: "🍕",
    questions: [
      { id: "f1", visual: { model: "bar", parts: 4, shaded: 3 }, answer: "3/4" },
      {
        id: "f2",
        visual: { model: "bar", parts: 8, shaded: 4 },
        answer: "1/2",
        alsoAccept: ["4/8"],
      },
      {
        id: "f3",
        visual: {
          model: "bar-compare",
          top: { parts: 3, shaded: 1 },
          bottom: { parts: 4, shaded: 1 },
        },
        answer: "1/3",
      },
      {
        id: "f4",
        visual: { model: "bar", parts: 5, shaded: 5 },
        answer: "1",
        alsoAccept: ["5/5"],
      },
      {
        id: "f5",
        visual: {
          model: "bar-compare",
          top: { parts: 6, shaded: 3 },
          bottom: { parts: 2, shaded: 1 },
        },
        answer: "yes",
        options: ["yes", "no"],
      },
    ],
  },

  {
    slug: "percentages",
    emoji: "💯",
    questions: [
      { id: "p1", visual: { model: "grid", shaded: 25 }, answer: "25", alsoAccept: ["25%"] },
      {
        id: "p2",
        visual: { model: "grid", shaded: 50 },
        answer: "1/2",
        alsoAccept: ["50/100"],
      },
      { id: "p3", visual: { model: "grid", shaded: 10 }, answer: "5" },
      { id: "p4", visual: { model: "grid", shaded: 75 }, answer: "25", alsoAccept: ["25%"] },
      {
        // The bar is worth a plain 20 with no currency symbol: a pound sign
        // would make this question about Britain for five of the six locales.
        id: "p5",
        visual: { model: "bar", parts: 5, shaded: 1, label: "20" },
        answer: "4",
      },
    ],
  },
];

export function topicBySlug(slug: string) {
  return TOPICS.find((t) => t.slug === slug) ?? null;
}
