import { getTranslations } from "next-intl/server";
import { Check, Flame } from "lucide-react";
import type { DailyGoal } from "@/lib/yle/goal";

/**
 * Today's goal, as a row of dots.
 *
 * Dots rather than a percentage or a ring, for the same reason the maths
 * player uses them: "two of three" is a thing a child can see without reading,
 * and a goal they have to decode is not doing its job.
 *
 * The copy stops at the goal on purpose. Once it is met the card congratulates
 * and says nothing about carrying on — no "keep going", no next target
 * appearing where the last one was. A goal that moves when you reach it is not
 * a goal, and a child learns within a week that finishing is not possible
 * here. They are welcome to continue; they will not be nudged to.
 */
export async function GoalRing({ goal, streak }: { goal: DailyGoal; streak: number }) {
  const t = await getTranslations("yleGoal");

  return (
    <section
      className={`flex items-center gap-4 rounded-[1.5rem] border-2 p-5 ${
        goal.met ? "border-mint/60 bg-mint/10" : "border-border bg-card"
      }`}
    >
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
          goal.met ? "bg-mint text-[oklch(0.28_0.07_165)]" : "bg-muted text-muted-foreground"
        }`}
        aria-hidden
      >
        {goal.met ? <Check className="size-6" /> : <Flame className="size-6" />}
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-heading font-extrabold">
          {goal.met ? t("met") : t("todayTitle", { done: goal.doneToday, goal: goal.goal })}
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5" aria-hidden>
          {Array.from({ length: goal.goal }).map((_, i) => (
            <span
              key={i}
              className={`h-2.5 w-7 rounded-full ${
                i < goal.doneToday ? "bg-mint" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {streak > 0 && (
          <p className="mt-2 text-xs font-bold text-tangerine">{t("streak", { n: streak })}</p>
        )}
      </div>
    </section>
  );
}
