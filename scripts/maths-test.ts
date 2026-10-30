import { readFileSync } from "node:fs";
import {
  TOPICS,
  isMathsCorrect,
  normaliseMaths,
  type Visual,
} from "../src/lib/maths/topics";

/**
 * Checks every maths question against its own picture.
 *
 *   npm run test:maths
 *
 * This exists because of the one failure mode the maths section genuinely
 * has. Every picture is drawn from the numbers in `visual`, and every answer
 * is marked by exact comparison against `answer` — but nothing connects the
 * two. Write `rows: 3, cols: 4, answer: "11"` and the app is perfectly happy:
 * it draws twelve dots, asks how many there are, and marks a child wrong for
 * saying twelve. No type will catch that, and no one reviewing a diff of
 * twenty-three questions reliably will either.
 *
 * So: derive the answer from the picture independently, and compare.
 *
 * It also checks that every question has a prompt and a note in all six
 * locales, since the prose moved to the catalogue and a missing key renders as
 * a raw dotted path in front of a child.
 */

const LOCALES = ["en", "es", "fr", "hi", "zh", "ar"] as const;

let failed = 0;

function report(ok: boolean, label: string, detail = "") {
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"}  ${label}${detail ? "  " + detail : ""}`);
}

/** Reduces a fraction, so "4/8" and "1/2" compare equal. */
function fraction(top: number, bottom: number) {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(top, bottom);
  const [t, b] = [top / d, bottom / d];
  return b === 1 ? `${t}` : `${t}/${b}`;
}

/**
 * Every answer the picture can defensibly support.
 *
 * Deliberately a set rather than one value: "24 dots in 4 rows, how many per
 * row?" and "how many dots altogether?" are both fair questions about the same
 * rectangle. The check is not that the answer is the only possible one, it is
 * that the answer is *reachable from the drawing at all* — which is exactly
 * what a typo in either breaks.
 */
function answersFromPicture(visual: Visual): string[] {
  switch (visual.model) {
    case "number-line": {
      const landing = visual.start + visual.jump;
      // Where you land, or how far you jumped. Which of the two is being asked
      // is precisely what `hideEnd` / `hideJump` decide.
      return visual.hideJump ? [`${Math.abs(visual.jump)}`] : [`${landing}`];
    }
    case "array":
      return [
        `${visual.rows * visual.cols}`,
        `${visual.rows}`,
        `${visual.cols}`,
      ];
    case "bar": {
      const out = [fraction(visual.shaded, visual.parts)];
      // A bar carrying a value answers "what is one part worth?" too.
      const worth = Number(visual.label);
      if (Number.isFinite(worth) && visual.parts > 0) {
        out.push(`${(worth / visual.parts) * visual.shaded}`);
      }
      return out;
    }
    case "bar-compare": {
      const a = visual.top.shaded / visual.top.parts;
      const b = visual.bottom.shaded / visual.bottom.parts;
      return [
        // Which is bigger, named as a fraction.
        fraction(
          a >= b ? visual.top.shaded : visual.bottom.shaded,
          a >= b ? visual.top.parts : visual.bottom.parts,
        ),
        // Or simply whether they match.
        a === b ? "yes" : "no",
      ];
    }
    case "grid":
      return [
        `${visual.shaded}`,
        `${100 - visual.shaded}`,
        fraction(visual.shaded, 100),
      ];
  }
}

/**
 * Questions whose answer is deliberately NOT in the picture.
 *
 * Each one asks the child to carry the idea somewhere new — that is the point
 * of it — so it is listed here with the reason rather than weakening the check
 * for the other twenty-two.
 */
const TRANSFERS: Record<string, string> = {
  p3: "shows 10% of a hundred grid, then asks for 10% of 50",
};

console.log("\nanswers against their pictures\n");

const seen = new Set<string>();

for (const topic of TOPICS) {
  for (const q of topic.questions) {
    const label = `${topic.slug}/${q.id}`;

    if (seen.has(q.id)) report(false, label, "duplicate question id");
    seen.add(q.id);

    if (TRANSFERS[q.id]) {
      console.log(`--    ${label}  transfer question: ${TRANSFERS[q.id]}`);
      continue;
    }

    const derived = answersFromPicture(q.visual);
    const ok = derived.some((d) => isMathsCorrect(q, d));
    report(ok, label, ok ? `= ${q.answer}` : `answer "${q.answer}" not in [${derived.join(", ")}]`);
  }
}

console.log("\nmarking\n");

for (const topic of TOPICS) {
  for (const q of topic.questions) {
    const label = `${topic.slug}/${q.id}`;

    // Its own answer must mark correct, or the question is unanswerable.
    report(isMathsCorrect(q, q.answer), `${label} accepts its own answer`);

    // Every alternative form must mark correct too.
    for (const alt of q.alsoAccept ?? []) {
      report(isMathsCorrect(q, alt), `${label} accepts "${alt}"`);
    }

    // An empty answer must never be right, however forgiving the normaliser.
    report(!isMathsCorrect(q, "   "), `${label} rejects blank`);

    if (q.options) {
      const matching = q.options.filter((o) => isMathsCorrect(q, o));
      report(
        matching.length === 1,
        `${label} has exactly one correct option`,
        matching.length === 1 ? "" : `${matching.length} of ${q.options.length} match`,
      );
    }
  }
}

console.log("\nnormalising\n");

for (const [a, b] of [
  ["−3", "-3"],
  ["– 3", "-3"],
  [" 3 / 4 ", "3/4"],
  ["+7", "7"],
  ["YES", "yes"],
] as const) {
  report(normaliseMaths(a) === normaliseMaths(b), `"${a}" reads as "${b}"`);
}

console.log("\ncopy, in every locale\n");

for (const locale of LOCALES) {
  const messages = JSON.parse(readFileSync(`messages/${locale}.json`, "utf8"));
  const topics = messages?.maths?.topics ?? {};
  const choices = messages?.maths?.choice ?? {};
  const missing: string[] = [];

  for (const topic of TOPICS) {
    const entry = topics[topic.slug];
    for (const field of ["name", "blurb", "idea"]) {
      if (!entry?.[field]?.trim()) missing.push(`${topic.slug}.${field}`);
    }
    for (const q of topic.questions) {
      for (const field of ["prompt", "note"]) {
        if (!entry?.q?.[q.id]?.[field]?.trim()) {
          missing.push(`${topic.slug}.q.${q.id}.${field}`);
        }
      }
      // An option is shown through `maths.choice.<value>`; without it a child
      // in Hindi is asked to pick between "yes" and "no".
      for (const option of q.options ?? []) {
        if (!choices?.[option]?.trim()) missing.push(`choice.${option}`);
      }
    }
  }

  report(missing.length === 0, locale, missing.length === 0 ? "" : `missing ${missing.join(", ")}`);
}

const questions = TOPICS.reduce((n, t) => n + t.questions.length, 0);
console.log(
  failed === 0
    ? `\n${TOPICS.length} topics, ${questions} questions, all consistent\n`
    : `\n${failed} CHECK(S) FAILED\n`,
);
process.exit(failed === 0 ? 0 : 1);
