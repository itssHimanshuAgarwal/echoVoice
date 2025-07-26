export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      communication_history: {
        Row: {
          context_location: string | null
          context_person: string | null
          context_time: string | null
          created_at: string
          id: string
          phrase: string
          phrase_type: string | null
          priority_level: string | null
          times_used: number | null
          user_id: string
        }
        Insert: {
          context_location?: string | null
          context_person?: string | null
          context_time?: string | null
          created_at?: string
          id?: string
          phrase: string
          phrase_type?: string | null
          priority_level?: string | null
          times_used?: number | null
          user_id: string
        }
        Update: {
          context_location?: string | null
          context_person?: string | null
          context_time?: string | null
          created_at?: string
          id?: string
          phrase?: string
          phrase_type?: string | null
          priority_level?: string | null
          times_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          phone: string | null
          relationship: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          phone?: string | null
          relationship?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string | null
          relationship?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      favorite_phrases: {
        Row: {
          category: string | null
          created_at: string
          custom_created: boolean | null
          id: string
          is_quick_action: boolean | null
          phrase: string
          priority_order: number | null
          times_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          custom_created?: boolean | null
          id?: string
          is_quick_action?: boolean | null
          phrase: string
          priority_order?: number | null
          times_used?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          custom_created?: boolean | null
          id?: string
          is_quick_action?: boolean | null
          phrase?: string
          priority_order?: number | null
          times_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          location_type: string
          name: string
          room_type: string | null
          times_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          location_type: string
          name: string
          room_type?: string | null
          times_used?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          location_type?: string
          name?: string
          room_type?: string | null
          times_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          communication_style: string | null
          created_at: string
          email: string | null
          id: string
          is_emergency_contact: boolean | null
          last_interaction: string | null
          name: string
          nickname: string | null
          notes: string | null
          phone: string | null
          relationship: string
          times_interacted: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          communication_style?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_emergency_contact?: boolean | null
          last_interaction?: string | null
          name: string
          nickname?: string | null
          notes?: string | null
          phone?: string | null
          relationship: string
          times_interacted?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          communication_style?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_emergency_contact?: boolean | null
          last_interaction?: string | null
          name?: string
          nickname?: string | null
          notes?: string | null
          phone?: string | null
          relationship?: string
          times_interacted?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      phrase_analytics: {
        Row: {
          context_tags: string[] | null
          day_of_week: number | null
          id: string
          location_id: string | null
          person_id: string | null
          phrase_id: string | null
          phrase_text: string
          success_rating: number | null
          time_of_day: string | null
          used_at: string
          user_id: string
        }
        Insert: {
          context_tags?: string[] | null
          day_of_week?: number | null
          id?: string
          location_id?: string | null
          person_id?: string | null
          phrase_id?: string | null
          phrase_text: string
          success_rating?: number | null
          time_of_day?: string | null
          used_at?: string
          user_id: string
        }
        Update: {
          context_tags?: string[] | null
          day_of_week?: number | null
          id?: string
          location_id?: string | null
          person_id?: string | null
          phrase_id?: string | null
          phrase_text?: string
          success_rating?: number | null
          time_of_day?: string | null
          used_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quick_actions: {
        Row: {
          button_color: string | null
          button_position: number
          created_at: string
          icon_name: string | null
          id: string
          phrase: string
          times_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          button_color?: string | null
          button_position: number
          created_at?: string
          icon_name?: string | null
          id?: string
          phrase: string
          times_used?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          button_color?: string | null
          button_position?: number
          created_at?: string
          icon_name?: string | null
          id?: string
          phrase?: string
          times_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          accessibility_large_text: boolean | null
          accessibility_reduced_motion: boolean | null
          communication_style: string | null
          context_detection: boolean | null
          created_at: string
          elevenlabs_voice_id: string | null
          id: string
          save_history: boolean | null
          speech_speed: number | null
          updated_at: string
          user_id: string
          voice_type: string | null
        }
        Insert: {
          accessibility_large_text?: boolean | null
          accessibility_reduced_motion?: boolean | null
          communication_style?: string | null
          context_detection?: boolean | null
          created_at?: string
          elevenlabs_voice_id?: string | null
          id?: string
          save_history?: boolean | null
          speech_speed?: number | null
          updated_at?: string
          user_id: string
          voice_type?: string | null
        }
        Update: {
          accessibility_large_text?: boolean | null
          accessibility_reduced_motion?: boolean | null
          communication_style?: string | null
          context_detection?: boolean | null
          created_at?: string
          elevenlabs_voice_id?: string | null
          id?: string
          save_history?: boolean | null
          speech_speed?: number | null
          updated_at?: string
          user_id?: string
          voice_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
