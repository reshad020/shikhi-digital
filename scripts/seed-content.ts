import { loadEnvFile } from "node:process";
loadEnvFile(".env");

import { createClient } from "@supabase/supabase-js";
import { LESSON_SOURCES } from "../content/lessons";
import { STORYBOARDS } from "../content/storyboards";
import { PASSAGES } from "../content/passages";
import { generateStoryboard } from "../src/lib/storyboard/generate";
import { generatePassage } from "../src/lib/listening/generate";
import { generateSteelmanPrompt } from "../src/lib/steelman/generate";
import type { Database } from "../src/lib/supabase/types";

/**
 * Fills a database with content.
 *
 *   npm run seed:content                 # everything missing
 *   npm run seed:content -- lessons      # just one kind
 *   npm run seed:content -- --count 6
 *
 * Runs the same generators the admin screens use, so what lands here is
 * exactly what a human would have produced by clicking through — no second,
 * divergent code path that drifts from the real one.
 *
 * Two rules it follows:
 *
 * 1. **Idempotent.** Lessons are matched on slug and skipped if present, so a
 *    re-run after a failure costs nothing and duplicates nothing.
 * 2. **One failure does not lose the batch.** Every item is generated inside
 *    its own try, because a single malformed model response should not throw
 *    away the eleven that already worked and the money they cost.
 *
 * It publishes directly (`status: 'ready'`). That is a deliberate exception to
 * the human-review rule, and it holds only because the lesson texts in
 * `content/lessons.ts` were written by a person. Generated daily challenges
 * and trick puzzles still go through /admin.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
  process.exit(1);
}
if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY must be set in .env — every generator needs it");
  process.exit(1);
}

const db = createClient<Database>(url, key, { auth: { persistSession: false } });

const args = process.argv.slice(2);
const countFlag = args.indexOf("--count");
const COUNT = countFlag >= 0 ? Number(args[countFlag + 1]) || 6 : 6;
const only = args.filter((a) => !a.startsWith("--") && a !== String(COUNT));
const wants = (kind: string) => only.length === 0 || only.includes(kind);

/** Mirrors the slug rule in the admin action, so a re-run matches what exists. */
function slugify(subject: string) {
  return subject
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function seedLessons() {
  console.log(`\n=== lessons (${LESSON_SOURCES.length} written) ===`);

  const { data: existing } = await db.from("lessons").select("slug");
  const have = new Set((existing ?? []).map((r) => r.slug));

  let made = 0;
  for (const source of LESSON_SOURCES) {
    const slug = slugify(source.subject);
    if (have.has(slug)) {
      console.log(`  skip   ${source.subject} (already here)`);
      continue;
    }

    try {
      process.stdout.write(`  ...    ${source.subject}`);

      // A hand-authored storyboard wins over generating one. It is better
      // content, it costs nothing, and it is the only route that works when
      // the Gemini key is out of credit — which is exactly when you most want
      // to be able to fill a library.
      const authored = STORYBOARDS[source.subject];
      const { storyboard, model } = authored
        ? { storyboard: authored, model: "hand-authored" }
        : await generateStoryboard({
            subject: source.subject,
            sourceText: source.text,
            locale: "en",
          });

      const { error } = await db.from("lessons").insert({
        slug,
        subject: source.subject,
        locale: "en",
        source_text: source.text,
        status: "ready",
        model,
        storyboard,
      });
      if (error) throw error;

      made++;
      console.log(
        `\r  ok     ${source.subject} — ${storyboard.scenes.length} scenes, ` +
          `${storyboard.quiz.length} questions, ` +
          `${storyboard.quiz.filter((q) => q.defend).length} to defend  [${model}]`,
      );
    } catch (error) {
      console.log(`\r  FAIL   ${source.subject}`);
      console.error(`         ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log(`  ${made} new lesson(s)`);
}

async function seedListening() {
  console.log(`\n=== listening passages (target ${COUNT}) ===`);

  const { data: existing } = await db
    .from("listening_passages")
    .select("title")
    .eq("locale", "en");
  const avoid = (existing ?? []).map((r) => r.title);

  // Spread across the world for the same reason the lessons are: a child
  // should hear about somewhere other than where the syllabus assumes.
  const hints = [
    "animals that do something surprising",
    "how people navigated or mapped the world before machines",
    "an everyday object nobody thinks about, and how it works",
    "a discovery someone made by noticing something small",
    "deep ocean or high mountains",
    "how a city solved a problem it had",
  ];

  let made = 0;
  // Hand-authored passages first, then generated ones to top up. Authored
  // content is better and free; generation is the fallback, not the default.
  const total = Math.max(COUNT, PASSAGES.length);

  for (let i = 0; i < total; i++) {
    try {
      const authored = PASSAGES[i];
      if (!authored && i >= COUNT) break;

      process.stdout.write(`  ...    passage ${i + 1}`);
      const { draft, model } = authored
        ? { draft: authored, model: "hand-authored" }
        : await generatePassage({
            locale: "en",
            topicHint: hints[i % hints.length],
            avoid,
          });

      if (avoid.includes(draft.title)) {
        console.log(`  skip   ${draft.title} (already here)`);
        continue;
      }
      avoid.push(draft.title);

      const { error } = await db.from("listening_passages").insert({
        locale: "en",
        title: draft.title,
        topic: draft.topic,
        transcript: draft.transcript,
        recall_question: draft.recallQuestion,
        recall_options: draft.recallOptions,
        inference_question: draft.inferenceQuestion,
        inference_options: draft.inferenceOptions,
        defend_prompt: draft.defendPrompt,
        status: "ready",
        model,
      });
      if (error) throw error;

      made++;
      const words = draft.transcript.trim().split(/\s+/).length;
      console.log(`\r  ok     ${draft.title} — ${words} words, ~${Math.round((words / 130) * 60)}s`);
    } catch (error) {
      console.log(`\r  FAIL   passage ${i + 1}`);
      console.error(`         ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log(`  ${made} new passage(s)`);
}

async function seedSteelman() {
  console.log(`\n=== steelman claims (target ${COUNT}) ===`);

  const hints = [
    "school rules",
    "animals and how people treat them",
    "money, chores and fairness at home",
    "screens, games and free time",
    "sport and competition",
    "cities, streets and how people share space",
  ];

  let made = 0;
  for (let i = 0; i < COUNT; i++) {
    try {
      process.stdout.write(`  ...    claim ${i + 1}`);
      const { draft, model } = await generateSteelmanPrompt({
        locale: "en",
        topicHint: hints[i % hints.length],
      });

      const { error } = await db.from("steelman_prompts").insert({
        locale: "en",
        claim: draft.claim,
        context: draft.context,
        side_a: draft.sideA,
        side_b: draft.sideB,
        best_for_a: draft.bestForA,
        best_for_b: draft.bestForB,
        status: "ready",
        model,
      });
      if (error) throw error;

      made++;
      console.log(`\r  ok     ${draft.claim}`);
    } catch (error) {
      console.log(`\r  FAIL   claim ${i + 1}`);
      console.error(`         ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log(`  ${made} new claim(s)`);
}

async function main() {
  console.log(`seeding ${url}`);

  if (wants("lessons")) await seedLessons();
  if (wants("listening")) await seedListening();
  if (wants("steelman")) await seedSteelman();

  const counts = await Promise.all(
    (["lessons", "listening_passages", "steelman_prompts"] as const).map(async (table) => {
      const { count } = await db
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq("status", "ready");
      return `${table}=${count ?? 0}`;
    }),
  );

  console.log(`\npublished: ${counts.join("  ")}`);
  console.log("Fake or Real and Spot the Trick are generated from /admin.\n");
}

main();
