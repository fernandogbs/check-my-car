import { requireUser } from '@/lib/api/supabase-session'
import { jsonError, jsonOk } from '@/lib/api/json-response'

/**
 * Retorna o utilizador autenticado (sessão própria + `public.users`) para a sessão atual.
 * @see supabase/API.md — Autenticação
 */
export async function GET() {
  const session = await requireUser()
  if (!session.ok) {
    return session.response
  }

  const { user, admin } = session
  const { data, error } = await admin
    .from('users')
    .select('id, email, nome, tipo_usuario, telefone, created_at')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    return jsonError(500, 'database_error', error.message)
  }

  if (!data) {
    return jsonError(404, 'not_found', 'User not found.')
  }

  return jsonOk({
    id: data.id,
    email: data.email,
    nome: data.nome,
    tipo_usuario: data.tipo_usuario,
    telefone: data.telefone,
    created_at: data.created_at,
  })
}
