import {
  postInspectionReportSchema,
  requestIdParamSchema,
} from '@/lib/api/inspection-schemas'
import { jsonError, jsonOk } from '@/lib/api/json-response'
import { readJsonBody } from '@/lib/api/request-json'
import { requireSupabaseUser } from '@/lib/api/supabase-session'

type RouteContext = { params: Promise<{ requestId: string }> }

/**
 * Regista o caminho do laudo no Storage (upload deve ser feito antes, p.ex. URL assinada).
 * @see supabase/API.md — Envio de laudo
 */
export async function POST(request: Request, context: RouteContext) {
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
  const body = postInspectionReportSchema.safeParse(raw)
  if (!body.success) {
    return jsonError(400, 'validation_error', body.error.message)
  }

  const { supabase, user } = session
  const requestId = idParsed.data.requestId

  const { data: current, error: loadError } = await supabase
    .from('inspection_requests')
    .select('status, accepted_by')
    .eq('id', requestId)
    .maybeSingle()

  if (loadError) {
    return jsonError(500, 'database_error', loadError.message)
  }

  if (!current?.accepted_by) {
    return jsonError(400, 'invalid_state', 'Request must be accepted before report upload.')
  }

  if (current.accepted_by !== user.id) {
    return jsonError(403, 'forbidden', 'Only the assigned professional can submit the report.')
  }

  const nextStatus =
    current.status === 'accepted' || current.status === 'in_progress'
      ? 'awaiting_report'
      : current.status

  const submittedAt = new Date().toISOString()

  const { data, error } = await supabase
    .from('inspection_requests')
    .update({
      report_storage_path: body.data.report_storage_path,
      report_submitted_at: submittedAt,
      status: nextStatus,
    })
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
