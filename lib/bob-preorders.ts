import 'server-only'
import { adminDb, requireData } from './supabase-admin'
import { requestTrackStk } from './domain-payment'
import { sendCustomSms } from './sozuri'

export const BOB_PRICE_KSH = 150
export type BobOrder = {
  id: string; browser_hash: string; attempt_id: string; phone: string;
  amount: number; reference: string; provider_id: string | null;
  receipt: string | null; status: 'created'|'pending'|'uncertain'|'failed'|'paid';
  note: string; code: string | null; sms_status: 'pending'|'sending'|'sent'|'failed';
  sms_attempts: number; sms_attempted_at: string | null; sms_sent_at: string | null;
  confirmed_at: string | null
}

export function publicBobOrder(order: BobOrder) {
  return {
    id: order.id, amount: Number(order.amount), status: order.status,
    reference: order.reference, note: order.note,
    phoneLast4: order.phone.slice(-4),
    receipt: order.status === 'paid' ? order.receipt : null,
    code: order.status === 'paid' ? order.code : null,
    smsStatus: order.status === 'paid' ? order.sms_status : null,
  }
}

export async function initiateBobPayment(order: BobOrder) {
  if (order.status !== 'created') return order
  const db = adminDb()
  const { data: claimed, error } = await db.from('bob_preorders')
    .update({ status: 'uncertain', note: 'Sending your M-Pesa prompt. Check your phone before retrying.' })
    .eq('id', order.id).eq('status', 'created').select('*').maybeSingle()
  if (error) throw new Error('Your pre-order could not be saved.')
  if (!claimed) return requireData(await db.from('bob_preorders').select('*').eq('id', order.id).single()) as BobOrder
  const result = await requestTrackStk(order.phone, order.reference, BOB_PRICE_KSH, 'BoB - SWAT x Unco Jing Jong pre-order')
  const saved = await db.from('bob_preorders')
    .update({ status: result.status, provider_id: result.providerId || null, note: result.note })
    .eq('id', order.id).eq('status', 'uncertain').is('provider_id', null).select('*').maybeSingle()
  if (saved.error) throw new Error('Could not record the provider response. Check status before retrying.')
  return (saved.data || requireData(await db.from('bob_preorders').select('*').eq('id', order.id).single())) as BobOrder
}

export function parseBobPayment(data: any, order: BobOrder): { status:'paid';receipt:string } | {status:'pending'|'failed'} {
  const payment = data?.transaction || data?.data || data
  const providerId = payment?.CheckoutRequestID || payment?.checkoutRequestId || payment?.checkout_request_id
  const reference = payment?.accountReference || payment?.reference
  if ((providerId && providerId !== order.provider_id) || (reference && reference !== order.reference)) return { status: 'pending' }
  const receipt = payment?.mpesaReceiptNumber || payment?.MpesaReceiptNumber || data?.mpesaReceiptNumber || data?.MpesaReceiptNumber
  const amount = payment?.amount ?? data?.amount
  const state = String(payment?.status || data?.status || '').toLowerCase()
  // Some Swifta poll responses omit amount; when present it MUST match our server-side quote.
  if (state === 'success' && typeof receipt === 'string' && /^[A-Z0-9]{8,30}$/i.test(receipt)
      && (amount === undefined || Number(amount) === BOB_PRICE_KSH))
    return { status: 'paid', receipt: receipt.toUpperCase() }
  return { status: ['failed','cancelled','canceled'].includes(state) ? 'failed' : 'pending' }
}

