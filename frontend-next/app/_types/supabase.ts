export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      artist_information: {
        Row: {
          artist_id: number
          created_at: string
          name: string
        }
        Insert: {
          artist_id?: number
          created_at?: string
          name: string
        }
        Update: {
          artist_id?: number
          created_at?: string
          name?: string
        }
        Relationships: []
      }
      artistsong_information: {
        Row: {
          artist_id: number
          created_at: string
          song_id: number
        }
        Insert: {
          artist_id: number
          created_at?: string
          song_id: number
        }
        Update: {
          artist_id?: number
          created_at?: string
          song_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "artistsong_information_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist_information"
            referencedColumns: ["artist_id"]
          },
          {
            foreignKeyName: "artistsong_information_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "song_information"
            referencedColumns: ["id"]
          },
        ]
      }
      image_information: {
        Row: {
          format: string
          id: number
          image_path: string
          size: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          format: string
          id?: number
          image_path: string
          size: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          format?: string
          id?: number
          image_path?: string
          size?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_information_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_information"
            referencedColumns: ["username"]
          },
        ]
      }
      playlist_information: {
        Row: {
          created_at: string
          created_by: string
          playlist_id: number
          playlist_name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          playlist_id?: number
          playlist_name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          playlist_id?: number
          playlist_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_information_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_information"
            referencedColumns: ["username"]
          },
        ]
      }
      playlistsong_information: {
        Row: {
          created_at: string
          playlist_id: number
          song_id: number
        }
        Insert: {
          created_at?: string
          playlist_id: number
          song_id: number
        }
        Update: {
          created_at?: string
          playlist_id?: number
          song_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "playlistsong_information_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlist_information"
            referencedColumns: ["playlist_id"]
          },
          {
            foreignKeyName: "playlistsong_information_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "song_information"
            referencedColumns: ["id"]
          },
        ]
      }
      song_information: {
        Row: {
          artist_name: string
          created_at: string
          id: number
          image_path: string
          is_AI_gen: boolean
          song_name: string
          song_path: string
          uploaded_by: string
        }
        Insert: {
          artist_name: string
          created_at?: string
          id?: number
          image_path: string
          is_AI_gen?: boolean
          song_name: string
          song_path: string
          uploaded_by: string
        }
        Update: {
          artist_name?: string
          created_at?: string
          id?: number
          image_path?: string
          is_AI_gen?: boolean
          song_name?: string
          song_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_information_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_information"
            referencedColumns: ["username"]
          },
        ]
      }
      user_information: {
        Row: {
          email: string
          hashpass: string
          pfp_path: string | null
          userid: string
          username: string
        }
        Insert: {
          email: string
          hashpass: string
          pfp_path?: string | null
          userid: string
          username: string
        }
        Update: {
          email?: string
          hashpass?: string
          pfp_path?: string | null
          userid?: string
          username?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
