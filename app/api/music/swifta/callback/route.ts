import { NextRequest } from 'next/server'
import { adminDb } from '@/lib/supabase-admin'
import { json } from '@/lib/sales-http'
import { processTrackCallback } from '@/lib/track-payments'
export const runtime = 'nodejs'
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text(); if (raw.length > 16384) return json({ error: 'Callback too large.' }, 413)
    const body = JSON.parse(raw), nested = body?.Body?.stkCallback || body?.data || body
    const id = nested?.CheckoutRequestID || nested?.checkoutRequestId || nested?.checkout_request_id
    if (typeof id !== 'string' || id.length > 200) return json({ error: 'Missing checkout ID.' }, 400)
    // Save the callback first, then verify it with the provider before accounting.
    const result = await processTrackCallback(id)
    if (!result) return json({ error: 'Checkout has not been matched yet. Retry callback.' }, 503)
    if (result.status !== 'paid' && result.status !== 'failed') return json({ error: 'Provider confirmation is pending. Retry callback.' }, 503)
    return json({ received: true })
  } catch { return json({ error: 'Confirmation could not be saved. Retry callback.' }, 503) }
}
