import { createInspectionRequestSchema } from '@/lib/api/inspection-schemas'
import { jsonError, jsonOk } from '@/lib/api/json-response'
import { readJsonBody } from '@/lib/api/request-json'
import { requireUser } from '@/lib/api/supabase-session'

/**
 * Lista solicitações visíveis ao utilizador: próprias, aceites, ou pendentes na fila.
 * Ownership enforced in code (admin client bypasses RLS).
 * @see supabase/API.md — Criação e listagem
 */
export async function GET() {
  const session = await requireUser()
  if (!session.ok) {
    return session.response
  }

  const { user, admin } = session
  const id = user.id

  const { data, error } = await admin
    .from('inspection_requests')
    .select('*')
    .or(`created_by.eq.${id},accepted_by.eq.${id},and(status.eq.pending,accepted_by.is.null)`)
    .order('created_at', { ascending: false })

  if (error) {
    return jsonError(500, 'database_error', error.message)
  }

  return jsonOk({ data })
}

/**
 * Cria uma solicitação de vistoria (`inspection_requests`).
 * @see supabase/API.md — Criação de solicitações
 */
export async function POST(request: Request) {
  const session = await requireUser()
  if (!session.ok) {
    return session.response
  }

  const raw = await readJsonBody(request)
  const parsed = createInspectionRequestSchema.safeParse(raw)
  if (!parsed.success) {
    return jsonError(400, 'validation_error', parsed.error.message)
  }

  const { user, admin } = session
  const { data, error } = await admin
    .from('inspection_requests')
    .insert({
      created_by: user.id,
      vehicle_plate: parsed.data.vehicle_plate,
      vehicle_year: parsed.data.vehicle_year,
      vehicle_model: parsed.data.vehicle_model,
      inspection_type: parsed.data.inspection_type,
      inspection_location: parsed.data.inspection_location,
      notes: parsed.data.notes ?? null,
      client_document_path: parsed.data.client_document_path ?? null,
      status: parsed.data.status,
    })
    .select('*')
    .single()

  if (error) {
    return jsonError(500, 'database_error', error.message)
  }

  return jsonOk({ data }, 201)
}
