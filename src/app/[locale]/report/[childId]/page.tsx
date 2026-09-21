import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Mail, MailX, MessageCircleQuestion, Quote, Sprout, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { MOVE_LABELS, type ThinkingMove } from "@/lib/reasoning/moves";
import { getWeeklyReport } from "@/lib/report/build";
import { createClient } from "@/lib/supabase/server";
import { setWeeklyEmail } from "./actions";

export const metadata: Metadata = {
  title: "This week's thinking",
  // The parent is authenticated and row level security scopes this to their own
  // children, but a page of a child's writing still has no business in an index.
  robots: { index: false, follow: false },
};

export default async function ReportPage({ params }: PageProps<"/[locale]/report/[childId]">) {
  const { locale, childId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("report");

  // Row level security means a childId belonging to another family simply
  // returns nothing, so there is no ownership check to write here.
  const result = await getWeeklyReport({ childId });

  if (result.status === "tooEarly") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
        <Sprout className="size-12 text-mint" aria-hidden />
        <h1 className="font-heading text-3xl font-extrabold">{t("tooEarlyTitle")}</h1>
        <p className="text-muted-foreground">
          {t("tooEarlyBody", { need: result.need, have: result.have })}
        </p>
        <Button className="btn-pop mt-2 h-12 rounded-full px-6 font-bold" render={<Link href="/" />}>
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("tooEarlyCta")}
        </Button>
      </main>
    );
  }

  const { report } = result;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("weekly_email").eq("id", user.id).maybeSingle()
    : { data: null };
  const emailOn = profile?.weekly_email ?? false;
  const lessons: string[] = (report.lessons as string[]);
  const questions: string[] = (report.dinner_questions as string[]);

  const weekLabel = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(report.week_start));

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <header className="border-b pb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("weekOf", { date: weekLabel })}
        </p>
        <h1 className="mt-2 font-heading text-4xl font-extrabold text-balance">
          {report.headline}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{report.summary}</p>
      </header>

      {/* The quote. Reproduced exactly as the child typed it — this is the one
          thing on the page a parent will read closely. */}
      <section className="mt-8 rounded-3xl border-2 bg-card p-6 shadow-pop">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <Quote className="size-4" aria-hidden />
          {t("theirWords")}
        </p>
        {report.quote_question && (
          <p className="mt-3 text-sm font-semibold text-muted-foreground">
            {t("answering")}: “{report.quote_question}”
          </p>
        )}
        <blockquote className="mt-3 font-heading text-2xl leading-snug font-bold text-balance">
          “{report.quote_text}”
        </blockquote>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border-2 bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-mint">
            <TrendingUp className="size-4" aria-hidden />
            {t("leaningOn")}
          </p>
          <p className="mt-2 font-heading text-xl font-bold">
            {MOVE_LABELS[report.climbing_move as ThinkingMove] ?? report.climbing_move}
          </p>
        </div>
        <div className="rounded-2xl border-2 bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-tangerine">
            <Sprout className="size-4" aria-hidden />
            {t("lookNext")}
          </p>
          <p className="mt-2 font-heading text-xl font-bold">
            {MOVE_LABELS[report.next_move as ThinkingMove] ?? report.next_move}
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border-2 bg-card p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          {t("explored")}
        </p>
        <p className="mt-2 font-semibold">{lessons.join(" · ")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("explanations", { count: report.attempt_count })}
        </p>
      </section>

      {/* The retention half: a reason to talk at the table, away from the app. */}
      <section className="mt-6 rounded-3xl border-2 border-primary/30 bg-primary/5 p-6">
        <p className="flex items-center gap-2 font-heading text-xl font-extrabold">
          <MessageCircleQuestion className="size-5 text-primary" aria-hidden />
          {t("dinnerTitle")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{t("dinnerBlurb")}</p>
        <ol className="mt-4 flex flex-col gap-3">
          {questions.map((question, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="text-lg font-medium leading-snug">{question}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* The delivery preference lives with the thing being delivered, rather
          than in a settings page nobody opens. */}
      <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dashed bg-card p-5">
        <p className="text-sm font-semibold">
          {emailOn ? t("emailOnLabel") : t("emailOffLabel")}
        </p>
        <form action={setWeeklyEmail}>
          <input type="hidden" name="enabled" value={emailOn ? "false" : "true"} />
          <Button
            type="submit"
            variant="outline"
            className="h-10 rounded-full border-2 font-bold"
          >
            {emailOn ? <MailX className="size-4" /> : <Mail className="size-4" />}
            {emailOn ? t("emailStop") : t("emailStart")}
          </Button>
        </form>
      </section>

      <footer className="mt-8 border-t pt-5 text-sm text-muted-foreground">
        {t("footer")}
      </footer>
    </main>
  );
}
