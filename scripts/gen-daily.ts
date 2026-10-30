import { loadEnvFile } from "node:process";
loadEnvFile(".env");

import { createClient } from "@supabase/supabase-js";
import { generateChallenges } from "../src/lib/daily/generate";
import { balanceProblems, verifyChallenge } from "../src/lib/daily/verify";
import { generatePuzzle } from "../src/lib/tricks/generate";
import { structuralProblems, verifyPuzzle } from "../src/lib/tricks/verify";
import { TECHNIQUES } from "../src/lib/tricks/techniques";
import type { Challenge } from "../src/lib/daily/schema";

/**
 * Fills the two features that ship empty.
 *
 *   npm run gen:daily                 # 7 Fake or Real + one puzzle per technique
 *   npm run gen:daily -- --days 14    # a fortnight of Fake or Real
 *   npm run gen:daily -- --only fake  # or --only tricks
 *   npm run gen:daily -- --dry        # generate and check, write nothing
 *
 * `/admin` can already do both, a batch at a time, behind a button. This
 * exists because seeding a fortnight that way is a lot of clicking, and more
 * importantly because every item generated here is **cross-examined by a
 * second, independent request** before it is kept — see `daily/verify.ts` and
 * `tricks/verify.ts` for why that is not the same as asking the first request
 * to check its own work.
 *
 * ## Everything lands as a draft
 *
 * Nothing written here reaches a child. `status` is `draft`, exactly as it is
 * from `/admin`, and a person still publishes at `/admin/daily` and
 * `/admin/tricks`. The verification pass lowers how often a human reviewer
 * meets something wrong; it is not a reason to stop having one. A model
 * checking a model agrees more often than two people would.
 *
 * Rejected items are printed in full with the reason, because a rejection is
 * the most interesting output this script produces — it is the thing that
 * would otherwise have been waiting in the review queue.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

const args = process.argv.slice(2);
function flag(name: string, fallback: number) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Math.max(Number(args[i + 1]) || fallback, 1) : fallback;
}
const DAYS = flag("days", 7);
const onlyIndex = args.indexOf("--only");
const ONLY = onlyIndex >= 0 ? args[onlyIndex + 1] : null;
const DRY = args.includes("--dry");
const techIndex = args.indexOf("--technique");
/** Fills one gap without regenerating the puzzles that already passed. */
const TECHNIQUE = techIndex >= 0 ? args[techIndex + 1] : null;

/** The free tier allows five requests a minute, and each item costs two. */
const PACE_MS = 13_000;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

let kept = 0;
let rejected = 0;

function reject(label: string, reasons: string[], detail: string) {
  rejected++;
  console.log(`\n  REJECTED  ${label}`);
  for (const reason of reasons) console.log(`            - ${reason}`);
  console.log(`            ${detail}`);
}

// ---------------------------------------------------------------- Fake or Real

