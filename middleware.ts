import { NextResponse, type NextRequest } from 'next/server'

const ANALYTICS_PREFIX = '/Analytics/web/'
const PUBLIC_ANALYTICS_PATHS = new Set([
  '/Analytics/web/access.html',
  '/Analytics/web/Access management.html',
  '/Analytics/web/send-invite',
  '/Analytics/web/verify-invite',
  '/Analytics/web/session-status',
  '/Analytics/web/manage-access',
  '/Analytics/web/portal-session.js',
  '/Analytics/web/ga-extra.css',
])

function clearAnalyticsCookies(response: NextResponse) {
  response.cookies.set('rieng_analytics_email', '', { path: '/Analytics/web', maxAge: 0 })
  response.cookies.set('rieng_analytics_token', '', { path: '/Analytics/web', maxAge: 0 })
  return response
}

function analyticsDenied(request: NextRequest, status = 401) {
  const destination = request.headers.get('sec-fetch-dest')
  if (!destination || destination === 'document') {
    const url = new URL('/Analytics/web/access.html', request.url)
    url.searchParams.set('error', status === 403 ? 'revoked' : 'session-required')
    return clearAnalyticsCookies(NextResponse.redirect(url))
  }

  return clearAnalyticsCookies(
    new NextResponse(status === 403 ? 'Analytics access revoked.' : 'Analytics session required.', {
      status,
      headers: { 'Cache-Control': 'no-store' },
    }),
  )
}

async function protectAnalytics(request: NextRequest) {
  let decodedPath = request.nextUrl.pathname
  try {
    decodedPath = decodeURIComponent(decodedPath)
  } catch {}

  if (PUBLIC_ANALYTICS_PATHS.has(decodedPath)) return NextResponse.next()

  const email = request.cookies.get('rieng_analytics_email')?.value?.trim().toLowerCase()
  const token = request.cookies.get('rieng_analytics_token')?.value

  if (!email || !token) return analyticsDenied(request, 401)

  try {
    const upstream = await fetch('https://g-analytics-invite.johnwakaba146.workers.dev/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-analytics-site': 'rieng',
      },
      body: JSON.stringify({ email, token }),
      cache: 'no-store',
    })

    if (upstream.ok) return NextResponse.next()
    return analyticsDenied(request, upstream.status === 403 ? 403 : 401)
  } catch {
    return new NextResponse('Analytics access verification is temporarily unavailable.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path.startsWith(ANALYTICS_PREFIX)) {
    return protectAnalytics(request)
  }

  if (path === '/sales/login' || path.startsWith('/sales/sign-up/')) return NextResponse.next()
  if (!request.cookies.get('sales_session')) return NextResponse.redirect(new URL('/sales/login', request.url))
  // Authentication is checked against the database by every protected page/action.
  return NextResponse.next()
}

export const config = { matcher: ['/sales/:path*', '/Analytics/web/:path*'] }
