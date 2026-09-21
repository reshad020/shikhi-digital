"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/** Google's brand mark. Inline because lucide ships no third-party logos. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="size-5">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

/**
 * The primary way into the product.
 *
 * The OAuth call runs in the BROWSER rather than a server action on purpose:
 * the redirect target has to be this origin, and on Vercel that is a different
 * host for every preview deployment. `window.location.origin` is correct in all
 * of them for free, where a server-side equivalent would need a header read or
 * a per-environment variable.
 *
 * It deliberately sends no `next` parameter. Supabase matches `redirectTo`
 * against an allow-list, and a query string is the kind of thing that makes a
 * launch-day match fail silently — so every Google arrival lands on the
 * callback's default, `/children`, which is where a new parent has to go
 * anyway. Email sign-in still honours `next`.
 */
export function GoogleButton({
  /** Signup gates this on the consent checkbox — see `consented_at`. */
  blocked = false,
  onBlocked,
}: {
  blocked?: boolean;
  onBlocked?: () => void;
}) {
  const t = useTranslations("auth");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (blocked) {
      onBlocked?.();
      return;
    }

    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    // On success the browser is already navigating away, so this only runs when
    // the provider is misconfigured or unreachable.
    if (oauthError) {
      setError("errOauth");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={start}
        disabled={pending}
        aria-disabled={blocked}
        className="h-12 rounded-2xl border-2 text-base font-bold"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <GoogleMark />}
        {t("google")}
      </Button>

      {error && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {t(error)}
        </p>
      )}
    </div>
  );
}
