import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionClaims } from '@/features/auth/services/current-user'
import { jsonError } from '@/lib/api/json-response'

export async function requireUser() {
  const claims = await getSessionClaims()
  if (!claims) {
    return {
      ok: false as const,
      response: jsonError(401, 'unauthorized', 'Missing or invalid session.'),
    }
  }
  return { ok: true as const, user: { id: claims.sub, role: claims.role }, admin: createAdminClient() }
}
