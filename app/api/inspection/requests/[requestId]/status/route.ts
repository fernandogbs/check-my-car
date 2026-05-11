import {
  patchInspectionStatusSchema,
  requestIdParamSchema,
} from '@/lib/api/inspection-schemas'
import { jsonError, jsonOk } from '@/lib/api/json-response'
import { readJsonBody } from '@/lib/api/request-json'
import { requireSupabaseUser } from '@/lib/api/supabase-session'
import type { Database, Json } from '@/lib/supabase/database.types'

type InspectionRequestUpdate =
  Database['public']['Tables']['inspection_requests']['Update']

type RouteContext = { params: Promise<{ requestId: string }> }

/**
 * Atualiza o estado do fluxo (criador ou profissional aceite, conforme políticas RLS).
 * @see supabase/API.md — Atualização de status
 */
export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireSupabaseUser()
  if (!session.ok) {
    return session.response
  }

  const params = await context.params
  const idParsed = requestIdParamSchema.safeParse(params)
  if (!idParsed.success) {
    return jsonError(400, 'validation_error', idParsed.error.message)
  }

  const raw = await readJsonBody(request)
  const body = patchInspectionStatusSchema.safeParse(raw)
  if (!body.success) {
    return jsonError(400, 'validation_error', body.error.message)
  }

  const { supabase } = session
  const requestId = idParsed.data.requestId

  if (body.data.status === 'completed') {
    const { data: row, error: loadError } = await supabase
      .from('inspection_requests')
      .select('report_storage_path, accepted_by')
      .eq('id', requestId)
      .maybeSingle()

    if (loadError) {
      return jsonError(500, 'database_error', loadError.message)
    }

    if (!row?.accepted_by) {
      return jsonError(400, 'invalid_transition', 'Cannot complete before acceptance.')
    }

    if (!row.report_storage_path) {
      return jsonError(
        400,
        'invalid_transition',
        'Cannot complete without a submitted report path.'
      )
    }
  }

  const payload: InspectionRequestUpdate = { status: body.data.status }

  if (body.data.result_summary !== undefined) {
    payload.result_summary = body.data.result_summary as Json
  }

  const { data, error } = await supabase
    .from('inspection_requests')
    .update(payload)
    .eq('id', requestId)
    .select('*')
    .maybeSingle()

  if (error) {
    return jsonError(500, 'database_error', error.message)
  }

  if (!data) {
    return jsonError(404, 'not_found', 'Inspection request not found or not allowed.')
  }

  return jsonOk({ data })
}
