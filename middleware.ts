import { NextResponse, type NextRequest } from 'next/server'
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  if (path === '/sales/login' || path.startsWith('/sales/sign-up/')) return NextResponse.next()
  if (!request.cookies.get('sales_session')) return NextResponse.redirect(new URL('/sales/login', request.url))
  // Authentication is checked against the database by every protected page/action.
  return NextResponse.next()
}
export const config = { matcher: ['/sales/:path*'] }
