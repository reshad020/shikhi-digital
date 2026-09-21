import "server-only";

/**
 * The one place email leaves this application.
 *
 * Deliberately a `fetch` against the provider's REST API rather than an SDK:
 * this is a single POST, and a dependency that ships its own HTTP stack is not
 * worth adding for it.
 *
 * **A missing configuration is not an exception.** If the keys are absent the
 * send reports `not-configured` and the caller carries on. The weekly job runs
 * unattended, and a preview deploy without an email provider should log that
 * clearly rather than crash a scheduled task every Sunday.
 */

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: "not-configured" | "failed"; detail?: string };

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  /** URL that turns these emails off. Becomes a one-click header too. */
  unsubscribeUrl,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl?: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!key || !from) return { ok: false, reason: "not-configured" };

  // List-Unsubscribe is what makes a mail client show its own unsubscribe
  // button. Without it, bulk recurring mail gets reported as spam instead of
  // unsubscribed from, and the sending domain's reputation pays for it.
  const headers: Record<string, string> = unsubscribeUrl
    ? {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      }
    : {};

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text, headers }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return { ok: false, reason: "failed", detail: `${response.status} ${detail.slice(0, 300)}` };
    }

    const body = (await response.json()) as { id?: string };
    return { ok: true, id: body.id ?? "unknown" };
  } catch (error) {
    return {
      ok: false,
      reason: "failed",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}
