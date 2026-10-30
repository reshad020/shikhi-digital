import { Send, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { locales } from "@/i18n/routing";
import { deletePassage, generatePassages, publishPassage } from "../../listening-actions";

type Option = { text: string; isCorrect: boolean; feedback: string };

export default async function AdminListeningPage() {
  const supabase = await createClient();
  const { data: passages } = await supabase
    .from("listening_passages")
    .select("*")
    .order("created_at", { ascending: false });

  const drafts = (passages ?? []).filter((p) => p.status === "draft");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold">Listen Close</h1>
        <p className="text-sm text-muted-foreground">
          Review for one thing above all: <strong>is the inference question really an
          inference?</strong> Models drift towards asking something the passage states outright,
          which makes it a duplicate of the recall question and removes the only part of the
          exercise that requires thinking. Read the transcript, then read question two — if the
          answer is sitting in the text, delete it.
        </p>
      </div>

      <Card className="rounded-2xl border-2">
        <CardContent className="p-5">
          <form action={generatePassages} className="flex flex-wrap items-end gap-3">
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
                placeholder="deep sea, bridges, how maps were made"
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
        {(passages ?? []).map((p) => {
          const recall = (p.recall_options as Option[]) ?? [];
          const inference = (p.inference_options as Option[]) ?? [];
          const words = p.transcript.trim().split(/\s+/).length;

          return (
            <li key={p.id}>
              <Card className="rounded-2xl border-2">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full">{p.locale}</Badge>
                    <Badge className="rounded-full">{p.topic}</Badge>
                    {/* Roughly 130 words a minute spoken. */}
                    <Badge className="rounded-full">
                      {words} words &middot; ~{Math.max(Math.round((words / 130) * 60), 10)}s
                    </Badge>
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
                            await publishPassage(p.id);
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
                          await deletePassage(p.id);
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

                  <h2 className="font-heading text-xl font-extrabold">{p.title}</h2>
                  <p className="rounded-xl bg-muted/60 p-4 text-sm leading-relaxed">
                    {p.transcript}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <QuestionBlock label="1 · Recall" question={p.recall_question} options={recall} />
                    <QuestionBlock
                      label="2 · Inference — must NOT be answerable from the text"
                      question={p.inference_question}
                      options={inference}
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    <strong>Then asks:</strong> {p.defend_prompt}
                  </p>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function QuestionBlock({
  label,
  question,
  options,
}: {
  label: string;
  question: string;
  options: Option[];
}) {
  return (
    <div className="rounded-xl border-2 border-border p-4">
      <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1.5 font-heading text-sm font-extrabold">{question}</p>
      <ul className="mt-2 flex flex-col gap-1">
        {options.map((o) => (
          <li
            key={o.text}
            className={`text-sm ${o.isCorrect ? "font-bold text-mint" : "text-muted-foreground"}`}
          >
            {o.isCorrect ? "✓" : "·"} {o.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
