"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Mail, MailX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setWeeklyEmail } from "@/lib/parent/email-actions";

/**
 * The weekly-email switch, on the page a parent actually lands on.
 *
 * It already existed at the bottom of one child's report, which is the wrong
 * place for an account-level preference — a setting buried inside a document
 * about one child reads as being about that child.
 */
export function EmailToggle({ enabled }: { enabled: boolean }) {
  const t = useTranslations("parent");
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() => startTransition(() => setWeeklyEmail(!enabled))}
      className="h-10 rounded-full border-2 font-bold"
      aria-pressed={enabled}
    >
      {enabled ? <MailX className="size-4" /> : <Mail className="size-4" />}
      {enabled ? t("emailStop") : t("emailStart")}
    </Button>
  );
}
