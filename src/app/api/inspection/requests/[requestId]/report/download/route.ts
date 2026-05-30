import { requestIdParamSchema } from '@/lib/api/inspection-schemas'
import { jsonError, jsonOk } from '@/lib/api/json-response'
import { requireUser } from '@/lib/api/supabase-session'
import { canViewReport } from '@/features/inspection-requests/utils/report-visibility'

type RouteContext = { params: Promise<{ requestId: string }> }

/**
 * Gera uma URL assinada (60 s) para download do laudo.
 * Visibility enforced in code: creator OR acceptor OR (pending & unassigned).
 * @see supabase/API.md — Download do laudo
 */
export async function GET(_request: Request, context: RouteContext) {
  const session = await requireUser()
  if (!session.ok) {
    return session.response
  }

  const params = await context.params
  const idParsed = requestIdParamSchema.safeParse(params)
  if (!idParsed.success) {
    return jsonError(400, 'validation_error', idParsed.error.message)
  }

  const { user, admin } = session
  const requestId = idParsed.data.requestId

  const { data, error } = await admin
    .from('inspection_requests')
    .select('report_storage_path, created_by, accepted_by, status')
    .eq('id', requestId)
    .maybeSingle()

  if (error) {
    return jsonError(500, 'database_error', error.message)
  }

  if (!data) {
    return jsonError(404, 'not_found', 'Inspection request not found.')
  }

  const visible = canViewReport({
    userId: user.id,
    createdBy: data.created_by,
    acceptedBy: data.accepted_by,
    status: data.status,
  })

  if (!visible) {
    return jsonError(404, 'not_found', 'Inspection request not found.')
  }

  if (!data.report_storage_path) {
    return jsonError(404, 'report_not_found', 'No report has been submitted yet.')
  }

  const { data: signed, error: signError } = await admin.storage
    .from('inspection-attachments')
    .createSignedUrl(data.report_storage_path, 60)

  if (signError || !signed) {
    return jsonError(500, 'sign_failed', 'Failed to generate signed URL.')
  }

  return jsonOk({ url: signed.signedUrl })
}
