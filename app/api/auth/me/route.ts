import { requireSupabaseUser } from '@/lib/api/supabase-session'
import { jsonOk } from '@/lib/api/json-response'

/**
 * Retorna o utilizador autenticado (JWT + `auth.users`) para a sessão atual.
 * @see supabase/API.md — Autenticação
 */
export async function GET() {
  const session = await requireSupabaseUser()
  if (!session.ok) {
    return session.response
  }

  const { user } = session
  return jsonOk({
    id: user.id,
    email: user.email,
    app_metadata: user.app_metadata,
    created_at: user.created_at,
  })
}
