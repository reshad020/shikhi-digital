import { Send, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { locales } from "@/i18n/routing";
import {
  deleteSteelmanPrompt,
  generateSteelmanPrompts,
  publishSteelmanPrompt,
} from "../../steelman-actions";

export default async function AdminSteelmanPage() {
  const supabase = await createClient();
  const { data: prompts } = await supabase
    .from("steelman_prompts")
    .select("*")
    .order("created_at", { ascending: false });

  const drafts = (prompts ?? []).filter((p) => p.status === "draft");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold">Steelman Arena</h1>
        <p className="text-sm text-muted-foreground">
          Review for one thing above all: <strong>can both sides genuinely be argued?</strong> If
          one is obviously right, every child will write a strawman and be marked down for our
          mistake. The two prepared arguments are shown side by side below — if one is clearly
          weaker, delete the claim rather than publishing it.
        </p>
      </div>

      <Card className="rounded-2xl border-2">
        <CardContent className="p-5">
          <form action={generateSteelmanPrompts} className="flex flex-wrap items-end gap-3">
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

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold">How many</span>
              <input
                name="count"
                type="number"
                min={1}
                max={6}
                defaultValue={3}
                className="h-10 w-20 rounded-xl border-2 border-border bg-background px-3"
              />
            </label>

            <label className="flex min-w-56 flex-1 flex-col gap-1.5">
              <span className="text-sm font-bold">Topic nudge (optional)</span>
              <input
                name="topic"
                placeholder="school rules, pets, pocket money"
                className="h-10 rounded-xl border-2 border-border bg-background px-3"
              />
            </label>

            <Button type="submit" className="h-10 rounded-full font-bold">
              <Sparkles className="size-4" />
              Generate drafts
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
        {(prompts ?? []).map((p) => (
          <li key={p.id}>
            <Card className="rounded-2xl border-2">
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
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
                          await publishSteelmanPrompt(p.id);
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
                        await deleteSteelmanPrompt(p.id);
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

                <h2 className="font-heading text-xl font-extrabold">{p.claim}</h2>
                <p className="text-sm text-muted-foreground">{p.context}</p>

                {/* Side by side, because a lopsided pair is the failure mode
                    and it is only visible by comparison. */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border-2 border-border p-4">
                    <p className="font-heading text-sm font-extrabold">{p.side_a}</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">{p.best_for_a}</p>
                  </div>
                  <div className="rounded-xl border-2 border-border p-4">
                    <p className="font-heading text-sm font-extrabold">{p.side_b}</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">{p.best_for_b}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
