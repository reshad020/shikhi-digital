import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

// Next.js 16 renamed `middleware.ts` to `proxy.ts`.

const handleIntl = createIntlMiddleware(routing);

/**
 * Signed-out visitors may see these; everything else needs an account.
 *
 * /spot-the-trick is the public content hub (SEO_PLAN hub C). Gating it would
 * make every page in it invisible to crawlers, which defeats the point of
 * publishing it.
 *
 * /unsubscribe is public by necessity rather than convenience: a mail client's
 * one-click unsubscribe sends a bare POST with no cookies, and a link that
 * demands a login is how recurring mail gets reported as spam instead. It
 * carries a signed token and can only flip one boolean — see lib/email/tokens.
 */
const PUBLIC_PATHS = ["/signin", "/signup", "/auth", "/spot-the-trick", "/unsubscribe"];

/**
 * Routes that live OUTSIDE the `[locale]` tree.
 *
 * These must never reach the locale negotiator. next-intl rewrites everything
 * it is handed into the locale tree, so `/auth/callback` becomes
 * `/en/auth/callback`, which does not exist — a flat 404.
 *
 * This was a live bug before `/unsubscribe` existed and only `/admin` was
 * excluded: **`/auth/callback` has always 404'd**. It went unnoticed because
 * email confirmation is off locally, so the one route Supabase redirects to
 * after a real signup was never exercised. Turning confirmation on in a hosted
 * project would have broken every new account.
 *
 * Anything added under `src/app/` but not under `src/app/[locale]/` belongs
 * here.
 */
const UNLOCALIZED = ["/admin", "/auth", "/unsubscribe"];

function isUnlocalized(pathname: string) {
  return UNLOCALIZED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Strips the locale prefix so path checks work in every language. */
function unlocalized(pathname: string) {
  const [, maybeLocale, ...rest] = pathname.split("/");
  return (routing.locales as readonly string[]).includes(maybeLocale)
    ? `/${rest.join("/")}`
    : pathname;
}

/** Same-origin URL for a path, keeping whatever locale prefix was in use. */
function landing(request: NextRequest, path: string) {
  const url = request.nextUrl.clone();
  const [, maybeLocale] = request.nextUrl.pathname.split("/");
  const prefix = (routing.locales as readonly string[]).includes(maybeLocale)
    ? `/${maybeLocale}`
    : "";
  url.pathname = `${prefix}${path}`;
  url.search = "";
  return url;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes outside the [locale] tree pass through untouched; everything else
  // goes to the locale negotiator.
  const response = isUnlocalized(pathname)
    ? NextResponse.next({ request })
    : handleIntl(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          // Written to both: the request so downstream reads see the refreshed
          // token, and the response so the browser keeps it.
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          list.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshes an expiring token as a side effect. Without this call in the
  // proxy, sessions silently expire mid-visit.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const bare = unlocalized(pathname);
  const isPublic =
    bare === "/" || PUBLIC_PATHS.some((p) => bare === p || bare.startsWith(`${p}/`));

  if (!user && !isPublic) {
    const signIn = request.nextUrl.clone();
    signIn.pathname = "/signin";
    signIn.search = "";
    // Come back to where they were headed once they are in.
    signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }

  // Already signed in and back on an auth page: the hub, for the same reason
  // as the sign-in redirect itself.
  if (user && (bare === "/signin" || bare === "/signup")) {
    return NextResponse.redirect(landing(request, "/parent"));
  }

  // "/" is the marketing page, and a signed-in family has already been sold
  // to. It goes to the LIBRARY rather than the parent hub because "/" is what
  // the logo links to, and on a shared device that tap is nearly always a
  // child wanting the next lesson. An adult arriving deliberately comes
  // through sign-in, the header, or a link in the weekly email.
  //
  // Bouncing here rather than branching inside the page is what lets the
  // landing page stay statically rendered: the session has been resolved above
  // regardless, so this check costs nothing extra.
  if (user && bare === "/") {
    return NextResponse.redirect(landing(request, "/learn"));
  }

  // The admin ROLE is checked in the admin layout rather than here: reading it
  // costs a database round trip, and row level security enforces it at the data
  // layer regardless. This only establishes that somebody is signed in.
  return response;
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
