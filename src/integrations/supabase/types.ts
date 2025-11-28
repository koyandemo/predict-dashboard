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
      comments: {
        Row: {
          comment_id: number
          comment_text: string
          match_id: number | null
          timestamp: string | null
          user_id: number
        }
        Insert: {
          comment_id?: number
          comment_text: string
          match_id?: number | null
          timestamp?: string | null
          user_id: number
        }
        Update: {
          comment_id?: number
          comment_text?: string
          match_id?: number | null
          timestamp?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "comments_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["match_id"]
          },
        ]
      }
      leagues: {
        Row: {
          country: string
          league_id: number
          name: string
          slug: string | null
        }
        Insert: {
          country: string
          league_id?: number
          name: string
          slug?: string | null
        }
        Update: {
          country?: string
          league_id?: number
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      match_outcomes: {
        Row: {
          away_win_prob: number | null
          draw_prob: number | null
          home_win_prob: number | null
          match_id: number | null
          outcome_id: number
        }
        Insert: {
          away_win_prob?: number | null
          draw_prob?: number | null
          home_win_prob?: number | null
          match_id?: number | null
          outcome_id?: number
        }
        Update: {
          away_win_prob?: number | null
          draw_prob?: number | null
          home_win_prob?: number | null
          match_id?: number | null
          outcome_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_outcomes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["match_id"]
          },
        ]
      }
      matches: {
        Row: {
          away_team_id: number | null
          home_team_id: number | null
          league_id: number | null
          match_date: string
          match_id: number
          match_time: string
          slug: string | null
          status: string | null
          venue: string | null
        }
        Insert: {
          away_team_id?: number | null
          home_team_id?: number | null
          league_id?: number | null
          match_date: string
          match_id?: number
          match_time: string
          slug?: string | null
          status?: string | null
          venue?: string | null
        }
        Update: {
          away_team_id?: number | null
          home_team_id?: number | null
          league_id?: number | null
          match_date?: string
          match_id?: number
          match_time?: string
          slug?: string | null
          status?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "matches_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["league_id"]
          },
        ]
      }
      score_predictions: {
        Row: {
          away_score: number
          home_score: number
          match_id: number | null
          score_pred_id: number
          vote_count: number | null
        }
        Insert: {
          away_score: number
          home_score: number
          match_id?: number | null
          score_pred_id?: number
          vote_count?: number | null
        }
        Update: {
          away_score?: number
          home_score?: number
          match_id?: number | null
          score_pred_id?: number
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "score_predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["match_id"]
          },
        ]
      }
      teams: {
        Row: {
          country: string
          logo_url: string | null
          name: string
          short_code: string
          slug: string | null
          team_id: number
        }
        Insert: {
          country: string
          logo_url?: string | null
          name: string
          short_code: string
          slug?: string | null
          team_id?: number
        }
        Update: {
          country?: string
          logo_url?: string | null
          name?: string
          short_code?: string
          slug?: string | null
          team_id?: number
        }
        Relationships: []
      }
      user_predictions: {
        Row: {
          match_id: number | null
          predicted_winner: string | null
          prediction_date: string | null
          prediction_id: number
          user_id: number
        }
        Insert: {
          match_id?: number | null
          predicted_winner?: string | null
          prediction_date?: string | null
          prediction_id?: number
          user_id: number
        }
        Update: {
          match_id?: number | null
          predicted_winner?: string | null
          prediction_date?: string | null
          prediction_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["match_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      slugify: { Args: { text_input: string }; Returns: string }
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
