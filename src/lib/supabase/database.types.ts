export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      fotos_laudo: {
        Row: {
          created_at: string | null
          id: string
          laudo_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          laudo_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          laudo_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fotos_laudo_laudo_id_fkey"
            columns: ["laudo_id"]
            isOneToOne: false
            referencedRelation: "laudos"
            referencedColumns: ["id"]
          },
        ]
      }
      fotos_solicitacao: {
        Row: {
          created_at: string | null
          id: string
          solicitacao_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          solicitacao_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          solicitacao_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fotos_solicitacao_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_requests: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          client_document_path: string | null
          created_at: string
          created_by: string
          id: string
          inspection_location: string
          inspection_type: Database["public"]["Enums"]["inspection_type"]
          notes: string | null
          report_storage_path: string | null
          report_submitted_at: string | null
          result_summary: Json | null
          status: string
          updated_at: string
          vehicle_model: string
          vehicle_plate: string
          vehicle_year: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          client_document_path?: string | null
          created_at?: string
          created_by: string
          id?: string
          inspection_location: string
          inspection_type: Database["public"]["Enums"]["inspection_type"]
          notes?: string | null
          report_storage_path?: string | null
          report_submitted_at?: string | null
          result_summary?: Json | null
          status?: string
          updated_at?: string
          vehicle_model: string
          vehicle_plate: string
          vehicle_year: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          client_document_path?: string | null
          created_at?: string
          created_by?: string
          id?: string
          inspection_location?: string
          inspection_type?: Database["public"]["Enums"]["inspection_type"]
          notes?: string | null
          report_storage_path?: string | null
          report_submitted_at?: string | null
          result_summary?: Json | null
          status?: string
          updated_at?: string
          vehicle_model?: string
          vehicle_plate?: string
          vehicle_year?: string
        }
        Relationships: []
      }
      laudos: {
        Row: {
          comentarios: string | null
          created_at: string | null
          data_verificacao: string | null
          estado_geral: string | null
          id: string
          recomendacao: Database["public"]["Enums"]["recomendacao_enum"]
          solicitacao_id: string
        }
        Insert: {
          comentarios?: string | null
          created_at?: string | null
          data_verificacao?: string | null
          estado_geral?: string | null
          id?: string
          recomendacao: Database["public"]["Enums"]["recomendacao_enum"]
          solicitacao_id: string
        }
        Update: {
          comentarios?: string | null
          created_at?: string | null
          data_verificacao?: string | null
          estado_geral?: string | null
          id?: string
          recomendacao?: Database["public"]["Enums"]["recomendacao_enum"]
          solicitacao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "laudos_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: true
            referencedRelation: "solicitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes: {
        Row: {
          ano: number
          cidade: string
          comprador_id: string
          created_at: string | null
          id: string
          link_anuncio: string | null
          marca: string
          modelo: string
          observacoes: string | null
          status: Database["public"]["Enums"]["status_solicitacao_enum"]
          valor: number | null
          verificador_id: string | null
        }
        Insert: {
          ano: number
          cidade: string
          comprador_id: string
          created_at?: string | null
          id?: string
          link_anuncio?: string | null
          marca: string
          modelo: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_solicitacao_enum"]
          valor?: number | null
          verificador_id?: string | null
        }
        Update: {
          ano?: number
          cidade?: string
          comprador_id?: string
          created_at?: string | null
          id?: string
          link_anuncio?: string | null
          marca?: string
          modelo?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_solicitacao_enum"]
          valor?: number | null
          verificador_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_verificador_id_fkey"
            columns: ["verificador_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nome: string
          senha: string
          telefone: string | null
          tipo_usuario: Database["public"]["Enums"]["tipo_usuario_enum"]
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          nome: string
          senha: string
          telefone?: string | null
          tipo_usuario: Database["public"]["Enums"]["tipo_usuario_enum"]
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          senha?: string
          telefone?: string | null
          tipo_usuario?: Database["public"]["Enums"]["tipo_usuario_enum"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_inspection_request: {
        Args: { request_id: string }
        Returns: {
          accepted_at: string | null
          accepted_by: string | null
          client_document_path: string | null
          created_at: string
          created_by: string
          id: string
          inspection_location: string
          inspection_type: Database["public"]["Enums"]["inspection_type"]
          notes: string | null
          report_storage_path: string | null
          report_submitted_at: string | null
          result_summary: Json | null
          status: string
          updated_at: string
          vehicle_model: string
          vehicle_plate: string
          vehicle_year: string
        }
        SetofOptions: {
          from: "*"
          to: "inspection_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      inspection_type: "cautelar" | "transferencia"
      recomendacao_enum: "aprovado" | "atencao" | "nao_recomendado"
      status_solicitacao_enum:
        | "aguardando"
        | "em_andamento"
        | "verificado"
        | "finalizado"
      tipo_usuario_enum: "comprador" | "verificador"
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
      inspection_type: ["cautelar", "transferencia"],
      recomendacao_enum: ["aprovado", "atencao", "nao_recomendado"],
      status_solicitacao_enum: [
        "aguardando",
        "em_andamento",
        "verificado",
        "finalizado",
      ],
      tipo_usuario_enum: ["comprador", "verificador"],
    },
  },
} as const
