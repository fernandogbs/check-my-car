'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import type { CheckEmailActionState } from '../../types/check-email-action-state'

const emailSchema = z.object({ email: z.string().email() })

export async function checkEmail(
  _prev: CheckEmailActionState,
  formData: FormData
): Promise<CheckEmailActionState> {
  const parsed = emailSchema.safeParse({ email: formData.get('email') })

  if (!parsed.success) {
    return { ok: false, code: 'validation', fieldErrors: { email: true } }
  }

  const admin = createAdminClient()
  const { data: user, error } = await admin
    .from('users')
    .select('id')
    .ilike('email', parsed.data.email)
    .maybeSingle()

  if (error) return { ok: false, code: 'generic' }
  if (!user) return { ok: false, code: 'emailNotFound' }

  return { ok: true, email: parsed.data.email }
}
