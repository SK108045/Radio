import 'server-only'
import WebSocket from 'ws'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
let client: SupabaseClient | undefined
export function adminDb() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!key || !url) throw new Error('Artist sales are not configured. Set the Supabase server secret and apply the sales migration.')
  return client ||= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, realtime: { transport: WebSocket as any } })
}
export function requireData<T>(result: { data: T; error: { message: string } | null }): NonNullable<T> {
  if (result.error || result.data === null) throw new Error('The database operation could not be completed.')
  return result.data as NonNullable<T>
}
export async function rateLimit(key: string, max: number, seconds: number) {
  const allowed = requireData(await adminDb().rpc('sales_rate_limit', { p_key: key, p_max: max, p_seconds: seconds }))
  if (!allowed) throw new Error('Too many attempts. Please wait and try again.')
}
