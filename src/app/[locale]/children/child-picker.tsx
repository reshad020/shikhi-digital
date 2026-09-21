"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AVATAR_CHOICES, ChildAvatar } from "@/components/child-avatar";
import { locales } from "@/i18n/routing";
import {
  createChild,
  removeChild,
  selectChild,
  type ChildFormState,
} from "@/lib/data/children-actions";
import type { Child } from "@/lib/supabase/types";

const initial: ChildFormState = {};
const THIS_YEAR = new Date().getFullYear();

export function ChildPicker({
  childProfiles,
  activeId,
  defaultOpen,
  locale,
}: {
  childProfiles: Child[];
  activeId: string | null;
  defaultOpen: boolean;
  locale: string;
}) {
  const t = useTranslations("children");
  const router = useRouter();
  const [adding, setAdding] = useState(defaultOpen);
  const [avatar, setAvatar] = useState(AVATAR_CHOICES[0]);
  const [state, formAction, pending] = useActionState(
    async (prev: ChildFormState, formData: FormData) => {
      const result = await createChild(prev, formData);
      if (!result.error) {
        setAdding(false);
        router.refresh();
      }
      return result;
    },
    initial,
  );

  async function choose(id: string) {
    await selectChild(id);
    router.push(`/${locale}`);
  }

  return (
    <div className="flex flex-col gap-5">
      {childProfiles.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {childProfiles.map((child) => (
            <li key={child.id}>
              <motion.button
                type="button"
                onClick={() => choose(child.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`flex w-full items-center gap-4 rounded-3xl border-2 bg-card p-5 text-start shadow-pop-sm transition-colors ${
                  child.id === activeId ? "border-primary" : "border-border hover:border-primary/50"
                }`}
              >
                <ChildAvatar avatar={child.avatar} className="size-14 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-heading text-xl font-bold">
                    {child.name}
                  </span>
                  {child.birth_year && (
                    <span className="block text-sm text-muted-foreground">
                      {THIS_YEAR - child.birth_year}
                    </span>
                  )}
                </span>
                {child.id === activeId && <Check className="size-5 shrink-0 text-primary" />}
              </motion.button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <Card className="rounded-3xl border-2">
          <CardContent className="p-6">
            <form action={formAction} className="flex flex-col gap-4">
              <input type="hidden" name="avatar" value={avatar} />

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-bold">{t("name")}</span>
                <input
                  name="name"
                  required
                  maxLength={40}
                  autoFocus
                  className="h-12 rounded-2xl border-2 border-border bg-background px-4 outline-none focus-visible:border-ring"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold">{t("birthYear")}</span>
                  <input
                    name="birthYear"
                    type="number"
                    required
                    min={THIS_YEAR - 18}
                    max={THIS_YEAR}
                    defaultValue={THIS_YEAR - 10}
                    className="h-12 rounded-2xl border-2 border-border bg-background px-4 outline-none focus-visible:border-ring"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold">Language</span>
                  <select
                    name="locale"
                    defaultValue={locale}
                    className="h-12 rounded-2xl border-2 border-border bg-background px-4 outline-none focus-visible:border-ring"
                  >
                    {locales.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-sm font-bold">{t("avatar")}</legend>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_CHOICES.map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setAvatar(choice)}
                      aria-pressed={avatar === choice}
                      aria-label={choice}
                      className={`rounded-2xl border-2 p-0.5 transition-colors ${
                        avatar === choice ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <ChildAvatar avatar={choice} className="size-11" />
                    </button>
                  ))}
                </div>
              </fieldset>

              {state.error && (
                <p role="alert" className="text-sm font-semibold text-destructive">
                  {t(state.error)}
                </p>
              )}

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={pending}
                  className="btn-pop h-12 rounded-full px-6 font-bold"
                >
                  {pending && <Loader2 className="size-4 animate-spin" />}
                  {t("save")}
                </Button>
                {childProfiles.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setAdding(false)}
                    className="h-12 rounded-full px-4 font-bold text-muted-foreground"
                  >
                    {t("cancel")}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => setAdding(true)}
            className="h-12 rounded-full border-2 px-6 font-bold"
          >
            <Plus className="size-4" />
            {t("add")}
          </Button>
          {activeId && (
            <Button
              variant="ghost"
              onClick={async () => {
                await removeChild(activeId);
                router.refresh();
              }}
              className="h-12 rounded-full px-4 font-bold text-destructive"
            >
              <Trash2 className="size-4" />
              {t("remove")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
