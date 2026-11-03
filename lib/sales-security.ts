import 'server-only'
import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash, createHmac } from 'node:crypto'
import { promisify } from 'node:util'
const scrypt = promisify(scryptCallback)
export const ARTISTS = { metro_stunna: 'Metro_Stunna', swatt: 'swatt', kapitani: 'Kapitani', ethics_entertainment: 'Ethics Entertainment', test_artist: 'Test_Artist' } as const
export function artistSlug(value: string) { const slug = value.toLowerCase(); return Object.hasOwn(ARTISTS, slug) ? slug as keyof typeof ARTISTS : null }
export function opaqueToken() { return randomBytes(32).toString('base64url') }
export function digest(value: string) { return createHash('sha256').update(value).digest('hex') }
export function otpDigest(id: string, code: string) {
  const secret = process.env.SALES_OTP_SECRET || process.env.DOMAIN_PAYMENT_SECRET
  if (!secret) throw new Error('Phone verification is not configured.')
  return createHmac('sha256', secret).update(`${id}:${code}`).digest('hex')
}
export function validPassword(password: string) { return password.length >= 10 && password.length <= 128 }
export async function hashPassword(password: string) {
  if (!validPassword(password)) throw new Error('Use a password with 10–128 characters.')
  const salt = randomBytes(16).toString('hex')
  const key = await scrypt(password, salt, 64) as Buffer
  return `scrypt$${salt}$${key.toString('hex')}`
}
export async function verifyPassword(password: string, stored: string) {
  if (typeof password !== 'string' || password.length > 128) return false
  const [algorithm, salt, key, extra] = stored.split('$')
  if (algorithm !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(key) || extra) return false
  const actual = await scrypt(password, salt, 64) as Buffer
  return timingSafeEqual(actual, Buffer.from(key, 'hex'))
}
export const BROWSER_COOKIE = 'rieng-listening-browser'
export const ENTITLEMENT_HOURS = 12
export function playbackTTL(expiresAt: string, now = Date.now()) { return Math.max(0, Math.min(60, Math.floor((new Date(expiresAt).getTime() - now) / 1000))) }
