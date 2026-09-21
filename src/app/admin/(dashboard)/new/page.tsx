import { LessonForm } from "./lesson-form";

export default function NewLessonPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold">New lesson</h1>
        <p className="text-sm text-muted-foreground">
          Write 400-500 words the way you would explain it to another adult. Gemini handles turning
          it into child-sized language, scenes and questions.
        </p>
      </div>
      <LessonForm />
    </div>
  );
}
