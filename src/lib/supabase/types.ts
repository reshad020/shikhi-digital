/**
 * Database types.
 *
 * `types.generated.ts` is produced from the live schema and must not be edited:
 *   npm run db:types -- --hosted
 *
 * This file adds the aliases the app actually uses, so a table rename shows up
 * as one compile error here rather than scattered across every component.
 */
export type { Database, Json } from "./types.generated";
import type { Database } from "./types.generated";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Child = Tables<"children">;
export type Lesson = Tables<"lessons">;
export type Profile = Tables<"profiles">;
export type ReasoningAttemptRow = Tables<"reasoning_attempts">;
export type WeeklyReportRow = Tables<"weekly_reports">;
export type SteelmanPromptRow = Tables<"steelman_prompts">;
export type SteelmanAttemptRow = Tables<"steelman_attempts">;
export type ListeningPassageRow = Tables<"listening_passages">;
export type ListeningAttemptRow = Tables<"listening_attempts">;

export type Role = Profile["role"];
export type LessonStatus = Lesson["status"];
export type Quality = ReasoningAttemptRow["quality"];
