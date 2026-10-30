
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "attempt_reviews": {
                  Row: {
                    "attempt_id": string | null,"created_at": string,"id": string,"listening_attempt_id": string | null,"note": string | null,"outcome": string,"reviewed_by": string,"steelman_attempt_id": string | null,"yle_story_attempt_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "attempt_id"?: string | null,"created_at"?: string,"id"?: string,"listening_attempt_id"?: string | null,"note"?: string | null,"outcome": string,"reviewed_by": string,"steelman_attempt_id"?: string | null,"yle_story_attempt_id"?: string | null
                  }
                  Update: {
                    "attempt_id"?: string | null,"created_at"?: string,"id"?: string,"listening_attempt_id"?: string | null,"note"?: string | null,"outcome"?: string,"reviewed_by"?: string,"steelman_attempt_id"?: string | null,"yle_story_attempt_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "attempt_reviews_attempt_id_fkey"
      columns: ["attempt_id"]
isOneToOne: true
      referencedRelation: "reasoning_attempts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attempt_reviews_listening_attempt_id_fkey"
      columns: ["listening_attempt_id"]
isOneToOne: true
      referencedRelation: "listening_attempts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attempt_reviews_reviewed_by_fkey"
      columns: ["reviewed_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attempt_reviews_steelman_attempt_id_fkey"
      columns: ["steelman_attempt_id"]
isOneToOne: true
      referencedRelation: "steelman_attempts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attempt_reviews_yle_story_attempt_id_fkey"
      columns: ["yle_story_attempt_id"]
isOneToOne: false
      referencedRelation: "yle_story_attempts"
      referencedColumns: ["id"]
    }
                  ]
                },"challenge_attempts": {
                  Row: {
                    "challenge_id": string,"child_id": string,"chosen_tell": string,"created_at": string,"id": string,"picked_correctly": boolean,"tell_correct": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "challenge_id": string,"child_id": string,"chosen_tell": string,"created_at"?: string,"id"?: string,"picked_correctly": boolean,"tell_correct": boolean
                  }
                  Update: {
                    "challenge_id"?: string,"child_id"?: string,"chosen_tell"?: string,"created_at"?: string,"id"?: string,"picked_correctly"?: boolean,"tell_correct"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "challenge_attempts_challenge_id_fkey"
      columns: ["challenge_id"]
isOneToOne: false
      referencedRelation: "daily_challenges"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "challenge_attempts_child_id_fkey"
      columns: ["child_id"]
isOneToOne: false
      referencedRelation: "children"
      referencedColumns: ["id"]
    }
                  ]
                },"children": {
                  Row: {
                    "avatar": string,"birth_year": number | null,"created_at": string,"daily_goal": number,"id": string,"locale": string,"name": string,"parent_id": string,"seen_rank": string,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar"?: string,"birth_year"?: number | null,"created_at"?: string,"daily_goal"?: number,"id"?: string,"locale"?: string,"name": string,"parent_id": string,"seen_rank"?: string,"user_id"?: string | null
                  }
                  Update: {
                    "avatar"?: string,"birth_year"?: number | null,"created_at"?: string,"daily_goal"?: number,"id"?: string,"locale"?: string,"name"?: string,"parent_id"?: string,"seen_rank"?: string,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "children_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"content_pool": {
                  Row: {
                    "created_at": string,"id": string,"kind": string,"level": string,"locale": string,"model": string | null,"payload": NonNullable<Json>,"payload_version": number,"skill": string,"source": string,"status": string,"topic": string,"usage_count": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"kind": string,"level": string,"locale"?: string,"model"?: string | null,"payload": NonNullable<Json>,"payload_version"?: number,"skill": string,"source"?: string,"status"?: string,"topic"?: string,"usage_count"?: number
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"kind"?: string,"level"?: string,"locale"?: string,"model"?: string | null,"payload"?: NonNullable<Json>,"payload_version"?: number,"skill"?: string,"source"?: string,"status"?: string,"topic"?: string,"usage_count"?: number
                  }
                  Relationships: [
                    
                  ]
                },"content_seen": {
                  Row: {
                    "child_id": string,"pool_id": string,"seen_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "child_id": string,"pool_id": string,"seen_at"?: string
                  }
                  Update: {
                    "child_id"?: string,"pool_id"?: string,"seen_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "content_seen_child_id_fkey"
      columns: ["child_id"]
isOneToOne: false
      referencedRelation: "children"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "content_seen_pool_id_fkey"
      columns: ["pool_id"]
isOneToOne: false
      referencedRelation: "content_pool"
      referencedColumns: ["id"]
    }
                  ]
                },"daily_challenges": {
                  Row: {
                    "created_at": string,"created_by": string | null,"explanation": string,"false_claim": string,"id": string,"locale": string,"model": string | null,"publish_on": string,"source_note": string,"status": string,"tell": string,"tell_options": NonNullable<Json>,"true_claim": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"explanation": string,"false_claim": string,"id"?: string,"locale"?: string,"model"?: string | null,"publish_on": string,"source_note": string,"status"?: string,"tell": string,"tell_options": NonNullable<Json>,"true_claim": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"explanation"?: string,"false_claim"?: string,"id"?: string,"locale"?: string,"model"?: string | null,"publish_on"?: string,"source_note"?: string,"status"?: string,"tell"?: string,"tell_options"?: NonNullable<Json>,"true_claim"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "daily_challenges_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"lessons": {
                  Row: {
                    "created_at": string,"created_by": string | null,"error": string | null,"id": string,"locale": string,"model": string | null,"slug": string,"source_text": string,"status": string,"storyboard": Json | null,"subject": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"error"?: string | null,"id"?: string,"locale"?: string,"model"?: string | null,"slug": string,"source_text": string,"status"?: string,"storyboard"?: Json | null,"subject": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"error"?: string | null,"id"?: string,"locale"?: string,"model"?: string | null,"slug"?: string,"source_text"?: string,"status"?: string,"storyboard"?: Json | null,"subject"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "lessons_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"listening_attempts": {
                  Row: {
                    "child_id": string,"created_at": string,"flagged": boolean,"id": string,"inference_correct": boolean,"moves": NonNullable<Json>,"passage_id": string,"plays": number,"pushback": string,"quality": string,"recall_correct": boolean,"response": string,"text": string
                  }
                  ComputedFields: never
                  Insert: {
                    "child_id": string,"created_at"?: string,"flagged"?: boolean,"id"?: string,"inference_correct": boolean,"moves"?: NonNullable<Json>,"passage_id": string,"plays"?: number,"pushback": string,"quality": string,"recall_correct": boolean,"response": string,"text": string
                  }
                  Update: {
                    "child_id"?: string,"created_at"?: string,"flagged"?: boolean,"id"?: string,"inference_correct"?: boolean,"moves"?: NonNullable<Json>,"passage_id"?: string,"plays"?: number,"pushback"?: string,"quality"?: string,"recall_correct"?: boolean,"response"?: string,"text"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "listening_attempts_child_id_fkey"
      columns: ["child_id"]
isOneToOne: false
      referencedRelation: "children"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listening_attempts_passage_id_fkey"
      columns: ["passage_id"]
isOneToOne: false
      referencedRelation: "listening_passages"
      referencedColumns: ["id"]
    }
                  ]
                },"listening_passages": {
                  Row: {
                    "created_at": string,"created_by": string | null,"defend_prompt": string,"id": string,"inference_options": NonNullable<Json>,"inference_question": string,"locale": string,"model": string | null,"recall_options": NonNullable<Json>,"recall_question": string,"status": string,"title": string,"topic": string,"transcript": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"defend_prompt": string,"id"?: string,"inference_options": NonNullable<Json>,"inference_question": string,"locale"?: string,"model"?: string | null,"recall_options": NonNullable<Json>,"recall_question": string,"status"?: string,"title": string,"topic": string,"transcript": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"defend_prompt"?: string,"id"?: string,"inference_options"?: NonNullable<Json>,"inference_question"?: string,"locale"?: string,"model"?: string | null,"recall_options"?: NonNullable<Json>,"recall_question"?: string,"status"?: string,"title"?: string,"topic"?: string,"transcript"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "listening_passages_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "consented_at": string | null,"created_at": string,"email": string | null,"full_name": string | null,"id": string,"role": string,"weekly_email": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "consented_at"?: string | null,"created_at"?: string,"email"?: string | null,"full_name"?: string | null,"id": string,"role"?: string,"weekly_email"?: boolean
                  }
                  Update: {
                    "consented_at"?: string | null,"created_at"?: string,"email"?: string | null,"full_name"?: string | null,"id"?: string,"role"?: string,"weekly_email"?: boolean
                  }
                  Relationships: [
                    
                  ]
                },"puzzle_attempts": {
                  Row: {
                    "child_id": string,"chosen": string,"correct": boolean,"created_at": string,"id": string,"puzzle_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "child_id": string,"chosen": string,"correct": boolean,"created_at"?: string,"id"?: string,"puzzle_id": string
                  }
                  Update: {
                    "child_id"?: string,"chosen"?: string,"correct"?: boolean,"created_at"?: string,"id"?: string,"puzzle_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "puzzle_attempts_child_id_fkey"
      columns: ["child_id"]
isOneToOne: false
      referencedRelation: "children"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "puzzle_attempts_puzzle_id_fkey"
      columns: ["puzzle_id"]
isOneToOne: false
      referencedRelation: "trick_puzzles"
      referencedColumns: ["id"]
    }
                  ]
                },"reasoning_attempts": {
                  Row: {
                    "answer_correct": boolean,"child_id": string,"created_at": string,"flagged": boolean,"id": string,"lesson_id": string,"moves": NonNullable<Json>,"pushback": string,"quality": string,"question_id": string,"response": string,"text": string
                  }
                  ComputedFields: never
                  Insert: {
                    "answer_correct": boolean,"child_id": string,"created_at"?: string,"flagged"?: boolean,"id"?: string,"lesson_id": string,"moves"?: NonNullable<Json>,"pushback": string,"quality": string,"question_id": string,"response": string,"text": string
                  }
                  Update: {
                    "answer_correct"?: boolean,"child_id"?: string,"created_at"?: string,"flagged"?: boolean,"id"?: string,"lesson_id"?: string,"moves"?: NonNullable<Json>,"pushback"?: string,"quality"?: string,"question_id"?: string,"response"?: string,"text"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reasoning_attempts_child_id_fkey"
      columns: ["child_id"]
isOneToOne: false
      referencedRelation: "children"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reasoning_attempts_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: false
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    }
                  ]
                },"steelman_attempts": {
                  Row: {
                    "believes": string,"child_id": string,"created_at": string,"fairness": string,"flagged": boolean,"id": string,"moves": NonNullable<Json>,"prompt_id": string,"pushback": string,"quality": string,"response": string,"text": string
                  }
                  ComputedFields: never
                  Insert: {
                    "believes": string,"child_id": string,"created_at"?: string,"fairness": string,"flagged"?: boolean,"id"?: string,"moves"?: NonNullable<Json>,"prompt_id": string,"pushback": string,"quality": string,"response": string,"text": string
                  }
                  Update: {
                    "believes"?: string,"child_id"?: string,"created_at"?: string,"fairness"?: string,"flagged"?: boolean,"id"?: string,"moves"?: NonNullable<Json>,"prompt_id"?: string,"pushback"?: string,"quality"?: string,"response"?: string,"text"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "steelman_attempts_child_id_fkey"
      columns: ["child_id"]
isOneToOne: false
      referencedRelation: "children"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "steelman_attempts_prompt_id_fkey"
      columns: ["prompt_id"]
isOneToOne: false
      referencedRelation: "steelman_prompts"
      referencedColumns: ["id"]
    }
                  ]
                },"steelman_prompts": {
                  Row: {
                    "best_for_a": string,"best_for_b": string,"claim": string,"context": string,"created_at": string,"created_by": string | null,"id": string,"locale": string,"model": string | null,"side_a": string,"side_b": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "best_for_a": string,"best_for_b": string,"claim": string,"context": string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"locale"?: string,"model"?: string | null,"side_a": string,"side_b": string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "best_for_a"?: string,"best_for_b"?: string,"claim"?: string,"context"?: string,"created_at"?: string,"created_by"?: string | null,"id"?: string,"locale"?: string,"model"?: string | null,"side_a"?: string,"side_b"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "steelman_prompts_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"trick_puzzles": {
                  Row: {
                    "artefact": NonNullable<Json>,"created_at": string,"created_by": string | null,"explanation": string,"id": string,"locale": string,"model": string | null,"options": NonNullable<Json>,"status": string,"technique": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "artefact": NonNullable<Json>,"created_at"?: string,"created_by"?: string | null,"explanation": string,"id"?: string,"locale"?: string,"model"?: string | null,"options": NonNullable<Json>,"status"?: string,"technique": string,"updated_at"?: string
                  }
                  Update: {
                    "artefact"?: NonNullable<Json>,"created_at"?: string,"created_by"?: string | null,"explanation"?: string,"id"?: string,"locale"?: string,"model"?: string | null,"options"?: NonNullable<Json>,"status"?: string,"technique"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "trick_puzzles_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"weekly_reports": {
                  Row: {
                    "attempt_count": number,"child_id": string,"climbing_move": string,"created_at": string,"dinner_questions": NonNullable<Json>,"emailed_at": string | null,"headline": string,"id": string,"lesson_count": number,"lessons": NonNullable<Json>,"locale": string,"model": string,"next_move": string,"quote_attempt_id": string,"quote_question": string,"quote_text": string,"summary": string,"week_start": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attempt_count": number,"child_id": string,"climbing_move": string,"created_at"?: string,"dinner_questions": NonNullable<Json>,"emailed_at"?: string | null,"headline": string,"id"?: string,"lesson_count": number,"lessons": NonNullable<Json>,"locale"?: string,"model": string,"next_move": string,"quote_attempt_id": string,"quote_question": string,"quote_text": string,"summary": string,"week_start": string
                  }
                  Update: {
                    "attempt_count"?: number,"child_id"?: string,"climbing_move"?: string,"created_at"?: string,"dinner_questions"?: NonNullable<Json>,"emailed_at"?: string | null,"headline"?: string,"id"?: string,"lesson_count"?: number,"lessons"?: NonNullable<Json>,"locale"?: string,"model"?: string,"next_move"?: string,"quote_attempt_id"?: string,"quote_question"?: string,"quote_text"?: string,"summary"?: string,"week_start"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "weekly_reports_child_id_fkey"
      columns: ["child_id"]
isOneToOne: false
      referencedRelation: "children"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "weekly_reports_quote_attempt_id_fkey"
      columns: ["quote_attempt_id"]
isOneToOne: false
      referencedRelation: "reasoning_attempts"
      referencedColumns: ["id"]
    }
                  ]
                },"yle_attempts": {
                  Row: {
                    "answers": NonNullable<Json>,"child_id": string,"correct": number,"created_at": string,"id": string,"kind": string,"level": string,"paper": string,"part": number,"seconds": number | null,"set_id": string,"shields": number,"total": number
                  }
                  ComputedFields: never
                  Insert: {
                    "answers"?: NonNullable<Json>,"child_id": string,"correct": number,"created_at"?: string,"id"?: string,"kind": string,"level": string,"paper": string,"part": number,"seconds"?: number | null,"set_id": string,"shields": number,"total": number
                  }
                  Update: {
                    "answers"?: NonNullable<Json>,"child_id"?: string,"correct"?: number,"created_at"?: string,"id"?: string,"kind"?: string,"level"?: string,"paper"?: string,"part"?: number,"seconds"?: number | null,"set_id"?: string,"shields"?: number,"total"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "yle_attempts_child_id_fkey"
      columns: ["child_id"]
isOneToOne: false
      referencedRelation: "children"
      referencedColumns: ["id"]
    }
                  ]
                },"yle_story_attempts": {
                  Row: {
                    "child_id": string,"covers_all": boolean,"created_at": string,"fixes": NonNullable<Json>,"flagged": boolean,"id": string,"mark": number,"next_time": string,"prompt_id": string,"strength": string,"text": string
                  }
                  ComputedFields: never
                  Insert: {
                    "child_id": string,"covers_all": boolean,"created_at"?: string,"fixes"?: NonNullable<Json>,"flagged"?: boolean,"id"?: string,"mark": number,"next_time": string,"prompt_id": string,"strength": string,"text": string
                  }
                  Update: {
                    "child_id"?: string,"covers_all"?: boolean,"created_at"?: string,"fixes"?: NonNullable<Json>,"flagged"?: boolean,"id"?: string,"mark"?: number,"next_time"?: string,"prompt_id"?: string,"strength"?: string,"text"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "yle_story_attempts_child_id_fkey"
      columns: ["child_id"]
isOneToOne: false
      referencedRelation: "children"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "bump_pool_usage":
{ Args: { "target": string }; Returns: undefined
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"owns_child":
{ Args: { "target": string }; Returns: boolean
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
