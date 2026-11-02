import { NextRequest } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { adminDb, requireData } from '@/lib/supabase-admin'
import { json } from '@/lib/sales-http'
import { reconcileTrackOrder, processTrackCallback, type TrackOrder } from '@/lib/track-payments'
export const maxDuration = 180
async function batches<T>(items: T[], worker: (item: T) => Promise<void>) {
  for (let offset = 0; offset < items.length; offset += 4) {
    await Promise.all(items.slice(offset, offset + 4).map(worker))
  }
}
export async function POST(req: NextRequest) {
  const secret = process.env.SALES_RECONCILE_SECRET, supplied = req.headers.get('authorization') || ''
  if (!secret) return json({ error: 'Reconciliation is not configured.' }, 503)
  const expected = Buffer.from(`Bearer ${secret}`), actual = Buffer.from(supplied)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return json({ error: 'Unauthorized.' }, 401)
  try {
    // Failed orders can still receive delayed success. Do not abandon accounting
    // after an arbitrary age, or let one unavailable callback block other sales.
    const rows = requireData(await adminDb().from('sales_orders').select('*').in('status',['pending','uncertain','failed']).not('provider_id','is',null).order('last_checked_at', { ascending: true, nullsFirst: true }).limit(25))
    const inbox = requireData(await adminDb().from('sales_callback_inbox').select('provider_id').is('processed_at',null).order('last_checked_at',{ascending:true,nullsFirst:true}).limit(25))
    let paid = 0, failures = 0
    await Promise.all([
      batches(inbox, async event => {
        try { await processTrackCallback(event.provider_id) } catch { failures++ }
        finally {
          const { error } = await adminDb().from('sales_callback_inbox').update({last_checked_at:new Date().toISOString()}).eq('provider_id',event.provider_id)
          if (error) throw new Error('Callback reconciliation progress could not be saved.')
        }
      }),
      batches(rows, async row => {
        try { const result = await reconcileTrackOrder(row as TrackOrder); if (result.status==='paid') paid++ } catch { failures++ }
        finally {
          const { error } = await adminDb().from('sales_orders').update({ last_checked_at: new Date().toISOString() }).eq('id',row.id)
          if (error) throw new Error('Reconciliation progress could not be saved.')
        }
      }),
    ])
    return json({ checked: rows.length, confirmed: paid, callbacksChecked: inbox.length, retryableFailures: failures })
  } catch { return json({ error: 'Reconciliation failed. Retry.' }, 503) }
}
