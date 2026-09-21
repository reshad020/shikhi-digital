"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { BookOpen, PenLine, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { LessonCard } from "@/lib/data/lessons";

/**
 * The browse grid.
 *
 * Until this existed the only route into a lesson was typing its slug, so the
 * entire product sat behind a URL nobody had. Cards lead with the storyboard's
 * own title and hook rather than the admin's subject line, because the hook is
 * the sentence written to make a child want to start.
 *
 * The "2 to defend" chip is deliberate: it tells a child up front that they
 * will be asked to explain themselves, which makes the ask feel like part of
 * the game instead of an ambush at the end.
 */

const TONES = [
  "bg-grape/12 border-grape/35",
  "bg-mint/15 border-mint/45",
  "bg-sunny/18 border-sunny/50",
  "bg-sky/12 border-sky/40",
  "bg-bubblegum/12 border-bubblegum/35",
  "bg-tangerine/14 border-tangerine/40",
] as const;

export function LessonGrid({ lessons }: { lessons: LessonCard[] }) {
  const t = useTranslations("library");
  const reduced = useReducedMotion();

  if (lessons.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[1.75rem] border-2 border-dashed border-border bg-card p-12 text-center">
        <BookOpen className="size-9 text-muted-foreground" aria-hidden />
        <p className="font-heading text-xl font-extrabold">{t("emptyTitle")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t("emptyBody")}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {lessons.map((lesson, i) => (
        <motion.div
          key={lesson.slug}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 250, damping: 24, delay: (i % 6) * 0.06 }}
          whileHover={reduced ? undefined : { y: -5 }}
        >
          <Link
            href={`/learn/${lesson.slug}`}
            className="flex h-full flex-col gap-3 rounded-[1.75rem] border-2 border-border bg-card p-5 shadow-pop-sm transition-shadow hover:shadow-float focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span
              className={`grid size-16 place-items-center rounded-3xl border-2 text-3xl ${TONES[i % TONES.length]}`}
              aria-hidden
            >
              {lesson.heroEmoji}
            </span>

            <h3 className="font-heading text-xl leading-tight font-extrabold text-balance">
              {lesson.title}
            </h3>
            <p className="text-sm leading-relaxed font-medium text-muted-foreground">
              {lesson.hook}
            </p>

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
              <Chip icon={<BookOpen className="size-3" />} label={t("scenes", { count: lesson.scenes })} />
              <Chip icon={<Sparkles className="size-3" />} label={t("questions", { count: lesson.questions })} />
              {lesson.defends > 0 && (
                <Chip
                  icon={<PenLine className="size-3" />}
                  label={t("defends", { count: lesson.defends })}
                  accent
                />
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

function Chip({
  icon,
  label,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
        accent ? "bg-grape/12 text-grape" : "bg-muted text-muted-foreground"
      }`}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </span>
  );
}
