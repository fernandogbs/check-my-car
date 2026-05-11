import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { routing, type Locale } from '@/i18n/routing'
import type { Database } from '@/lib/supabase/database.types'

const PUBLIC_AUTH_SEGMENTS = new Set([
  'login',
  'callback',
  'register',
  'forgot',
])

function isLocalePublicAuthPath(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  const locale = segments[0]
  if (!routing.locales.includes(locale as Locale)) {
    return false
  }

  const rest = segments.slice(1)
  if (rest[0] !== 'auth') {
    return false
  }

  if (!PUBLIC_AUTH_SEGMENTS.has(rest[1] ?? '')) {
    return false
  }

  if (rest[1] === 'callback') {
    return rest.length >= 2
  }

  return rest.length === 2
}

function shouldEnforceAuth(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) {
    return false
  }

  return routing.locales.includes(segments[0] as Locale)
}

/**
 * Refresh session cookies on `response` (typically from next-intl).
 * Only redirects anonymous users away from **`/{locale}/...`** routes (not `/`).
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const supabaseResponse = response

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data } = await supabase.auth.getClaims()
  const user = data?.claims
  const pathname = request.nextUrl.pathname

  if (
    shouldEnforceAuth(pathname) &&
    !user &&
    !isLocalePublicAuthPath(pathname)
  ) {
    const segments = pathname.split('/').filter(Boolean)
    const locale = routing.locales.includes(segments[0] as Locale)
      ? segments[0]
      : routing.defaultLocale

    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/auth/login`
    const redirectResponse = NextResponse.redirect(url)
    for (const cookie of supabaseResponse.cookies.getAll()) {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    }
    return redirectResponse
  }

  return supabaseResponse
}
