import { NextResponse } from 'next/server'

const workerBase = 'https://g-analytics-invite.johnwakaba146.workers.dev'

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization')
  if (!authorization || !/^Bearer [^\s]+$/.test(authorization)) {
    return NextResponse.json({ error: 'Enter the admin invite key.' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const action = body?.action

  if (!/^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$/.test(email) || !['revoke', 'restore'].includes(action)) {
    return NextResponse.json({ error: 'Enter a valid email address and access action.' }, { status: 400 })
  }

  try {
    const upstream = await fetch(workerBase + '/' + action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
        'x-analytics-site': 'rieng',
      },
      body: JSON.stringify({ email }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    })

    const result = await upstream.json().catch(() => ({}))
    return NextResponse.json(result, {
      status: upstream.status,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return NextResponse.json(
      { error: 'The access-control service could not complete this request.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
