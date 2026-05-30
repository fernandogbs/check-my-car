import {
  patchInspectionStatusSchema,
  requestIdParamSchema,
} from '@/lib/api/inspection-schemas'
import { jsonError, jsonOk } from '@/lib/api/json-response'
import { readJsonBody } from '@/lib/api/request-json'
import { requireUser } from '@/lib/api/supabase-session'
import type { Database, Json } from '@/lib/supabase/database.types'

type InspectionRequestUpdate =
  Database['public']['Tables']['inspection_requests']['Update']

type RouteContext = { params: Promise<{ requestId: string }> }

/**
 * Atualiza o estado do fluxo.
 * Ownership enforced in code (mirrors old RLS update policy):
 *   - creator may set draft/pending/cancelled only while unassigned
 *   - acceptor may update freely
 *   - `completed` requires report_storage_path and prior acceptance
 * @see supabase/API.md — Atualização de status
 */
export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireUser()
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

  const { user, admin } = session
  const requestId = idParsed.data.requestId

  const { data: row, error: loadError } = await admin
    .from('inspection_requests')
    .select('report_storage_path, accepted_by, created_by, status')
    .eq('id', requestId)
    .maybeSingle()

  if (loadError) {
    return jsonError(500, 'database_error', loadError.message)
  }

  if (!row) {
    return jsonError(404, 'not_found', 'Inspection request not found or not allowed.')
  }

  const id = user.id
  const isCreator = row.created_by === id
  const isAcceptor = row.accepted_by === id

  // Mirror old RLS update policy: creator (while unassigned, limited statuses) OR acceptor
  const creatorAllowed =
    isCreator &&
    row.accepted_by === null &&
    ['draft', 'pending', 'cancelled'].includes(body.data.status)

  if (!creatorAllowed && !isAcceptor) {
    return jsonError(404, 'not_found', 'Inspection request not found or not allowed.')
  }

  if (body.data.status === 'completed') {
    if (!row.accepted_by) {
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

  const { data, error } = await admin
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
