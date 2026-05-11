'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signInWithGoogle(formData: FormData) {
  const locale = String(formData.get('locale') ?? 'pt')
  const headerList = await headers()
  const origin =
    headerList.get('origin') ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000'

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/${locale}/auth/callback`,
    },
  })

  if (error || !data.url) {
    redirect(`/${locale}/auth/login?error=oauth`)
  }

  redirect(data.url)
}
