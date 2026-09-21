import "server-only";
import { MOVE_LABELS, type ThinkingMove } from "@/lib/reasoning/moves";
import { SITE } from "@/lib/seo/config";
import type { WeeklyReportRow } from "@/lib/supabase/types";

/**
 * The weekly email.
 *
 * **The email carries the report, it does not link to it.** That is the whole
 * design. A notification saying "your report is ready" asks a tired parent on
 * a Sunday evening to click, wait, and possibly sign in — and most will not.
 * Putting the headline, the summary, their child's actual words and the three
 * dinner questions in the body means the thing is delivered whether or not
 * anybody clicks.
 *
 * It also settles how sharing works. A parent who wants the other parent to
 * see this forwards the email, which needs no capability URL, no second
 * account, and no unauthenticated route serving a child's writing. The
 * old share-by-link exposure was removed deliberately; this does not bring it
 * back.
 */

/** Escapes text destined for an HTML email. Every field here is user or model text. */
function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function reportSubject(childName: string, report: WeeklyReportRow) {
  // The headline, not "Your weekly report". A subject line that says what
  // actually happened is the difference between opened and archived.
  return `${childName} this week: ${report.headline}`;
}

export function renderReportEmail({
  childName,
  report,
  reportUrl,
  unsubscribeUrl,
}: {
  childName: string;
  report: WeeklyReportRow;
  reportUrl: string;
  unsubscribeUrl: string;
}): { html: string; text: string } {
  const questions = (report.dinner_questions as string[]) ?? [];
  const climbing = MOVE_LABELS[report.climbing_move as ThinkingMove] ?? report.climbing_move;
  const next = MOVE_LABELS[report.next_move as ThinkingMove] ?? report.next_move;

  const weekLabel = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(report.week_start));

  const text = [
    `${childName} this week`,
    `Week of ${weekLabel}`,
    "",
    report.headline,
    "",
    report.summary,
    "",
    "IN THEIR OWN WORDS",
    report.quote_question ? `On: ${report.quote_question}` : "",
    `"${report.quote_text}"`,
    "Copied exactly as they wrote it.",
    "",
    `Climbing: ${climbing}`,
    `Try next: ${next}`,
    "",
    "THREE QUESTIONS FOR THE TABLE",
    ...questions.map((q, i) => `${i + 1}. ${q}`),
    "",
    `Read it online: ${reportUrl}`,
    `Stop these emails: ${unsubscribeUrl}`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  // Inline styles and a table shell: email clients strip <style> blocks, and
  // several still do not lay out flexbox.
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f5f1;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(report.summary.slice(0, 140))}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f1;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:2px solid #e6e3ef;border-radius:24px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#241f36;">

        <tr><td style="padding:28px 28px 0;">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#6f6a86;">
            ${esc(childName)} &middot; week of ${esc(weekLabel)}
          </p>
          <h1 style="margin:10px 0 0;font-size:26px;line-height:1.2;font-weight:800;">${esc(report.headline)}</h1>
          <p style="margin:14px 0 0;font-size:16px;line-height:1.65;color:#4a4560;">${esc(report.summary)}</p>
        </td></tr>

        <tr><td style="padding:22px 28px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1fd;border:2px solid #ddd5f7;border-radius:18px;">
            <tr><td style="padding:18px 20px;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#6f6a86;">In their own words</p>
              ${
                report.quote_question
                  ? `<p style="margin:8px 0 0;font-size:13px;font-weight:600;color:#6f6a86;">On: ${esc(report.quote_question)}</p>`
                  : ""
              }
              <p style="margin:10px 0 0;font-size:18px;line-height:1.55;font-weight:700;">&ldquo;${esc(report.quote_text)}&rdquo;</p>
              <p style="margin:12px 0 0;font-size:12px;font-weight:600;color:#6f6a86;">Copied exactly as they wrote it.</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:18px 28px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" valign="top" style="padding-right:6px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #e6e3ef;border-radius:16px;">
                  <tr><td style="padding:14px 16px;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;color:#6f6a86;">Climbing</p>
                    <p style="margin:6px 0 0;font-size:16px;font-weight:800;">${esc(climbing)}</p>
                  </td></tr>
                </table>
              </td>
              <td width="50%" valign="top" style="padding-left:6px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #e6e3ef;border-radius:16px;">
                  <tr><td style="padding:14px 16px;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;color:#6f6a86;">Try next</p>
                    <p style="margin:6px 0 0;font-size:16px;font-weight:800;">${esc(next)}</p>
                  </td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:22px 28px 0;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#6f6a86;">Three questions for the table</p>
          <p style="margin:6px 0 0;font-size:13px;color:#6f6a86;">No screen needed. The last is the easiest to answer.</p>
          <ol style="margin:12px 0 0;padding-left:20px;font-size:16px;line-height:1.6;font-weight:600;">
            ${questions.map((q) => `<li style="margin-bottom:8px;">${esc(q)}</li>`).join("")}
          </ol>
        </td></tr>

        <tr><td style="padding:26px 28px 28px;">
          <a href="${esc(reportUrl)}" style="display:inline-block;background:#6b41e8;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 24px;border-radius:999px;">Open it online</a>
          <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#8a8599;">
            Forward this to anyone who should read it. The online version stays behind your account.
            <br>
            <a href="${esc(unsubscribeUrl)}" style="color:#8a8599;">Stop these weekly emails</a>
            &middot; ${esc(SITE.name)}
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { html, text };
}
