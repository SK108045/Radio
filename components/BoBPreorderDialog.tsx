'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, LoaderCircle, Smartphone, TicketCheck } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog'

type Order = {
  id: string; amount: number; status: 'created'|'pending'|'uncertain'|'failed'|'paid';
  reference: string; phoneLast4: string; note: string;
  receipt: string|null; code: string|null;
  smsStatus: 'pending'|'sending'|'sent'|'failed'|null;
}
type StatusReply = { ready?: boolean; order?: Order|null; error?: string }

export default function BoBPreorderDialog({ open, onOpenChange }: {
  open: boolean; onOpenChange: (next: boolean) => void
}) {
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState<Order|null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const current = useRef(true)

  const checkStatus = useCallback(async (initial = false) => {
    try {
      const response = await fetch('/api/releases/bob/checkout', { cache: 'no-store', credentials: 'same-origin' })
      const data = await response.json() as StatusReply
      if (!current.current) return
      if (!response.ok || !data.ready) {
        if (initial) { setReady(false); setError(data.error || 'Pre-orders are temporarily unavailable.') }
        return
      }
      setReady(true)
      if (data.order) setOrder(data.order)
      if (initial) setError('')
    } catch {
      if (current.current && initial) setError('Could not connect to the payment service. Try again shortly.')
    } finally {
      if (current.current && initial) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) { current.current = false; return }
    current.current = true
    setLoading(true)
    setReady(false)
    setError('')
    void checkStatus(true)
    const timer = window.setInterval(() => { void checkStatus() }, 4500)
    return () => { current.current = false; window.clearInterval(timer) }
  }, [open, checkStatus])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || !ready || order?.status === 'paid' || order?.status === 'pending' || order?.status === 'uncertain') return
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/releases/bob/checkout', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, attemptId: crypto.randomUUID() }),
      })
      const data = await response.json() as { order?: Order; error?: string }
      if (!response.ok || !data.order) throw new Error(data.error || 'Payment request failed.')
      if (current.current) setOrder(data.order)
    } catch (err) {
      if (current.current) setError(err instanceof Error ? err.message : 'Payment failed to start.')
    } finally {
      if (current.current) setSubmitting(false)
    }
  }

  const paid = order?.status === 'paid'
  const awaiting = order?.status === 'pending' || order?.status === 'uncertain'
  const smsText = order?.smsStatus === 'sent'
    ? 'Your SMS was accepted by Sozuri. Keep it as proof of your pre-order.'
    : order?.smsStatus === 'failed'
      ? 'Your payment is confirmed, but the SMS is delayed. Save the code below; we will retry sending it.'
      : 'Your confirmation SMS is being prepared. Save your unique code below.'

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto border-orange-500/25 bg-[#100b09] px-5 py-6 text-white shadow-[0_20px_100px_rgba(255,100,0,.15)] sm:max-w-md sm:p-8">
      <div className="flex items-center gap-3 border-b border-white/10 pb-5 pr-6">
        <div className="flex h-14 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-orange-500/10">
          <TicketCheck className="text-orange-400" aria-hidden="true" />
        </div>
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[.22em] text-orange-400">RIENG254 exclusive pre-order</p>
          <DialogTitle className="text-2xl font-black tracking-tight">BoB — SWAT × Unco Jing Jong</DialogTitle>
        </div>
      </div>
      <DialogDescription className="text-sm leading-6 text-neutral-300">
        Secure your copy for <strong className="text-white">KSh 150</strong>. Pay by M-Pesa STK push and receive a unique pre-order confirmation code by SMS.
      </DialogDescription>

      {loading ? <div className="flex items-center gap-3 py-6 text-sm text-orange-200"><LoaderCircle className="animate-spin" aria-hidden="true" /> Preparing secure checkout…</div>
      : paid ? <div className="space-y-5" role="status">
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
          <CheckCircle2 className="shrink-0 text-emerald-400" aria-hidden="true" />
          <div><strong className="block text-white">Pre-order confirmed!</strong><span className="text-xs text-emerald-100">KSh 150 payment received</span></div>
        </div>
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[.24em] text-orange-200">Your unique BoB code</p>
          <p className="mt-3 break-all font-mono text-2xl font-black tracking-wide text-orange-400">{order?.code}</p>
        </div>
        <p className="text-sm leading-6 text-neutral-300">{smsText}</p>
        {order?.receipt && <p className="text-xs text-neutral-400">M-Pesa receipt: <span className="font-mono text-neutral-100">{order.receipt}</span></p>}
        <p className="text-xs text-neutral-400">Sent to phone ending in {order?.phoneLast4}. Keep this code for release instructions.</p>
        <button type="button" onClick={() => onOpenChange(false)} className="w-full rounded-lg bg-orange-500 px-5 py-3 font-bold text-black hover:bg-orange-400">Done</button>
      </div>
      : awaiting ? <div className="space-y-5" role="status">
        <div className="flex items-center gap-3 rounded-xl border border-orange-500/25 bg-orange-500/10 p-4 text-orange-100">
          <LoaderCircle className="shrink-0 animate-spin text-orange-400" aria-hidden="true" />
          <span className="text-sm font-medium">Awaiting M-Pesa confirmation for KSh 150.</span>
        </div>
        <p className="text-sm leading-6 text-neutral-300">{order?.note || 'Check your phone and enter your M-Pesa PIN if prompted.'}</p>
        <p className="text-xs text-neutral-400">Phone ending {order?.phoneLast4} · Ref {order?.reference}</p>
        <p className="text-xs text-neutral-400">Checking securely every few seconds. You can close this window and check again later. Don’t pay twice while it is pending.</p>
        <button type="button" onClick={() => { void checkStatus() }} className="w-full rounded-lg border border-orange-500/40 px-4 py-3 font-semibold text-orange-200 hover:bg-orange-500/10">Check payment status</button>
      </div>
      : <form className="space-y-5" onSubmit={submit}>
        {order?.status === 'failed' && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">The earlier payment was not completed. You can request a new STK prompt.</p>}
        <div>
          <label htmlFor="bob-mpesa-phone" className="mb-2 block text-xs font-bold uppercase tracking-[.15em] text-neutral-300">M-Pesa phone number</label>
          <div className="relative">
            <Smartphone size={18} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
            <input id="bob-mpesa-phone" type="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="0712 345 678" required maxLength={25} disabled={!ready || submitting}
              className="w-full rounded-lg border border-white/20 bg-white/5 py-3 pl-10 pr-3 text-white outline-none placeholder:text-neutral-500 focus:border-orange-400 disabled:opacity-50" />
          </div>
        </div>
        <button type="submit" disabled={!ready || submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-4 font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
          {submitting ? 'Sending M-Pesa prompt…' : 'Pay KSh 150 via M-Pesa'}
        </button>
        <p className="text-center text-xs leading-5 text-neutral-400">Your pre-order code is generated only after payment is verified. No M-Pesa PIN is entered on this website.</p>
      </form>}
      {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
    </DialogContent>
  </Dialog>
}
