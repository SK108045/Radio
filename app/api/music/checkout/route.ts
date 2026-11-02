import { NextRequest } from 'next/server'
import { adminDb, requireData, rateLimit } from '@/lib/supabase-admin'
import { browserHash, inputJson, json, uuid, withBrowser } from '@/lib/sales-http'
import { normalizePhone, paymentEnv } from '@/lib/domain-payment'
import { activeEntitlement, initiateTrackOrder, publicOrder, type TrackOrder } from '@/lib/track-payments'
export const runtime = 'nodejs'
export async function GET(req: NextRequest) { return withBrowser(json({ ready: true }), req) }
export async function POST(req: NextRequest) {
  try {
    const input = await inputJson(req), browser = browserHash(req)
    if (!browser) return json({ error: 'Reload this page before purchasing.' }, 401)
    const phone = normalizePhone(input.phone)
    if (!phone || !uuid(input.trackId) || !uuid(input.attemptId)) return json({ error: 'Enter a valid Kenyan M-Pesa number.' }, 400)
    if (!paymentEnv('SWIFTA_API_KEY')) return json({ error: 'M-Pesa payments are unavailable.' }, 503)
    await rateLimit(`checkout:${browser}`, 10, 3600)
    const entitlement = await activeEntitlement(browser, input.trackId)
    if (entitlement) return json({ expiresAt: entitlement.expires_at, status: 'paid' })
    const order = requireData(await adminDb().rpc('sales_create_order', { p_browser: browser, p_track: input.trackId, p_attempt: input.attemptId })) as TrackOrder
    const track = requireData(await adminDb().from('tracks').select('title').eq('id', order.track_id).single())
    const updated = await initiateTrackOrder(order, phone, track.title)
    return json({ order: publicOrder(updated) })
  } catch (e) { return json({ error: e instanceof Error ? e.message : 'Payment could not start.' }, 400) }
}
