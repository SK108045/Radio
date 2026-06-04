import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Always allow the Coming Soon page itself ──────────────────────────
  if (pathname === '/coming-soon') {
    return NextResponse.next()
  }

  // ── 2. Sales dashboard keeps its own auth logic ──────────────────────────
  if (pathname.startsWith('/sales')) {
    const session = request.cookies.get('sales_session')
    const isLoginPage = pathname === '/sales/login'

    if (!session && !isLoginPage) {
      return NextResponse.redirect(new URL('/sales/login', request.url))
    }
    if (session && isLoginPage) {
      return NextResponse.redirect(new URL('/sales', request.url))
    }
    return NextResponse.next()
  }

  // ── 3. Everything else → Coming Soon ─────────────────────────────────────
  return NextResponse.redirect(new URL('/coming-soon', request.url))
}

export const config = {
  // Match all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
