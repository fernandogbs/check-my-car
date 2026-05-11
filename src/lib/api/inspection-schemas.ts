import { z } from 'zod'

import type { InspectionRequestStatus } from '@/lib/supabase/database.types'

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
  vehicle_plate: z.string().min(1).max(32),
  vehicle_model: z.string().max(120).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
  status: z.enum(['draft', 'pending']).optional().default('pending'),
})

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
