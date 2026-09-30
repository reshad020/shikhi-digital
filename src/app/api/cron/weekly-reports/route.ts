import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { sendWeeklyReports } from "@/lib/email/weekly";

/**
 * The Sunday trigger.
 *
 * Deliberately provider-agnostic: any scheduler that can issue an authorised
 * GET will do — Vercel Cron, GitHub Actions, a cron line with curl. The Vercel
 * schedule lives in vercel.json (Sundays, 17:00 UTC); Vercel attaches the
 * `Authorization: Bearer $CRON_SECRET` header by itself when that environment
 * variable is set, which is exactly what `authorised` below checks for.
 *
 * The route sits under /api, which the proxy matcher excludes, so it is
 * reachable without a session. `CRON_SECRET` is therefore the only thing
 * standing in front of a job that reads every family's data — and if it is
 * unset the route refuses to run rather than defaulting to open.
 */

export const dynamic = "force-dynamic";

// 60s is the ceiling on Vercel's Hobby plan, and a value above it fails the
// deployment outright rather than being clamped. Raise it to 300 on Pro once
// the family count makes that necessary — the job is safe to cut short either
// way, because `emailed_at` is stamped per report, so a run that times out
// resends nothing and simply leaves the rest for the next trigger.
export const maxDuration = 60;

function authorised(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  if (!authorised(request)) {
    // 404 rather than 401: there is no reason to confirm to an unauthenticated
    // caller that a scheduled job lives at this path.
    return new NextResponse(null, { status: 404 });
  }

  // `?dry=1` renders and counts without sending — the safe way to check a
  // production configuration before letting it mail real parents.
  const dryRun = request.nextUrl.searchParams.get("dry") === "1";

  const summary = await sendWeeklyReports({ dryRun });

  console.info("[cron] weekly reports:", JSON.stringify(summary));
  return NextResponse.json(summary);
}
