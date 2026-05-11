import { requestIdParamSchema } from '@/lib/api/inspection-schemas'
import { jsonError, jsonOk } from '@/lib/api/json-response'
import { requireSupabaseUser } from '@/lib/api/supabase-session'

type RouteContext = { params: Promise<{ requestId: string }> }

/**
 * Vista resumida do resultado para cliente e profissional (RLS).
 * @see supabase/API.md — Visualização do resultado
 */
export async function GET(_request: Request, context: RouteContext) {
  const session = await requireSupabaseUser()
  if (!session.ok) {
    return session.response
  }

  const params = await context.params
  const idParsed = requestIdParamSchema.safeParse(params)
  if (!idParsed.success) {
    return jsonError(400, 'validation_error', idParsed.error.message)
  }

  const { supabase } = session
  const { data, error } = await supabase
    .from('inspection_requests')
    .select(
      'id, status, vehicle_plate, vehicle_model, result_summary, report_storage_path, report_submitted_at, updated_at'
    )
    .eq('id', idParsed.data.requestId)
    .maybeSingle()

  if (error) {
    return jsonError(500, 'database_error', error.message)
  }

  if (!data) {
    return jsonError(404, 'not_found', 'Inspection request not found.')
  }

  return jsonOk({
    data: {
      id: data.id,
      status: data.status,
      vehicle_plate: data.vehicle_plate,
      vehicle_model: data.vehicle_model,
      result_summary: data.result_summary,
      report_storage_path: data.report_storage_path,
      report_submitted_at: data.report_submitted_at,
      updated_at: data.updated_at,
    },
  })
}
