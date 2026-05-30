import 'server-only'

import { getSessionClaims, navRoleFromTipo } from '@/features/auth/services/current-user'

import type { AppNavRole } from '@/lib/app/app-nav-role-types'

export type { AppNavRole }

/**
 * Papel para a bottom-nav derivado da sessão própria (sem DB).
 * `verificador` → `'inspector'`, tudo o resto → `'buyer'`.
 */
export async function getAppNavRole(): Promise<AppNavRole> {
  const claims = await getSessionClaims()
  if (!claims) {
    return 'buyer'
  }
  return navRoleFromTipo(claims.role)
}
