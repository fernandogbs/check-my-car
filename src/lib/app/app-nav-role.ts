import 'server-only'

import { createClient } from '@/lib/supabase/server'

import type { AppNavRole } from '@/lib/app/app-nav-role-types'

export type { AppNavRole }

function navRoleFromMetadata(meta: Record<string, unknown> | undefined): AppNavRole | null {
  if (!meta) {
    return null
  }
  const raw = meta.nav_role ?? meta.role
  if (raw === 'inspector' || raw === 'buyer') {
    return raw
  }
  return null
}

/**
 * Papel para a bottom-nav: `app_metadata` (nav_role | role) ou `public.users.tipo_usuario`.
 */
export async function getAppNavRole(): Promise<AppNavRole> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return 'buyer'
  }

  const fromMeta = navRoleFromMetadata(user.app_metadata as Record<string, unknown>)
  if (fromMeta) {
    return fromMeta
  }

  const { data: row, error } = await supabase
    .from('users')
    .select('tipo_usuario')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !row) {
    return 'buyer'
  }

  if (row.tipo_usuario === 'verificador') {
    return 'inspector'
  }

  return 'buyer'
}
