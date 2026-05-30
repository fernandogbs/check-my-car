import { requestIdParamSchema } from '@/lib/api/inspection-schemas'
import { jsonError, jsonOk } from '@/lib/api/json-response'
import { requireUser } from '@/lib/api/supabase-session'

type RouteContext = { params: Promise<{ requestId: string }> }

/**
 * Aceita uma demanda pendente via UPDATE atômico condicional (admin client).
 * Mirrors old RPC contract: 409 if not pending / already assigned.
 * @see supabase/API.md — Aceite de demanda
 */
export async function POST(_request: Request, context: RouteContext) {
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
    .update({
      accepted_by: user.id,
      accepted_at: new Date().toISOString(),
      status: 'accepted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', idParsed.data.requestId)
    .eq('status', 'pending')
    .is('accepted_by', null)
    .select('*')
    .maybeSingle()

  if (error) {
    return jsonError(400, 'accept_failed', error.message)
  }

  if (!data) {
    return jsonError(409, 'accept_failed', 'inspection request is not pending or already assigned')
  }

  return jsonOk({ data })
}
