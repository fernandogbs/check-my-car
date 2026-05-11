import { createClient } from '@/lib/supabase/server'
import { jsonError } from '@/lib/api/json-response'

export async function requireSupabaseUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      ok: false as const,
      response: jsonError(401, 'unauthorized', 'Missing or invalid session.'),
    }
  }

  return { ok: true as const, supabase, user }
}
