export const SESSION_COOKIE = 'cmc_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

export type SessionRole = 'comprador' | 'verificador'

export type SessionClaims = {
  sub: string
  role: SessionRole
  exp: number
}

// --- base64url helpers ---

function bufferToBase64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function stringToBase64url(str: string): string {
  const encoder = new TextEncoder()
  return bufferToBase64url(encoder.encode(str).buffer as ArrayBuffer)
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

// --- HMAC key helper ---

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

async function computeHmac(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await getHmacKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return bufferToBase64url(sig)
}

// --- Constant-time comparison ---

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// --- Public API ---

export async function signSession(input: {
  sub: string
  role: SessionRole
}): Promise<string> {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET environment variable is not set')

  const claims: SessionClaims = {
    sub: input.sub,
    role: input.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  }

  const payload = stringToBase64url(JSON.stringify(claims))
  const sig = await computeHmac(payload, secret)
  return `${payload}.${sig}`
}

export async function verifySession(
  token: string | undefined | null
): Promise<SessionClaims | null> {
  if (!token) return null

  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET environment variable is not set')

  const dotIndex = token.lastIndexOf('.')
  if (dotIndex === -1) return null

  const payload = token.slice(0, dotIndex)
  const providedSig = token.slice(dotIndex + 1)

  if (!payload || !providedSig) return null

  const expectedSig = await computeHmac(payload, secret)
  if (!constantTimeEqual(expectedSig, providedSig)) return null

  let claims: unknown
  try {
    claims = JSON.parse(base64urlToString(payload))
  } catch {
    return null
  }

  if (
    typeof claims !== 'object' ||
    claims === null ||
    typeof (claims as Record<string, unknown>)['sub'] !== 'string' ||
    typeof (claims as Record<string, unknown>)['role'] !== 'string' ||
    typeof (claims as Record<string, unknown>)['exp'] !== 'number'
  ) {
    return null
  }

  const typed = claims as SessionClaims

  if (typed.role !== 'comprador' && typed.role !== 'verificador') return null

  const now = Math.floor(Date.now() / 1000)
  if (typed.exp <= now) return null

  return typed
}
