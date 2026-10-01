import 'server-only'
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DOMAIN_QUOTE, paymentAmount, type PaymentPurpose, type DomainPaymentStatus, type DomainPaymentSummary } from './domain-quote'

export const PAYMENT_COOKIE = 'rieng-domain-payment'
export const SESSION_SECONDS = 7 * 24 * 60 * 60
export type PaymentSession = {
  id: string
  purpose: PaymentPurpose
  expiresAt: number
  status: DomainPaymentStatus
  attemptId?: string
  reference?: string
  providerId?: string
  receipt?: string
  phoneLast4?: string
  note: string
}

// Next's self-hosted runtime loads .env. Tracing this file also supports the
// repository's committed .env workflow in Vercel functions. Never import this
// module into a client component or expose these values with NEXT_PUBLIC_.
let bundled: Record<string, string> | undefined
export function paymentEnv(name: 'SWIFTA_API_KEY' | 'DOMAIN_PAYMENT_SECRET'): string {
  if (process.env[name]) return process.env[name]!
  if (!bundled) {
    bundled = {}
    try {
      for (const line of readFileSync(join(process.cwd(), '.env'), 'utf8').split(/\r?\n/)) {
        const match = line.match(/^\s*(SWIFTA_API_KEY|DOMAIN_PAYMENT_SECRET)\s*=\s*(.*?)\s*$/)
        if (match) bundled[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
      }
    } catch { /* Runtime environment variables can configure payments instead. */ }
  }
  return bundled[name] || ''
}

function signature(value: string) {
  const secret = paymentEnv('DOMAIN_PAYMENT_SECRET')
  if (!secret) throw new Error('Domain payments are not configured.')
  return createHmac('sha256', secret).update(value).digest('base64url')
}
function equal(left: string, right: string) {
  const a = Buffer.from(left), b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}
export function newSession(purpose: PaymentPurpose = 'domain'): PaymentSession {
  return { id: randomUUID(), purpose, expiresAt: Date.now() + SESSION_SECONDS * 1000, status: 'unpaid', note: '' }
}
export function signSession(session: PaymentSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url')
  return `${payload}.${signature(payload)}`
}
export function readSession(value: string | undefined, purpose: PaymentPurpose = 'domain'): PaymentSession | null {
  if (!value || value.length > 4000) return null
  const [payload, supplied, extra] = value.split('.')
  if (!payload || !supplied || extra || !equal(supplied, signature(payload))) return null
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as PaymentSession
    if (!/^[a-f0-9-]{36}$/i.test(session.id) || !Number.isFinite(session.expiresAt) || session.expiresAt < Date.now()) return null
    if (!['unpaid', 'pending', 'uncertain', 'failed', 'paid'].includes(session.status)) return null
    // Preserve existing signed domain cookies, which predate the test route.
    session.purpose ||= 'domain'
    if (session.purpose !== purpose) return null
    return session
  } catch { return null }
}
export function csrfToken(session: PaymentSession) { return signature(`csrf:${session.purpose}:${session.id}`) }
export function validCsrf(session: PaymentSession, value: string) { return equal(csrfToken(session), value) }
export function summary(session: PaymentSession): DomainPaymentSummary {
  return { status: session.status, amount: paymentAmount(session.purpose), reference: session.reference || null, receipt: session.receipt || null, phoneLast4: session.phoneLast4 || null, note: session.note }
}
export function normalizePhone(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 40) return null
  const phone = value.trim().replace(/[\s()-]/g, '').replace(/^\+?254/, '0')
  return /^0[17]\d{8}$/.test(phone) ? phone : null
}

