import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyUnsubscribeToken } from "@/lib/email/tokens";
import { SITE } from "@/lib/seo/config";

/**
 * One-click unsubscribe.
 *
 * Reachable without a session on purpose. An unsubscribe link that asks a
 * parent to sign in first is how recurring mail gets reported as spam instead
 * of unsubscribed from, and mail clients expect `List-Unsubscribe-Post` to
 * work with a bare POST and no cookies.
 *
 * The blast radius is one boolean. A valid token sets `weekly_email = false`
 * on one profile and nothing else; it reads nothing back, reveals nothing
 * about the account, and is not a route to the report. An invalid one gets
 * the same page as a valid one, so the endpoint cannot be used to test
 * whether a token or an account exists.
 */

export const dynamic = "force-dynamic";

async function unsubscribe(token: string | null) {
  if (!token) return;
  const profileId = verifyUnsubscribeToken(token);
  if (!profileId) return;

  const supabase = createAdminClient();
  await supabase.from("profiles").update({ weekly_email: false }).eq("id", profileId);
}

function page() {
  return new NextResponse(
    `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Unsubscribed</title><meta name="robots" content="noindex"></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f6f5f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#241f36;">
  <main style="max-width:26rem;padding:2.5rem;text-align:center;background:#fff;border:2px solid #e6e3ef;border-radius:24px;margin:1rem;">
    <h1 style="margin:0;font-size:1.5rem;font-weight:800;">That is switched off</h1>
    <p style="margin:0.75rem 0 0;line-height:1.6;color:#4a4560;">
      You will not get the weekly thinking report by email any more. It is still there whenever you want it, signed in.
    </p>
    <a href="${SITE.url}" style="display:inline-block;margin-top:1.5rem;background:#6b41e8;color:#fff;text-decoration:none;font-weight:700;padding:0.7rem 1.4rem;border-radius:999px;">${SITE.name}</a>
  </main>
</body></html>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export async function GET(request: NextRequest) {
  await unsubscribe(request.nextUrl.searchParams.get("token"));
  return page();
}

/** What a mail client's own unsubscribe button sends. */
export async function POST(request: NextRequest) {
  await unsubscribe(request.nextUrl.searchParams.get("token"));
  return page();
}
