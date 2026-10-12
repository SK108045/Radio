import { NextRequest } from 'next/server'
import { adminDb, requireData, rateLimit } from '@/lib/supabase-admin'
import { browserHash, inputJson, json, uuid, withBrowser } from '@/lib/sales-http'
import { normalizePhone, paymentEnv } from '@/lib/domain-payment'
import { initiateBobPayment, publicBobOrder, reconcileBobOrder, type BobOrder } from '@/lib/bob-preorders'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    // Readiness check prevents attempting to charge customers before the migration is applied.
    const db = adminDb()
    // Continue serving existing KSh 150 orders if the optional test SQL is not applied yet.
    const { error: testSchemaError } = await db.from('bob_preorders').select('id,is_test').limit(1)
    if (testSchemaError) {
      const { error: originalSchemaError } = await db.from('bob_preorders').select('id').limit(1)
      if (originalSchemaError) return json({ ready: false, error: 'BoB pre-orders are being prepared. Please check back shortly.' }, 503)
    }
    if (!paymentEnv('SWIFTA_API_KEY')) return json({ ready: false, error: 'M-Pesa checkout is temporarily unavailable.' }, 503)
    const browser = browserHash(req)
    if (!browser) return withBrowser(json({ ready: true, order: null }), req)
    let query = db.from('bob_preorders').select('*').eq('browser_hash', browser)
    if (!testSchemaError) query = query.eq('is_test', false)
    const row = await query.order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (row.error) throw new Error('Pre-order lookup failed.')
    let order = row.data as BobOrder | null
    if (order) {
      try { order = await reconcileBobOrder(order) } catch {
        // Payment history remains viewable during an SMS/provider outage.
      }
    }
    return json({ ready: true, order: order ? publicBobOrder(order) : null })
  } catch { return json({ ready: false, error: 'Pre-order status is currently unavailable. Try again shortly.' }, 503) }
}

export async function POST(req: NextRequest) {
  try {
    const input = await inputJson(req, 2048)
    const browser = browserHash(req)
    if (!browser) return json({ error: 'Please reload the pre-order window and try again.' }, 401)
    const phone = normalizePhone(input?.phone)
    if (!phone || !uuid(input?.attemptId)) return json({ error: 'Enter a valid Kenyan M-Pesa phone number.' }, 400)
    if (!paymentEnv('SWIFTA_API_KEY')) return json({ error: 'M-Pesa pre-orders are currently unavailable.' }, 503)
    await rateLimit('bob-checkout:' + browser, 6, 3600)
    const order = requireData(await adminDb().rpc('bob_create_preorder', {
      p_browser: browser, p_attempt: input.attemptId, p_phone: phone,
    })) as BobOrder
    const updated = await initiateBobPayment(order)
    return json({ order: publicBobOrder(updated) })
  } catch (error) {
    // Do not surface raw Postgres/provider details to a public buyer.
    const limited = error instanceof Error && /Too many attempts/.test(error.message)
    return json({ error: limited ? error.message : 'Could not start payment. Please check your payment status before trying again.' }, limited ? 429 : 503)
  }
}
