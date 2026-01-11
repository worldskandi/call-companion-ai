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
      activity_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_settings: {
        Row: {
          ai_name: string | null
          ai_personality: string | null
          ai_voice: string | null
          company_name: string | null
          created_at: string | null
          default_greeting: string | null
          id: string
          language: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_name?: string | null
          ai_personality?: string | null
          ai_voice?: string | null
          company_name?: string | null
          created_at?: string | null
          default_greeting?: string | null
          id?: string
          language?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_name?: string | null
          ai_personality?: string | null
          ai_voice?: string | null
          company_name?: string | null
          created_at?: string | null
          default_greeting?: string | null
          id?: string
          language?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          scopes: string[] | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          scopes?: string[] | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          scopes?: string[] | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          call_type: string | null
          campaign_id: string | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          lead_id: string
          meeting_link: string | null
          meeting_link_sent_via: string | null
          meeting_scheduled_at: string | null
          outcome: Database["public"]["Enums"]["call_outcome"] | null
          started_at: string
          summary: string | null
          transcript: string | null
          user_id: string
        }
        Insert: {
          call_type?: string | null
          campaign_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          lead_id: string
          meeting_link?: string | null
          meeting_link_sent_via?: string | null
          meeting_scheduled_at?: string | null
          outcome?: Database["public"]["Enums"]["call_outcome"] | null
          started_at?: string
          summary?: string | null
          transcript?: string | null
          user_id: string
        }
        Update: {
          call_type?: string | null
          campaign_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          lead_id?: string
          meeting_link?: string | null
          meeting_link_sent_via?: string | null
          meeting_scheduled_at?: string | null
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
      call_sessions: {
        Row: {
          call_sid: string | null
          campaign_id: string | null
          campaign_prompt: string | null
          created_at: string
          expires_at: string
          id: string
          lead_company: string | null
          lead_id: string | null
          lead_name: string | null
          user_id: string
        }
        Insert: {
          call_sid?: string | null
          campaign_id?: string | null
          campaign_prompt?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          lead_company?: string | null
          lead_id?: string | null
          lead_name?: string | null
          user_id: string
        }
        Update: {
          call_sid?: string | null
          campaign_id?: string | null
          campaign_prompt?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          lead_company?: string | null
          lead_id?: string | null
          lead_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_sessions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_sessions_lead_id_fkey"
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
      inbound_routing: {
        Row: {
          ai_greeting: string | null
          business_hours_end: string | null
          business_hours_only: boolean | null
          business_hours_start: string | null
          campaign_id: string | null
          created_at: string | null
          forward_to: string | null
          id: string
          is_active: boolean | null
          phone_number_id: string
          routing_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_greeting?: string | null
          business_hours_end?: string | null
          business_hours_only?: boolean | null
          business_hours_start?: string | null
          campaign_id?: string | null
          created_at?: string | null
          forward_to?: string | null
          id?: string
          is_active?: boolean | null
          phone_number_id: string
          routing_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_greeting?: string | null
          business_hours_end?: string | null
          business_hours_only?: boolean | null
          business_hours_start?: string | null
          campaign_id?: string | null
          created_at?: string | null
          forward_to?: string | null
          id?: string
          is_active?: boolean | null
          phone_number_id?: string
          routing_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inbound_routing_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbound_routing_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
        ]
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
      notification_settings: {
        Row: {
          created_at: string | null
          daily_summary: boolean | null
          email_on_call_completed: boolean | null
          email_on_lead_interested: boolean | null
          email_on_meeting_scheduled: boolean | null
          id: string
          push_enabled: boolean | null
          updated_at: string | null
          user_id: string
          weekly_report: boolean | null
        }
        Insert: {
          created_at?: string | null
          daily_summary?: boolean | null
          email_on_call_completed?: boolean | null
          email_on_lead_interested?: boolean | null
          email_on_meeting_scheduled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_report?: boolean | null
        }
        Update: {
          created_at?: string | null
          daily_summary?: boolean | null
          email_on_call_completed?: boolean | null
          email_on_lead_interested?: boolean | null
          email_on_meeting_scheduled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_report?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          resource_id: string | null
          resource_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          resource_id?: string | null
          resource_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          resource_id?: string | null
          resource_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      phone_numbers: {
        Row: {
          campaign_id: string | null
          capabilities: Json | null
          country_code: string | null
          created_at: string | null
          friendly_name: string | null
          id: string
          is_active: boolean | null
          monthly_cost_cents: number | null
          phone_number: string
          provider: string | null
          twilio_sid: string | null
          updated_at: string | null
          user_id: string
          welcome_message: string | null
        }
        Insert: {
          campaign_id?: string | null
          capabilities?: Json | null
          country_code?: string | null
          created_at?: string | null
          friendly_name?: string | null
          id?: string
          is_active?: boolean | null
          monthly_cost_cents?: number | null
          phone_number: string
          provider?: string | null
          twilio_sid?: string | null
          updated_at?: string | null
          user_id: string
          welcome_message?: string | null
        }
        Update: {
          campaign_id?: string | null
          capabilities?: Json | null
          country_code?: string | null
          created_at?: string | null
          friendly_name?: string | null
          id?: string
          is_active?: boolean | null
          monthly_cost_cents?: number | null
          phone_number?: string
          provider?: string | null
          twilio_sid?: string | null
          updated_at?: string | null
          user_id?: string
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_campaign_id_fkey"
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
      subscriptions: {
        Row: {
          cancel_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          cancel_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          cancel_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
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
      usage_records: {
        Row: {
          created_at: string | null
          id: string
          metric: string
          period_end: string
          period_start: string
          quantity: number | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric: string
          period_end: string
          period_start: string
          quantity?: number | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric?: string
          period_end?: string
          period_start?: string
          quantity?: number | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_integrations: {
        Row: {
          access_token: string
          created_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          provider: string
          provider_email: string | null
          provider_user_id: string | null
          refresh_token: string | null
          scope: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          provider: string
          provider_email?: string | null
          provider_user_id?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          provider?: string
          provider_email?: string | null
          provider_user_id?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
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
      workspace_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string | null
          token: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: string | null
          token?: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string | null
          token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string | null
          role: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_call_log: {
        Args: {
          p_call_type?: string
          p_campaign_id?: string
          p_lead_id: string
        }
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
      create_notification: {
        Args: {
          p_message: string
          p_resource_id?: string
          p_resource_type?: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      delete_campaign: { Args: { p_campaign_id: string }; Returns: boolean }
      delete_lead: { Args: { p_lead_id: string }; Returns: boolean }
      get_call_analytics: {
        Args: { p_days?: number }
        Returns: {
          date: string
          inbound_count: number
          outbound_count: number
          success_count: number
          total_duration: number
        }[]
      }
      get_call_log: {
        Args: { p_call_id: string }
        Returns: {
          call_type: string
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
          p_call_type?: string
          p_campaign_id?: string
          p_lead_id?: string
          p_limit?: number
          p_offset?: number
          p_outcome?: Database["public"]["Enums"]["call_outcome"]
        }
        Returns: {
          call_type: string
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
      get_campaign_analytics: {
        Args: never
        Returns: {
          avg_duration: number
          campaign_id: string
          campaign_name: string
          success_rate: number
          successful_calls: number
          total_calls: number
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
          inbound_calls_today: number
          interested_leads: number
          missed_calls_today: number
          outbound_calls_today: number
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
