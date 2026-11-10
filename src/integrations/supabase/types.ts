export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      anomaly_flag: {
        Row: {
          created_at: string
          dismiss_note: string
          dismissed_at: string | null
          dismissed_by: string | null
          evidence: Json
          id: string
          node_id: string
          student_id: string
          type: string
        }
        Insert: {
          created_at?: string
          dismiss_note?: string
          dismissed_at?: string | null
          dismissed_by?: string | null
          evidence?: Json
          id?: string
          node_id?: string
          student_id: string
          type: string
        }
        Update: {
          created_at?: string
          dismiss_note?: string
          dismissed_at?: string | null
          dismissed_by?: string | null
          evidence?: Json
          id?: string
          node_id?: string
          student_id?: string
          type?: string
        }
        Relationships: []
      }
      assessment_attempt: {
        Row: {
          active_seconds: number
          assessment_id: string
          attempt_number: number
          created_at: string
          id: string
          low_effort: boolean
          median_seconds: number
          node_id: string
          passed: boolean
          responses: Json
          score_pct: number
          student_id: string
          tier: string
        }
        Insert: {
          active_seconds?: number
          assessment_id: string
          attempt_number?: number
          created_at?: string
          id?: string
          low_effort?: boolean
          median_seconds?: number
          node_id: string
          passed?: boolean
          responses?: Json
          score_pct?: number
          student_id: string
          tier: string
        }
        Update: {
          active_seconds?: number
          assessment_id?: string
          attempt_number?: number
          created_at?: string
          id?: string
          low_effort?: boolean
          median_seconds?: number
          node_id?: string
          passed?: boolean
          responses?: Json
          score_pct?: number
          student_id?: string
          tier?: string
        }
        Relationships: []
      }
      assignment_submission: {
        Row: {
          answers: Json
          assignment_key: string
          assignment_title: string
          id: string
          reviewed_at: string | null
          student_id: string
          submit_count: number
          submitted_at: string
          teacher_note: string
        }
        Insert: {
          answers?: Json
          assignment_key: string
          assignment_title?: string
          id?: string
          reviewed_at?: string | null
          student_id: string
          submit_count?: number
          submitted_at?: string
          teacher_note?: string
        }
        Update: {
          answers?: Json
          assignment_key?: string
          assignment_title?: string
          id?: string
          reviewed_at?: string | null
          student_id?: string
          submit_count?: number
          submitted_at?: string
          teacher_note?: string
        }
        Relationships: []
      }
      class_setting: {
        Row: {
          daily_xp_cap: number
          default_threshold: number
          id: string
          mastery_gate_enabled: boolean
          min_section_seconds: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          daily_xp_cap?: number
          default_threshold?: number
          id?: string
          mastery_gate_enabled?: boolean
          min_section_seconds?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          daily_xp_cap?: number
          default_threshold?: number
          id?: string
          mastery_gate_enabled?: boolean
          min_section_seconds?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      engagement_session: {
        Row: {
          active_seconds: number
          ended_at: string
          id: string
          idle_seconds: number
          interaction_count: number
          node_id: string
          started_at: string
          student_id: string
        }
        Insert: {
          active_seconds?: number
          ended_at?: string
          id?: string
          idle_seconds?: number
          interaction_count?: number
          node_id: string
          started_at?: string
          student_id: string
        }
        Update: {
          active_seconds?: number
          ended_at?: string
          id?: string
          idle_seconds?: number
          interaction_count?: number
          node_id?: string
          started_at?: string
          student_id?: string
        }
        Relationships: []
      }
      gate_override: {
        Row: {
          node_id: string
          reason: string
          state: string
          student_id: string
          threshold_override: number | null
          unlocked_by: string | null
          updated_at: string
        }
        Insert: {
          node_id: string
          reason?: string
          state?: string
          student_id: string
          threshold_override?: number | null
          unlocked_by?: string | null
          updated_at?: string
        }
        Update: {
          node_id?: string
          reason?: string
          state?: string
          student_id?: string
          threshold_override?: number | null
          unlocked_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      glossary_term: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          definition: string
          example: string
          id: string
          term: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          definition: string
          example?: string
          id?: string
          term: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          definition?: string
          example?: string
          id?: string
          term?: string
        }
        Relationships: []
      }
      grade_override: {
        Row: {
          id: string
          item_key: string
          note: string
          score: number
          student_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          item_key: string
          note?: string
          score: number
          student_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          item_key?: string
          note?: string
          score?: number
          student_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      launchpad_progress: {
        Row: {
          completed: boolean
          notes: string
          section_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          notes?: string
          section_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          notes?: string
          section_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_upload: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          focus: string
          html: string
          id: string
          lesson_date: string
          pdf_name: string
          pdf_path: string
          published: boolean
          slug: string
          spec: Json
          title: string
          until_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          focus?: string
          html?: string
          id?: string
          lesson_date?: string
          pdf_name?: string
          pdf_path?: string
          published?: boolean
          slug: string
          spec?: Json
          title: string
          until_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          focus?: string
          html?: string
          id?: string
          lesson_date?: string
          pdf_name?: string
          pdf_path?: string
          published?: boolean
          slug?: string
          spec?: Json
          title?: string
          until_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_profile: {
        Row: {
          completed_scenarios: Json
          display_name: string | null
          email: string | null
          goals: Json
          grade_level: string | null
          mastered_terms: Json
          study_plan: string | null
          threshold_override: number | null
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          completed_scenarios?: Json
          display_name?: string | null
          email?: string | null
          goals?: Json
          grade_level?: string | null
          mastered_terms?: Json
          study_plan?: string | null
          threshold_override?: number | null
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          completed_scenarios?: Json
          display_name?: string | null
          email?: string | null
          goals?: Json
          grade_level?: string | null
          mastered_terms?: Json
          study_plan?: string | null
          threshold_override?: number | null
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      xp_admin_action: {
        Row: {
          action: string
          created_at: string
          id: string
          node_id: string
          reason: string
          require_retake: boolean
          scope: string
          student_id: string
          teacher_id: string
          xp_removed: number
        }
        Insert: {
          action?: string
          created_at?: string
          id?: string
          node_id?: string
          reason?: string
          require_retake?: boolean
          scope?: string
          student_id: string
          teacher_id: string
          xp_removed?: number
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          node_id?: string
          reason?: string
          require_retake?: boolean
          scope?: string
          student_id?: string
          teacher_id?: string
          xp_removed?: number
        }
        Relationships: []
      }
      xp_ledger: {
        Row: {
          blocked_reason: string
          capped: boolean
          created_at: string
          event_type: string
          id: string
          multiplier_applied: number
          node_id: string
          student_id: string
          xp_delta: number
        }
        Insert: {
          blocked_reason?: string
          capped?: boolean
          created_at?: string
          event_type: string
          id?: string
          multiplier_applied?: number
          node_id?: string
          student_id: string
          xp_delta?: number
        }
        Update: {
          blocked_reason?: string
          capped?: boolean
          created_at?: string
          event_type?: string
          id?: string
          multiplier_applied?: number
          node_id?: string
          student_id?: string
          xp_delta?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["teacher", "student"],
    },
  },
} as const
