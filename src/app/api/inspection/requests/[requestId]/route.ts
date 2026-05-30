import { requestIdParamSchema } from '@/lib/api/inspection-schemas'
import { jsonError, jsonOk } from '@/lib/api/json-response'
import { requireUser } from '@/lib/api/supabase-session'

type RouteContext = { params: Promise<{ requestId: string }> }

/**
 * Detalhe de uma solicitação.
 * Visibility enforced in code: creator OR acceptor OR (pending & unassigned).
 * @see supabase/API.md
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
  const { data, error } = await admin
    .from('inspection_requests')
    .select('*')
    .eq('id', idParsed.data.requestId)
    .maybeSingle()

  if (error) {
    return jsonError(500, 'database_error', error.message)
  }

  if (!data) {
    return jsonError(404, 'not_found', 'Inspection request not found.')
  }

  const id = user.id
  const visible =
    data.created_by === id ||
    data.accepted_by === id ||
    (data.status === 'pending' && data.accepted_by === null)

  if (!visible) {
    return jsonError(404, 'not_found', 'Inspection request not found.')
  }

  return jsonOk({ data })
}
