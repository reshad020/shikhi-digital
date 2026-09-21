import Link from "next/link";
import { BookOpen, CircleAlert, CircleCheck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listLessons } from "@/lib/data/lessons";
import { locales } from "@/i18n/routing";

const STATUS = {
  ready: { label: "Ready", Icon: CircleCheck, className: "bg-mint/20 text-mint" },
  generating: { label: "Generating", Icon: Clock, className: "bg-sunny/20 text-tangerine" },
  failed: { label: "Failed", Icon: CircleAlert, className: "bg-destructive/15 text-destructive" },
  draft: { label: "Draft", Icon: Clock, className: "bg-muted text-muted-foreground" },
} as const;

export default async function AdminLessonsPage() {
  const lessons = await listLessons();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold">Lessons</h1>
        <p className="text-sm text-muted-foreground">
          Write about a person or topic and Gemini turns it into a storyboard kids can play.
        </p>
      </div>

      {lessons.length === 0 ? (
        <Card className="rounded-3xl border-2 border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <BookOpen className="size-10 text-muted-foreground" />
            <p className="font-semibold">No lessons yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Start with 400-500 words about someone — Nelson Mandela, Marie Curie, whoever your
              class is learning about this week.
            </p>
            <Link href="/admin/new" className="font-bold text-primary underline underline-offset-4">
              Write the first one
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {lessons.map((lesson) => {
            const status = STATUS[lesson.status as keyof typeof STATUS] ?? STATUS.draft;
            const language = locales.find((l) => l.code === lesson.locale);
            return (
              <li key={lesson.id}>
                <Link href={`/admin/lessons/${lesson.id}`}>
                  <Card className="rounded-2xl border-2 transition-shadow hover:shadow-float">
                    <CardContent className="flex items-center gap-4 p-5">
                      <span
                        title={language?.label}
                        className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-sm font-bold"
                      >
                        {language?.short ?? lesson.locale.toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-heading text-lg font-bold">{lesson.subject}</p>
                        <p className="truncate text-sm text-muted-foreground">/{lesson.slug}</p>
                      </div>
                      <Badge className={`gap-1 rounded-full ${status.className}`}>
                        <status.Icon className="size-3.5" />
                        {status.label}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
