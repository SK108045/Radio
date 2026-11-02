import 'server-only'
import { cookies } from 'next/headers'
import { adminDb, requireData } from './supabase-admin'
import { digest, opaqueToken } from './sales-security'
export type SessionPayload = { artistId: string; stageName: string; phone: string; isTest: boolean }
export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get('sales_session')?.value
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null
  const db = adminDb()
  const { data, error } = await db.from('sales_artist_sessions').select('artist_id').eq('token_hash', digest(token)).gt('expires_at', new Date().toISOString()).maybeSingle()
  if (error) throw new Error('Artist authentication is unavailable.')
  if (!data) return null
  const account = requireData(await db.from('sales_artist_accounts').select('phone, sales_artist_registry(stage_name,is_test)').eq('artist_id', data.artist_id).single())
  const registry = account.sales_artist_registry as unknown as { stage_name: string; is_test: boolean }
  return { artistId: data.artist_id, stageName: registry.stage_name, phone: account.phone, isTest: registry.is_test }
}
export async function setSession(artistId: string) {
  const token = opaqueToken()
  requireData(await adminDb().from('sales_artist_sessions').insert({ token_hash: digest(token), artist_id: artistId, expires_at: new Date(Date.now() + 7 * 86400000).toISOString() }).select('artist_id').single())
  ;(await cookies()).set('sales_session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7 * 86400 })
}
export async function clearSession() {
  const store = await cookies(), token = store.get('sales_session')?.value
  if (token && /^[A-Za-z0-9_-]{43}$/.test(token)) {
    const { error } = await adminDb().from('sales_artist_sessions').delete().eq('token_hash', digest(token))
    if (error) throw new Error('Could not sign out. Try again.')
  }
  store.delete('sales_session')
}
