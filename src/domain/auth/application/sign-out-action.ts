'use server'

import { redirect } from 'next/navigation'
import { clearSessionCookie } from '@/lib/auth/current-user'

export async function signOut(formData: FormData): Promise<void> {
  const locale = String(formData.get('locale') ?? 'pt')
  await clearSessionCookie()
  redirect(`/${locale}/auth/login`)
}
