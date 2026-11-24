import { NextRequest, NextResponse } from 'next/server'

const verifyUrl = 'https://g-analytics-invite.johnwakaba146.workers.dev/verify'

function clear(response: NextResponse) {
  response.cookies.set('rieng_analytics_email', '', { path: '/Analytics/web', maxAge: 0 })
  response.cookies.set('rieng_analytics_token', '', { path: '/Analytics/web', maxAge: 0 })
  return response
}

export async function GET(request: NextRequest) {
  const email = request.cookies.get('rieng_analytics_email')?.value?.trim().toLowerCase()
  const token = request.cookies.get('rieng_analytics_token')?.value

  if (!email || !token) {
    return clear(NextResponse.json({ ok: false, error: 'Analytics session required.' }, {
      status: 401,
      headers: { 'Cache-Control': 'no-store' },
    }))
  }

  try {
    const upstream = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-analytics-site': 'rieng',
      },
      body: JSON.stringify({ email, token }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    })

    const result = await upstream.json().catch(() => ({}))

    if (upstream.ok && result.ok === true) {
      return NextResponse.json(
        { ok: true, email: result.email, role: result.role },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }

    return clear(NextResponse.json(
      { ok: false, error: result?.error || 'Analytics session is no longer valid.' },
      { status: upstream.status === 403 ? 403 : 401, headers: { 'Cache-Control': 'no-store' } },
    ))
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Analytics access verification is temporarily unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
