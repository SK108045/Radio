import { NextRequest } from 'next/server'
import { adminDb } from '@/lib/supabase-admin'
import { browserHash, json, uuid } from '@/lib/sales-http'
import { activeEntitlement, publicOrder, reconcileTrackOrder, type TrackOrder } from '@/lib/track-payments'
export async function GET(req: NextRequest) {
  try {
    const browser = browserHash(req), trackId = req.nextUrl.searchParams.get('trackId')
    if (!browser || !uuid(trackId)) return json({ error: 'Reload the page.' }, 400)
    const { data, error } = await adminDb().from('sales_orders').select('*').eq('browser_hash', browser).eq('track_id', trackId).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (error) throw new Error('Payment status is unavailable.')
    const order = data ? await reconcileTrackOrder(data as TrackOrder) : null
    const entitlement = await activeEntitlement(browser, trackId)
    return json({ order: order ? publicOrder(order) : null, expiresAt: entitlement?.expires_at || null })
  } catch { return json({ error: 'Payment status could not be checked. Please retry.' }, 503) }
}
