import { requestIdParamSchema } from '@/lib/api/inspection-schemas'
import { jsonError, jsonOk } from '@/lib/api/json-response'
import { requireSupabaseUser } from '@/lib/api/supabase-session'

type RouteContext = { params: Promise<{ requestId: string }> }

/**
 * Detalhe de uma solicitação (sujeito a RLS).
 * @see supabase/API.md
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
    .select('*')
    .eq('id', idParsed.data.requestId)
    .maybeSingle()

  if (error) {
    return jsonError(500, 'database_error', error.message)
  }

  if (!data) {
    return jsonError(404, 'not_found', 'Inspection request not found.')
  }

  return jsonOk({ data })
}