async function fakeOrReal() {
  console.log(`\n=== Fake or Real — ${DAYS} day(s) ===\n`);

  const { data: scheduled } = await db
    .from("daily_challenges")
    .select("publish_on, true_claim")
    .eq("locale", "en")
    .gte("publish_on", todayKey())
    .order("publish_on", { ascending: true });

  const taken = new Set((scheduled ?? []).map((r) => r.publish_on));
  const avoid = (scheduled ?? []).map((r) => r.true_claim);

  // The generator caps a batch at seven, so a longer run goes round again
  // telling it what it has already written.
  const accepted: Challenge[] = [];
  const tellCounts = new Map<string, number>();
  let model = "";

  while (accepted.length < DAYS) {
    const want = Math.min(DAYS - accepted.length, 7);
    console.log(`generating ${want}...`);

    let batch;
    try {
      ({ challenges: batch, model } = await generateChallenges({
        locale: "en",
        count: want,
        avoid: [...avoid, ...accepted.map((c) => c.trueClaim)],
        // Anything already used twice. Naming them is enough; forbidding them
        // outright would just shift the pile-up onto whatever is left.
        avoidTells: [...tellCounts].filter(([, n]) => n >= 2).map(([t]) => t),
      }));
    } catch (error) {
      console.error(`generation failed: ${error instanceof Error ? error.message : error}`);
      break;
    }

    let keptThisRound = 0;

    for (const challenge of batch) {
      await wait(PACE_MS);
      const label = challenge.trueClaim.slice(0, 64);

      // Free and deterministic, so it runs before the call that costs money.
      const unbalanced = balanceProblems(challenge);
      if (unbalanced.length > 0) {
        reject(
          label,
          unbalanced,
          `true:  ${challenge.trueClaim}
            false: ${challenge.falseClaim}`,
        );
        continue;
      }

      let verdict;
      try {
        verdict = await verifyChallenge(challenge);
      } catch (error) {
        reject(label, [`check failed: ${error instanceof Error ? error.message : error}`], "");
        continue;
      }

      if (!verdict.ok) {
        reject(
          label,
          verdict.reasons,
          `true: ${challenge.trueClaim}\n            false: ${challenge.falseClaim}`,
        );
        continue;
      }

      accepted.push(challenge);
      tellCounts.set(challenge.tell, (tellCounts.get(challenge.tell) ?? 0) + 1);
      keptThisRound++;
      kept++;
      console.log(`\n  kept      ${label}`);
      console.log(`            true:  ${challenge.trueClaim}`);
      console.log(`            false: ${challenge.falseClaim}`);
      console.log(`            tell:  ${challenge.tell}  ·  ${challenge.sourceNote}`);
      for (const note of verdict.notes) console.log(`            ${note}`);

      if (accepted.length >= DAYS) break;
    }

    // A round that produced nothing usable will probably do it again; stopping
    // beats burning quota on the same failure.
    if (keptThisRound === 0) {
      console.log("\nnothing survived this round — stopping");
      break;
    }
    if (accepted.length < DAYS) await wait(PACE_MS);
  }

  if (accepted.length > 0) {
    const spread = [...tellCounts].sort((a, b) => b[1] - a[1]);
    console.log(`
tells used: ${spread.map(([t, n]) => `${t} x${n}`).join(", ")}`);
  }

  if (accepted.length === 0 || DRY) return;

  // Fill the earliest free days from today, as /admin does.
  const rows = [];
  const cursor = new Date(`${todayKey()}T00:00:00Z`);
  for (const challenge of accepted) {
    while (taken.has(cursor.toISOString().slice(0, 10))) {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    const day = cursor.toISOString().slice(0, 10);
    taken.add(day);

    rows.push({
      publish_on: day,
      locale: "en",
      true_claim: challenge.trueClaim,
      false_claim: challenge.falseClaim,
      tell: challenge.tell,
      tell_options: [challenge.tell, ...challenge.distractorTells],
      explanation: challenge.explanation,
      source_note: challenge.sourceNote,
      status: "draft" as const,
      model,
    });
  }

  const { error } = await db.from("daily_challenges").insert(rows);
  if (error) console.error(`\ninsert failed: ${error.message}`);
  else console.log(`\ninserted ${rows.length} draft(s), ${rows[0].publish_on} onward`);
}

// ------------------------------------------------------------- Spot the Trick

async function spotTheTrick() {
  console.log(
    `\n=== Spot the Trick — ${TECHNIQUE ?? `${TECHNIQUES.length} technique(s)`} ===\n`,
  );

  const rows = [];

  const wanted = TECHNIQUE
    ? TECHNIQUES.filter((t) => t.slug === TECHNIQUE)
    : TECHNIQUES;

  if (TECHNIQUE && wanted.length === 0) {
    console.error(`no technique called "${TECHNIQUE}"`);
    return;
  }

  for (const technique of wanted) {
    // One retry. A rejected Fake or Real is a day without a challenge; a
    // rejected technique is a permanent hole, because this loop runs once per
    // technique and nothing else ever fills it.
    for (let attempt = 1; attempt <= 2; attempt++) {
      await wait(PACE_MS);
      const tag = attempt === 1 ? technique.slug : `${technique.slug} (retry)`;
      console.log(`generating ${tag}...`);

      let generated;
      try {
        generated = await generatePuzzle({ technique, locale: "en" });
      } catch (error) {
        reject(tag, [`generation failed: ${error instanceof Error ? error.message : error}`], "");
        continue;
      }

      const { puzzle, options, model } = generated;

      // Free, instant, and cannot be argued with — so it runs before the call
      // that costs something.
      const structural = structuralProblems(puzzle, technique);
      if (structural.length > 0) {
        reject(tag, structural, `title: ${puzzle.artefact.title}`);
        continue;
      }

      await wait(PACE_MS);
      let verdict;
      try {
        verdict = await verifyPuzzle(puzzle, technique);
      } catch (error) {
        reject(tag, [`check failed: ${error instanceof Error ? error.message : error}`], "");
        continue;
      }

      if (!verdict.ok) {
        reject(tag, verdict.reasons, `title: ${puzzle.artefact.title}`);
        continue;
      }

      kept++;
      console.log(`
  kept      ${technique.slug}`);
      console.log(`            ${puzzle.artefact.kind}: ${puzzle.artefact.title}`);
      console.log(`            ${puzzle.artefact.source}`);
      if (puzzle.artefact.bars.length > 0) {
        console.log(
          `            bars: ${puzzle.artefact.bars
            .map((b) => `${b.label}=${b.value}${puzzle.artefact.unit}`)
            .join(", ")}  (scale from ${puzzle.artefact.axisStart})`,
        );
      }
      for (const note of verdict.notes) console.log(`            ${note}`);

      rows.push({
        technique: technique.slug,
        locale: "en",
        artefact: puzzle.artefact,
        options,
        explanation: puzzle.explanation,
        status: "draft" as const,
        model,
        created_by: null,
      });
      break;
    }
  }

  const covered = new Set(rows.map((r) => r.technique));
  const uncovered = wanted.filter((t) => !covered.has(t.slug)).map((t) => t.slug);
  if (uncovered.length > 0) {
    console.log(`
still without a puzzle: ${uncovered.join(", ")}`);
  }

  if (rows.length === 0 || DRY) return;

  const { error } = await db.from("trick_puzzles").insert(rows);
  if (error) console.error(`\ninsert failed: ${error.message}`);
  else console.log(`\ninserted ${rows.length} draft(s)`);
}

async function main() {
  console.log(`\n${url}${DRY ? "  (dry run — nothing will be written)" : ""}`);

  if (ONLY !== "tricks") await fakeOrReal();
  if (ONLY !== "fake") await spotTheTrick();

  console.log(`\n${kept} kept, ${rejected} rejected`);
  if (kept > 0 && !DRY) {
    console.log("\nAll of it is a DRAFT. Publish at /admin/daily and /admin/tricks.\n");
  } else {
    console.log("");
  }
}

main();
