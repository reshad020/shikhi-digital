import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PartyPopper, ScanSearch, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PuzzlePlayer } from "@/components/tricks/puzzle-player";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveChild, listChildren } from "@/lib/data/children";
import { getTechnique } from "@/lib/tricks/techniques";
import type { Artefact } from "@/lib/tricks/types";

export default async function TricksPage({ params }: PageProps<"/[locale]/tricks">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const child = await getActiveChild();
  if (!child) {
    const children = await listChildren();
    redirect(`/${locale}/children${children.length === 0 ? "?add=1" : ""}`);
  }

  const t = await getTranslations("tricks");
  const supabase = await createClient();

  const { data: seen } = await supabase
    .from("puzzle_attempts")
    .select("puzzle_id")
    .eq("child_id", child.id);
  const seenIds = (seen ?? []).map((r) => r.puzzle_id);

  // Oldest unseen first, deterministically. A random pick would make this
  // component non-idempotent, and predictable progression through the catalogue
  // is better anyway — a child works through the techniques rather than being
  // shown the same one twice by chance.
  let query = supabase
    .from("trick_puzzles")
    .select("id, artefact, options")
    .eq("status", "ready")
    .eq("locale", locale)
    .order("created_at", { ascending: true })
    .limit(1);
  if (seenIds.length > 0) query = query.not("id", "in", `(${seenIds.join(",")})`);

  const { data: pool } = await query;
  const puzzle = pool?.[0] ?? null;

  // An empty pool has two very different causes and they were being shown the
  // same message. A child who had never played one was told "You have done
  // them all" under a party popper, because nothing was published — praised
  // for work they had not done, about a game they had not seen. So when there
  // is nothing to play, ask whether there was ever anything to play.
  let finishedThem = false;
  if (!puzzle) {
    const { count } = await supabase
      .from("trick_puzzles")
      .select("*", { count: "exact", head: true })
      .eq("status", "ready")
      .eq("locale", locale);
    finishedThem = (count ?? 0) > 0;
  }

  return (
    <>
      <SiteHeader child={child} signedIn />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <h1 className="font-heading text-3xl font-extrabold">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("lead")}</p>

        <div className="mt-8">
          {puzzle ? (
            <PuzzlePlayer
              puzzleId={puzzle.id}
              artefact={puzzle.artefact as Artefact}
              options={(puzzle.options as string[]).map((slug) => ({
                slug,
                label: getTechnique(slug)?.label ?? slug,
              }))}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-4xl border-2 bg-card p-10 text-center shadow-pop">
              {finishedThem ? (
                <PartyPopper className="size-10 text-sunny" aria-hidden />
              ) : (
                <ScanSearch className="size-10 text-muted-foreground" aria-hidden />
              )}
              <p className="font-heading text-2xl font-extrabold">
                {finishedThem ? t("allDone") : t("noneYet")}
              </p>
              <p className="text-muted-foreground">
                {finishedThem ? t("allDoneBody") : t("noneYetBody")}
              </p>
              <Link
                href="/spot-the-trick"
                className="inline-flex items-center gap-1.5 font-bold text-primary underline underline-offset-4"
              >
                <Sparkles className="size-4" />
                {t("readGuide")}
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
