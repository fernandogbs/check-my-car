import { requestIdParamSchema } from '@/lib/api/inspection-schemas'
import { jsonError, jsonOk } from '@/lib/api/json-response'
import { requireSupabaseUser } from '@/lib/api/supabase-session'

type RouteContext = { params: Promise<{ requestId: string }> }

/**
 * Aceita uma demanda pendente via RPC `accept_inspection_request` (transação atómica + RLS-safe).
 * @see supabase/API.md — Aceite de demanda
 */
export async function POST(_request: Request, context: RouteContext) {
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
  const { data, error } = await supabase.rpc('accept_inspection_request', {
    request_id: idParsed.data.requestId,
  })

  if (error) {
    const code = error.code === 'P0001' ? 409 : 400
    return jsonError(code, 'accept_failed', error.message)
  }

  return jsonOk({ data })
}
