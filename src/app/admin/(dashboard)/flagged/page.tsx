import { ShieldCheck, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { reviewAttempt } from "../../daily-actions";

/**
 * The safety queue.
 *
 * The graders set `flagged` when a child's writing suggests distress, harm or
 * abuse. Until this page existed the column was written and indexed and nobody
 * ever read it, which is the same as not having it.
 *
 * It reads **both** places a child writes freely — defended answers and
 * steelman arguments. Adding a second writing surface without adding it here
 * would recreate the original bug one table over.
 */

type QueueItem = {
  id: string;
  source: "reasoning" | "steelman";
  text: string;
  createdAt: string;
  childName: string;
  /** The lesson subject, or the claim being argued. */
  about: string;
};

export default async function FlaggedPage() {
  const supabase = await createClient();

  const [reasoning, steelman, reviews] = await Promise.all([
    supabase
      .from("reasoning_attempts")
      .select("id, text, created_at, children(name), lessons(subject)")
      .eq("flagged", true)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("steelman_attempts")
      .select("id, text, created_at, children(name), steelman_prompts(claim)")
      .eq("flagged", true)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("attempt_reviews").select("attempt_id, steelman_attempt_id"),
  ]);

  const reviewed = new Set(
    (reviews.data ?? []).flatMap((r) =>
      [r.attempt_id, r.steelman_attempt_id].filter((v): v is string => Boolean(v)),
    ),
  );

  const items: QueueItem[] = [
    ...(reasoning.data ?? []).map((a) => ({
      id: a.id,
      source: "reasoning" as const,
      text: a.text,
      createdAt: a.created_at,
      childName: (a.children as { name: string } | null)?.name ?? "unknown child",
      about: (a.lessons as { subject: string } | null)?.subject ?? "—",
    })),
    ...(steelman.data ?? []).map((a) => ({
      id: a.id,
      source: "steelman" as const,
      text: a.text,
      createdAt: a.created_at,
      childName: (a.children as { name: string } | null)?.name ?? "unknown child",
      about: (a.steelman_prompts as { claim: string } | null)?.claim ?? "—",
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const open = items.filter((a) => !reviewed.has(a.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold">Flagged writing</h1>
        <p className="text-sm text-muted-foreground">
          Written by a child and flagged by a grader. Read every one — silliness and rudeness are
          normal childhood and should be closed as fine; genuine distress is why this page exists.
        </p>
      </div>

      {open.length === 0 ? (
        <Card className="rounded-3xl border-2 border-dashed">
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
            <ShieldCheck className="size-10 text-mint" />
            <p className="font-semibold">Nothing waiting</p>
            <p className="text-sm text-muted-foreground">
              {items.length} flagged in total, all reviewed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {open.map((item) => (
            <li key={`${item.source}-${item.id}`}>
              <Card className="rounded-2xl border-2 border-destructive/40">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <TriangleAlert className="size-4 text-destructive" />
                    <Badge className="rounded-full">{item.childName}</Badge>
                    <Badge className="rounded-full">
                      {item.source === "steelman" ? "Steelman" : "Defend"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{item.about}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <blockquote className="rounded-xl bg-muted p-4 italic">
                    &ldquo;{item.text}&rdquo;
                  </blockquote>

                  <form action={reviewAttempt} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="attemptId" value={item.id} />
                    <input type="hidden" name="source" value={item.source} />
                    <input
                      name="note"
                      placeholder="Note (optional)"
                      className="h-10 min-w-48 flex-1 rounded-xl border-2 border-border bg-background px-3 text-sm"
                    />
                    <Button
                      type="submit"
                      name="outcome"
                      value="ok"
                      variant="outline"
                      className="h-10 rounded-full font-bold"
                    >
                      Nothing needed
                    </Button>
                    <Button
                      type="submit"
                      name="outcome"
                      value="needs_contact"
                      className="h-10 rounded-full font-bold"
                    >
                      Parent should be told
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
