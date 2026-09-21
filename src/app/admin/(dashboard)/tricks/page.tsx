import { Send, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArtefactView } from "@/components/tricks/artefact";
import { createClient } from "@/lib/supabase/server";
import { getTechnique } from "@/lib/tricks/techniques";
import { locales } from "@/i18n/routing";
import type { Artefact } from "@/lib/tricks/types";
import { deletePuzzle, generateTrickPuzzles, publishPuzzle } from "../../daily-actions";

export default async function AdminTricksPage() {
  const supabase = await createClient();
  const { data: puzzles } = await supabase
    .from("trick_puzzles")
    .select("*")
    .order("created_at", { ascending: false });

  const drafts = (puzzles ?? []).filter((p) => p.status === "draft");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold">Spot the Trick</h1>
        <p className="text-sm text-muted-foreground">
          One puzzle per technique. Check the trick is genuinely present in the artefact before
          publishing — a puzzle whose answer is not really there teaches the wrong lesson.
        </p>
      </div>

      <Card className="rounded-2xl border-2">
        <CardContent className="p-5">
          <form action={generateTrickPuzzles} className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold">Language</span>
              <select
                name="locale"
                defaultValue="en"
                className="h-10 rounded-xl border-2 border-border bg-background px-3"
              >
                {locales.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" className="h-10 rounded-full font-bold">
              <Sparkles className="size-4" />
              Generate one per technique
            </Button>
            {drafts.length > 0 && (
              <span className="text-sm font-semibold text-tangerine">
                {drafts.length} awaiting review
              </span>
            )}
          </form>
        </CardContent>
      </Card>

      <ul className="flex flex-col gap-3">
        {(puzzles ?? []).map((p) => (
          <li key={p.id}>
            <Card className="rounded-2xl border-2">
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full">
                    {getTechnique(p.technique)?.label ?? p.technique}
                  </Badge>
                  <Badge className="rounded-full">{p.locale}</Badge>
                  <Badge
                    className={
                      p.status === "ready"
                        ? "rounded-full bg-mint/20 text-mint"
                        : "rounded-full bg-sunny/20 text-tangerine"
                    }
                  >
                    {p.status}
                  </Badge>
                  <span className="ms-auto flex items-center gap-2">
                    {p.status === "draft" && (
                      <form
                        action={async () => {
                          "use server";
                          await publishPuzzle(p.id);
                        }}
                      >
                        <Button type="submit" size="sm" className="rounded-full font-bold">
                          <Send className="size-3.5" />
                          Publish
                        </Button>
                      </form>
                    )}
                    <form
                      action={async () => {
                        "use server";
                        await deletePuzzle(p.id);
                      }}
                    >
                      <Button
                        type="submit"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Delete"
                        className="rounded-full text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </form>
                  </span>
                </div>

                <ArtefactView artefact={p.artefact as Artefact} />
                <p className="text-sm text-muted-foreground">{p.explanation}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
