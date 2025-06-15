export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          account_number: string
          account_type: Database["public"]["Enums"]["account_type"]
          balance: number
          created_at: string
          id: string
          ifsc_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          account_type?: Database["public"]["Enums"]["account_type"]
          balance?: number
          created_at?: string
          id?: string
          ifsc_code?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          account_type?: Database["public"]["Enums"]["account_type"]
          balance?: number
          created_at?: string
          id?: string
          ifsc_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          user_id?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_time: string
          email: string
          id: string
          ip_address: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempt_time?: string
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          attempt_time?: string
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          event_type: Database["public"]["Enums"]["notification_event"]
          id: string
          message: string
          metadata: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          read_at: string | null
          sent_at: string
          title: string
          user_id: string
        }
        Insert: {
          event_type: Database["public"]["Enums"]["notification_event"]
          id?: string
          message: string
          metadata?: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          read_at?: string | null
          sent_at?: string
          title: string
          user_id: string
        }
        Update: {
          event_type?: Database["public"]["Enums"]["notification_event"]
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          read_at?: string | null
          sent_at?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          enabled: boolean
          event_type: Database["public"]["Enums"]["notification_event"]
          id: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          event_type: Database["public"]["Enums"]["notification_event"]
          id?: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          event_type?: Database["public"]["Enums"]["notification_event"]
          id?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_value: number
          recorded_at: string
        }
        Insert: {
          id?: string
          metric_name: string
          metric_value: number
          recorded_at?: string
        }
        Update: {
          id?: string
          metric_name?: string
          metric_value?: number
          recorded_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          account_id: string
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          account_id?: string
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          description: string | null
          from_account_id: string
          id: string
          status: Database["public"]["Enums"]["transfer_status"]
          to_account_id: string | null
          to_account_number: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          description?: string | null
          from_account_id: string
          id?: string
          status?: Database["public"]["Enums"]["transfer_status"]
          to_account_id?: string | null
          to_account_number: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          description?: string | null
          from_account_id?: string
          id?: string
          status?: Database["public"]["Enums"]["transfer_status"]
          to_account_id?: string | null
          to_account_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean
          last_activity: string
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_activity?: string
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_activity?: string
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: { p_email: string; p_ip_address?: string }
        Returns: Json
      }
      create_user_session: {
        Args: {
          p_user_id: string
          p_session_token: string
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: string
      }
      generate_account_number: {
        Args: { phone_number: string }
        Returns: string
      }
      get_admin_role: {
        Args: { user_id?: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      log_login_attempt: {
        Args: {
          p_email: string
          p_success: boolean
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: string
      }
      log_notification: {
        Args: {
          p_user_id: string
          p_event_type: Database["public"]["Enums"]["notification_event"]
          p_notification_type: Database["public"]["Enums"]["notification_type"]
          p_title: string
          p_message: string
          p_metadata?: Json
        }
        Returns: string
      }
      process_transfer: {
        Args: {
          p_from_account_id: string
          p_to_account_number: string
          p_amount: number
          p_description?: string
        }
        Returns: Json
      }
      record_system_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_session_activity: {
        Args: { p_session_token: string }
        Returns: boolean
      }
    }
    Enums: {
      account_type: "savings" | "checking" | "business"
      admin_role: "super_admin" | "admin" | "moderator"
      notification_event:
        | "transaction"
        | "transfer_in"
        | "transfer_out"
        | "login"
        | "security"
      notification_type: "push" | "email" | "in_app"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "transfer_in"
        | "transfer_out"
      transfer_status: "pending" | "completed" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["savings", "checking", "business"],
      admin_role: ["super_admin", "admin", "moderator"],
      notification_event: [
        "transaction",
        "transfer_in",
        "transfer_out",
        "login",
        "security",
      ],
      notification_type: ["push", "email", "in_app"],
      transaction_type: [
        "deposit",
        "withdrawal",
        "transfer_in",
        "transfer_out",
      ],
      transfer_status: ["pending", "completed", "failed"],
    },
  },
} as const
