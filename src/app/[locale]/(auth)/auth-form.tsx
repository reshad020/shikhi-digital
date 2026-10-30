"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { GoogleButton } from "./google-button";

/**
 * One way in: Google.
 *
 * Email and password were removed rather than hidden. Hosted Supabase requires
 * a confirmation mail before a new account can be used, and its built-in mail
 * service is rate limited to a couple of messages an hour and is not meant for
 * production -- so the email path was a door that opened onto a wall. One
 * working way in beats two where the second strands people.
 *
 * CONSENT IS ASKED ON BOTH PAGES, which is the part worth not getting wrong.
 * `signInWithOAuth` has no sign-in-only mode: a parent who has never been here
 * before and lands on /signin gets an account created by that same click. Since
 * `handle_new_user` stamps `profiles.consented_at` on any insert into
 * auth.users, gating only /signup would record consent that nobody gave, for a
 * product used by 8-13 year olds. A returning parent ticks one box; that is a
 * cheap price for the timestamp meaning something.
 */
export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const t = useTranslations("auth");
  const isSignUp = mode === "signup";

  const [consented, setConsented] = useState(false);
  const [consentError, setConsentError] = useState(false);

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
          is the legal record for a child's data, and a tick box squeezed
          against wrapping grey text reads as fine print — which is the one
          thing it must not be. */}
      <ConsentGate
        checked={consented}
        error={consentError}
        onChange={(value) => {
          setConsented(value);
          if (value) setConsentError(false);
        }}
        label={t("consent")}
        errorLabel={t("errConsent")}
        privacyLabel={t("privacyLink")}
      />

      <div className="mt-5">
        <GoogleButton blocked={!consented} onBlocked={() => setConsentError(true)} />
      </div>

      {/* Both pages now do exactly the same thing, so the old "already have an
          account?" link would send people in a circle. This says the quiet part
          instead. */}
      <p className="mt-6 text-center text-sm leading-relaxed font-semibold text-muted-foreground">
        {t("googleNote")}
      </p>
    </div>
  );
}

/** The consent gate: a large, obviously tappable target, not fine print. */
function ConsentGate({
  checked,
  error,
  onChange,
  label,
  errorLabel,
  privacyLabel,
}: {
  checked: boolean;
  error: boolean;
  onChange: (value: boolean) => void;
  label: string;
  errorLabel: string;
  privacyLabel: string;
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

      {/* Outside the label on purpose: inside it, tapping the link would toggle
          the checkbox instead of opening the policy. */}
      <p className="mt-2.5 px-1 text-sm">
        <Link
          href="/privacy"
          className="font-semibold text-muted-foreground underline underline-offset-4 hover:text-primary"
        >
          {privacyLabel}
        </Link>
      </p>
    </div>
  );
}
