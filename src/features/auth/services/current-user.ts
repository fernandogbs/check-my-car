import 'server-only'
import { cookies } from 'next/headers'
import {
  verifySession,
  signSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from '@/features/auth/services/session'
import type { SessionClaims, SessionRole } from '@/features/auth/services/session'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AppNavRole } from '@/lib/app/app-nav-role-types'

export type { SessionClaims }

export async function getSessionClaims(): Promise<SessionClaims | null> {
  const store = await cookies()
  return verifySession(store.get(SESSION_COOKIE)?.value)
}

export function navRoleFromTipo(tipo: 'comprador' | 'verificador'): AppNavRole {
  return tipo === 'verificador' ? 'inspector' : 'buyer'
}

export type CurrentUser = {
  id: string
  nome: string
  email: string
  telefone: string | null
  tipo_usuario: 'comprador' | 'verificador'
  navRole: AppNavRole
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const claims = await getSessionClaims()
  if (!claims) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from('users')
    .select('id, nome, email, telefone, tipo_usuario')
    .eq('id', claims.sub)
    .maybeSingle()

  if (!data) return null

  return {
    ...data,
    navRole: navRoleFromTipo(data.tipo_usuario),
  }
}

export async function setSessionCookie(input: {
  sub: string
  role: SessionRole
}): Promise<void> {
  const token = await signSession(input)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}
