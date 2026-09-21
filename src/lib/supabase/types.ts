/**
 * Database types.
 *
 * `types.generated.ts` is produced from the live schema and must not be edited:
 *   npm run db:types
 *
 * This file adds the aliases the app actually uses, so a table rename shows up
 * as one compile error here rather than scattered across every component.
 */
import type { Database as Generated, Json } from "./types.generated";

export type { Json };

/**
 * Tables whose migration exists but has not yet been applied to the database
 * `types.generated.ts` was produced from.
 *
 * Declared here rather than by hand-editing the generated file, which is
 * machine output and would lose the edit on the next run. **Delete this block
 * and the intersection below after running `npm run db:types` against a
 * database with `20260911100000_steelman.sql` applied** — at that point the
 * generated file is authoritative again and leaving these would mask a drift
 * between the migration and the real schema, which is the whole reason the
 * types are generated in the first place.
 */
type PendingTables = {
  /** `weekly_email` added by 20260911110000_weekly_email.sql. */
  profiles: Omit<Generated["public"]["Tables"]["profiles"], "Row" | "Insert" | "Update"> & {
    Row: Generated["public"]["Tables"]["profiles"]["Row"] & { weekly_email: boolean };
    Insert: Generated["public"]["Tables"]["profiles"]["Insert"] & { weekly_email?: boolean };
    Update: Generated["public"]["Tables"]["profiles"]["Update"] & { weekly_email?: boolean };
  };
  /** `emailed_at` added by the same migration. */
  weekly_reports: Omit<
    Generated["public"]["Tables"]["weekly_reports"],
    "Row" | "Insert" | "Update"
  > & {
    Row: Generated["public"]["Tables"]["weekly_reports"]["Row"] & { emailed_at: string | null };
    Insert: Generated["public"]["Tables"]["weekly_reports"]["Insert"] & {
      emailed_at?: string | null;
    };
    Update: Generated["public"]["Tables"]["weekly_reports"]["Update"] & {
      emailed_at?: string | null;
    };
  };
  /** Reshaped by the same migration: a review now points at one of two tables. */
  attempt_reviews: {
    Row: {
      id: string;
      attempt_id: string | null;
      steelman_attempt_id: string | null;
      reviewed_by: string;
      outcome: string;
      note: string | null;
      created_at: string;
    };
    Insert: {
      id?: string;
      attempt_id?: string | null;
      steelman_attempt_id?: string | null;
      reviewed_by: string;
      outcome: string;
      note?: string | null;
      created_at?: string;
    };
    Update: {
      id?: string;
      attempt_id?: string | null;
      steelman_attempt_id?: string | null;
      reviewed_by?: string;
      outcome?: string;
      note?: string | null;
      created_at?: string;
    };
    Relationships: [
      {
        foreignKeyName: "attempt_reviews_attempt_id_fkey";
        columns: ["attempt_id"];
        isOneToOne: true;
        referencedRelation: "reasoning_attempts";
        referencedColumns: ["id"];
      },
      {
        foreignKeyName: "attempt_reviews_steelman_attempt_id_fkey";
        columns: ["steelman_attempt_id"];
        isOneToOne: true;
        referencedRelation: "steelman_attempts";
        referencedColumns: ["id"];
      },
      {
        foreignKeyName: "attempt_reviews_reviewed_by_fkey";
        columns: ["reviewed_by"];
        isOneToOne: false;
        referencedRelation: "profiles";
        referencedColumns: ["id"];
      },
    ];
  };
  steelman_prompts: {
    Row: {
      id: string;
      locale: string;
      claim: string;
      context: string;
      side_a: string;
      side_b: string;
      best_for_a: string;
      best_for_b: string;
      status: string;
      model: string | null;
      created_by: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      locale?: string;
      claim: string;
      context: string;
      side_a: string;
      side_b: string;
      best_for_a: string;
      best_for_b: string;
      status?: string;
      model?: string | null;
      created_by?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      locale?: string;
      claim?: string;
      context?: string;
      side_a?: string;
      side_b?: string;
      best_for_a?: string;
      best_for_b?: string;
      status?: string;
      model?: string | null;
      created_by?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Relationships: [
      {
        foreignKeyName: "steelman_prompts_created_by_fkey";
        columns: ["created_by"];
        isOneToOne: false;
        referencedRelation: "profiles";
        referencedColumns: ["id"];
      },
    ];
  };
  steelman_attempts: {
    Row: {
      id: string;
      child_id: string;
      prompt_id: string;
      believes: string;
      text: string;
      quality: string;
      fairness: string;
      moves: Json;
      response: string;
      pushback: string;
      flagged: boolean;
      created_at: string;
    };
    Insert: {
      id?: string;
      child_id: string;
      prompt_id: string;
      believes: string;
      text: string;
      quality: string;
      fairness: string;
      moves?: Json;
      response: string;
      pushback: string;
      flagged?: boolean;
      created_at?: string;
    };
    Update: {
      id?: string;
      child_id?: string;
      prompt_id?: string;
      believes?: string;
      text?: string;
      quality?: string;
      fairness?: string;
      moves?: Json;
      response?: string;
      pushback?: string;
      flagged?: boolean;
      created_at?: string;
    };
    Relationships: [
      {
        foreignKeyName: "steelman_attempts_child_id_fkey";
        columns: ["child_id"];
        isOneToOne: false;
        referencedRelation: "children";
        referencedColumns: ["id"];
      },
      {
        foreignKeyName: "steelman_attempts_prompt_id_fkey";
        columns: ["prompt_id"];
        isOneToOne: false;
        referencedRelation: "steelman_prompts";
        referencedColumns: ["id"];
      },
    ];
  };
};

export type Database = Omit<Generated, "public"> & {
  public: Omit<Generated["public"], "Tables"> & {
    // Omit first: `attempt_reviews` is RESHAPED by the migration, not added,
    // and intersecting the old row type with the new one would keep
    // `attempt_id` non-nullable and silently defeat the change.
    Tables: Omit<Generated["public"]["Tables"], keyof PendingTables> & PendingTables;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Child = Tables<"children">;
export type Lesson = Tables<"lessons">;
export type Profile = Tables<"profiles">;
export type ReasoningAttemptRow = Tables<"reasoning_attempts">;
export type WeeklyReportRow = Tables<"weekly_reports">;
export type SteelmanPromptRow = Tables<"steelman_prompts">;
export type SteelmanAttemptRow = Tables<"steelman_attempts">;

export type Role = Profile["role"];
export type LessonStatus = Lesson["status"];
export type Quality = ReasoningAttemptRow["quality"];
