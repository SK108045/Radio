'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Check, Copy, Headphones, Share2, Ticket } from 'lucide-react'
import BoBPreorderDialog from '@/components/BoBPreorderDialog'

export default function BobPreorderPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  async function sharePage() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BoB — SWAT × Unco Jing Jong | RIENG254',
          text: 'Pre-order BoB for KSh 150. Pay securely with M-Pesa and get your unique confirmation code by SMS.',
          url,
        })
        return
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      window.prompt('Copy this BoB pre-order link:', url)
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      window.prompt('Copy this BoB pre-order link:', window.location.href)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#090807] text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(255,105,20,.18),transparent_38%),radial-gradient(ellipse_at_10%_80%,rgba(255,105,20,.08),transparent_35%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <a href="/" className="text-sm font-black tracking-[.28em] text-white">RIENG<span className="text-orange-500">254</span></a>
          <span className="rounded-full border border-orange-400/25 bg-orange-400/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.18em] text-orange-200">Exclusive pre-order</span>
        </header>

        <section className="grid flex-1 items-center gap-10 py-9 md:grid-cols-[1fr_.78fr] md:gap-16 md:py-14">
          <div className="order-2 md:order-1">
            <p className="mb-5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.22em] text-orange-400">
              <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_18px_rgba(255,115,26,.8)]" />
              New music · Coming soon
            </p>
            <h1 className="text-6xl font-black uppercase leading-[.86] tracking-[-.075em] sm:text-8xl">BoB<span className="text-orange-500">.</span></h1>
            <p className="mt-5 text-lg font-black uppercase tracking-[.06em] sm:text-xl">SWAT <span className="text-orange-500">×</span> Unco Jing Jong</p>
            <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-300 sm:text-base">
              Two voices. One new drop. Lock in your pre-order for BoB and be ready for the release.
              Pay with M-Pesa STK Push and receive your unique confirmation code by SMS after payment is confirmed.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={() => setCheckoutOpen(true)} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-md bg-orange-500 px-6 py-4 text-sm font-black text-[#190b03] transition hover:bg-orange-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300">
                <Ticket size={19} aria-hidden="true" /> Pre-Order Now · KSh 150
              </button>
              <button onClick={sharePage} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md border border-white/20 px-5 py-4 text-sm font-bold transition hover:border-orange-400/60 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300">
                <Share2 size={17} aria-hidden="true" /> Share
              </button>
              <button onClick={copyLink} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md px-3 py-4 text-sm font-semibold text-neutral-300 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300">
                {copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
                {copied ? 'Link copied' : 'Copy link'}
              </button>
            </div>

            <div className="mt-9 grid max-w-lg grid-cols-3 border-y border-white/10 py-4">
              <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-neutral-500">Price</p><p className="mt-1 text-sm font-extrabold">KSh 150</p></div>
              <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-neutral-500">Payment</p><p className="mt-1 text-sm font-extrabold">M-Pesa</p></div>
              <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-neutral-500">Confirmation</p><p className="mt-1 text-sm font-extrabold">SMS code</p></div>
            </div>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[.2em] text-neutral-600"><Headphones className="mr-2 inline-block" size={14} aria-hidden="true" /> Music · Culture · Kenya</p>
          </div>

          <div className="order-1 mx-auto w-full max-w-sm md:order-2 md:max-w-none">
            <div className="relative rounded-sm bg-gradient-to-br from-orange-400 via-orange-950 to-orange-600 p-1.5 shadow-[0_24px_90px_rgba(255,90,0,.19)]">
              <Image
                src="/releases/bob-swat-unco-jing-jong.webp"
                alt="BoB by SWAT and Unco Jing Jong — upcoming release"
                width={1024}
                height={1536}
                priority
                sizes="(max-width: 768px) 88vw, 42vw"
                className="block h-auto w-full bg-[#100c09]"
              />
            </div>
            <p className="mt-4 text-center text-[10px] font-extrabold uppercase tracking-[.24em] text-neutral-500">RIENG254 presents · BoB</p>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[10px] font-semibold uppercase tracking-[.15em] text-neutral-600">
          <span>© RIENG254</span>
          <a href="/" className="transition hover:text-orange-300">Visit RIENG254.com</a>
        </footer>
      </div>

      <BoBPreorderDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </main>
  )
}
