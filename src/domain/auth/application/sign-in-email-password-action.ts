'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPassword } from '@/lib/auth/password'
import { setSessionCookie } from '@/lib/auth/current-user'
import type { AuthActionState } from '../model/auth-action-state'
import { loginCredentialsSchema } from '../model/login-credentials-schema'

const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8DvKQ6Df0iLk0ExQ4z1u3qXyz1abc'

export async function signInWithEmailPassword(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const locale = String(formData.get('locale') ?? 'pt')

  const parsed = loginCredentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    const fieldErrors: NonNullable<
      Extract<AuthActionState, { ok: false }>['fieldErrors']
    > = {}

    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (key === 'email') {
        fieldErrors.email = true
      }
      if (key === 'password') {
        fieldErrors.password = true
      }
    }

    return { ok: false, code: 'validation', fieldErrors }
  }

  const admin = createAdminClient()
  const { data: user } = await admin
    .from('users')
    .select('id, senha, tipo_usuario')
    .ilike('email', parsed.data.email)
    .maybeSingle()

  const valid = await verifyPassword(parsed.data.password, user?.senha ?? DUMMY_HASH)

  if (!user || !valid) {
    return { ok: false, code: 'invalidCredentials' }
  }

  await setSessionCookie({ sub: user.id, role: user.tipo_usuario })

  redirect(`/${locale}/dashboard`)
}
