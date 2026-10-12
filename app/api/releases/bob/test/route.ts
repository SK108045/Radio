import { NextRequest } from 'next/server'
import { adminDb, requireData, rateLimit } from '@/lib/supabase-admin'
import { browserHash, inputJson, json, uuid, withBrowser } from '@/lib/sales-http'
import { normalizePhone, paymentEnv } from '@/lib/domain-payment'
import { initiateBobPayment, publicBobOrder, reconcileBobOrder, type BobOrder } from '@/lib/bob-preorders'

export const runtime = 'nodejs'

// Dedicated 1-bob test checkout: separate server-fixed price, records and code.
export async function GET(req: NextRequest) {
  try {
    const db = adminDb()
    const { error } = await db.from('bob_preorders').select('id,is_test').limit(1)
    if (error) return json({ ready: false, error: 'Run the BoB KSh 1 test SQL in Supabase before paying.' }, 503)
    if (!paymentEnv('SWIFTA_API_KEY')) return json({ ready: false, error: 'Swifta is not configured.' }, 503)
    const browser = browserHash(req)
    if (!browser) return withBrowser(json({ ready: true, order: null }), req)
    const row = await db.from('bob_preorders').select('*').eq('browser_hash', browser)
      .eq('is_test', true).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (row.error) throw new Error('Test order unavailable.')
    let order = row.data as BobOrder | null
    if (order) {
      try { order = await reconcileBobOrder(order) }
      catch { /* Retain payment history even when provider or SMS is unavailable. */ }
    }
    return json({ ready: true, order: order ? publicBobOrder(order) : null })
  } catch { return json({ ready: false, error: 'Test checkout is temporarily unavailable.' }, 503) }
}

export async function POST(req: NextRequest) {
  try {
    const input = await inputJson(req, 2048)
    const browser = browserHash(req)
    if (!browser) return json({ error: 'Reload the checkout to begin.' }, 401)
    const phone = normalizePhone(input?.phone)
    if (!phone || !uuid(input?.attemptId)) return json({ error: 'Enter a valid Kenyan M-Pesa number.' }, 400)
    if (!paymentEnv('SWIFTA_API_KEY')) return json({ error: 'M-Pesa is unavailable.' }, 503)
    await rateLimit('bob-test:' + browser, 4, 3600)
    const order = requireData(await adminDb().rpc('bob_create_test_preorder', {
      p_browser: browser, p_attempt: input.attemptId, p_phone: phone,
    })) as BobOrder
    if (!order.is_test || Number(order.amount) !== 1)
      throw new Error('Test quote does not match.')
    const updated = await initiateBobPayment(order)
    return json({ order: publicBobOrder(updated) })
  } catch (error) {
    const limited = error instanceof Error && /Too many attempts/.test(error.message)
    return json({ error: limited ? error.message : 'The test payment could not start. Check M-Pesa status before retrying.' }, limited ? 429 : 503)
  }
}
