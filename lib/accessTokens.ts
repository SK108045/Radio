import crypto from 'crypto'

const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET || 'rieng-radio-music-store-secret-key-2026'

export interface AccessTokenPayload {
  trackId: string
  phone?: string
  reference: string
  expiresAt: number
  issuedAt: number
}

/**
 * Generate a signed 15-minute access token for a track
 */
export function create15MinAccessToken(
  trackId: string,
  reference: string,
  phone?: string
): { token: string; expiresAt: number } {
  const now = Date.now()
  const expiresAt = now + 15 * 60 * 1000 // 15 minutes in milliseconds

  const payload: AccessTokenPayload = {
    trackId,
    reference,
    phone: phone ? phone.replace(/\s+/g, '') : undefined,
    issuedAt: now,
    expiresAt,
  }

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payloadBase64)
    .digest('base64url')

  const token = `${payloadBase64}.${signature}`
  return { token, expiresAt }
}

/**
 * Verify a 15-minute access token
 */
export function verifyAccessToken(
  token: string,
  expectedTrackId?: string
): { valid: boolean; payload?: AccessTokenPayload; error?: string } {
  try {
    if (!token || !token.includes('.')) {
      return { valid: false, error: 'Malformed token' }
    }

    const [payloadBase64, signature] = token.split('.')
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(payloadBase64)
      .digest('base64url')

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid token signature' }
    }

    const payload: AccessTokenPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf8')
    )

    if (Date.now() > payload.expiresAt) {
      return { valid: false, payload, error: 'Access pass expired' }
    }

    if (expectedTrackId && payload.trackId !== expectedTrackId) {
      return { valid: false, payload, error: 'Token is for a different track' }
    }

    return { valid: true, payload }
  } catch (err) {
    return { valid: false, error: 'Token parsing failed' }
  }
}
