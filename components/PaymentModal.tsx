'use client'

import { useState, useEffect } from 'react'

interface Song {
  id: string | number
  title: string
  feat: string
  price: string
  priceNum: number
  genre: string
  image: string
  downloadUrl: string
  fileName: string
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  song: Song | null
  onSuccessUnlock?: (trackId: string, token: string, expiresAt: number) => void
  callbackPath?: string
}

export default function PaymentModal({ isOpen, onClose, song, onSuccessUnlock, callbackPath }: PaymentModalProps) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [animateIn, setAnimateIn] = useState(false)
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details')
  const [payUrl, setPayUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => setAnimateIn(true), 10)
    } else {
      document.body.style.overflow = 'unset'
      setAnimateIn(false)
      setTimeout(() => {
        setStep('details')
        setPhone('')
        setError('')
        setPayUrl(null)
      }, 400)
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  const handleClose = () => {
    setAnimateIn(false)
    setTimeout(onClose, 400)
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!song) return

    const cleaned = phone.replace(/\s+/g, '')
    if (!/^(07|01|\+2547|\+2541)\d{8,9}$/.test(cleaned)) {
      setError('Please enter a valid Kenyan phone number (e.g. 0712345678)')
      return
    }

    setError('')
    setStep('processing')

    const fakeEmail = `${cleaned.replace('+', '')}@riengmusicstore.co.ke`
    const targetPath = callbackPath || (typeof window !== 'undefined' ? window.location.pathname : '/other-artists')
    const callbackUrl = `${window.location.origin}${targetPath}?payment=success&trackId=${encodeURIComponent(String(song.id))}`

    try {
      // 1. Initialize transaction directly on server (fast, reliable)
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fakeEmail,
          amount: song.priceNum,
          songTitle: song.title,
          songId: String(song.id),
          phone: cleaned,
          callbackUrl,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.authorization_url) {
        throw new Error(data.error || 'Could not initialize payment gateway. Please check connection.')
      }

      setPayUrl(data.authorization_url)

      // 2. Redirect to Paystack's official secure checkout (instant M-Pesa STK push & Card gateway)
      window.location.href = data.authorization_url
    } catch (err: any) {
      console.error('Payment initialization error:', err)
      setError(err?.message || 'Payment service error. Please try again.')
      setStep('details')
    }
  }

  if (!isOpen || !song) return null

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={handleClose} />

      {/* Modal Card */}
      <div className={`relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_120px_rgba(255,107,53,0.15)] z-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${animateIn ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}>

        {/* Top glow accent */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

        {/* Close */}
        <button onClick={handleClose} className="absolute top-5 right-5 z-50 w-10 h-10 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Song Header */}
        <div className="border-b border-white/8 p-6 flex items-center gap-4 bg-white/2">
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 bg-[#111]">
            <img src={song.image} alt={song.title} className="w-full h-full object-cover opacity-80" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-0.5">{song.genre}</p>
            <h3 className="text-white font-black text-lg uppercase tracking-tight truncate">{song.title}</h3>
            <p className="text-white/30 text-xs font-bold truncate">{song.feat}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-0.5">Price</p>
            <p className="text-white font-black text-2xl tracking-tight">{song.price}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">

          {/* ── Step: Enter Phone ── */}
          {step !== 'success' && (
            <form onSubmit={handlePay} className="space-y-6">
              <div>
                <p className="text-white font-black text-xl uppercase tracking-tight mb-1">Unlock Full Track</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Enter your M-Pesa phone number to unlock <strong className="text-primary">15-minute full streaming access</strong> on the player.
                </p>
              </div>

              <div>
                <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] block mb-2">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 font-bold text-sm">🇰🇪</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setError('') }}
                    placeholder="0712 345 678"
                    required
                    disabled={step === 'processing'}
                    className="w-full bg-white/5 border border-white/10 focus:border-primary/60 focus:bg-white/8 rounded-xl pl-12 pr-5 py-4 text-white placeholder-white/20 font-medium outline-none transition-all duration-300 text-sm tracking-widest disabled:opacity-50"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm font-medium flex items-center gap-3">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  {error}
                </div>
              )}

              {/* Accepted methods */}
              <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-white/5">
                <span className="text-white/20 text-[9px] font-black uppercase tracking-widest">Pay via:</span>
                {['M-Pesa', 'Card', 'USSD', 'Bank'].map(m => (
                  <span key={m} className="text-[9px] font-black text-white/30 border border-white/8 px-2.5 py-1 rounded-lg uppercase tracking-wider">{m}</span>
                ))}
              </div>

              <button
                type="submit"
                disabled={step === 'processing'}
                className="w-full bg-primary hover:bg-primary/80 disabled:bg-primary/50 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-sm shadow-[0_0_30px_rgba(255,107,53,0.25)] hover:shadow-[0_0_50px_rgba(255,107,53,0.45)] cursor-pointer"
              >
                {step === 'processing' ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Opening Secure M-Pesa Checkout...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Pay {song.price} to Unlock
                  </>
                )}
              </button>

              {/* Direct Link fallback if popups take time */}
              {payUrl && (
                <div className="text-center pt-2">
                  <a
                    href={payUrl}
                    className="text-xs text-primary underline font-bold"
                  >
                    Click here if checkout does not open automatically →
                  </a>
                </div>
              )}

              <p className="text-center text-white/15 text-[10px] font-bold">Secured by Paystack · 256-bit SSL Encryption</p>
            </form>
          )}

          {/* ── Step: Success + Unlocked ── */}
          {step === 'success' && (
            <div className="flex flex-col items-center text-center gap-6 py-6">
              <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="text-white font-black text-2xl uppercase tracking-tight mb-2">Access Pass Unlocked! 🔥</p>
                <p className="text-gray-300 text-sm leading-relaxed mb-2">
                  You now have <strong className="text-emerald-400">15 minutes of unrestricted full streaming access</strong> on the player!
                </p>
              </div>
              <button
                onClick={handleClose}
                className="bg-primary hover:bg-white text-white hover:text-black font-black uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 flex items-center gap-3 text-sm shadow-[0_0_30px_rgba(255,107,53,0.3)]"
              >
                <span>Listen to Full Track Now</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
