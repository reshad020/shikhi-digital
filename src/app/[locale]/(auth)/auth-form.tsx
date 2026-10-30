"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { signIn, signUp, type AuthState } from "@/lib/auth/actions";
import { GoogleButton } from "./google-button";

const initialState: AuthState = {};

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
    <div className="w-full max-w-md rounded-[2rem] border-2 border-border bg-card p-7 shadow-float sm:p-9">
      <header>
        <h1 className="font-heading text-[1.75rem] leading-tight font-extrabold text-balance">
          {isSignUp ? t("signUpTitle") : t("signInTitle")}
        </h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          {isSignUp ? t("signUpSubtitle") : t("signInSubtitle")}
        </p>
      </header>

      {/* Consent is its own panel rather than a stray checkbox in a stack. It
          gates both routes in, it is the legal record for a child's data, and
          a tick box squeezed against wrapping grey text reads as fine print —
          which is the one thing it must not be. */}
      {isSignUp && (
        <ConsentGate
          checked={consented}
          error={consentError}
          onChange={(value) => {
            setConsented(value);
            if (value) setConsentError(false);
          }}
          label={t("consent")}
          errorLabel={t("errConsent")}
        />
      )}

      <div className={isSignUp ? "mt-4" : "mt-7"}>
        <GoogleButton blocked={blocked} onBlocked={() => setConsentError(true)} />
      </div>

      <div className="my-6 flex items-center gap-4">
        <span className="h-0.5 flex-1 rounded-full bg-border" />
        <span className="font-heading text-xs font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
          {t("or")}
        </span>
        <span className="h-0.5 flex-1 rounded-full bg-border" />
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />
        {/* The gate above lives outside this form, so its value is carried in
            rather than posted directly. The server re-checks it regardless. */}
        {isSignUp && <input type="hidden" name="consent" value={consented ? "on" : ""} />}

        {isSignUp && <Field label={t("name")} name="fullName" autoComplete="name" />}

        <Field label={t("email")} name="email" type="email" required autoComplete="email" />

        <Field
          label={t("password")}
          name="password"
          type="password"
          required
          minLength={isSignUp ? 8 : undefined}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          hint={isSignUp ? t("passwordHint") : undefined}
        />

        {state.error && (
          <p
            role="alert"
            className="rounded-2xl border-2 border-destructive/40 bg-destructive/8 px-4 py-3 text-sm font-bold text-destructive"
          >
            {t(state.error)}
          </p>
        )}
        {state.notice && (
          <p
            role="status"
            className="rounded-2xl border-2 border-mint/50 bg-mint/12 px-4 py-3 text-sm font-semibold"
          >
            {t(state.notice)}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="btn-pop mt-1 h-14 rounded-full text-base font-extrabold"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {isSignUp ? t("signUp") : t("signIn")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm font-semibold text-muted-foreground">
        {isSignUp ? t("haveAccount") : t("noAccount")}{" "}
        <Link
          href={isSignUp ? "/signin" : "/signup"}
          className="font-bold text-primary underline underline-offset-4"
        >
          {isSignUp ? t("signInLink") : t("createOne")}
        </Link>
      </p>
    </div>
  );
}

/**
 * A labelled field with real breathing room.
 *
 * The old version stacked `gap-3` between fields and `gap-1.5` between a label
 * and its input — nearly the same number, so nothing grouped and the form read
 * as one undifferentiated column.
 */
function Field({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-heading text-sm font-bold">{label}</span>
      <input
        {...props}
        className="h-13 w-full rounded-2xl border-2 border-border bg-background px-4 text-base font-medium outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-primary"
      />
      {hint && <span className="text-xs font-semibold text-muted-foreground">{hint}</span>}
    </label>
  );
}

/** The consent gate: a large, obviously tappable target, not fine print. */
function ConsentGate({
  checked,
  error,
  onChange,
  label,
  errorLabel,
}: {
  checked: boolean;
  error: boolean;
  onChange: (value: boolean) => void;
  label: string;
  errorLabel: string;
}) {
  return (
    <div className="mt-6">
      <label
        className={`flex cursor-pointer items-start gap-3.5 rounded-[1.25rem] border-2 p-4 transition-colors ${
          error
            ? "border-destructive bg-destructive/8"
            : checked
              ? "border-mint bg-mint/10"
              : "border-border bg-muted/40 hover:border-primary/50"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        {/* Drawn rather than native: a default checkbox is ~13px, sits on the
            text baseline, and cannot be styled consistently across browsers. */}
        <span
          aria-hidden
          className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-[7px] border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 ${
            checked ? "border-mint bg-mint text-white" : "border-muted-foreground/40 bg-background"
          }`}
        >
          {checked && <Check className="size-4" strokeWidth={3.5} />}
        </span>
        <span className="text-sm leading-relaxed font-semibold">{label}</span>
      </label>

      {error && (
        <p role="alert" className="mt-2 text-sm font-bold text-destructive">
          {errorLabel}
        </p>
      )}
    </div>
  );
}
