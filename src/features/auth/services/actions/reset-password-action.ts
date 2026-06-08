'use server'

import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashPassword } from '@/features/auth/utils/password'
import type { ResetPasswordActionState } from '../../types/reset-password-action-state'

const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'mismatch',
  })

export async function resetPassword(
  _prev: ResetPasswordActionState,
  formData: FormData
): Promise<ResetPasswordActionState> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    const fieldErrors: NonNullable<
      Extract<ResetPasswordActionState, { ok: false }>['fieldErrors']
    > = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (key === 'password') fieldErrors.password = true
      if (key === 'confirmPassword') fieldErrors.confirmPassword = true
    }
    return { ok: false, code: 'validation', fieldErrors }
  }

  const admin = createAdminClient()
  const { data: user } = await admin
    .from('users')
    .select('id')
    .ilike('email', parsed.data.email)
    .maybeSingle()

  if (!user) return { ok: false, code: 'generic' }

  const hashed = await hashPassword(parsed.data.password)
  const { error } = await admin
    .from('users')
    .update({ senha: hashed })
    .eq('id', user.id)

  if (error) return { ok: false, code: 'generic' }

  return { ok: true }
}
