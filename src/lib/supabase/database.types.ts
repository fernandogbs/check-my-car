export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type InspectionRequestStatus =
  | 'draft'
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'awaiting_report'
  | 'completed'
  | 'cancelled'

export type Database = {
  public: {
    Tables: {
      inspection_requests: {
        Row: {
          id: string
          created_by: string
          vehicle_plate: string
          vehicle_model: string | null
          notes: string | null
          status: InspectionRequestStatus
          accepted_by: string | null
          accepted_at: string | null
          report_storage_path: string | null
          report_submitted_at: string | null
          result_summary: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_by: string
          vehicle_plate: string
          vehicle_model?: string | null
          notes?: string | null
          status?: InspectionRequestStatus
          accepted_by?: string | null
          accepted_at?: string | null
          report_storage_path?: string | null
          report_submitted_at?: string | null
          result_summary?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_by?: string
          vehicle_plate?: string
          vehicle_model?: string | null
          notes?: string | null
          status?: InspectionRequestStatus
          accepted_by?: string | null
          accepted_at?: string | null
          report_storage_path?: string | null
          report_submitted_at?: string | null
          result_summary?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      accept_inspection_request: {
        Args: { request_id: string }
        Returns: Database['public']['Tables']['inspection_requests']['Row']
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
