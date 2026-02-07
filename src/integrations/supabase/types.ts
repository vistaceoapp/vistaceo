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
      admin_audit_log: {
        Row: {
          action_data: Json | null
          action_type: string
          admin_user_id: string | null
          created_at: string
          id: string
          target_business_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          admin_user_id?: string | null
          created_at?: string
          id?: string
          target_business_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          admin_user_id?: string | null
          created_at?: string
          id?: string
          target_business_id?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          ai_summary_json: Json | null
          alert_type: string
          audio_url: string | null
          business_id: string
          category: string
          created_at: string
          id: string
          text_content: string | null
        }
        Insert: {
          ai_summary_json?: Json | null
          alert_type?: string
          audio_url?: string | null
          business_id: string
          category?: string
          created_at?: string
          id?: string
          text_content?: string | null
        }
        Update: {
          ai_summary_json?: Json | null
          alert_type?: string
          audio_url?: string | null
          business_id?: string
          category?: string
          created_at?: string
          id?: string
          text_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_analytics_daily: {
        Row: {
          avg_time_on_page: number | null
          bounce_rate: number | null
          country_breakdown: Json | null
          created_at: string
          device_breakdown: Json | null
          id: string
          metric_date: string
          pageviews: number | null
          post_slug: string
          referrer_breakdown: Json | null
          scroll_depth_avg: number | null
          unique_visitors: number | null
        }
        Insert: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          country_breakdown?: Json | null
          created_at?: string
          device_breakdown?: Json | null
          id?: string
          metric_date: string
          pageviews?: number | null
          post_slug: string
          referrer_breakdown?: Json | null
          scroll_depth_avg?: number | null
          unique_visitors?: number | null
        }
        Update: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          country_breakdown?: Json | null
          created_at?: string
          device_breakdown?: Json | null
          id?: string
          metric_date?: string
          pageviews?: number | null
          post_slug?: string
          referrer_breakdown?: Json | null
          scroll_depth_avg?: number | null
          unique_visitors?: number | null
        }
        Relationships: []
      }
      blog_config: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      blog_plan: {
        Row: {
          country_code: string
          created_at: string
          id: string
          last_attempt_at: string | null
          pillar: string
          planned_date: string
          publish_attempts: number | null
          skip_reason: string | null
          status: string
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          country_code?: string
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          pillar: string
          planned_date: string
          publish_attempts?: number | null
          skip_reason?: string | null
          status?: string
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          pillar?: string
          planned_date?: string
          publish_attempts?: number | null
          skip_reason?: string | null
          status?: string
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_plan_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "blog_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_bio: string | null
          author_name: string | null
          author_url: string | null
          canonical_url: string | null
          category: string | null
          content_md: string
          country_code: string
          created_at: string
          excerpt: string | null
          external_sources: Json | null
          hero_image_url: string | null
          id: string
          image_alt_text: string | null
          intent: string | null
          internal_links: Json | null
          meta_description: string | null
          meta_title: string | null
          pillar: string | null
          plan_id: string | null
          primary_keyword: string | null
          publish_at: string | null
          quality_gate_report: Json | null
          reading_time_min: number | null
          required_subtopics: string[] | null
          schema_jsonld: Json | null
          secondary_keywords: string[] | null
          sector: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          topic_id: string | null
          unique_angle: string | null
          updated_at: string
        }
        Insert: {
          author_bio?: string | null
          author_name?: string | null
          author_url?: string | null
          canonical_url?: string | null
          category?: string | null
          content_md: string
          country_code?: string
          created_at?: string
          excerpt?: string | null
          external_sources?: Json | null
          hero_image_url?: string | null
          id?: string
          image_alt_text?: string | null
          intent?: string | null
          internal_links?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          pillar?: string | null
          plan_id?: string | null
          primary_keyword?: string | null
          publish_at?: string | null
          quality_gate_report?: Json | null
          reading_time_min?: number | null
          required_subtopics?: string[] | null
          schema_jsonld?: Json | null
          secondary_keywords?: string[] | null
          sector?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          topic_id?: string | null
          unique_angle?: string | null
          updated_at?: string
        }
        Update: {
          author_bio?: string | null
          author_name?: string | null
          author_url?: string | null
          canonical_url?: string | null
          category?: string | null
          content_md?: string
          country_code?: string
          created_at?: string
          excerpt?: string | null
          external_sources?: Json | null
          hero_image_url?: string | null
          id?: string
          image_alt_text?: string | null
          intent?: string | null
          internal_links?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          pillar?: string | null
          plan_id?: string | null
          primary_keyword?: string | null
          publish_at?: string | null
          quality_gate_report?: Json | null
          reading_time_min?: number | null
          required_subtopics?: string[] | null
          schema_jsonld?: Json | null
          secondary_keywords?: string[] | null
          sector?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          topic_id?: string | null
          unique_angle?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "blog_plan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "blog_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_runs: {
        Row: {
          chosen_plan_id: string | null
          chosen_topic_id: string | null
          created_at: string
          id: string
          notes: string | null
          post_id: string | null
          quality_gate_report: Json | null
          result: string
          run_at: string
          skip_reason: string | null
        }
        Insert: {
          chosen_plan_id?: string | null
          chosen_topic_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          post_id?: string | null
          quality_gate_report?: Json | null
          result: string
          run_at?: string
          skip_reason?: string | null
        }
        Update: {
          chosen_plan_id?: string | null
          chosen_topic_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          post_id?: string | null
          quality_gate_report?: Json | null
          result?: string
          run_at?: string
          skip_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_runs_chosen_plan_id_fkey"
            columns: ["chosen_plan_id"]
            isOneToOne: false
            referencedRelation: "blog_plan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_runs_chosen_topic_id_fkey"
            columns: ["chosen_topic_id"]
            isOneToOne: false
            referencedRelation: "blog_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_runs_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_ssg_audits: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          generation_time_ms: number | null
          html_size_bytes: number | null
          id: string
          slug: string
          success: boolean
          triggered_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          generation_time_ms?: number | null
          html_size_bytes?: number | null
          id?: string
          slug: string
          success?: boolean
          triggered_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          generation_time_ms?: number | null
          html_size_bytes?: number | null
          id?: string
          slug?: string
          success?: boolean
          triggered_by?: string | null
        }
        Relationships: []
      }
      blog_topics: {
        Row: {
          category: string | null
          country_codes: string[] | null
          created_at: string
          generated_filler: boolean | null
          id: string
          intent: string | null
          last_used_at: string | null
          pillar: string
          primary_keyword: string | null
          priority_score: number | null
          required_subtopics: string[] | null
          seasonality: string | null
          secondary_keywords: string[] | null
          sector: string | null
          slug: string
          title_base: string
          unique_angle_options: string[] | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          country_codes?: string[] | null
          created_at?: string
          generated_filler?: boolean | null
          id?: string
          intent?: string | null
          last_used_at?: string | null
          pillar: string
          primary_keyword?: string | null
          priority_score?: number | null
          required_subtopics?: string[] | null
          seasonality?: string | null
          secondary_keywords?: string[] | null
          sector?: string | null
          slug: string
          title_base: string
          unique_angle_options?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          country_codes?: string[] | null
          created_at?: string
          generated_filler?: boolean | null
          id?: string
          intent?: string | null
          last_used_at?: string | null
          pillar?: string
          primary_keyword?: string | null
          priority_score?: number | null
          required_subtopics?: string[] | null
          seasonality?: string | null
          secondary_keywords?: string[] | null
          sector?: string | null
          slug?: string
          title_base?: string
          unique_angle_options?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      business_brains: {
        Row: {
          business_id: string
          concept_graph: Json | null
          confidence_score: number | null
          created_at: string
          current_focus: string
          decisions_memory: Json
          dynamic_memory: Json
          factual_memory: Json
          focus_priority: number | null
          id: string
          last_learning_at: string | null
          locale_profile: Json | null
          mvc_completion_pct: number | null
          mvc_gaps: Json | null
          preferences_memory: Json
          primary_business_type: string
          secondary_business_type: string | null
          secondary_type_weight: number | null
          success_patterns: Json | null
          total_signals: number | null
          updated_at: string
          user_style_model: Json | null
          version: number | null
          version_history: Json | null
        }
        Insert: {
          business_id: string
          concept_graph?: Json | null
          confidence_score?: number | null
          created_at?: string
          current_focus?: string
          decisions_memory?: Json
          dynamic_memory?: Json
          factual_memory?: Json
          focus_priority?: number | null
          id?: string
          last_learning_at?: string | null
          locale_profile?: Json | null
          mvc_completion_pct?: number | null
          mvc_gaps?: Json | null
          preferences_memory?: Json
          primary_business_type?: string
          secondary_business_type?: string | null
          secondary_type_weight?: number | null
          success_patterns?: Json | null
          total_signals?: number | null
          updated_at?: string
          user_style_model?: Json | null
          version?: number | null
          version_history?: Json | null
        }
        Update: {
          business_id?: string
          concept_graph?: Json | null
          confidence_score?: number | null
          created_at?: string
          current_focus?: string
          decisions_memory?: Json
          dynamic_memory?: Json
          factual_memory?: Json
          focus_priority?: number | null
          id?: string
          last_learning_at?: string | null
          locale_profile?: Json | null
          mvc_completion_pct?: number | null
          mvc_gaps?: Json | null
          preferences_memory?: Json
          primary_business_type?: string
          secondary_business_type?: string | null
          secondary_type_weight?: number | null
          success_patterns?: Json | null
          total_signals?: number | null
          updated_at?: string
          user_style_model?: Json | null
          version?: number | null
          version_history?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "business_brains_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_checkins: {
        Row: {
          answers_json: Json | null
          business_id: string
          checkin_type: string
          created_at: string
          id: string
          snapshot_id: string | null
        }
        Insert: {
          answers_json?: Json | null
          business_id: string
          checkin_type?: string
          created_at?: string
          id?: string
          snapshot_id?: string | null
        }
        Update: {
          answers_json?: Json | null
          business_id?: string
          checkin_type?: string
          created_at?: string
          id?: string
          snapshot_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_checkins_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_checkins_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      business_competitors: {
        Row: {
          address: string | null
          business_id: string
          created_at: string
          distance_km: number | null
          google_place_id: string | null
          has_verified_prices: boolean | null
          id: string
          metadata: Json | null
          name: string
          price_level: number | null
          rating: number | null
          review_count: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_id: string
          created_at?: string
          distance_km?: number | null
          google_place_id?: string | null
          has_verified_prices?: boolean | null
          id?: string
          metadata?: Json | null
          name: string
          price_level?: number | null
          rating?: number | null
          review_count?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_id?: string
          created_at?: string
          distance_km?: number | null
          google_place_id?: string | null
          has_verified_prices?: boolean | null
          id?: string
          metadata?: Json | null
          name?: string
          price_level?: number | null
          rating?: number | null
          review_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_competitors_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_focus_config: {
        Row: {
          auto_adjust_focus: boolean | null
          business_id: string
          created_at: string
          current_focus: string
          daily_checkin_enabled: boolean | null
          focus_history: Json | null
          focus_weights: Json
          id: string
          proactive_suggestions: boolean | null
          secondary_focus: string | null
          updated_at: string
          weekly_action_limit: number | null
        }
        Insert: {
          auto_adjust_focus?: boolean | null
          business_id: string
          created_at?: string
          current_focus?: string
          daily_checkin_enabled?: boolean | null
          focus_history?: Json | null
          focus_weights?: Json
          id?: string
          proactive_suggestions?: boolean | null
          secondary_focus?: string | null
          updated_at?: string
          weekly_action_limit?: number | null
        }
        Update: {
          auto_adjust_focus?: boolean | null
          business_id?: string
          created_at?: string
          current_focus?: string
          daily_checkin_enabled?: boolean | null
          focus_history?: Json | null
          focus_weights?: Json
          id?: string
          proactive_suggestions?: boolean | null
          secondary_focus?: string | null
          updated_at?: string
          weekly_action_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_focus_config_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
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
      business_menu_items: {
        Row: {
          business_id: string
          category: string | null
          channel_prices: Json | null
          created_at: string
          id: string
          is_star_item: boolean | null
          metadata: Json | null
          name: string
          price: number
          size: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          category?: string | null
          channel_prices?: Json | null
          created_at?: string
          id?: string
          is_star_item?: boolean | null
          metadata?: Json | null
          name: string
          price: number
          size?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          category?: string | null
          channel_prices?: Json | null
          created_at?: string
          id?: string
          is_star_item?: boolean | null
          metadata?: Json | null
          name?: string
          price?: number
          size?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_menu_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profile_extracted: {
        Row: {
          business_id: string
          created_at: string
          data_json: Json | null
          id: string
          source: string
          transcript: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          data_json?: Json | null
          id?: string
          source?: string
          transcript?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          data_json?: Json | null
          id?: string
          source?: string
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profile_extracted_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_setup_progress: {
        Row: {
          business_id: string
          completed_at: string | null
          created_at: string
          current_step: string
          id: string
          pmo_status: Json
          precision_score: number
          setup_data: Json
          updated_at: string
        }
        Insert: {
          business_id: string
          completed_at?: string | null
          created_at?: string
          current_step?: string
          id?: string
          pmo_status?: Json
          precision_score?: number
          setup_data?: Json
          updated_at?: string
        }
        Update: {
          business_id?: string
          completed_at?: string | null
          created_at?: string
          current_step?: string
          id?: string
          pmo_status?: Json
          precision_score?: number
          setup_data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_setup_progress_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_type_configs: {
        Row: {
          blocked_phrases: Json | null
          business_type: string
          common_issues: Json | null
          created_at: string
          display_name: string
          focus_weights: Json | null
          id: string
          key_metrics: Json | null
          key_variables: Json | null
          mission_templates: Json | null
          mvc_fields: Json
          playbook: Json | null
          priority_rules: Json | null
          signal_weights: Json | null
          updated_at: string
        }
        Insert: {
          blocked_phrases?: Json | null
          business_type: string
          common_issues?: Json | null
          created_at?: string
          display_name: string
          focus_weights?: Json | null
          id?: string
          key_metrics?: Json | null
          key_variables?: Json | null
          mission_templates?: Json | null
          mvc_fields: Json
          playbook?: Json | null
          priority_rules?: Json | null
          signal_weights?: Json | null
          updated_at?: string
        }
        Update: {
          blocked_phrases?: Json | null
          business_type?: string
          common_issues?: Json | null
          created_at?: string
          display_name?: string
          focus_weights?: Json | null
          id?: string
          key_metrics?: Json | null
          key_variables?: Json | null
          mission_templates?: Json | null
          mvc_fields?: Json
          playbook?: Json | null
          priority_rules?: Json | null
          signal_weights?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          active_dayparts: string[] | null
          address: string | null
          avg_rating: number | null
          avg_ticket: number | null
          avg_ticket_range: Json | null
          baseline_date: string | null
          baseline_snapshot_id: string | null
          category: Database["public"]["Enums"]["business_category"] | null
          channel_mix: Json | null
          competitive_radius_km: number | null
          country: Database["public"]["Enums"]["country_code"] | null
          created_at: string | null
          currency: string | null
          daily_transactions_range: Json | null
          delivery_platforms: string[] | null
          fixed_costs_range: Json | null
          food_cost_range: Json | null
          google_place_id: string | null
          id: string
          instagram_handle: string | null
          integrations: Json | null
          monthly_revenue_range: Json | null
          name: string
          owner_id: string
          phone: string | null
          precision_score: number | null
          reservation_platforms: string[] | null
          sales_tax_percent: number | null
          service_fee_percent: number | null
          service_model: string | null
          service_slots: Json | null
          settings: Json | null
          setup_completed: boolean | null
          timezone: string | null
          tip_percent: number | null
          updated_at: string | null
        }
        Insert: {
          active_dayparts?: string[] | null
          address?: string | null
          avg_rating?: number | null
          avg_ticket?: number | null
          avg_ticket_range?: Json | null
          baseline_date?: string | null
          baseline_snapshot_id?: string | null
          category?: Database["public"]["Enums"]["business_category"] | null
          channel_mix?: Json | null
          competitive_radius_km?: number | null
          country?: Database["public"]["Enums"]["country_code"] | null
          created_at?: string | null
          currency?: string | null
          daily_transactions_range?: Json | null
          delivery_platforms?: string[] | null
          fixed_costs_range?: Json | null
          food_cost_range?: Json | null
          google_place_id?: string | null
          id?: string
          instagram_handle?: string | null
          integrations?: Json | null
          monthly_revenue_range?: Json | null
          name: string
          owner_id: string
          phone?: string | null
          precision_score?: number | null
          reservation_platforms?: string[] | null
          sales_tax_percent?: number | null
          service_fee_percent?: number | null
          service_model?: string | null
          service_slots?: Json | null
          settings?: Json | null
          setup_completed?: boolean | null
          timezone?: string | null
          tip_percent?: number | null
          updated_at?: string | null
        }
        Update: {
          active_dayparts?: string[] | null
          address?: string | null
          avg_rating?: number | null
          avg_ticket?: number | null
          avg_ticket_range?: Json | null
          baseline_date?: string | null
          baseline_snapshot_id?: string | null
          category?: Database["public"]["Enums"]["business_category"] | null
          channel_mix?: Json | null
          competitive_radius_km?: number | null
          country?: Database["public"]["Enums"]["country_code"] | null
          created_at?: string | null
          currency?: string | null
          daily_transactions_range?: Json | null
          delivery_platforms?: string[] | null
          fixed_costs_range?: Json | null
          food_cost_range?: Json | null
          google_place_id?: string | null
          id?: string
          instagram_handle?: string | null
          integrations?: Json | null
          monthly_revenue_range?: Json | null
          name?: string
          owner_id?: string
          phone?: string | null
          precision_score?: number | null
          reservation_platforms?: string[] | null
          sales_tax_percent?: number | null
          service_fee_percent?: number | null
          service_model?: string | null
          service_slots?: Json | null
          settings?: Json | null
          setup_completed?: boolean | null
          timezone?: string | null
          tip_percent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_baseline_snapshot_id_fkey"
            columns: ["baseline_snapshot_id"]
            isOneToOne: false
            referencedRelation: "snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      canonical_entities: {
        Row: {
          business_id: string
          canonical_name: string
          confidence: number | null
          created_at: string
          display_name: string
          entity_type: string
          id: string
          last_seen_at: string | null
          mention_count: number | null
          metadata: Json
          synonyms: Json
          updated_at: string
        }
        Insert: {
          business_id: string
          canonical_name: string
          confidence?: number | null
          created_at?: string
          display_name: string
          entity_type: string
          id?: string
          last_seen_at?: string | null
          mention_count?: number | null
          metadata?: Json
          synonyms?: Json
          updated_at?: string
        }
        Update: {
          business_id?: string
          canonical_name?: string
          confidence?: number | null
          created_at?: string
          display_name?: string
          entity_type?: string
          id?: string
          last_seen_at?: string | null
          mention_count?: number | null
          metadata?: Json
          synonyms?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "canonical_entities_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      causal_blueprints: {
        Row: {
          business_type: string
          causal_graph: Json
          controllable_levers: Json
          created_at: string
          display_name: string
          id: string
          is_active: boolean | null
          leading_indicators: Json
          native_metrics: Json
          seasonality_pattern: Json
          sector: string
          signature_predictions: Json
          structural_risks: Json
          typical_shocks: Json
          updated_at: string
        }
        Insert: {
          business_type: string
          causal_graph?: Json
          controllable_levers?: Json
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean | null
          leading_indicators?: Json
          native_metrics?: Json
          seasonality_pattern?: Json
          sector: string
          signature_predictions?: Json
          structural_risks?: Json
          typical_shocks?: Json
          updated_at?: string
        }
        Update: {
          business_type?: string
          causal_graph?: Json
          controllable_levers?: Json
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean | null
          leading_indicators?: Json
          native_metrics?: Json
          seasonality_pattern?: Json
          sector?: string
          signature_predictions?: Json
          structural_risks?: Json
          typical_shocks?: Json
          updated_at?: string
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
      data_gaps: {
        Row: {
          answer: Json | null
          answered_at: string | null
          answered_via: string | null
          brain_id: string | null
          business_id: string
          category: string
          created_at: string
          field_name: string
          gap_type: string
          id: string
          priority: number | null
          questions: Json
          reason: string
          status: string | null
          unlocks: string
          updated_at: string
        }
        Insert: {
          answer?: Json | null
          answered_at?: string | null
          answered_via?: string | null
          brain_id?: string | null
          business_id: string
          category: string
          created_at?: string
          field_name: string
          gap_type: string
          id?: string
          priority?: number | null
          questions?: Json
          reason: string
          status?: string | null
          unlocks: string
          updated_at?: string
        }
        Update: {
          answer?: Json | null
          answered_at?: string | null
          answered_via?: string | null
          brain_id?: string | null
          business_id?: string
          category?: string
          created_at?: string
          field_name?: string
          gap_type?: string
          id?: string
          priority?: number | null
          questions?: Json
          reason?: string
          status?: string | null
          unlocks?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_gaps_brain_id_fkey"
            columns: ["brain_id"]
            isOneToOne: false
            referencedRelation: "business_brains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_gaps_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_twin_config: {
        Row: {
          active_assumptions: Json
          baseline_metrics: Json
          business_id: string
          calibration_accuracy: Json
          created_at: string
          custom_driver_weights: Json
          drift_status: string | null
          id: string
          known_constraints: Json
          last_drift_check: string | null
          risk_personality: string
          updated_at: string
        }
        Insert: {
          active_assumptions?: Json
          baseline_metrics?: Json
          business_id: string
          calibration_accuracy?: Json
          created_at?: string
          custom_driver_weights?: Json
          drift_status?: string | null
          id?: string
          known_constraints?: Json
          last_drift_check?: string | null
          risk_personality?: string
          updated_at?: string
        }
        Update: {
          active_assumptions?: Json
          baseline_metrics?: Json
          business_id?: string
          calibration_accuracy?: Json
          created_at?: string
          custom_driver_weights?: Json
          drift_status?: string | null
          id?: string
          known_constraints?: Json
          last_drift_check?: string | null
          risk_personality?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_twin_config_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      email_events: {
        Row: {
          business_id: string | null
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          provider_message_id: string | null
          sent_at: string | null
          status: string
          template_key: string
          user_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          template_key: string
          user_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          template_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_mentions: {
        Row: {
          business_id: string
          context: string | null
          created_at: string
          entity_id: string
          id: string
          raw_text: string | null
          sentiment: number | null
          source_id: string
          source_type: string
        }
        Insert: {
          business_id: string
          context?: string | null
          created_at?: string
          entity_id: string
          id?: string
          raw_text?: string | null
          sentiment?: number | null
          source_id: string
          source_type: string
        }
        Update: {
          business_id?: string
          context?: string | null
          created_at?: string
          entity_id?: string
          id?: string
          raw_text?: string | null
          sentiment?: number | null
          source_id?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_mentions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_mentions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "canonical_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_relations: {
        Row: {
          business_id: string
          created_at: string
          entity_a_id: string
          entity_b_id: string
          evidence_count: number | null
          id: string
          metadata: Json | null
          relation_type: string
          strength: number | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          entity_a_id: string
          entity_b_id: string
          evidence_count?: number | null
          id?: string
          metadata?: Json | null
          relation_type: string
          strength?: number | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          entity_a_id?: string
          entity_b_id?: string
          evidence_count?: number | null
          id?: string
          metadata?: Json | null
          relation_type?: string
          strength?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_relations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_relations_entity_a_id_fkey"
            columns: ["entity_a_id"]
            isOneToOne: false
            referencedRelation: "canonical_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_relations_entity_b_id_fkey"
            columns: ["entity_b_id"]
            isOneToOne: false
            referencedRelation: "canonical_entities"
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
      insight_metrics: {
        Row: {
          business_id: string
          created_at: string
          id: string
          insights_applied: number | null
          insights_by_type: Json | null
          insights_dismissed: number | null
          period_end: string
          period_start: string
          top_categories: Json | null
          total_insights: number | null
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          insights_applied?: number | null
          insights_by_type?: Json | null
          insights_dismissed?: number | null
          period_end: string
          period_start: string
          top_categories?: Json | null
          total_insights?: number | null
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          insights_applied?: number | null
          insights_by_type?: Json | null
          insights_dismissed?: number | null
          period_end?: string
          period_start?: string
          top_categories?: Json | null
          total_insights?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "insight_metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      insight_notifications: {
        Row: {
          business_id: string
          created_at: string
          id: string
          insights_count: number | null
          is_read: boolean | null
          message: string | null
          metadata: Json | null
          notification_type: string
          title: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          insights_count?: number | null
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          notification_type?: string
          title: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          insights_count?: number | null
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          notification_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "insight_notifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_items: {
        Row: {
          action_steps: Json | null
          business_id: string
          concept_hash: string | null
          content: string | null
          created_at: string
          id: string
          intent_signature: string | null
          is_read: boolean | null
          is_saved: boolean | null
          item_type: string
          quality_gate_score: number | null
          source: string | null
          title: string
        }
        Insert: {
          action_steps?: Json | null
          business_id: string
          concept_hash?: string | null
          content?: string | null
          created_at?: string
          id?: string
          intent_signature?: string | null
          is_read?: boolean | null
          is_saved?: boolean | null
          item_type?: string
          quality_gate_score?: number | null
          source?: string | null
          title: string
        }
        Update: {
          action_steps?: Json | null
          business_id?: string
          concept_hash?: string | null
          content?: string | null
          created_at?: string
          id?: string
          intent_signature?: string | null
          is_read?: boolean | null
          is_saved?: boolean | null
          item_type?: string
          quality_gate_score?: number | null
          source?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
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
      linkedin_integration: {
        Row: {
          access_token: string | null
          access_token_expires_at: string | null
          created_at: string
          id: string
          last_post_at: string | null
          organization_name: string | null
          organization_urn: string | null
          refresh_token: string | null
          status: string
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          access_token_expires_at?: string | null
          created_at?: string
          id?: string
          last_post_at?: string | null
          organization_name?: string | null
          organization_urn?: string | null
          refresh_token?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          access_token_expires_at?: string | null
          created_at?: string
          id?: string
          last_post_at?: string | null
          organization_name?: string | null
          organization_urn?: string | null
          refresh_token?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      metrics_timeseries: {
        Row: {
          business_id: string
          created_at: string
          granularity: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_source: string
          period_end: string
          period_start: string
          value: number
        }
        Insert: {
          business_id: string
          created_at?: string
          granularity?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_source: string
          period_end: string
          period_start: string
          value: number
        }
        Update: {
          business_id?: string
          created_at?: string
          granularity?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_source?: string
          period_end?: string
          period_start?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "metrics_timeseries_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_templates: {
        Row: {
          business_type: string
          created_at: string
          description_template: string
          effort_score: number | null
          focus_area: string
          id: string
          impact_formula: string | null
          is_active: boolean | null
          priority_base: number | null
          required_signals: Json | null
          required_variables: Json
          steps_template: Json
          tags: Json | null
          template_key: string
          title_template: string
          updated_at: string
        }
        Insert: {
          business_type: string
          created_at?: string
          description_template: string
          effort_score?: number | null
          focus_area: string
          id?: string
          impact_formula?: string | null
          is_active?: boolean | null
          priority_base?: number | null
          required_signals?: Json | null
          required_variables?: Json
          steps_template?: Json
          tags?: Json | null
          template_key: string
          title_template: string
          updated_at?: string
        }
        Update: {
          business_type?: string
          created_at?: string
          description_template?: string
          effort_score?: number | null
          focus_area?: string
          id?: string
          impact_formula?: string | null
          is_active?: boolean | null
          priority_base?: number | null
          required_signals?: Json | null
          required_variables?: Json
          steps_template?: Json
          tags?: Json | null
          template_key?: string
          title_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          area: string | null
          business_id: string
          completed_at: string | null
          concept_hash: string | null
          created_at: string | null
          current_step: number | null
          description: string | null
          effort_score: number | null
          id: string
          impact_score: number | null
          source_opportunity_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["mission_status"] | null
          steps: Json | null
          title: string
        }
        Insert: {
          area?: string | null
          business_id: string
          completed_at?: string | null
          concept_hash?: string | null
          created_at?: string | null
          current_step?: number | null
          description?: string | null
          effort_score?: number | null
          id?: string
          impact_score?: number | null
          source_opportunity_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["mission_status"] | null
          steps?: Json | null
          title: string
        }
        Update: {
          area?: string | null
          business_id?: string
          completed_at?: string | null
          concept_hash?: string | null
          created_at?: string | null
          current_step?: number | null
          description?: string | null
          effort_score?: number | null
          id?: string
          impact_score?: number | null
          source_opportunity_id?: string | null
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
          {
            foreignKeyName: "missions_source_opportunity_id_fkey"
            columns: ["source_opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          ai_plan_json: Json | null
          business_id: string
          concept_hash: string | null
          converted_to_mission_id: string | null
          created_at: string | null
          description: string | null
          dismissed_at: string | null
          effort_score: number | null
          evidence: Json | null
          id: string
          impact_score: number | null
          intent_signature: string | null
          is_converted: boolean | null
          quality_gate_details: Json | null
          quality_gate_score: number | null
          root_problem_signature: string | null
          source: string | null
          title: string
        }
        Insert: {
          ai_plan_json?: Json | null
          business_id: string
          concept_hash?: string | null
          converted_to_mission_id?: string | null
          created_at?: string | null
          description?: string | null
          dismissed_at?: string | null
          effort_score?: number | null
          evidence?: Json | null
          id?: string
          impact_score?: number | null
          intent_signature?: string | null
          is_converted?: boolean | null
          quality_gate_details?: Json | null
          quality_gate_score?: number | null
          root_problem_signature?: string | null
          source?: string | null
          title: string
        }
        Update: {
          ai_plan_json?: Json | null
          business_id?: string
          concept_hash?: string | null
          converted_to_mission_id?: string | null
          created_at?: string | null
          description?: string | null
          dismissed_at?: string | null
          effort_score?: number | null
          evidence?: Json | null
          id?: string
          impact_score?: number | null
          intent_signature?: string | null
          is_converted?: boolean | null
          quality_gate_details?: Json | null
          quality_gate_score?: number | null
          root_problem_signature?: string | null
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
      prediction_calibrations: {
        Row: {
          answer: Json | null
          answered_at: string | null
          business_id: string
          created_at: string
          default_value: number | null
          delta_confidence: number | null
          delta_uncertainty_reduction: number | null
          id: string
          improves: Json
          input_type: string
          max_value: number | null
          min_value: number | null
          options: Json | null
          prediction_id: string | null
          priority: number | null
          question: string
          reason: string
          status: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          answer?: Json | null
          answered_at?: string | null
          business_id: string
          created_at?: string
          default_value?: number | null
          delta_confidence?: number | null
          delta_uncertainty_reduction?: number | null
          id?: string
          improves?: Json
          input_type?: string
          max_value?: number | null
          min_value?: number | null
          options?: Json | null
          prediction_id?: string | null
          priority?: number | null
          question: string
          reason: string
          status?: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          answer?: Json | null
          answered_at?: string | null
          business_id?: string
          created_at?: string
          default_value?: number | null
          delta_confidence?: number | null
          delta_uncertainty_reduction?: number | null
          id?: string
          improves?: Json
          input_type?: string
          max_value?: number | null
          min_value?: number | null
          options?: Json | null
          prediction_id?: string | null
          priority?: number | null
          question?: string
          reason?: string
          status?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_calibrations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_calibrations_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_ledger: {
        Row: {
          accuracy_score: number | null
          actual_outcome: Json | null
          business_id: string
          created_at: string
          error_margin: number | null
          id: string
          learning_notes: string | null
          outcome_recorded_at: string | null
          prediction_id: string
          prediction_snapshot: Json
        }
        Insert: {
          accuracy_score?: number | null
          actual_outcome?: Json | null
          business_id: string
          created_at?: string
          error_margin?: number | null
          id?: string
          learning_notes?: string | null
          outcome_recorded_at?: string | null
          prediction_id: string
          prediction_snapshot: Json
        }
        Update: {
          accuracy_score?: number | null
          actual_outcome?: Json | null
          business_id?: string
          created_at?: string
          error_margin?: number | null
          id?: string
          learning_notes?: string | null
          outcome_recorded_at?: string | null
          prediction_id?: string
          prediction_snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "prediction_ledger_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_ledger_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          available_actions: Json
          brain_id: string | null
          breakpoint_thresholds: Json | null
          business_id: string
          causal_chain: Json
          confidence: number
          converted_to_mission_id: string | null
          created_at: string
          dismissed_at: string | null
          domain: string
          estimated_impact: Json
          evidence: Json
          horizon_ring: string
          id: string
          is_breakpoint: boolean | null
          probability: number
          publication_level: string
          recommended_actions: Json
          status: string
          summary: string | null
          time_window: Json
          title: string
          uncertainty_band: Json
          updated_at: string
          verification_notes: string | null
          verification_result: string | null
          verified_at: string | null
          visual_payload: Json
        }
        Insert: {
          available_actions?: Json
          brain_id?: string | null
          breakpoint_thresholds?: Json | null
          business_id: string
          causal_chain?: Json
          confidence?: number
          converted_to_mission_id?: string | null
          created_at?: string
          dismissed_at?: string | null
          domain: string
          estimated_impact?: Json
          evidence?: Json
          horizon_ring: string
          id?: string
          is_breakpoint?: boolean | null
          probability?: number
          publication_level?: string
          recommended_actions?: Json
          status?: string
          summary?: string | null
          time_window?: Json
          title: string
          uncertainty_band?: Json
          updated_at?: string
          verification_notes?: string | null
          verification_result?: string | null
          verified_at?: string | null
          visual_payload?: Json
        }
        Update: {
          available_actions?: Json
          brain_id?: string | null
          breakpoint_thresholds?: Json | null
          business_id?: string
          causal_chain?: Json
          confidence?: number
          converted_to_mission_id?: string | null
          created_at?: string
          dismissed_at?: string | null
          domain?: string
          estimated_impact?: Json
          evidence?: Json
          horizon_ring?: string
          id?: string
          is_breakpoint?: boolean | null
          probability?: number
          publication_level?: string
          recommended_actions?: Json
          status?: string
          summary?: string | null
          time_window?: Json
          title?: string
          uncertainty_band?: Json
          updated_at?: string
          verification_notes?: string | null
          verification_result?: string | null
          verified_at?: string | null
          visual_payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "predictions_brain_id_fkey"
            columns: ["brain_id"]
            isOneToOne: false
            referencedRelation: "business_brains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
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
          last_active_at: string | null
          last_login_at: string | null
          login_count: number | null
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
          last_active_at?: string | null
          last_login_at?: string | null
          login_count?: number | null
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
          last_active_at?: string | null
          last_login_at?: string | null
          login_count?: number | null
          onboarding_completed?: boolean | null
          preferred_language?: string | null
          updated_at?: string | null
          user_mode?: Database["public"]["Enums"]["user_mode"] | null
        }
        Relationships: []
      }
      pulse_blueprints: {
        Row: {
          adaptacion_por_brain: string | null
          business_type: string
          created_at: string
          eventos_bad_base: string[] | null
          eventos_good_base: string[] | null
          id: string
          is_active: boolean | null
          labels_1_5: Json
          numeric_prompt_base: string | null
          pregunta_principal_base: string
          proxy_base: string | null
          recommended_frequency: string | null
          sector: string
          selling_model_base: string
          shift_mode_base: string | null
          updated_at: string
        }
        Insert: {
          adaptacion_por_brain?: string | null
          business_type: string
          created_at?: string
          eventos_bad_base?: string[] | null
          eventos_good_base?: string[] | null
          id?: string
          is_active?: boolean | null
          labels_1_5?: Json
          numeric_prompt_base?: string | null
          pregunta_principal_base: string
          proxy_base?: string | null
          recommended_frequency?: string | null
          sector: string
          selling_model_base: string
          shift_mode_base?: string | null
          updated_at?: string
        }
        Update: {
          adaptacion_por_brain?: string | null
          business_type?: string
          created_at?: string
          eventos_bad_base?: string[] | null
          eventos_good_base?: string[] | null
          id?: string
          is_active?: boolean | null
          labels_1_5?: Json
          numeric_prompt_base?: string | null
          pregunta_principal_base?: string
          proxy_base?: string | null
          recommended_frequency?: string | null
          sector?: string
          selling_model_base?: string
          shift_mode_base?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pulse_checkins: {
        Row: {
          applies_to_date: string
          brain_updated: boolean | null
          business_id: string
          confidence_score: number | null
          created_at: string
          currency_local: string | null
          granularity: string
          id: string
          metadata: Json | null
          notes_bad: string | null
          notes_good: string | null
          processed_at: string | null
          pulse_label: string | null
          pulse_score_1_5: number | null
          revenue_local: number | null
          revenue_usd: number | null
          shift_tag: string | null
          source: string
          tags: Json | null
          updated_at: string
          volume_proxy_type: string | null
          volume_proxy_value: number | null
        }
        Insert: {
          applies_to_date?: string
          brain_updated?: boolean | null
          business_id: string
          confidence_score?: number | null
          created_at?: string
          currency_local?: string | null
          granularity?: string
          id?: string
          metadata?: Json | null
          notes_bad?: string | null
          notes_good?: string | null
          processed_at?: string | null
          pulse_label?: string | null
          pulse_score_1_5?: number | null
          revenue_local?: number | null
          revenue_usd?: number | null
          shift_tag?: string | null
          source?: string
          tags?: Json | null
          updated_at?: string
          volume_proxy_type?: string | null
          volume_proxy_value?: number | null
        }
        Update: {
          applies_to_date?: string
          brain_updated?: boolean | null
          business_id?: string
          confidence_score?: number | null
          created_at?: string
          currency_local?: string | null
          granularity?: string
          id?: string
          metadata?: Json | null
          notes_bad?: string | null
          notes_good?: string | null
          processed_at?: string | null
          pulse_label?: string | null
          pulse_score_1_5?: number | null
          revenue_local?: number | null
          revenue_usd?: number | null
          shift_tag?: string | null
          source?: string
          tags?: Json | null
          updated_at?: string
          volume_proxy_type?: string | null
          volume_proxy_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pulse_checkins_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_traces: {
        Row: {
          based_on: Json
          block_reason: string | null
          brain_id: string | null
          business_id: string
          confidence: string
          created_at: string
          feedback_at: string | null
          feedback_notes: string | null
          generic_phrases_detected: Json | null
          id: string
          is_blocked: boolean | null
          output_content: Json
          output_id: string | null
          output_type: string
          passed_quality_gate: boolean | null
          quality_gate_details: Json | null
          quality_gate_score: number | null
          user_feedback: string | null
          variables_used: Json | null
          why_summary: string
        }
        Insert: {
          based_on?: Json
          block_reason?: string | null
          brain_id?: string | null
          business_id: string
          confidence: string
          created_at?: string
          feedback_at?: string | null
          feedback_notes?: string | null
          generic_phrases_detected?: Json | null
          id?: string
          is_blocked?: boolean | null
          output_content: Json
          output_id?: string | null
          output_type: string
          passed_quality_gate?: boolean | null
          quality_gate_details?: Json | null
          quality_gate_score?: number | null
          user_feedback?: string | null
          variables_used?: Json | null
          why_summary: string
        }
        Update: {
          based_on?: Json
          block_reason?: string | null
          brain_id?: string | null
          business_id?: string
          confidence?: string
          created_at?: string
          feedback_at?: string | null
          feedback_notes?: string | null
          generic_phrases_detected?: Json | null
          id?: string
          is_blocked?: boolean | null
          output_content?: Json
          output_id?: string | null
          output_type?: string
          passed_quality_gate?: boolean | null
          quality_gate_details?: Json | null
          quality_gate_score?: number | null
          user_feedback?: string | null
          variables_used?: Json | null
          why_summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_traces_brain_id_fkey"
            columns: ["brain_id"]
            isOneToOne: false
            referencedRelation: "business_brains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_traces_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations_feedback: {
        Row: {
          action_id: string | null
          applied_status: string
          blocker: string | null
          business_id: string
          created_at: string
          id: string
          mission_id: string | null
          notes: string | null
          opportunity_id: string | null
        }
        Insert: {
          action_id?: string | null
          applied_status?: string
          blocker?: string | null
          business_id: string
          created_at?: string
          id?: string
          mission_id?: string | null
          notes?: string | null
          opportunity_id?: string | null
        }
        Update: {
          action_id?: string | null
          applied_status?: string
          blocker?: string | null
          business_id?: string
          created_at?: string
          id?: string
          mission_id?: string | null
          notes?: string | null
          opportunity_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_feedback_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "daily_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_feedback_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_feedback_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_feedback_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      rejected_concepts: {
        Row: {
          blocked_until: string | null
          business_id: string
          concept_hash: string
          created_at: string
          id: string
          intent_signature: string | null
          reason: string
          root_problem_signature: string | null
          source_id: string | null
          source_type: string
          user_feedback: string | null
        }
        Insert: {
          blocked_until?: string | null
          business_id: string
          concept_hash: string
          created_at?: string
          id?: string
          intent_signature?: string | null
          reason?: string
          root_problem_signature?: string | null
          source_id?: string | null
          source_type?: string
          user_feedback?: string | null
        }
        Update: {
          blocked_until?: string | null
          business_id?: string
          concept_hash?: string
          created_at?: string
          id?: string
          intent_signature?: string | null
          reason?: string
          root_problem_signature?: string | null
          source_id?: string | null
          source_type?: string
          user_feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rejected_concepts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      signals: {
        Row: {
          brain_id: string | null
          business_id: string
          confidence: string | null
          content: Json
          created_at: string
          entities: Json | null
          id: string
          importance: number | null
          processed: boolean | null
          processed_at: string | null
          raw_text: string | null
          signal_type: string
          source: string
        }
        Insert: {
          brain_id?: string | null
          business_id: string
          confidence?: string | null
          content?: Json
          created_at?: string
          entities?: Json | null
          id?: string
          importance?: number | null
          processed?: boolean | null
          processed_at?: string | null
          raw_text?: string | null
          signal_type: string
          source: string
        }
        Update: {
          brain_id?: string | null
          business_id?: string
          confidence?: string | null
          content?: Json
          created_at?: string
          entities?: Json | null
          id?: string
          importance?: number | null
          processed?: boolean | null
          processed_at?: string | null
          raw_text?: string | null
          signal_type?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "signals_brain_id_fkey"
            columns: ["brain_id"]
            isOneToOne: false
            referencedRelation: "business_brains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      snapshots: {
        Row: {
          business_id: string
          created_at: string
          dimensions_json: Json | null
          explanation_json: Json | null
          id: string
          source: string
          strengths: Json | null
          top_actions: Json | null
          total_score: number | null
          weaknesses: Json | null
        }
        Insert: {
          business_id: string
          created_at?: string
          dimensions_json?: Json | null
          explanation_json?: Json | null
          id?: string
          source?: string
          strengths?: Json | null
          top_actions?: Json | null
          total_score?: number | null
          weaknesses?: Json | null
        }
        Update: {
          business_id?: string
          created_at?: string
          dimensions_json?: Json | null
          explanation_json?: Json | null
          id?: string
          source?: string
          strengths?: Json | null
          top_actions?: Json | null
          total_score?: number | null
          weaknesses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "snapshots_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      social_publications: {
        Row: {
          attempts: number
          blog_post_id: string
          canonical_url: string | null
          channel: string
          created_at: string
          error_message: string | null
          generated_text: string | null
          id: string
          linkedin_post_urn: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          blog_post_id: string
          canonical_url?: string | null
          channel?: string
          created_at?: string
          error_message?: string | null
          generated_text?: string | null
          id?: string
          linkedin_post_urn?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          blog_post_id?: string
          canonical_url?: string | null
          channel?: string
          created_at?: string
          error_message?: string | null
          generated_text?: string | null
          id?: string
          linkedin_post_urn?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_publications_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          auto_renew: boolean | null
          business_id: string
          cancelled_at: string | null
          created_at: string
          expires_at: string
          id: string
          local_amount: number | null
          local_currency: string | null
          metadata: Json | null
          payment_amount: number
          payment_currency: string
          payment_id: string | null
          payment_provider: string
          plan_id: string
          starts_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          business_id: string
          cancelled_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          local_amount?: number | null
          local_currency?: string | null
          metadata?: Json | null
          payment_amount: number
          payment_currency: string
          payment_id?: string | null
          payment_provider: string
          plan_id: string
          starts_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          business_id?: string
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          local_amount?: number | null
          local_currency?: string | null
          metadata?: Json | null
          payment_amount?: number
          payment_currency?: string
          payment_id?: string | null
          payment_provider?: string
          plan_id?: string
          starts_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          business_id: string | null
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          page_path: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          page_path?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          page_path?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_metrics: {
        Row: {
          actions_count: number | null
          business_id: string | null
          chat_messages_sent: number | null
          checkins_completed: number | null
          created_at: string
          id: string
          logins_count: number | null
          metric_date: string
          missions_completed: number | null
          missions_started: number | null
          pages_viewed: number | null
          radar_views: number | null
          time_spent_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actions_count?: number | null
          business_id?: string | null
          chat_messages_sent?: number | null
          checkins_completed?: number | null
          created_at?: string
          id?: string
          logins_count?: number | null
          metric_date: string
          missions_completed?: number | null
          missions_started?: number | null
          pages_viewed?: number | null
          radar_views?: number | null
          time_spent_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actions_count?: number | null
          business_id?: string | null
          chat_messages_sent?: number | null
          checkins_completed?: number | null
          created_at?: string
          id?: string
          logins_count?: number | null
          metric_date?: string
          missions_completed?: number | null
          missions_started?: number | null
          pages_viewed?: number | null
          radar_views?: number | null
          time_spent_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      web_analytics: {
        Row: {
          blog_post_slug: string | null
          browser: string | null
          country: string | null
          created_at: string
          device_type: string | null
          duration_seconds: number | null
          event_data: Json | null
          event_type: string
          id: string
          page_path: string
          page_url: string
          referrer: string | null
          region: string | null
          scroll_depth: number | null
          session_id: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          visitor_id: string
        }
        Insert: {
          blog_post_slug?: string | null
          browser?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          event_data?: Json | null
          event_type?: string
          id?: string
          page_path: string
          page_url: string
          referrer?: string | null
          region?: string | null
          scroll_depth?: number | null
          session_id: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id: string
        }
        Update: {
          blog_post_slug?: string | null
          browser?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          event_data?: Json | null
          event_type?: string
          id?: string
          page_path?: string
          page_url?: string
          referrer?: string | null
          region?: string | null
          scroll_depth?: number | null
          session_id?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string
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
      check_subscription_status: {
        Args: { p_business_id: string }
        Returns: {
          expires_at: string
          is_pro: boolean
          plan_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      action_status: "pending" | "completed" | "skipped" | "snoozed"
      app_role: "admin" | "moderator" | "user"
      business_category:
        | "cafeteria"
        | "bar"
        | "restaurant"
        | "fast_casual"
        | "heladeria"
        | "panaderia"
        | "dark_kitchen"
      country_code:
        | "AR"
        | "MX"
        | "CL"
        | "UY"
        | "BR"
        | "CO"
        | "CR"
        | "PA"
        | "US"
        | "EC"
        | "PY"
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
      app_role: ["admin", "moderator", "user"],
      business_category: [
        "cafeteria",
        "bar",
        "restaurant",
        "fast_casual",
        "heladeria",
        "panaderia",
        "dark_kitchen",
      ],
      country_code: [
        "AR",
        "MX",
        "CL",
        "UY",
        "BR",
        "CO",
        "CR",
        "PA",
        "US",
        "EC",
        "PY",
      ],
      mission_status: ["active", "completed", "paused", "abandoned"],
      priority_level: ["low", "medium", "high", "urgent"],
      user_mode: ["nano", "standard", "proactive", "sos"],
    },
  },
} as const
