import { loadEnvFile } from "node:process";
loadEnvFile(".env");

import { createClient } from "@supabase/supabase-js";
import { generateCue } from "../src/lib/speaking/cue";
import { CUE_KIND } from "../src/lib/speaking/serve";
import { LEVELS, type Level } from "../src/lib/pool/serve";

/**
 * Warms the shared content pool.
 *
 *   npm run seed:pool                      # two speaking cues per level
 *   npm run seed:pool -- --each 5          # five each
 *   npm run seed:pool -- --level a1        # one level only
 *
 * The pool generates on a miss, so this script is not required for the product
 * to work -- it exists so the FIRST child of the day is not the one who waits
 * for the model. ieltsbiz warms its passage pool the same way, and the comment
 * there is worth repeating: a warm pool turns a ~30s cold start into a ~0.5s
 * indexed read.
 *
 * Writes with the service key, because `content_pool` has no insert policy for
 * ordinary users by design -- the bank is system-authored.
 *
 * A generation that fails schema validation is skipped, never patched up and
 * stored. A malformed row in a SHARED bank is not one bad activity; it is one
 * bad activity served to every child who lands on it.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const each = Number(flag("each") ?? 2);
const only = flag("level") as Level | undefined;
const levels = only ? [only] : [...LEVELS];

if (only && !LEVELS.includes(only)) {
  console.error(`unknown level "${only}". one of: ${LEVELS.join(", ")}`);
  process.exit(1);
}

/**
 * Subject areas to rotate through.
 *
 * Without this the model converges. A run seeded three pre-A1 cues about a
 * school bag, shoes and a jacket, and produced "a game you like" at A1, A2 and
 * B1 -- because `avoid` is scoped to one level, so it cannot see what the other
 * rungs already got. A bank that never runs out is worth nothing if everything
 * in it is the same question rephrased.
 */
const TOPIC_AREAS = [
  "food and meals",
  "a place you go",
  "someone you know",
  "weather and seasons",
  "something you made or fixed",
  "games and play",
  "animals",
  "music or a sound you like",
  "getting around -- walking, buses, bicycles",
  "a time something went wrong",
  "what you do after school",
  "something you would like to try",
];

async function existingTitles(level: Level): Promise<string[]> {
  const { data } = await db
    .from("content_pool")
    .select("payload")
    .eq("skill", "speaking")
    .eq("kind", CUE_KIND)
    .eq("level", level);

  return (data ?? [])
    .map((r) => (r.payload as { title?: string })?.title)
    .filter((t): t is string => Boolean(t));
}

async function main() {
  let made = 0;
  let skipped = 0;

  for (const level of levels) {
    // Read once per level, then extend in memory: re-reading after every
    // insert would be a round trip per cue for no extra protection.
    const avoid = await existingTitles(level);
    console.log(`\n${level} — ${avoid.length} already in the pool`);

    for (let i = 0; i < each; i++) {
      try {
        // Offset by level as well as by index, so the four rungs do not march
        // through the same areas in the same order.
        const area = TOPIC_AREAS[(i + levels.indexOf(level) * 3) % TOPIC_AREAS.length];
        const { data, model } = await generateCue({ level, avoid, topicHint: area });

        const { error } = await db.from("content_pool").insert({
          skill: "speaking",
          level,
          kind: CUE_KIND,
          topic: data.topic || "any",
          locale: "en",
          payload: data,
          payload_version: 1,
          usage_count: 0,
          source: "seeded",
          model,
          status: "ready",
        });

        if (error) throw error;

        avoid.push(data.title);
        made++;
        console.log(`  ok    ${data.title}  (${area})`);
      } catch (err) {
        skipped++;
        console.log(`  skip  ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  console.log(`\n${made} added, ${skipped} skipped\n`);
  process.exit(skipped > 0 && made === 0 ? 1 : 0);
}

main();
