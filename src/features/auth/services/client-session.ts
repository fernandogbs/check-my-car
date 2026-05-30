import { SESSION_COOKIE } from '@/features/auth/services/session'

type SessionClaims = {
  sub: string
  role: string
  exp: number
}

function base64urlToString(b64url: string): string {
  const padded = b64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    b64url.length + ((4 - (b64url.length % 4)) % 4),
    '='
  )
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

export function getClientSessionClaims(): SessionClaims | null {
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${SESSION_COOKIE}=`))
    ?.split('=')[1]

  if (!cookieValue) return null

  const dotIndex = cookieValue.lastIndexOf('.')
  if (dotIndex === -1) return null

  const payload = cookieValue.slice(0, dotIndex)
  if (!payload) return null

  try {
    const claims = JSON.parse(base64urlToString(payload))

    // Validar estrutura e expiração
    if (
      typeof claims !== 'object' ||
      claims === null ||
      typeof claims['sub'] !== 'string' ||
      typeof claims['role'] !== 'string' ||
      typeof claims['exp'] !== 'number'
    ) {
      return null
    }

    // Verificar expiração
    const now = Math.floor(Date.now() / 1000)
    if (claims.exp <= now) {
      return null
    }

    return claims as SessionClaims
  } catch {
    return null
  }
}
