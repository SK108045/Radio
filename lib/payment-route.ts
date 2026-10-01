import { NextRequest, NextResponse } from 'next/server'
import { csrfToken, latestSession, newSession, normalizePhone, PAYMENT_COOKIE, paymentEnv, pollDomainPayment, readSession, rememberSession, SESSION_SECONDS, signSession, startPayment, summary, validCsrf, type PaymentSession } from './domain-payment'

import type { PaymentPurpose } from './domain-quote'

export function createPaymentHandlers(purpose: PaymentPurpose) {
  const cookieName = purpose === 'test' ? 'rieng-payment-test' : PAYMENT_COOKIE
  const apiPath = purpose === 'test' ? '/api/payment-test' : '/api/domain-payment'

  function reply(request: NextRequest, session: PaymentSession) {
    const response = NextResponse.json({ payment: summary(session), csrfToken: csrfToken(session) }, { headers: { 'Cache-Control': 'no-store, private' } })
    response.cookies.set(cookieName, signSession(session), { httpOnly: true, sameSite: 'strict', secure: request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https', path: apiPath, maxAge: SESSION_SECONDS })
    return response
  }
  function failure(message: string, status: number) {
    return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } })
  }
  function sameOrigin(request: NextRequest) {
    try {
      const origin = new URL(request.headers.get('origin') || '')
      // Next's Node adapter can construct an internal localhost request URL even
      // when the browser uses the public hostname. Match the routed Host instead.
      const protocol = request.headers.get('x-forwarded-proto') === 'https' ? 'https:' : request.nextUrl.protocol
      return origin.origin === `${protocol}//${request.headers.get('host')}`
    } catch { return false }
  }
  async function GET(request: NextRequest) {
    try {
      if (!paymentEnv('SWIFTA_API_KEY') || !paymentEnv('DOMAIN_PAYMENT_SECRET')) return failure('M-Pesa payments are currently unavailable. Please contact the Rieng team.', 503)
      const stored = readSession(request.cookies.get(cookieName)?.value, purpose)
      const session = stored ? await pollDomainPayment(latestSession(stored)) : newSession(purpose)
      rememberSession(session)
      return reply(request, latestSession(session))
    } catch { return failure('Payment status could not be checked. Please try again.', 503) }
  }
  async function POST(request: NextRequest) {
    try {
      if (!sameOrigin(request)) return failure('Open the payment page on this website.', 403)
      if (!request.headers.get('content-type')?.startsWith('application/json')) return failure('Send a JSON payment request.', 415)
      if (Number(request.headers.get('content-length')) > 2048) return failure('Payment request is too large.', 413)
      const session = readSession(request.cookies.get(cookieName)?.value, purpose)
      if (!session) return failure('Reload the payment page before trying again.', 401)
      if (!validCsrf(session, request.headers.get('x-csrf-token') || '')) return failure('Reload the payment page before trying again.', 403)
      const attemptId = request.headers.get('Idempotency-Key') || ''
      if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(attemptId)) return failure('A valid payment attempt is required.', 400)
      const raw = await request.text()
      if (raw.length > 2048) return failure('Payment request is too large.', 413)
      let input: any
      try { input = JSON.parse(raw) } catch { return failure('Invalid payment request.', 400) }
      const phone = normalizePhone(input?.phone)
      if (!phone) return failure('Enter a valid Kenyan M-Pesa number, such as 0712 345 678.', 400)
      if (!paymentEnv('SWIFTA_API_KEY')) return failure('M-Pesa payments are currently unavailable.', 503)
      const updated = await startPayment(session, attemptId, phone)
      return reply(request, updated)
    } catch (error) {
      const known = error instanceof Error && /Please wait|service is busy/.test(error.message)
      return failure(known ? error.message : 'The request could not be completed. Check payment status before trying again.', known ? 429 : 503)
    }
  }

  return { GET, POST }
}
