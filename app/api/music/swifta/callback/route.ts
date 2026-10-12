import { NextRequest } from 'next/server'
import { json } from '@/lib/sales-http'
import { processTrackCallback } from '@/lib/track-payments'
import { processBobCallback } from '@/lib/bob-preorders'
export const runtime = 'nodejs'
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text(); if (raw.length > 16384) return json({ error: 'Callback too large.' }, 413)
    const body = JSON.parse(raw), nested = body?.Body?.stkCallback || body?.data || body
    const id = nested?.CheckoutRequestID || nested?.checkoutRequestId || nested?.checkout_request_id
    if (typeof id !== 'string' || id.length > 200) return json({ error: 'Missing checkout ID.' }, 400)
    // A callback is a hint, not proof of payment. Both paths independently poll Swifta.
    // Keep track sales working even before the separate BoB migration is installed.
    const track = await processTrackCallback(id).catch(() => null)
    if (track) {
      if (track.status !== 'paid' && track.status !== 'failed') return json({ error: 'Provider confirmation is pending. Retry callback.' }, 503)
      return json({ received: true })
    }
    const bob = await processBobCallback(id)
    if (!bob) return json({ error: 'Checkout has not been matched yet. Retry callback.' }, 503)
    if (bob.status !== 'paid' && bob.status !== 'failed') return json({ error: 'Provider confirmation is pending. Retry callback.' }, 503)
    return json({ received: true })
  } catch { return json({ error: 'Confirmation could not be saved. Retry callback.' }, 503) }
}
