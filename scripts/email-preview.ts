import { writeFileSync } from "node:fs";
import { renderReportEmail, reportSubject } from "../src/lib/email/report-email";
import { unsubscribeToken, verifyUnsubscribeToken } from "../src/lib/email/tokens";
import type { WeeklyReportRow } from "../src/lib/supabase/types";

/**
 * Renders the weekly email to `email-preview.html` against a realistic frozen
 * report. No database, no provider, no network.
 *
 *   npm run email:preview
 *
 * This exists because an HTML email is the one surface in the product you
 * cannot see by running the app — it is assembled server-side, sent to a third
 * party, and rendered by somebody else's client. Editing the template without
 * a way to look at the result is how emails ship with a broken layout.
 *
 * It also round-trips an unsubscribe token, so a change to the signing code
 * fails here rather than silently invalidating every link in the wild.
 */

process.env.SUPABASE_SERVICE_ROLE_KEY ||= "preview-only-key";

const report = {
  id: "00000000-0000-0000-0000-0000000000r1",
  child_id: "00000000-0000-0000-0000-0000000000c1",
  week_start: "2026-09-08",
  locale: "en",
  attempt_count: 4,
  lesson_count: 2,
  lessons: ["Nelson Mandela", "How rumours spread"],
  quote_attempt_id: "00000000-0000-0000-0000-0000000000a1",
  quote_text:
    "It says they waited 12 hours but that is only the people who stayed. Nobody counted the ones who gave up and went home, so we do not actually know how many wanted to vote.",
  quote_question: "Why did people queue for a whole day to vote?",
  climbing_move: "questioned-source",
  next_move: "made-connection",
  headline: "She stopped trusting the first answer.",
  summary:
    "Maya wrote four explanations this week. Three of them questioned something the question had quietly assumed — including one where she talked herself out of an answer she had already given.",
  dinner_questions: [
    "If nobody counted the people who gave up queuing, what else might we be getting wrong when we count things?",
    "Can you think of a time you changed your mind about something halfway through?",
    "What is something you waited a really long time for?",
  ],
  model: "gemini-3.8-flash",
  created_at: "2026-09-14T17:00:00Z",
  emailed_at: null,
} satisfies WeeklyReportRow;

const token = unsubscribeToken("11111111-2222-3333-4444-555555555555");

console.log("subject:          ", reportSubject("Maya", report));
console.log("token verifies:   ", verifyUnsubscribeToken(token));
console.log("tampered rejected:", verifyUnsubscribeToken(token.slice(0, -1) + "x") === null);
console.log("garbage rejected: ", verifyUnsubscribeToken("nonsense") === null);

const { html, text } = renderReportEmail({
  childName: "Maya",
  report,
  reportUrl: "https://shikhi.digital/en/report/00000000-0000-0000-0000-0000000000c1",
  unsubscribeUrl: `https://shikhi.digital/unsubscribe?token=${token}`,
});

writeFileSync("email-preview.html", html);
console.log("\nwrote email-preview.html");
console.log("\n--- plain text part ---\n" + text);
