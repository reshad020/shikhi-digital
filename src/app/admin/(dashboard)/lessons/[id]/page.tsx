import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleAlert, ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getLessonById } from "@/lib/data/lessons";
import { parseStoryboard } from "@/lib/storyboard/schema";
import { deleteLesson, regenerateLesson } from "../../../actions";
import { SceneArt } from "@/components/storyboard/scene-art";

export default async function LessonDetailPage({ params }: PageProps<"/admin/lessons/[id]">) {
  const { id } = await params;
  const lesson = await getLessonById(id);
  if (!lesson) notFound();

  const storyboard = parseStoryboard(lesson.storyboard);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-3xl font-extrabold">{lesson.subject}</h1>
          <p className="text-sm text-muted-foreground">
            /{lesson.slug} · {lesson.locale}
            {lesson.model && ` · ${lesson.model}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {storyboard && (
            <Button
              variant="outline"
              className="rounded-full font-bold"
              render={<Link href={`/${lesson.locale}/learn/${lesson.slug}`} target="_blank" />}
            >
              <ExternalLink className="size-4" />
              Kid view
            </Button>
          )}
          <form
            action={async () => {
              "use server";
              await regenerateLesson(lesson.id);
            }}
          >
            <Button type="submit" variant="outline" className="rounded-full font-bold">
              <RefreshCw className="size-4" />
              Regenerate
            </Button>
          </form>
          <form
            action={async () => {
              "use server";
              await deleteLesson(lesson.id);
            }}
          >
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label="Delete lesson"
              className="rounded-full text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </form>
        </div>
      </div>

      {lesson.status === "failed" && (
        <Card className="rounded-2xl border-2 border-destructive/40 bg-destructive/5">
          <CardContent className="flex gap-3 p-5">
            <CircleAlert className="size-5 shrink-0 text-destructive" />
            <div>
              <p className="font-bold text-destructive">Generation failed</p>
              <p className="mt-1 text-sm text-destructive/90">{lesson.error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {storyboard && (
        <Card className="rounded-3xl border-2">
          <CardContent className="flex flex-col gap-5 p-6">
            <div>
              <Badge className="rounded-full">Storyboard</Badge>
              <h2 className="mt-2 font-heading text-2xl font-extrabold">
                {storyboard.heroEmoji} {storyboard.title}
              </h2>
              <p className="text-muted-foreground">{storyboard.hook}</p>
              <p className="mt-2 text-sm font-semibold">Big idea: {storyboard.bigIdea}</p>
            </div>

            <Separator />

            <ol className="flex flex-col gap-4">
              {storyboard.scenes.map((scene, i) => (
                <li key={scene.id} className="flex gap-4">
                  <SceneArt art={scene.art} className="h-24 w-32 shrink-0 rounded-xl" />
                  <div className="min-w-0">
                    <p className="font-heading font-bold">
                      {i + 1}. {scene.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{scene.narration}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {scene.art.palette} · {scene.art.motif} · {scene.art.mood} ·{" "}
                      {scene.interaction.kind}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <Separator />

            <div>
              <p className="font-heading font-bold">Interactive session — {storyboard.quiz.length} questions</p>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                {storyboard.quiz.map((q) => (
                  <li key={q.id}>• {q.question}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-3xl border-2">
        <CardContent className="p-6">
          <p className="mb-2 font-heading font-bold">Your source text</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {lesson.source_text}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
