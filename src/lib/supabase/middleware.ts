import { NextResponse, type NextRequest } from 'next/server'
import { routing, type Locale } from '@/i18n/routing'
import { verifySession, SESSION_COOKIE } from '@/features/auth/services/session'

const PUBLIC_AUTH_SEGMENTS = new Set([
  'login',
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
 * Validates custom session cookie and gates locale routes.
 * Only redirects anonymous users away from **`/{locale}/...`** routes (not `/`).
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const claims = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)
  const pathname = request.nextUrl.pathname

  if (
    shouldEnforceAuth(pathname) &&
    !claims &&
    !isLocalePublicAuthPath(pathname)
  ) {
    const segments = pathname.split('/').filter(Boolean)
    const locale = routing.locales.includes(segments[0] as Locale)
      ? segments[0]
      : routing.defaultLocale

    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/auth/login`
    const redirectResponse = NextResponse.redirect(url)
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    }
    return redirectResponse
  }

  return response
}
