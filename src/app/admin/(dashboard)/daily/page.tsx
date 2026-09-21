import { CalendarDays, Send, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { TELL_LABELS, type Tell } from "@/lib/daily/tells";
import { locales } from "@/i18n/routing";
import { deleteChallenge, generateDailyBatch, publishChallenge } from "../../daily-actions";

export default async function AdminDailyPage() {
  const supabase = await createClient();
  const { data: challenges } = await supabase
    .from("daily_challenges")
    .select("*")
    .order("publish_on", { ascending: true });

  const drafts = (challenges ?? []).filter((c) => c.status === "draft");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold">Fake or Real</h1>
        <p className="text-sm text-muted-foreground">
          Generated as drafts on the next free days. Nothing reaches a child until you publish it.
        </p>
      </div>

      <Card className="rounded-2xl border-2">
        <CardContent className="p-5">
          <form action={generateDailyBatch} className="flex flex-wrap items-end gap-3">
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
              <span className="text-sm font-bold">How many days</span>
              <input
                name="count"
                type="number"
                min={1}
                max={7}
                defaultValue={5}
                className="h-10 w-24 rounded-xl border-2 border-border bg-background px-3"
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

      {(challenges ?? []).length === 0 ? (
        <Card className="rounded-3xl border-2 border-dashed">
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
            <CalendarDays className="size-10 text-muted-foreground" />
            <p className="font-semibold">Nothing scheduled</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Generate a batch above. Each one lands on the next free day as a draft.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {(challenges ?? []).map((c) => (
            <li key={c.id}>
              <Card className="rounded-2xl border-2">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full font-mono">{c.publish_on}</Badge>
                    <Badge className="rounded-full">{c.locale}</Badge>
                    <Badge
                      className={`rounded-full ${
                        c.status === "ready"
                          ? "bg-mint/20 text-mint"
                          : "bg-sunny/20 text-tangerine"
                      }`}
                    >
                      {c.status}
                    </Badge>
                    <span className="ms-auto flex items-center gap-2">
                      {c.status === "draft" && (
                        <form
                          action={async () => {
                            "use server";
                            await publishChallenge(c.id);
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
                          await deleteChallenge(c.id);
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

                  <div className="grid gap-2 sm:grid-cols-2">
                    <p className="rounded-xl bg-mint/10 p-3 text-sm">
                      <strong className="text-mint">True:</strong> {c.true_claim}
                    </p>
                    <p className="rounded-xl bg-tangerine/10 p-3 text-sm">
                      <strong className="text-tangerine">False:</strong> {c.false_claim}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    <strong>Tell:</strong> {TELL_LABELS[c.tell as Tell] ?? c.tell} ·{" "}
                    <strong>Source:</strong> {c.source_note}
                  </p>
                  <p className="text-sm text-muted-foreground">{c.explanation}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
