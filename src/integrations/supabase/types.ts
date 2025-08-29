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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      action_items: {
        Row: {
          assigned_to: string
          completed_at: string | null
          created_at: string | null
          created_by: string
          description: string
          due_date: string | null
          id: string
          meeting_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_to: string
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          description: string
          due_date?: string | null
          id?: string
          meeting_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          description?: string
          due_date?: string | null
          id?: string
          meeting_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_items_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "one_on_one_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      bulletin_read_receipts: {
        Row: {
          bulletin_id: string | null
          created_at: string | null
          id: string
          read_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bulletin_id?: string | null
          created_at?: string | null
          id?: string
          read_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bulletin_id?: string | null
          created_at?: string | null
          id?: string
          read_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulletin_read_receipts_bulletin_id_fkey"
            columns: ["bulletin_id"]
            isOneToOne: false
            referencedRelation: "team_bulletins"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_metrics: {
        Row: {
          ap: number | null
          calls: number | null
          contacts: number | null
          created_at: string
          date: string
          id: string
          leads: number | null
          sales: number | null
          scheduled: number | null
          sits: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ap?: number | null
          calls?: number | null
          contacts?: number | null
          created_at?: string
          date?: string
          id?: string
          leads?: number | null
          sales?: number | null
          scheduled?: number | null
          sits?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ap?: number | null
          calls?: number | null
          contacts?: number | null
          created_at?: string
          date?: string
          id?: string
          leads?: number | null
          sales?: number | null
          scheduled?: number | null
          sits?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          age: string | null
          created_at: string
          dob: string | null
          dui: string | null
          employment_income: string | null
          employment_status: string[] | null
          family_medical_conditions: string | null
          height: string | null
          hospitalizations: string | null
          household_expenses: string | null
          id: string
          last_medical_exam: string | null
          medical_conditions: string[] | null
          name: string | null
          occupation: string | null
          other_medical_conditions: string | null
          pension_income: string | null
          prescription_medications: string | null
          selected_investments: string[] | null
          social_security_income: string | null
          submission_id: string
          surgeries: string | null
          survivorship_income: string | null
          tobacco_use: string | null
          total_income: string | null
          updated_at: string
          weight: string | null
        }
        Insert: {
          age?: string | null
          created_at?: string
          dob?: string | null
          dui?: string | null
          employment_income?: string | null
          employment_status?: string[] | null
          family_medical_conditions?: string | null
          height?: string | null
          hospitalizations?: string | null
          household_expenses?: string | null
          id?: string
          last_medical_exam?: string | null
          medical_conditions?: string[] | null
          name?: string | null
          occupation?: string | null
          other_medical_conditions?: string | null
          pension_income?: string | null
          prescription_medications?: string | null
          selected_investments?: string[] | null
          social_security_income?: string | null
          submission_id: string
          surgeries?: string | null
          survivorship_income?: string | null
          tobacco_use?: string | null
          total_income?: string | null
          updated_at?: string
          weight?: string | null
        }
        Update: {
          age?: string | null
          created_at?: string
          dob?: string | null
          dui?: string | null
          employment_income?: string | null
          employment_status?: string[] | null
          family_medical_conditions?: string | null
          height?: string | null
          hospitalizations?: string | null
          household_expenses?: string | null
          id?: string
          last_medical_exam?: string | null
          medical_conditions?: string[] | null
          name?: string | null
          occupation?: string | null
          other_medical_conditions?: string | null
          pension_income?: string | null
          prescription_medications?: string | null
          selected_investments?: string[] | null
          social_security_income?: string | null
          submission_id?: string
          surgeries?: string | null
          survivorship_income?: string | null
          tobacco_use?: string | null
          total_income?: string | null
          updated_at?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      form_field_positions: {
        Row: {
          alignment: string | null
          created_at: string
          field_id: string
          height: string | null
          id: string
          is_required: boolean | null
          label_text: string | null
          placeholder_text: string | null
          position: number
          section: string
          updated_at: string
          user_id: string
          validation_rules: Json | null
          width: string | null
          x_position: number | null
          y_position: number | null
        }
        Insert: {
          alignment?: string | null
          created_at?: string
          field_id: string
          height?: string | null
          id?: string
          is_required?: boolean | null
          label_text?: string | null
          placeholder_text?: string | null
          position: number
          section: string
          updated_at?: string
          user_id: string
          validation_rules?: Json | null
          width?: string | null
          x_position?: number | null
          y_position?: number | null
        }
        Update: {
          alignment?: string | null
          created_at?: string
          field_id?: string
          height?: string | null
          id?: string
          is_required?: boolean | null
          label_text?: string | null
          placeholder_text?: string | null
          position?: number
          section?: string
          updated_at?: string
          user_id?: string
          validation_rules?: Json | null
          width?: string | null
          x_position?: number | null
          y_position?: number | null
        }
        Relationships: []
      }
      form_section_positions: {
        Row: {
          created_at: string
          id: string
          position: number
          section_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position: number
          section_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          section_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_expenses: {
        Row: {
          created_at: string
          id: string
          lead_count: number
          lead_type: string[]
          purchase_date: string
          source: string
          total_cost: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_count: number
          lead_type?: string[]
          purchase_date: string
          source: string
          total_cost: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_count?: number
          lead_type?: string[]
          purchase_date?: string
          source?: string
          total_cost?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      manager_teams: {
        Row: {
          created_at: string | null
          id: string
          manager_id: string
          team_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          manager_id: string
          team_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          manager_id?: string
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manager_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_followups: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          meeting_id: string
          message: string | null
          reminder_at: string
          reminder_sent: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          meeting_id: string
          message?: string | null
          reminder_at: string
          reminder_sent?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          meeting_id?: string
          message?: string | null
          reminder_at?: string
          reminder_sent?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_followups_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "one_on_one_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_notes: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string
          id: string
          meeting_id: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          meeting_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          meeting_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_notes_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "one_on_one_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      notes_history: {
        Row: {
          created_at: string
          id: string
          new_notes: string
          previous_notes: string | null
          submission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_notes: string
          previous_notes?: string | null
          submission_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          new_notes?: string
          previous_notes?: string | null
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_history_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      one_on_one_meetings: {
        Row: {
          attendee_id: string
          created_at: string | null
          created_by: string
          duration_minutes: number
          id: string
          location: string | null
          scheduled_at: string
          status: string
          team_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          attendee_id: string
          created_at?: string | null
          created_by: string
          duration_minutes?: number
          id?: string
          location?: string | null
          scheduled_at: string
          status?: string
          team_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          attendee_id?: string
          created_at?: string | null
          created_by?: string
          duration_minutes?: number
          id?: string
          location?: string | null
          scheduled_at?: string
          status?: string
          team_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "one_on_one_meetings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agent_info: Json | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          language_preference: string | null
          last_name: string | null
          last_sign_in: string | null
          manager_id: string | null
          notification_preferences: Json | null
          phone: string | null
          privacy_settings: Json | null
          profile_image_url: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          terms_accepted_at: string | null
          updated_at: string
        }
        Insert: {
          agent_info?: Json | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          language_preference?: string | null
          last_name?: string | null
          last_sign_in?: string | null
          manager_id?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          privacy_settings?: Json | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          terms_accepted_at?: string | null
          updated_at?: string
        }
        Update: {
          agent_info?: Json | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          language_preference?: string | null
          last_name?: string | null
          last_sign_in?: string | null
          manager_id?: string | null
          notification_preferences?: Json | null
          phone?: string | null
          privacy_settings?: Json | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          terms_accepted_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          coupon_id: string | null
          created_at: string | null
          discount_type: string
          expiration_date: string
          id: string
          promo_code: string
          promo_id: string | null
          status: Database["public"]["Enums"]["promo_status"] | null
          usage_count: number | null
          usage_limit: number | null
          value: number | null
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string | null
          discount_type: string
          expiration_date: string
          id?: string
          promo_code: string
          promo_id?: string | null
          status?: Database["public"]["Enums"]["promo_status"] | null
          usage_count?: number | null
          usage_limit?: number | null
          value?: number | null
        }
        Update: {
          coupon_id?: string | null
          created_at?: string | null
          discount_type?: string
          expiration_date?: string
          id?: string
          promo_code?: string
          promo_id?: string | null
          status?: Database["public"]["Enums"]["promo_status"] | null
          usage_count?: number | null
          usage_limit?: number | null
          value?: number | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          created_at: string
          data: Json
          id: string
          outcome: string | null
          timestamp: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          outcome?: string | null
          timestamp?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          outcome?: string | null
          timestamp?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          annual_price: number
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          monthly_price: number
          name: string
          popular: boolean | null
          role: string
          stripe_price_id_annual: string
          stripe_price_id_monthly: string
          updated_at: string | null
        }
        Insert: {
          annual_price: number
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id: string
          monthly_price: number
          name: string
          popular?: boolean | null
          role: string
          stripe_price_id_annual: string
          stripe_price_id_monthly: string
          updated_at?: string | null
        }
        Update: {
          annual_price?: number
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          monthly_price?: number
          name?: string
          popular?: boolean | null
          role?: string
          stripe_price_id_annual?: string
          stripe_price_id_monthly?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          trial_end: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          trial_end?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      team_bulletins: {
        Row: {
          category: string | null
          content: string
          created_at: string
          created_by: string
          id: string
          mentioned_users: string[] | null
          pinned: boolean
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          created_by: string
          id?: string
          mentioned_users?: string[] | null
          pinned?: boolean
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          mentioned_users?: string[] | null
          pinned?: boolean
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_bulletins_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string
          invited_by: string
          role: string
          status: string
          team_id: string
          token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          invited_by: string
          role: string
          status?: string
          team_id: string
          token?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          invited_by?: string
          role?: string
          status?: string
          team_id?: string
          token?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_managers: {
        Row: {
          created_at: string | null
          id: string
          role: string
          team_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          team_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          team_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_managers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          role: string
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_relationships: {
        Row: {
          child_team_id: string
          created_at: string | null
          id: string
          parent_team_id: string
          updated_at: string | null
        }
        Insert: {
          child_team_id: string
          created_at?: string | null
          id?: string
          parent_team_id: string
          updated_at?: string | null
        }
        Update: {
          child_team_id?: string
          created_at?: string | null
          id?: string
          parent_team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_relationships_child_team_id_fkey"
            columns: ["child_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_relationships_parent_team_id_fkey"
            columns: ["parent_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          email: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          email?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          email?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_to_manager_teams: {
        Args: { manager_id: string; user_id: string }
        Returns: boolean
      }
      can_access_team: {
        Args: { check_team_id: string; check_user_id: string }
        Returns: boolean
      }
      create_team_for_manager: {
        Args: { team_name: string }
        Returns: Json
      }
      create_team_for_manager_secure: {
        Args: { team_name: string }
        Returns: Json
      }
      create_team_with_member: {
        Args: { member_role?: string; team_name: string }
        Returns: Json
      }
      ensure_user_in_manager_teams: {
        Args: { manager_id: string; user_id: string }
        Returns: boolean
      }
      force_agent_team_association: {
        Args: { agent_id: string }
        Returns: boolean
      }
      get_manager_teams: {
        Args: { manager_id: string }
        Returns: string[]
      }
      get_user_manager_status: {
        Args: { check_team_id: string; check_user_id: string }
        Returns: boolean
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_roles: {
        Args: { check_user_id: string }
        Returns: string[]
      }
      get_user_team_memberships: {
        Args: { user_id_param: string }
        Returns: string[]
      }
      get_user_teams: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_user_teams_by_id: {
        Args: { user_id_param: string }
        Returns: string[]
      }
      get_user_teams_secure: {
        Args: { check_user_id: string }
        Returns: string[]
      }
      get_user_teams_v2: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      has_role: {
        Args: { check_role: string; check_user_id: string }
        Returns: boolean
      }
      increment_promo_usage: {
        Args: { promo: string }
        Returns: undefined
      }
      is_manager_of: {
        Args: { manager_id: string; user_id: string }
        Returns: boolean
      }
      is_manager_of_user: {
        Args: { manager_id: string; user_id: string }
        Returns: boolean
      }
      is_momentum_team: {
        Args: { check_team_id: string }
        Returns: boolean
      }
      is_special_user: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_team_manager: {
        Args: { check_team_id: string }
        Returns: boolean
      }
      is_team_manager_secure: {
        Args: { check_team_id: string; check_user_id: string }
        Returns: boolean
      }
      is_team_manager_v2: {
        Args: { check_team_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { team_id: string }
        Returns: boolean
      }
      is_team_member_v2: {
        Args: { check_team_id: string }
        Returns: boolean
      }
      safe_is_team_manager: {
        Args: { check_team_id: string; check_user_id?: string }
        Returns: boolean
      }
      safe_is_team_manager_v2: {
        Args: { check_team_id: string; check_user_id?: string }
        Returns: boolean
      }
      user_has_role: {
        Args: { check_role: string; check_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      code_usage_type: "single_use" | "multiple_use"
      promo_status: "active" | "expired" | "inactive"
      user_role:
        | "agent"
        | "manager_pro"
        | "beta_user"
        | "manager_pro_gold"
        | "manager_pro_platinum"
        | "agent_pro"
        | "system_admin"
        | "manager"
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
      code_usage_type: ["single_use", "multiple_use"],
      promo_status: ["active", "expired", "inactive"],
      user_role: [
        "agent",
        "manager_pro",
        "beta_user",
        "manager_pro_gold",
        "manager_pro_platinum",
        "agent_pro",
        "system_admin",
        "manager",
      ],
    },
  },
} as const
