import { NextResponse } from 'next/server'

const inviteUrl = 'https://rieng-analytics-invite.johnwakaba146.workers.dev/invite'
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
      headers: { 'Content-Type': 'application/json', Authorization: authorization },
      body: JSON.stringify({ email, role, send: body.send }),
      redirect: 'error',
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    })

    if (upstream.status === 401) return json({ error: 'The admin invite key was rejected.' }, 401)

    if (upstream.ok) {
      const result = await upstream.json()
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
    }
  } catch {}

  return json({ error: 'The invitation service could not complete this request. Try again shortly.' }, 502)
}