// The unique code lives in the database; callback retries only resend the SAME code.
export async function deliverBobSms(order: BobOrder): Promise<BobOrder> {
  if (order.status !== 'paid' || order.sms_status === 'sent') return order
  const db = adminDb()
  const claimed = requireOptional(await db.rpc('bob_claim_sms', { p_order: order.id })) as BobOrder | null
  if (!claimed) return order
  let messageId: string | null = null, errorCode: string | null = null
  try {
    const result = await sendCustomSms(
      claimed.phone,
      'RIENG254: Your BoB pre-order (SWAT x Unco Jing Jong) is confirmed! ' +
      'Amount: KSh 150. Your unique code: ' + claimed.code +
      '. Keep this SMS as your pre-order proof. M-Pesa: ' + claimed.receipt + '.'
    )
    messageId = result.messageId
  } catch (error) {
    errorCode = error instanceof Error && 'code' in error ? String(error.code) : 'SMS_UNAVAILABLE'
  }
  const update = await db.from('bob_preorders')
    .update(messageId !== null || !errorCode
      ? { sms_status: 'sent', sms_sent_at: new Date().toISOString(), sms_provider_id: messageId, sms_error_code: null }
      : { sms_status: 'failed', sms_error_code: errorCode })
    .eq('id', claimed.id).eq('sms_status', 'sending').eq('sms_attempted_at', claimed.sms_attempted_at)
    .select('*').maybeSingle()
  if (update.error) throw new Error('SMS delivery outcome could not be saved.')
  return (update.data || claimed) as BobOrder
}
function requireOptional<T>(result:{data:T;error:{message:string}|null}):T {
  if(result.error) throw new Error('The SMS dispatch could not be claimed.')
  return result.data
}

export async function reconcileBobOrder(order: BobOrder, fetcher: typeof fetch = fetch): Promise<BobOrder> {
  if (order.status === 'paid') return deliverBobSms(order)
  if (!order.provider_id) return order
  let data: any
  try {
    const response = await fetcher('https://app.swifta.co.ke/poll/' + encodeURIComponent(order.provider_id), {
      headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000),
      redirect: 'error', cache: 'no-store'
    })
    if (!response.ok) return order
    data = await response.json()
  } catch { return order }
  const confirmed = parseBobPayment(data, order)
  const db = adminDb()
  if (confirmed.status === 'paid') {
    const paid = requireData(await db.rpc('bob_confirm_preorder', {
      p_order: order.id, p_provider: order.provider_id, p_receipt: confirmed.receipt, p_amount: BOB_PRICE_KSH
    })) as BobOrder
    return deliverBobSms(paid)
  }
  if (confirmed.status === 'failed' && order.status !== 'failed') {
    const result = await db.from('bob_preorders')
      .update({ status: 'failed', note: 'The payment was not completed. You can try again.' })
      .eq('id', order.id).neq('status','paid').select('*').maybeSingle()
    if(result.error) throw new Error('Payment result could not be recorded.')
    return (result.data || requireData(await db.from('bob_preorders').select('*').eq('id',order.id).single())) as BobOrder
  }
  return order
}

export async function processBobCallback(providerId: string, fetcher: typeof fetch = fetch): Promise<BobOrder | null> {
  const db = adminDb()
  const found = await db.from('bob_preorders').select('*').eq('provider_id', providerId).maybeSingle()
  if (found.error) throw new Error('Pre-order lookup failed.')
  let order = found.data as BobOrder | null
  if (!order) {
    // Callback may arrive before the STK response is saved. Never trust webhook
    // body fields: fetch reference and amount independently from Swifta.
    let response: Response
    try {
      response = await fetcher('https://app.swifta.co.ke/poll/' + encodeURIComponent(providerId), {
        headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000),
        redirect: 'error', cache: 'no-store'
      })
    } catch { return null }
    if (!response.ok) return null
    const data = await response.json()
    const payment = data?.transaction || data?.data || data
    const reference = payment?.accountReference || payment?.reference
    if (typeof reference !== 'string' || !reference.startsWith('RIENG-BOB-')) return null
    const candidate = await db.from('bob_preorders').select('*').eq('reference', reference).maybeSingle()
    if(candidate.error) throw new Error('Pre-order lookup failed.')
    if (!candidate.data || (candidate.data.provider_id && candidate.data.provider_id !== providerId)) return null
    const matched = { ...candidate.data, provider_id: providerId } as BobOrder
    if(parseBobPayment(data, matched).status !== 'paid') return null
    if (!candidate.data.provider_id) {
      const bound = await db.from('bob_preorders').update({ provider_id: providerId })
        .eq('id', matched.id).is('provider_id', null).neq('status', 'paid').select('*').maybeSingle()
      if(bound.error) throw new Error('Could not bind the M-Pesa checkout.')
      order = (bound.data || (await db.from('bob_preorders').select('*').eq('id', matched.id).maybeSingle()).data) as BobOrder | null
    } else order = matched
  }
  return order ? reconcileBobOrder(order, fetcher) : null
}
