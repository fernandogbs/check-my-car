'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { AuthActionState } from '../model/auth-action-state'
import { loginCredentialsSchema } from '../model/login-credentials-schema'

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

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { ok: false, code: 'invalidCredentials' }
  }

  redirect(`/${locale}`)
}
