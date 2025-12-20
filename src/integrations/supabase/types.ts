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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      call_logs: {
        Row: {
          campaign_id: string | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          lead_id: string
          outcome: Database["public"]["Enums"]["call_outcome"] | null
          started_at: string
          summary: string | null
          transcript: string | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          lead_id: string
          outcome?: Database["public"]["Enums"]["call_outcome"] | null
          started_at?: string
          summary?: string | null
          transcript?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          lead_id?: string
          outcome?: Database["public"]["Enums"]["call_outcome"] | null
          started_at?: string
          summary?: string | null
          transcript?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          ai_prompt: string | null
          call_goal: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          product_description: string | null
          target_group: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_prompt?: string | null
          call_goal?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          product_description?: string | null
          target_group?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_prompt?: string | null
          call_goal?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          product_description?: string | null
          target_group?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          campaign_id: string | null
          company: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string | null
          notes: string | null
          phone_number: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          notes?: string | null
          phone_number: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          notes?: string | null
          phone_number?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      test: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_call_log: {
        Args: { p_campaign_id?: string; p_lead_id: string }
        Returns: string
      }
      create_campaign: {
        Args: {
          p_ai_prompt?: string
          p_call_goal?: string
          p_name: string
          p_product_description?: string
          p_target_group?: string
        }
        Returns: string
      }
      create_lead: {
        Args: {
          p_campaign_id?: string
          p_company?: string
          p_email?: string
          p_first_name: string
          p_last_name?: string
          p_notes?: string
          p_phone_number: string
        }
        Returns: string
      }
      delete_campaign: { Args: { p_campaign_id: string }; Returns: boolean }
      delete_lead: { Args: { p_lead_id: string }; Returns: boolean }
      get_call_log: {
        Args: { p_call_id: string }
        Returns: {
          campaign_id: string
          campaign_name: string
          created_at: string
          duration_seconds: number
          ended_at: string
          id: string
          lead_company: string
          lead_first_name: string
          lead_id: string
          lead_last_name: string
          lead_phone_number: string
          outcome: Database["public"]["Enums"]["call_outcome"]
          started_at: string
          summary: string
          transcript: string
          user_id: string
        }[]
      }
      get_call_logs: {
        Args: {
          p_campaign_id?: string
          p_lead_id?: string
          p_limit?: number
          p_offset?: number
          p_outcome?: Database["public"]["Enums"]["call_outcome"]
        }
        Returns: {
          campaign_id: string
          campaign_name: string
          created_at: string
          duration_seconds: number
          ended_at: string
          id: string
          lead_company: string
          lead_first_name: string
          lead_id: string
          lead_last_name: string
          outcome: Database["public"]["Enums"]["call_outcome"]
          started_at: string
          summary: string
          transcript: string
          user_id: string
        }[]
      }
      get_campaign: {
        Args: { p_campaign_id: string }
        Returns: {
          ai_prompt: string
          call_goal: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          product_description: string
          target_group: string
          updated_at: string
          user_id: string
        }[]
      }
      get_campaigns: {
        Args: { p_is_active?: boolean }
        Returns: {
          ai_prompt: string
          call_goal: string
          created_at: string
          id: string
          is_active: boolean
          lead_count: number
          name: string
          product_description: string
          target_group: string
          updated_at: string
          user_id: string
        }[]
      }
      get_dashboard_stats: {
        Args: never
        Returns: {
          avg_call_duration_seconds: number
          calls_today: number
          interested_leads: number
          success_rate: number
          total_calls: number
          total_campaigns: number
          total_leads: number
        }[]
      }
      get_lead: {
        Args: { p_lead_id: string }
        Returns: {
          campaign_id: string
          company: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          notes: string
          phone_number: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          user_id: string
        }[]
      }
      get_leads: {
        Args: {
          p_campaign_id?: string
          p_search?: string
          p_status?: Database["public"]["Enums"]["lead_status"]
        }
        Returns: {
          campaign_id: string
          company: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          notes: string
          phone_number: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          user_id: string
        }[]
      }
      get_recent_activity: {
        Args: { p_limit?: number }
        Returns: {
          activity_id: string
          activity_type: string
          created_at: string
          description: string
          title: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_call_log: {
        Args: {
          p_call_id: string
          p_duration_seconds?: number
          p_ended_at?: string
          p_outcome?: Database["public"]["Enums"]["call_outcome"]
          p_summary?: string
          p_transcript?: string
        }
        Returns: boolean
      }
      update_campaign: {
        Args: {
          p_ai_prompt?: string
          p_call_goal?: string
          p_campaign_id: string
          p_is_active?: boolean
          p_name?: string
          p_product_description?: string
          p_target_group?: string
        }
        Returns: boolean
      }
      update_lead: {
        Args: {
          p_campaign_id?: string
          p_company?: string
          p_email?: string
          p_first_name?: string
          p_last_name?: string
          p_lead_id: string
          p_notes?: string
          p_phone_number?: string
          p_status?: Database["public"]["Enums"]["lead_status"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      call_outcome:
        | "answered"
        | "no_answer"
        | "busy"
        | "voicemail"
        | "interested"
        | "not_interested"
        | "callback_scheduled"
        | "qualified"
      lead_status:
        | "new"
        | "called"
        | "interested"
        | "callback"
        | "not_interested"
        | "qualified"
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
    Enums: {
      app_role: ["admin", "user"],
      call_outcome: [
        "answered",
        "no_answer",
        "busy",
        "voicemail",
        "interested",
        "not_interested",
        "callback_scheduled",
        "qualified",
      ],
      lead_status: [
        "new",
        "called",
        "interested",
        "callback",
        "not_interested",
        "qualified",
      ],
    },
  },
} as const