type PushResult = { status: 'pending' | 'failed' | 'uncertain'; providerId?: string; note: string }
export function requestDomainStk(phone: string, reference: string, fetcher: typeof fetch = fetch): Promise<PushResult> {
  return requestStk(phone, reference, 'domain', fetcher)
}
export function requestTestStk(phone: string, reference: string, fetcher: typeof fetch = fetch): Promise<PushResult> {
  return requestStk(phone, reference, 'test', fetcher)
}
async function requestStk(phone: string, reference: string, purpose: PaymentPurpose, fetcher: typeof fetch): Promise<PushResult> {
  const amount = paymentAmount(purpose)
  const key = paymentEnv('SWIFTA_API_KEY')
  if (!key) throw new Error('M-Pesa payments are not configured.')
  try {
    const response = await fetcher('https://app.swifta.co.ke/stkpush', {
      method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(20000),
      headers: { 'x-api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ phone, amount, accountReference: reference, description: purpose === 'test' ? 'Rieng KSh 1 payment test' : `Rieng domain switch to ${DOMAIN_QUOTE.newDomain}` }),
    })
    const raw = await response.text()
    let data: any
    try { data = JSON.parse(raw.replace(/^\uFEFF/, '')) } catch {
      const rejected = response.headers.get('cf-mitigated') === 'challenge' || [400, 401, 403, 404, 405, 413, 415, 422, 429].includes(response.status)
      return { status: rejected ? 'failed' : 'uncertain', note: rejected ? 'The payment service could not send a prompt. Please try again later.' : 'The service could not confirm this request. Check your phone before requesting another payment.' }
    }
    const result = data?.data || data
    const mpesa = result?.mpesaResponse || data?.mpesaResponse
    const meta = result?.meta || data?.meta
    const rawId = mpesa?.CheckoutRequestID || meta?.checkoutRequestId || result?.CheckoutRequestID || result?.checkoutRequestId || result?.checkout_request_id
    const providerId = typeof rawId === 'string' && rawId.length <= 200 ? rawId : undefined
    const code = mpesa?.ResponseCode ?? result?.ResponseCode ?? result?.responseCode ?? result?.response_code
    if (response.status >= 500 || response.status === 408 || (response.status >= 300 && response.status < 400)) {
      return { status: 'uncertain', providerId, note: 'The service could not confirm this request. A prompt may still arrive. Check payment status before trying again.' }
    }
    if (!response.ok || data?.success === false || result?.success === false || (code !== undefined && String(code) !== '0')) {
      return { status: 'failed', providerId, note: 'The M-Pesa request was declined. Check the number and try again.' }
    }
    // An accepted prompt is pending, never paid. Keep ambiguous responses locked.
    return providerId
      ? { status: 'pending', providerId, note: `Check your phone and enter your M-Pesa PIN to approve KSh ${amount.toLocaleString('en-KE')}.` }
      : { status: 'uncertain', note: 'The request was sent without a payment reference. Check your phone and contact the Rieng team before retrying.' }
  } catch {
    return { status: 'uncertain', note: 'The request was interrupted. A prompt may still arrive. Check your phone and contact the Rieng team before retrying.' }
  }
}

export async function pollDomainPayment(session: PaymentSession, fetcher: typeof fetch = fetch): Promise<PaymentSession> {
  if (!session.providerId || !['pending', 'uncertain'].includes(session.status)) return session
  try {
    const response = await fetcher(`https://app.swifta.co.ke/poll/${encodeURIComponent(session.providerId)}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000), redirect: 'error', cache: 'no-store' })
    if (!response.ok) return session
    const data = await response.json()
    const transaction = data?.transaction || data?.data || data
    const status = String(transaction?.status || data?.status || '').toLowerCase()
    const rawReceipt = transaction?.mpesaReceiptNumber || transaction?.MpesaReceiptNumber || data?.mpesaReceiptNumber || data?.MpesaReceiptNumber
    const receipt = typeof rawReceipt === 'string' && /^[A-Z0-9]{8,30}$/i.test(rawReceipt) ? rawReceipt.toUpperCase() : null
    const amount = transaction?.amount ?? data?.amount
    // The signed session binds this checkout to the fixed server-side quote.
    // When the provider returns an amount, additionally require an exact match.
    const expected = paymentAmount(session.purpose)
    if (status === 'success' && receipt && (amount === undefined || Number(amount) === expected)) {
      return { ...session, status: 'paid', receipt, note: `Your KSh ${expected.toLocaleString('en-KE')} M-Pesa payment is confirmed.` }
    }
    if (['failed', 'cancelled', 'canceled'].includes(status)) {
      return { ...session, status: 'failed', note: status === 'failed' ? 'The payment did not complete. You can try again.' : 'The M-Pesa prompt was cancelled. You can try again.' }
    }
    return session
  } catch { return session }
}

// Coalesce duplicate clicks within a running server. The signed HttpOnly cookie
// preserves the latest checkout across reloads and independent server instances.
// This one-off page intentionally has no order database or webhook dependency.
type Entry = { session: PaymentSession; flight?: Promise<PaymentSession>; attempts: number; lastAttempt: number }
const globalPayments = globalThis as typeof globalThis & { riengDomainPayments?: Map<string, Entry> }
const entries = globalPayments.riengDomainPayments ||= new Map<string, Entry>()
export function latestSession(session: PaymentSession): PaymentSession {
  const cached = entries.get(session.id)?.session
  if (session.status === 'paid' || (!cached && session.status !== 'unpaid')) return session
  return cached || session
}
export function rememberSession(session: PaymentSession) {
  const entry = entries.get(session.id)
  if (entry?.session.status === 'paid') return
  if (entry) { entry.session = session; return }
  if (entries.size < 1000) entries.set(session.id, { session, attempts: 0, lastAttempt: 0 })
}
export async function startPayment(session: PaymentSession, attemptId: string, phone: string, push?: typeof requestDomainStk): Promise<PaymentSession> {
  const send = push || (session.purpose === 'test' ? requestTestStk : requestDomainStk)
  for (const [id, entry] of entries) if (entry.session.expiresAt < Date.now()) entries.delete(id)
  const previous = entries.get(session.id)
  if (previous?.flight) return previous.flight
  const latest = latestSession(session)
  if (latest.status === 'paid' || ['pending', 'uncertain'].includes(latest.status) || latest.attemptId === attemptId) return latest
  if (entries.size >= 1000 && !previous) throw new Error('The payment service is busy. Please try again later.')
  const recent = previous && Date.now() - previous.lastAttempt < 60 * 60 * 1000
  if (recent && previous.attempts >= 3) throw new Error('Please wait before requesting another M-Pesa prompt.')
  const next: PaymentSession = { ...latest, status: 'uncertain', attemptId, reference: `RIENG-${session.purpose === 'test' ? 'TEST' : 'DOM'}-${randomUUID().slice(0, 8).toUpperCase()}`, phoneLast4: phone.slice(-4), providerId: undefined, receipt: undefined, note: 'The M-Pesa request is being sent. Check your phone before retrying.' }
  const entry: Entry = { session: next, attempts: recent ? previous.attempts + 1 : 1, lastAttempt: Date.now() }
  entries.set(session.id, entry)
  entry.flight = (async () => {
    try { entry.session = { ...next, ...await send(phone, next.reference!) } }
    catch { entry.session = next }
    finally { entry.flight = undefined }
    return entry.session
  })()
  return entry.flight
}
