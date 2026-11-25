import 'server-only'

const AUTH_URL = (process.env.CLOUDFLARE_ARTIST_AUTH_URL || 'https://rieng-artist-auth.johnwakaba146.workers.dev').replace(/\/$/, '')

type Artist = {
  artistId: string
  slug: string
  stageName: string
  phone: string
  isTest: boolean
}

type AuthResult = {
  session: { token: string; expiresAt: string }
  artist: Artist
}

async function request<T>(path: string, body: unknown, allowUnauthorized = false): Promise<T | null> {
  const response = await fetch(`${AUTH_URL}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  const payload = await response.json().catch(() => ({})) as { error?: string } & T
  if (allowUnauthorized && response.status === 401) return null
  if (!response.ok) throw new Error(payload.error || 'Artist authentication is temporarily unavailable.')
  return payload
}

export async function cloudflareSignup(input: { slug: string; phone: string; password: string; inviteToken: string }) {
  return request<AuthResult>('/signup', input) as Promise<AuthResult>
}

export async function cloudflareLogin(phone: string, password: string) {
  return request<AuthResult>('/login', { phone, password }, true) as Promise<AuthResult | null>
}

export async function cloudflareSession(token: string) {
  const payload = await request<{ artist: Artist }>('/session', { token }, true)
  return payload?.artist || null
}

export async function cloudflareLogout(token: string) {
  await request<{ ok: true }>('/logout', { token }).catch(() => null)
}
