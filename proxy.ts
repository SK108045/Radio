import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only the suspension page is accessible — everything else redirects
  if (pathname === '/coming-soon') {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/coming-soon', request.url))
}

export const config = {
  // Match all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
