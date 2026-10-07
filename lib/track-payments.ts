import 'server-only'
import { adminDb, requireData } from './supabase-admin'
import { paymentEnv, requestTrackStk } from './domain-payment'
export type TrackOrder = { id: string; browser_hash: string; artist_id: string; track_id: string; amount: number; reference: string; provider_id: string | null; status: string; note: string; confirmed_at: string | null }
export async function initiateTrackOrder(order: TrackOrder, phone: string, title: string) {
  // Durable compare-and-swap ensures only one server sends this order's STK request.
  const { data, error } = await adminDb().from('sales_orders').update({ status: 'uncertain', note: 'The payment request is being sent. Check your phone before retrying.' }).eq('id', order.id).eq('status', 'created').select('*').maybeSingle()
  if (error) throw new Error('Payment request could not be saved.')
  if (!data) return requireData(await adminDb().from('sales_orders').select('*').eq('id', order.id).single()) as TrackOrder
  const result = await requestTrackStk(phone, order.reference, Number(order.amount), title)
  const saved = await adminDb().from('sales_orders').update({ status: result.status, provider_id: result.providerId || null, note: result.note }).eq('id', order.id).eq('status', 'uncertain').is('provider_id',null).select('*').maybeSingle()
  if (saved.error) throw new Error('The provider reply could not be saved. Check payment status before retrying.')
  return (saved.data || requireData(await adminDb().from('sales_orders').select('*').eq('id', order.id).single())) as TrackOrder
}
export type ProviderConfirmation = { status: 'paid'; receipt: string; amount: number } | { status: 'failed' | 'pending' }
export function parseTrackConfirmation(data: any, order: TrackOrder): ProviderConfirmation {
  const t = data?.transaction || data?.data || data
  const status = String(t?.status || data?.status || '').toLowerCase()
  const provider = t?.CheckoutRequestID || t?.checkoutRequestId || t?.checkout_request_id
  const reference = t?.accountReference || t?.reference
  // The poll URL is bound to our saved provider ID; verify extra identifiers when supplied.
  if ((provider && provider !== order.provider_id) || (reference && reference !== order.reference)) return { status: 'pending' }
  const receipt = t?.mpesaReceiptNumber || t?.MpesaReceiptNumber || data?.mpesaReceiptNumber || data?.MpesaReceiptNumber
  const amount = t?.amount ?? data?.amount
  if (status === 'success' && typeof receipt === 'string' && /^[A-Z0-9]{8,30}$/i.test(receipt) && amount !== undefined && Number(amount) === Number(order.amount)) return { status: 'paid', receipt: receipt.toUpperCase(), amount: Number(amount) }
  return { status: ['failed','cancelled','canceled'].includes(status) ? 'failed' : 'pending' }
}
export async function reconcileTrackOrder(order: TrackOrder, fetcher: typeof fetch = fetch, db = adminDb()): Promise<TrackOrder> {
  if (!order.provider_id || order.status === 'paid') return order
  let confirmed: ProviderConfirmation
  try {
    const response = await fetcher(`https://app.swifta.co.ke/poll/${encodeURIComponent(order.provider_id)}`, { headers: { Accept: 'application/json', 'x-api-key': paymentEnv('SWIFTA_API_KEY') }, redirect: 'error', signal: AbortSignal.timeout(8000), cache: 'no-store' })
    if (!response.ok) return order
    confirmed = parseTrackConfirmation(await response.json(), order)
  } catch { return order }
  if (confirmed.status === 'paid') {
    // Do not swallow persistence errors. Browser/callback retries can safely replay confirmation.
    return requireData(await db.rpc('sales_confirm_order', { p_order: order.id, p_provider: order.provider_id, p_receipt: confirmed.receipt, p_amount: confirmed.amount })) as TrackOrder
  }
  if (confirmed.status === 'failed' && order.status !== 'failed') {
    const { error } = await db.from('sales_orders').update({ status: 'failed', note: 'Payment did not complete. You can try again.' }).eq('id', order.id).neq('status', 'paid')
    if (error) throw new Error('Payment status could not be saved.')
    return requireData(await db.from('sales_orders').select('*').eq('id', order.id).single()) as TrackOrder
  }
  return order
}
export async function activeEntitlement(browser: string, trackId: string) {
  const { data, error } = await adminDb().from('sales_entitlements').select('expires_at').eq('browser_hash', browser).eq('track_id', trackId).gt('expires_at', new Date().toISOString()).order('expires_at', { ascending: false }).limit(1).maybeSingle()
  if (error) throw new Error('Listening access could not be checked.')
  return data
}
export function publicOrder(o: TrackOrder) { return { id: o.id, trackId: o.track_id, amount: Number(o.amount), status: o.status, reference: o.reference, note: o.note } }

export async function processTrackCallback(providerId: string, fetcher: typeof fetch = fetch) {
  const db = adminDb()
  const saved = await db.from('sales_callback_inbox').upsert({ provider_id: providerId }, { onConflict: 'provider_id', ignoreDuplicates: true })
  if (saved.error) throw new Error('Callback could not be saved.')
  const found = await db.from('sales_orders').select('*').eq('provider_id', providerId).maybeSingle()
  if (found.error) throw new Error('Checkout could not be read.')
  let order = found.data as TrackOrder | null
  if (!order) {
    // Recover the callback-before-initiation-save race using a reference from the
    // trusted provider response, never a reference supplied in the webhook body.
    const response = await fetcher(`https://app.swifta.co.ke/poll/${encodeURIComponent(providerId)}`, { headers: { Accept: 'application/json', 'x-api-key': paymentEnv('SWIFTA_API_KEY') }, redirect: 'error', signal: AbortSignal.timeout(8000), cache: 'no-store' })
    if (!response.ok) throw new Error('Provider confirmation is unavailable.')
    const data = await response.json(), transaction = data?.transaction || data?.data || data
    const reference = transaction?.accountReference || transaction?.reference
    if (typeof reference !== 'string' || !reference.startsWith('RIENG-TRACK-')) return null
    const candidate = await db.from('sales_orders').select('*').eq('reference', reference).maybeSingle()
    if (candidate.error) throw new Error('Checkout could not be read.')
    if (!candidate.data || (candidate.data.provider_id && candidate.data.provider_id !== providerId) || Number(transaction?.amount ?? data?.amount) !== Number(candidate.data.amount)) return null
    const matched = { ...candidate.data, provider_id: providerId } as TrackOrder
    if (parseTrackConfirmation(data, matched).status !== 'paid') return null
    if (!candidate.data.provider_id) {
      const bound = await db.from('sales_orders').update({ provider_id: providerId }).eq('id', matched.id).is('provider_id', null).neq('status','paid').select('*').maybeSingle()
      if (bound.error) throw new Error('Checkout ID could not be saved.')
      order = bound.data as TrackOrder | null
      if (!order) return null
    } else order = matched
  }
  const result = await reconcileTrackOrder(order, fetcher, db)
  const recorded = await db.from('sales_callback_inbox').update({ last_checked_at: new Date().toISOString(), ...(['paid','failed'].includes(result.status) ? { processed_at: new Date().toISOString() } : {}) }).eq('provider_id', providerId)
  if (recorded.error) throw new Error('Callback processing could not be saved.')
  return result
}
