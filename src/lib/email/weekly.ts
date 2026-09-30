import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWeeklyReport } from "@/lib/report/build";
import { startOfWeek } from "@/lib/report/analyse";
import { SITE } from "@/lib/seo/config";
import { renderReportEmail, reportSubject } from "./report-email";
import { emailConfigured, sendEmail } from "./send";
import { unsubscribeToken } from "./tokens";

/**
 * The Sunday job.
 *
 * Runs with the service-role client because there is no session: it has to see
 * every family. That is the exception `admin.ts` exists for, and it is the
 * reason this module is never imported from anything a browser can reach.
 *
 * Three rules keep it from doing damage unattended:
 *
 * 1. **One send per report, ever.** `emailed_at` is stamped after a successful
 *    send, and reports already stamped are skipped. A retried or overlapping
 *    run mails nobody twice.
 * 2. **A failure to send is not a failure to record.** If the provider errors
 *    the timestamp is *not* written, so the next run picks it up again.
 * 3. **Generation happens here too.** Reports are otherwise created lazily
 *    when a parent opens the page, which for an unopened report is never. The
 *    job generates and then sends, and a child below the three-explanation
 *    floor is skipped in silence rather than mailed a thin week.
 */

export type WeeklySendSummary = {
  weekStart: string;
  considered: number;
  sent: number;
  skippedTooEarly: number;
  skippedAlreadySent: number;
  skippedUnsubscribed: number;
  skippedNoEmail: number;
  failed: { childId: string; reason: string }[];
  configured: boolean;
};

export async function sendWeeklyReports({
  /** Defaults to the week that has just ended — the one being reported on. */
  weekStart,
  dryRun = false,
}: { weekStart?: Date; dryRun?: boolean } = {}): Promise<WeeklySendSummary> {
  // Run on a Sunday and the current week is one day old; the week worth
  // reporting on is the one that just closed.
  const week = startOfWeek(weekStart ?? new Date(Date.now() - 24 * 60 * 60 * 1000));
  const weekKey = week.toISOString().slice(0, 10);

  const summary: WeeklySendSummary = {
    weekStart: weekKey,
    considered: 0,
    sent: 0,
    skippedTooEarly: 0,
    skippedAlreadySent: 0,
    skippedUnsubscribed: 0,
    skippedNoEmail: 0,
    failed: [],
    configured: emailConfigured(),
  };

  const supabase = createAdminClient();

  const { data: children, error } = await supabase
    .from("children")
    .select("id, name, parent_id, profiles!children_parent_id_fkey(id, email, weekly_email)");

  if (error) {
    summary.failed.push({ childId: "-", reason: `query failed: ${error.message}` });
    return summary;
  }

  for (const child of children ?? []) {
    summary.considered++;

    const parent = child.profiles as { id: string; email: string | null; weekly_email: boolean } | null;

    if (!parent?.email) {
      summary.skippedNoEmail++;
      continue;
    }
    if (!parent.weekly_email) {
      summary.skippedUnsubscribed++;
      continue;
    }

    try {
      const result = await getWeeklyReport({
        childId: child.id,
        weekStart: week,
        client: supabase,
      });

      // A thin week gets no report and therefore no email. Mailing "your child
      // did not do much" every Sunday is how a parent learns to filter these.
      if (result.status === "tooEarly") {
        summary.skippedTooEarly++;
        continue;
      }

      if (result.report.emailed_at) {
        summary.skippedAlreadySent++;
        continue;
      }

      const reportUrl = `${SITE.url}/${result.report.locale}/report/${child.id}`;
      const hubUrl = `${SITE.url}/${result.report.locale}/parent`;
      const unsubscribeUrl = `${SITE.url}/unsubscribe?token=${encodeURIComponent(
        unsubscribeToken(parent.id),
      )}`;

      const { html, text } = renderReportEmail({
        childName: child.name,
        report: result.report,
        reportUrl,
        hubUrl,
        unsubscribeUrl,
      });

      if (dryRun) {
        summary.sent++;
        continue;
      }

      const sent = await sendEmail({
        to: parent.email,
        subject: reportSubject(child.name, result.report),
        html,
        text,
        unsubscribeUrl,
      });

      if (!sent.ok) {
        summary.failed.push({ childId: child.id, reason: sent.reason + (sent.detail ? `: ${sent.detail}` : "") });
        continue;
      }

      // Only now. Stamping before the send would lose a report on any provider
      // error, and this is the one artefact the product exists to deliver.
      await supabase
        .from("weekly_reports")
        .update({ emailed_at: new Date().toISOString() })
        .eq("id", result.report.id);

      summary.sent++;
    } catch (cause) {
      summary.failed.push({
        childId: child.id,
        reason: cause instanceof Error ? cause.message : String(cause),
      });
    }
  }

  return summary;
}
