import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { BROWSER_COOKIE, opaqueToken, digest } from './sales-security'
export function sameOrigin(req: NextRequest) {
  try { return new URL(req.headers.get('origin') || '').origin === `${req.headers.get('x-forwarded-proto') === 'https' ? 'https:' : req.nextUrl.protocol}//${req.headers.get('host')}` } catch { return false }
}
export function browserToken(req: NextRequest) { const token = req.cookies.get(BROWSER_COOKIE)?.value; return token && /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null }
export function browserHash(req: NextRequest) { const token = browserToken(req); return token ? digest(token) : null }
export function json(data: unknown, status = 200) { return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store, private', 'Vary': 'Cookie' } }) }
export function withBrowser(response: NextResponse, req: NextRequest) {
  if (!browserToken(req)) response.cookies.set(BROWSER_COOKIE, opaqueToken(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 365 * 86400 })
  return response
}
export async function inputJson(req: NextRequest, limit = 8192) {
  if (!sameOrigin(req)) throw new Error('Open this page on the Rieng website.')
  if (!req.headers.get('content-type')?.startsWith('application/json')) throw new Error('Send a JSON request.')
  const text = await req.text(); if (text.length > limit) throw new Error('Request is too large.')
  return JSON.parse(text)
}
export function uuid(value: unknown): value is string { return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) }
