import { loadEnvFile } from "node:process";
loadEnvFile(".env");

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/supabase/types";
import { parseStoryboard } from "../src/lib/storyboard/schema";
import { gradeReasoning } from "../src/lib/reasoning/grade";

/**
 * Creates a demo family and fills one week with genuinely graded reasoning, so
 * the Weekly Report can be developed against real verdicts. Uses the service
 * role because there is no browser session to act on behalf of.
 *
 *   npm run demo:week
 */
const DEMO_EMAIL = "demo.parent@shikhi.test";
const DEMO_PASSWORD = "demo-password-123";

const ANSWERS: Record<string, { choice: number; text: string }[]> = {
  "q-apartheid": [
    {
      choice: 0,
      text: "Because the story said the laws decided where people could live and learn, and that was decided by skin colour. A city would not be able to do that to people.",
    },
  ],
  "q-after": [
    {
      choice: 2,
      text: "I thought he would punish them because 27 years is such a long time to be locked up that anyone would be angry. But then the story said he shook hands with them, so maybe he thought being angry would not fix the country.",
    },
    { choice: 0, text: "I just remembered it from the story." },
  ],
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Supabase env vars are not set — see .env.example");
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");

  const db = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // A parent account. The handle_new_user trigger creates the profile row.
  const { data: existing } = await db.auth.admin.listUsers();
  let userId = existing.users.find((u) => u.email === DEMO_EMAIL)?.id;

  if (!userId) {
    const { data, error } = await db.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Demo Parent" },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`Created parent ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  }

  let { data: child } = await db
    .from("children")
    .select("*")
    .eq("parent_id", userId)
    .maybeSingle();

  if (!child) {
    const { data, error } = await db
      .from("children")
      .insert({ parent_id: userId, name: "Ada", birth_year: 2015, avatar: "science" })
      .select()
      .single();
    if (error) throw error;
    child = data;
    console.log("Created child profile: Ada");
  }

  const { data: lesson } = await db
    .from("lessons")
    .select("*")
    .eq("status", "ready")
    .limit(1)
    .maybeSingle();
  const storyboard = parseStoryboard(lesson?.storyboard);
  if (!lesson || !storyboard) throw new Error("No ready lesson — run `npm run db:reset`.");

  await db.from("reasoning_attempts").delete().eq("child_id", child.id);
  await db.from("weekly_reports").delete().eq("child_id", child.id);

  const sceneSummary = storyboard.scenes.map((s) => `${s.title}: ${s.narration}`).join("\n");
  let written = 0;

  for (const [questionId, answers] of Object.entries(ANSWERS)) {
    const question = storyboard.quiz.find((q) => q.id === questionId);
    if (!question) continue;
    const correct = question.options.find((o) => o.isCorrect)!;

    for (const answer of answers) {
      const chosen = question.options[answer.choice];
      if (!chosen) continue;

      const { verdict } = await gradeReasoning({
        locale: lesson.locale as "en",
        sceneSummary,
        question: question.question,
        chosenAnswer: chosen.text,
        answerCorrect: chosen.isCorrect,
        correctAnswer: correct.text,
        childText: answer.text,
      });

      const { error } = await db.from("reasoning_attempts").insert({
        child_id: child.id,
        lesson_id: lesson.id,
        question_id: questionId,
        answer_correct: chosen.isCorrect,
        text: answer.text,
        quality: verdict.quality,
        moves: verdict.moves,
        response: verdict.response,
        pushback: verdict.pushback,
        flagged: verdict.flagged,
      });
      if (error) throw error;

      written++;
      console.log(
        `  ${verdict.quality.padEnd(11)} correct=${String(chosen.isCorrect).padEnd(5)} ${verdict.moves.join(", ")}`,
      );
    }
  }

  console.log(`\nWrote ${written} attempts for child ${child.name} (${child.id})`);
  console.log(`Sign in as ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`Report: /en/report/${child.id}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
