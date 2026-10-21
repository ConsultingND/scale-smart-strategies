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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          ai_question: string | null
          ai_question1: string | null
          ai_question2: string | null
          ai_question3: string | null
          ai_question4: string | null
          company: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          project_type: string
          submitted_at: string | null
          website: string | null
        }
        Insert: {
          ai_question?: string | null
          ai_question1?: string | null
          ai_question2?: string | null
          ai_question3?: string | null
          ai_question4?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          project_type: string
          submitted_at?: string | null
          website?: string | null
        }
        Update: {
          ai_question?: string | null
          ai_question1?: string | null
          ai_question2?: string | null
          ai_question3?: string | null
          ai_question4?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          project_type?: string
          submitted_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      newsletter_send_results: {
        Row: {
          id: string
          newsletter_slug: string
          recipient_email: string
          recipient_first_name: string | null
          recipient_last_name: string | null
          response_text: string | null
          sent_at: string
          success: boolean
          unsubscribe_token: string | null
        }
        Insert: {
          id?: string
          newsletter_slug: string
          recipient_email: string
          recipient_first_name?: string | null
          recipient_last_name?: string | null
          response_text?: string | null
          sent_at?: string
          success?: boolean
          unsubscribe_token?: string | null
        }
        Update: {
          id?: string
          newsletter_slug?: string
          recipient_email?: string
          recipient_first_name?: string | null
          recipient_last_name?: string | null
          response_text?: string | null
          sent_at?: string
          success?: boolean
          unsubscribe_token?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          subscribed_at: string
          unsubscribe_token: string
          updated_at: string
        }
        Insert: {
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          subscribed_at?: string
          unsubscribe_token?: string
          updated_at?: string
        }
        Update: {
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          subscribed_at?: string
          unsubscribe_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_leads: {
        Row: {
          answers: Json
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          quiz: string
          results: Json
          submitted_at: string
          utm: Json | null
        }
        Insert: {
          answers: Json
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          quiz: string
          results: Json
          submitted_at?: string
          utm?: Json | null
        }
        Update: {
          answers?: Json
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          quiz?: string
          results?: Json
          submitted_at?: string
          utm?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      unsubscribe_newsletter: {
        Args: { p_token: string }
        Returns: boolean
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

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
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
