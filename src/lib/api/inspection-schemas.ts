import { z } from 'zod'

import type { Database } from '@/lib/supabase/database.types'
import { INSPECTION_TYPES } from '@/features/inspection-requests/types/inspection-type'

export type InspectionRequestStatus =
  Database['public']['Tables']['inspection_requests']['Row']['status']

export const inspectionRequestStatusSchema = z.enum([
  'draft',
  'pending',
  'accepted',
  'in_progress',
  'awaiting_report',
  'completed',
  'cancelled',
]) satisfies z.ZodType<InspectionRequestStatus>

export const createInspectionRequestSchema = z.object({
  vehicle_plate: z.string().trim().min(1).max(32),
  vehicle_year: z.string().trim().min(4).max(9),
  vehicle_model: z.string().trim().min(1).max(120),
  inspection_type: z.enum(INSPECTION_TYPES),
  inspection_location: z.string().trim().min(1).max(200),
  notes: z.string().trim().max(4000).optional().nullable(),
  client_document_path: z.string().trim().min(1).max(2048).optional().nullable(),
  status: z.enum(['draft', 'pending']).optional().default('pending'),
})

export type CreateInspectionRequestInput = z.input<
  typeof createInspectionRequestSchema
>

export const patchInspectionStatusSchema = z.object({
  status: inspectionRequestStatusSchema,
  result_summary: z.unknown().optional().nullable(),
})

export const postInspectionReportSchema = z.object({
  report_storage_path: z.string().min(1).max(2048),
})

export const requestIdParamSchema = z.object({
  requestId: z.uuid(),
})
