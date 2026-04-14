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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          resource: string
          resource_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          resource: string
          resource_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          resource?: string
          resource_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          email: string | null
          horario: string | null
          id: string
          label: string
          ramal: string | null
          responsavel: string | null
          servicos: string[] | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          email?: string | null
          horario?: string | null
          id?: string
          label: string
          ramal?: string | null
          responsavel?: string | null
          servicos?: string[] | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string | null
          horario?: string | null
          id?: string
          label?: string
          ramal?: string | null
          responsavel?: string | null
          servicos?: string[] | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          author: string
          category: Database["public"]["Enums"]["document_category"]
          created_at: string
          created_by: string | null
          department_access: string[] | null
          department_slug: string | null
          description: string
          effective_date: string | null
          expiry_date: string | null
          file_name: string | null
          file_size: number | null
          file_size_formatted: string | null
          file_type: string | null
          file_url: string | null
          history: Json | null
          id: string
          is_featured: boolean
          language: string
          responsible_user: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          tags: string[] | null
          title: string
          updated_at: string
          version: string
          visibility: Database["public"]["Enums"]["visibility_type"]
        }
        Insert: {
          author?: string
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          created_by?: string | null
          department_access?: string[] | null
          department_slug?: string | null
          description?: string
          effective_date?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_size_formatted?: string | null
          file_type?: string | null
          file_url?: string | null
          history?: Json | null
          id?: string
          is_featured?: boolean
          language?: string
          responsible_user?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          version?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Update: {
          author?: string
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          created_by?: string | null
          department_access?: string[] | null
          department_slug?: string | null
          description?: string
          effective_date?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_size_formatted?: string | null
          file_type?: string | null
          file_url?: string | null
          history?: Json | null
          id?: string
          is_featured?: boolean
          language?: string
          responsible_user?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          version?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Relationships: []
      }
      file_attachments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          file_type: string
          id: string
          language: string
          name: string
          size: number
          size_formatted: string
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          file_type: string
          id?: string
          language?: string
          name: string
          size?: number
          size_formatted?: string
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_type?: string
          id?: string
          language?: string
          name?: string
          size?: number
          size_formatted?: string
          uploaded_by?: string | null
          url?: string
        }
        Relationships: []
      }
      institutional_pages: {
        Row: {
          author: string
          category: Database["public"]["Enums"]["institutional_category"]
          content_html: string
          created_at: string
          created_by: string | null
          department_access: string[] | null
          featured_image: string | null
          id: string
          is_featured: boolean
          language: string
          owner_department: string | null
          published_at: string | null
          responsible_user: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          summary: string
          tags: string[] | null
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["visibility_type"]
        }
        Insert: {
          author?: string
          category?: Database["public"]["Enums"]["institutional_category"]
          content_html?: string
          created_at?: string
          created_by?: string | null
          department_access?: string[] | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean
          language?: string
          owner_department?: string | null
          published_at?: string | null
          responsible_user?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Update: {
          author?: string
          category?: Database["public"]["Enums"]["institutional_category"]
          content_html?: string
          created_at?: string
          created_by?: string | null
          department_access?: string[] | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean
          language?: string
          owner_department?: string | null
          published_at?: string | null
          responsible_user?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Relationships: []
      }
      news: {
        Row: {
          author: string
          category: Database["public"]["Enums"]["news_category"]
          content: string
          cover_image: string | null
          created_at: string
          created_by: string | null
          department_access: string[] | null
          excerpt: string
          expires_at: string | null
          id: string
          is_featured: boolean
          language: string
          pinned: boolean
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          tags: string[] | null
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["visibility_type"]
        }
        Insert: {
          author?: string
          category?: Database["public"]["Enums"]["news_category"]
          content?: string
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          department_access?: string[] | null
          excerpt?: string
          expires_at?: string | null
          id?: string
          is_featured?: boolean
          language?: string
          pinned?: boolean
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Update: {
          author?: string
          category?: Database["public"]["Enums"]["news_category"]
          content?: string
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          department_access?: string[] | null
          excerpt?: string
          expires_at?: string | null
          id?: string
          is_featured?: boolean
          language?: string
          pinned?: boolean
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Relationships: []
      }
      procedures: {
        Row: {
          author: string
          category: string
          code: string
          content_status: Database["public"]["Enums"]["content_status"]
          created_at: string
          created_by: string | null
          department_access: string[] | null
          department_slug: string
          description: string
          effective_date: string | null
          history: Json | null
          id: string
          is_active: boolean
          language: string
          responsible_user: string | null
          slug: string
          status: Database["public"]["Enums"]["procedure_status"]
          tags: string[] | null
          title: string
          updated_at: string
          version: string
          visibility: Database["public"]["Enums"]["visibility_type"]
        }
        Insert: {
          author?: string
          category?: string
          code: string
          content_status?: Database["public"]["Enums"]["content_status"]
          created_at?: string
          created_by?: string | null
          department_access?: string[] | null
          department_slug?: string
          description?: string
          effective_date?: string | null
          history?: Json | null
          id?: string
          is_active?: boolean
          language?: string
          responsible_user?: string | null
          slug: string
          status?: Database["public"]["Enums"]["procedure_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          version?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Update: {
          author?: string
          category?: string
          code?: string
          content_status?: Database["public"]["Enums"]["content_status"]
          created_at?: string
          created_by?: string | null
          department_access?: string[] | null
          department_slug?: string
          description?: string
          effective_date?: string | null
          history?: Json | null
          id?: string
          is_active?: boolean
          language?: string
          responsible_user?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["procedure_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          version?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birthday: string | null
          created_at: string
          department: string
          department_id: string | null
          department_slug: string
          email: string
          employee_id: string
          extension: string | null
          id: string
          joined_at: string | null
          location: string | null
          manager_id: string | null
          name: string
          phone: string | null
          position: string
          preferred_language: string
          preferred_name: string | null
          skills: string[] | null
          status: Database["public"]["Enums"]["user_status"]
          tags: string[] | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          created_at?: string
          department?: string
          department_id?: string | null
          department_slug?: string
          email: string
          employee_id: string
          extension?: string | null
          id?: string
          joined_at?: string | null
          location?: string | null
          manager_id?: string | null
          name: string
          phone?: string | null
          position?: string
          preferred_language?: string
          preferred_name?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["user_status"]
          tags?: string[] | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          created_at?: string
          department?: string
          department_id?: string | null
          department_slug?: string
          email?: string
          employee_id?: string
          extension?: string | null
          id?: string
          joined_at?: string | null
          location?: string | null
          manager_id?: string | null
          name?: string
          phone?: string | null
          position?: string
          preferred_language?: string
          preferred_name?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["user_status"]
          tags?: string[] | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          department: string | null
          department_id: string | null
          department_slug: string | null
          id: string | null
          joined_at: string | null
          location: string | null
          name: string | null
          position: string | null
          preferred_name: string | null
          skills: string[] | null
          status: Database["public"]["Enums"]["user_status"] | null
          tags: string[] | null
          unit: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          department_id?: string | null
          department_slug?: string | null
          id?: string | null
          joined_at?: string | null
          location?: string | null
          name?: string | null
          position?: string | null
          preferred_name?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["user_status"] | null
          tags?: string[] | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          department?: string | null
          department_id?: string | null
          department_slug?: string | null
          id?: string | null
          joined_at?: string | null
          location?: string | null
          name?: string | null
          position?: string | null
          preferred_name?: string | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["user_status"] | null
          tags?: string[] | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
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
      app_role: "admin" | "manager" | "editor" | "employee"
      content_status: "draft" | "review" | "published" | "archived"
      document_category:
        | "manual"
        | "formulario"
        | "politica"
        | "procedimento"
        | "template"
      institutional_category:
        | "onboarding"
        | "compliance"
        | "ethics"
        | "cipa"
        | "lgpd"
        | "quality"
        | "departmental"
        | "general"
      news_category: "aviso" | "evento" | "comunicado" | "campanha"
      procedure_status: "vigente" | "em_revisao" | "obsoleto"
      user_status: "active" | "inactive" | "suspended"
      visibility_type: "public" | "department" | "restricted"
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
      app_role: ["admin", "manager", "editor", "employee"],
      content_status: ["draft", "review", "published", "archived"],
      document_category: [
        "manual",
        "formulario",
        "politica",
        "procedimento",
        "template",
      ],
      institutional_category: [
        "onboarding",
        "compliance",
        "ethics",
        "cipa",
        "lgpd",
        "quality",
        "departmental",
        "general",
      ],
      news_category: ["aviso", "evento", "comunicado", "campanha"],
      procedure_status: ["vigente", "em_revisao", "obsoleto"],
      user_status: ["active", "inactive", "suspended"],
      visibility_type: ["public", "department", "restricted"],
    },
  },
} as const
