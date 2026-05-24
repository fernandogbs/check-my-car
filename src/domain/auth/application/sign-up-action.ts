'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashPassword } from '@/lib/auth/password'
import { setSessionCookie } from '@/lib/auth/current-user'
import type { RegisterActionState } from '../model/register-action-state'
import { registerCredentialsSchema } from '../model/register-credentials-schema'

export async function signUp(
  _prev: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  const locale = String(formData.get('locale') ?? 'pt')

  const parsed = registerCredentialsSchema.safeParse({
    nome: formData.get('nome'),
    email: formData.get('email'),
    telefone: formData.get('telefone'),
    senha: formData.get('senha'),
    confirmarSenha: formData.get('confirmarSenha'),
    tipo_usuario: formData.get('tipo_usuario'),
  })

  if (!parsed.success) {
    const fieldErrors: NonNullable<
      Extract<RegisterActionState, { ok: false }>['fieldErrors']
    > = {}

    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (key === 'nome') fieldErrors.nome = true
      if (key === 'email') fieldErrors.email = true
      if (key === 'telefone') fieldErrors.telefone = true
      if (key === 'senha') fieldErrors.senha = true
      if (key === 'confirmarSenha') fieldErrors.confirmarSenha = true
    }

    return { ok: false, code: 'validation', fieldErrors }
  }

  const admin = createAdminClient()
  const email = parsed.data.email.toLowerCase()

  const { data: existing } = await admin
    .from('users')
    .select('id')
    .ilike('email', email)
    .maybeSingle()

  if (existing) {
    return { ok: false, code: 'emailTaken' }
  }

  const senha = await hashPassword(parsed.data.senha)

  const { data: created, error } = await admin
    .from('users')
    .insert({
      nome: parsed.data.nome,
      email,
      senha,
      telefone: parsed.data.telefone,
      tipo_usuario: parsed.data.tipo_usuario,
    })
    .select('id, tipo_usuario')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { ok: false, code: 'emailTaken' }
    }
    return { ok: false, code: 'generic' }
  }

  if (!created) {
    return { ok: false, code: 'generic' }
  }

  await setSessionCookie({ sub: created.id, role: created.tipo_usuario })

  redirect(`/${locale}/dashboard`)
}
