import { loadEnvFile } from "node:process";
loadEnvFile(".env");

import { createClient } from "@supabase/supabase-js";
import { SPEAKING_STARTERS } from "../content/speaking-starters";
import { CUE_KIND } from "../src/lib/speaking/serve";

/**
 * Puts the hand-written speaking cues into the pool.
 *
 *   npm run seed:speaking
 *
 * Separate from `seed:pool`, which calls the model. This one needs no API key
 * and no credit, so Speaking works on a fresh database and keeps working on a
 * day the model does not. Safe to run repeatedly: a cue already in the pool,
 * matched on title, is left alone rather than duplicated.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  let added = 0;
  let already = 0;

  for (const [level, cues] of Object.entries(SPEAKING_STARTERS)) {
    const { data: existing } = await db
      .from("content_pool")
      .select("payload")
      .eq("skill", "speaking")
      .eq("kind", CUE_KIND)
      .eq("level", level);

    const titles = new Set(
      (existing ?? []).map((r) => (r.payload as { title?: string })?.title).filter(Boolean),
    );

    for (const cue of cues) {
      if (titles.has(cue.title)) {
        already++;
        console.log(`  --    ${level}  ${cue.title}`);
        continue;
      }

      const { error } = await db.from("content_pool").insert({
        skill: "speaking",
        level,
        kind: CUE_KIND,
        topic: cue.topic || "any",
        locale: "en",
        payload: cue,
        payload_version: 1,
        usage_count: 0,
        source: "hand",
        status: "ready",
      });

      if (error) {
        console.log(`  FAIL  ${level}  ${cue.title}  ${error.message}`);
        continue;
      }

      added++;
      console.log(`  ok    ${level}  ${cue.title}`);
    }
  }

  console.log(`\n${added} added, ${already} already there\n`);
}

main();
