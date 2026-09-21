"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { signIn, signUp, type AuthState } from "@/lib/auth/actions";

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

  return (
    <Card className="w-full max-w-sm rounded-3xl border-2 shadow-pop">
      <CardContent className="p-7">
        <h1 className="font-heading text-2xl font-extrabold">
          {isSignUp ? t("signUpTitle") : t("signInTitle")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSignUp ? t("signUpSubtitle") : t("signInSubtitle")}
        </p>

        <form action={formAction} className="mt-6 flex flex-col gap-3">
          <input type="hidden" name="next" value={next} />

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

          {isSignUp && (
            <label className="mt-1 flex items-start gap-2.5 text-sm leading-snug text-muted-foreground">
              <input
                type="checkbox"
                name="consent"
                required
                className="mt-0.5 size-5 shrink-0 accent-primary"
              />
              <span>{t("consent")}</span>
            </label>
          )}

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
