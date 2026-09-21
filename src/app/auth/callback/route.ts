import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where Supabase sends a parent back after they click the confirmation link in
 * their email. Exchanges the one-time code for a session cookie.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/children";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${destination}`);
  }

  return NextResponse.redirect(`${origin}/signin?error=callback`);
}
