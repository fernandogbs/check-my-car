import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type CallbackContext = {
  params: Promise<{ locale: string }>
}

export async function GET(request: NextRequest, context: CallbackContext) {
  const { locale } = await context.params
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  const nextRelative =
    searchParams.get('next') ?? `/${locale}/dashboard`

  if (!code) {
    return NextResponse.redirect(
      new URL(`/${locale}/auth/login?error=callback`, request.url)
    )
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      new URL(`/${locale}/auth/login?error=callback`, request.url)
    )
  }

  const safeNext =
    nextRelative.startsWith('/') && !nextRelative.startsWith('//')
      ? nextRelative
      : `/${locale}/dashboard`

  return NextResponse.redirect(new URL(safeNext, request.url))
}
