import type { ApiErrorBody } from '@/lib/api/json-response'
import type { Tables } from '@/lib/supabase/database.types'

export type InspectionRequestRow = Tables<'inspection_requests'>

export type CreateInspectionRequestSuccess = {
  data: InspectionRequestRow
}

export type CreateInspectionRequestResponse =
  | CreateInspectionRequestSuccess
  | ApiErrorBody

export type { ApiErrorBody }
