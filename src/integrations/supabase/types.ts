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
      business_insights: {
        Row: {
          answer: string
          business_id: string
          category: string
          created_at: string
          id: string
          metadata: Json | null
          question: string
        }
        Insert: {
          answer: string
          business_id: string
          category: string
          created_at?: string
          id?: string
          metadata?: Json | null
          question: string
        }
        Update: {
          answer?: string
          business_id?: string
          category?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_insights_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_integrations: {
        Row: {
          business_id: string
          created_at: string
          credentials: Json | null
          id: string
          integration_type: string
          last_sync_at: string | null
          metadata: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          credentials?: Json | null
          id?: string
          integration_type: string
          last_sync_at?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          credentials?: Json | null
          id?: string
          integration_type?: string
          last_sync_at?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_integrations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          avg_rating: number | null
          avg_ticket: number | null
          category: Database["public"]["Enums"]["business_category"] | null
          country: Database["public"]["Enums"]["country_code"] | null
          created_at: string | null
          currency: string | null
          google_place_id: string | null
          id: string
          instagram_handle: string | null
          integrations: Json | null
          name: string
          owner_id: string
          phone: string | null
          service_slots: Json | null
          settings: Json | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avg_rating?: number | null
          avg_ticket?: number | null
          category?: Database["public"]["Enums"]["business_category"] | null
          country?: Database["public"]["Enums"]["country_code"] | null
          created_at?: string | null
          currency?: string | null
          google_place_id?: string | null
          id?: string
          instagram_handle?: string | null
          integrations?: Json | null
          name: string
          owner_id: string
          phone?: string | null
          service_slots?: Json | null
          settings?: Json | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avg_rating?: number | null
          avg_ticket?: number | null
          category?: Database["public"]["Enums"]["business_category"] | null
          country?: Database["public"]["Enums"]["country_code"] | null
          created_at?: string | null
          currency?: string | null
          google_place_id?: string | null
          id?: string
          instagram_handle?: string | null
          integrations?: Json | null
          name?: string
          owner_id?: string
          phone?: string | null
          service_slots?: Json | null
          settings?: Json | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          business_id: string
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          business_id: string
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          business_id?: string
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          notes: string | null
          photo_url: string | null
          slot: string | null
          traffic_level: number | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          slot?: string | null
          traffic_level?: number | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          slot?: string | null
          traffic_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "checkins_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_actions: {
        Row: {
          business_id: string
          category: string | null
          checklist: Json | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          outcome: string | null
          outcome_rating: number | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          scheduled_for: string | null
          signals: Json | null
          status: Database["public"]["Enums"]["action_status"] | null
          title: string
        }
        Insert: {
          business_id: string
          category?: string | null
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          outcome?: string | null
          outcome_rating?: number | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          scheduled_for?: string | null
          signals?: Json | null
          status?: Database["public"]["Enums"]["action_status"] | null
          title: string
        }
        Update: {
          business_id?: string
          category?: string | null
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          outcome?: string | null
          outcome_rating?: number | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          scheduled_for?: string | null
          signals?: Json | null
          status?: Database["public"]["Enums"]["action_status"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_actions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      external_data: {
        Row: {
          business_id: string
          content: Json
          created_at: string
          data_type: string
          external_id: string | null
          id: string
          importance: number | null
          integration_id: string
          processed_at: string | null
          sentiment_score: number | null
          synced_at: string
        }
        Insert: {
          business_id: string
          content?: Json
          created_at?: string
          data_type: string
          external_id?: string | null
          id?: string
          importance?: number | null
          integration_id: string
          processed_at?: string | null
          sentiment_score?: number | null
          synced_at?: string
        }
        Update: {
          business_id?: string
          content?: Json
          created_at?: string
          data_type?: string
          external_id?: string | null
          id?: string
          importance?: number | null
          integration_id?: string
          processed_at?: string | null
          sentiment_score?: number | null
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_data_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_data_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "business_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          business_id: string
          category: string | null
          content: string
          created_at: string
          id: string
          importance: number | null
          source: string | null
        }
        Insert: {
          business_id: string
          category?: string | null
          content: string
          created_at?: string
          id?: string
          importance?: number | null
          source?: string | null
        }
        Update: {
          business_id?: string
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          importance?: number | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          area: string | null
          business_id: string
          completed_at: string | null
          created_at: string | null
          current_step: number | null
          description: string | null
          effort_score: number | null
          id: string
          impact_score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["mission_status"] | null
          steps: Json | null
          title: string
        }
        Insert: {
          area?: string | null
          business_id: string
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          description?: string | null
          effort_score?: number | null
          id?: string
          impact_score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["mission_status"] | null
          steps?: Json | null
          title: string
        }
        Update: {
          area?: string | null
          business_id?: string
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          description?: string | null
          effort_score?: number | null
          id?: string
          impact_score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["mission_status"] | null
          steps?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          business_id: string
          converted_to_mission_id: string | null
          created_at: string | null
          description: string | null
          dismissed_at: string | null
          effort_score: number | null
          evidence: Json | null
          id: string
          impact_score: number | null
          is_converted: boolean | null
          source: string | null
          title: string
        }
        Insert: {
          business_id: string
          converted_to_mission_id?: string | null
          created_at?: string | null
          description?: string | null
          dismissed_at?: string | null
          effort_score?: number | null
          evidence?: Json | null
          id?: string
          impact_score?: number | null
          is_converted?: boolean | null
          source?: string | null
          title: string
        }
        Update: {
          business_id?: string
          converted_to_mission_id?: string | null
          created_at?: string | null
          description?: string | null
          dismissed_at?: string | null
          effort_score?: number | null
          evidence?: Json | null
          id?: string
          impact_score?: number | null
          is_converted?: boolean | null
          source?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_converted_to_mission_id_fkey"
            columns: ["converted_to_mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          preferred_language: string | null
          updated_at: string | null
          user_mode: Database["public"]["Enums"]["user_mode"] | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          preferred_language?: string | null
          updated_at?: string | null
          user_mode?: Database["public"]["Enums"]["user_mode"] | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          preferred_language?: string | null
          updated_at?: string | null
          user_mode?: Database["public"]["Enums"]["user_mode"] | null
        }
        Relationships: []
      }
      weekly_priorities: {
        Row: {
          business_id: string
          checklist: Json | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          metric_name: string | null
          metric_target: string | null
          status: Database["public"]["Enums"]["mission_status"] | null
          title: string
          week_start: string
        }
        Insert: {
          business_id: string
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metric_name?: string | null
          metric_target?: string | null
          status?: Database["public"]["Enums"]["mission_status"] | null
          title: string
          week_start: string
        }
        Update: {
          business_id?: string
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metric_name?: string | null
          metric_target?: string | null
          status?: Database["public"]["Enums"]["mission_status"] | null
          title?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_priorities_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      action_status: "pending" | "completed" | "skipped" | "snoozed"
      business_category:
        | "cafeteria"
        | "bar"
        | "restaurant"
        | "fast_casual"
        | "heladeria"
        | "panaderia"
        | "dark_kitchen"
      country_code: "AR" | "MX" | "CL" | "UY" | "BR" | "CO" | "CR" | "PA" | "US"
      mission_status: "active" | "completed" | "paused" | "abandoned"
      priority_level: "low" | "medium" | "high" | "urgent"
      user_mode: "nano" | "standard" | "proactive" | "sos"
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
      action_status: ["pending", "completed", "skipped", "snoozed"],
      business_category: [
        "cafeteria",
        "bar",
        "restaurant",
        "fast_casual",
        "heladeria",
        "panaderia",
        "dark_kitchen",
      ],
      country_code: ["AR", "MX", "CL", "UY", "BR", "CO", "CR", "PA", "US"],
      mission_status: ["active", "completed", "paused", "abandoned"],
      priority_level: ["low", "medium", "high", "urgent"],
      user_mode: ["nano", "standard", "proactive", "sos"],
    },
  },
} as const
