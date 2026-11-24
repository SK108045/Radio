import { NextResponse } from 'next/server'

const verifyUrl = 'https://g-analytics-invite.johnwakaba146.workers.dev/verify'
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/Analytics/web',
  maxAge: 24 * 60 * 60,
}

function json(body: object, status: number) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const token = body?.token
  if (!email || typeof token !== 'string' || !token || /[<>]/.test(email)) {
    return json({ ok: false, error: 'This invitation link is incomplete or invalid.' }, 400)
  }

  try {
    const upstream = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-analytics-site': 'rieng',
      },
      body: JSON.stringify({ email, token }),
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    })

    const result = await upstream.json().catch(() => ({}))

    if (upstream.status === 401) {
      return json({ ok: false, error: 'Invalid or expired invitation.' }, 401)
    }

    if (upstream.status === 403) {
      return json({ ok: false, error: result?.error || 'Access has been revoked.' }, 403)
    }

    if (upstream.ok && result.ok === true && result.email === email && ['Viewer', 'Analyst'].includes(result.role)) {
      const response = json({ ok: true, email: result.email, role: result.role }, 200)
      response.cookies.set('rieng_analytics_email', result.email, cookieOptions)
      response.cookies.set('rieng_analytics_token', token, cookieOptions)
      return response
    }

    if (!upstream.ok && typeof result?.error === 'string') {
      return json({ ok: false, error: result.error }, upstream.status)
    }
  } catch {}

  return json({ ok: false, error: 'Invitation verification is temporarily unavailable. Try again shortly.' }, 502)
}
