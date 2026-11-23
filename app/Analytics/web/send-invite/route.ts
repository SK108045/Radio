import { NextResponse } from 'next/server'

const inviteUrl = 'https://g-analytics-invite.johnwakaba146.workers.dev/invite'
const accessPath = '/Analytics/web/access.html'
const allowedAccessHosts = new Set(['riengradio.co.ke', 'www.riengradio.co.ke'])

function json(body: object, status: number) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization')
  if (!authorization || !/^Bearer [^\s]+$/.test(authorization)) {
    return json({ error: 'Enter the admin invite key.' }, 401)
  }

  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const role = body?.role
  if (!/^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$/.test(email) ||
      !['Viewer', 'Analyst'].includes(role) || typeof body?.send !== 'boolean') {
    return json({ error: 'Enter a valid email address and select an invitation role.' }, 400)
  }

  try {
    const upstream = await fetch(inviteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
        'x-analytics-site': 'rieng',
      },
      body: JSON.stringify({ email, role, send: body.send }),
      redirect: 'error',
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    })

    const result = await upstream.json().catch(() => ({}))

    if (upstream.status === 401) {
      return json({ error: 'The admin invite key was rejected.' }, 401)
    }

    if (!upstream.ok) {
      return json(
        { error: typeof result?.error === 'string' ? result.error : 'The invitation service could not complete this request.' },
        upstream.status >= 400 && upstream.status <= 599 ? upstream.status : 502,
      )
    }

    const link = new URL(result.accessUrl)
    const validAccessUrl =
      result.ok === true &&
      typeof result.sent === 'boolean' &&
      link.protocol === 'https:' &&
      allowedAccessHosts.has(link.hostname.toLowerCase()) &&
      link.port === '' &&
      link.username === '' &&
      link.password === '' &&
      link.pathname === accessPath &&
      link.searchParams.get('email') === email &&
      link.searchParams.has('token')

    if (validAccessUrl) {
      return json({ sent: result.sent, accessUrl: link.href }, 200)
    }

    return json({ error: 'The invitation service returned an invalid Rieng access link.' }, 502)
  } catch {
    return json({ error: 'The invitation service could not complete this request. Try again shortly.' }, 502)
  }
}
