"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { signIn, signUp, type AuthState } from "@/lib/auth/actions";
import { GoogleButton } from "./google-button";

const initialState: AuthState = {};

const FIELD =
  "h-12 w-full rounded-2xl border-2 border-border bg-background px-4 text-base outline-none focus-visible:border-ring";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const t = useTranslations("auth");
  const isSignUp = mode === "signup";
  const [state, formAction, pending] = useActionState(
    isSignUp ? signUp : signIn,
    initialState,
  );
  const next = useSearchParams().get("next") ?? "/";

  /**
   * Consent is lifted out of the form because BOTH ways in have to record it.
   *
   * `handle_new_user` stamps `profiles.consented_at` on any auth.users insert,
   * Google included — so without this gate an OAuth signup would record a
   * parent's consent that the parent never actually gave. The timestamp is the
   * consent record for a product used by 8–13 year olds; it has to correspond
   * to a real affirmative act.
   */
  const [consented, setConsented] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const blocked = isSignUp && !consented;

  return (
    <Card className="w-full max-w-sm rounded-3xl border-2 shadow-pop">
      <CardContent className="p-7">
        <h1 className="font-heading text-2xl font-extrabold">
          {isSignUp ? t("signUpTitle") : t("signInTitle")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSignUp ? t("signUpSubtitle") : t("signInSubtitle")}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {isSignUp && (
            <label className="flex items-start gap-2.5 text-sm leading-snug text-muted-foreground">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => {
                  setConsented(e.target.checked);
                  if (e.target.checked) setConsentError(false);
                }}
                className="mt-0.5 size-5 shrink-0 accent-primary"
              />
              <span>{t("consent")}</span>
            </label>
          )}

          <GoogleButton blocked={blocked} onBlocked={() => setConsentError(true)} />

          {consentError && (
            <p role="alert" className="text-sm font-semibold text-destructive">
              {t("errConsent")}
            </p>
          )}
        </div>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-bold uppercase text-muted-foreground">{t("or")}</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="next" value={next} />
          {/* The checkbox above lives outside this form, so its value is
              carried in rather than posted directly. The server re-checks it. */}
          {isSignUp && (
            <input type="hidden" name="consent" value={consented ? "on" : ""} />
          )}

          {isSignUp && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold">{t("name")}</span>
              <input name="fullName" autoComplete="name" className={FIELD} />
            </label>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold">{t("email")}</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className={FIELD}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold">{t("password")}</span>
            <input
              type="password"
              name="password"
              required
              minLength={isSignUp ? 8 : undefined}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className={FIELD}
            />
          </label>

          {state.error && (
            <p role="alert" className="text-sm font-semibold text-destructive">
              {t(state.error)}
            </p>
          )}
          {state.notice && (
            <p role="status" className="rounded-2xl bg-mint/15 p-3 text-sm font-semibold text-mint">
              {t(state.notice)}
            </p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="btn-pop mt-2 h-12 rounded-2xl text-base font-bold"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {isSignUp ? t("signUp") : t("signIn")}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isSignUp ? t("haveAccount") : t("noAccount")}{" "}
          <Link
            href={isSignUp ? "/signin" : "/signup"}
            className="font-bold text-primary underline underline-offset-4"
          >
            {isSignUp ? t("signInLink") : t("createOne")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
