'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Smartphone, TicketCheck } from 'lucide-react'
import BoBPreorderDialog from '@/components/BoBPreorderDialog'

export default function BobTestCheckout() {
  const [open, setOpen] = useState(true)
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0807] px-5 py-16 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-orange-500/25 bg-[#1a100b] p-6 shadow-2xl sm:p-10">
        <p className="mb-3 text-xs font-black uppercase tracking-[.25em] text-orange-400">RIENG254 • Internal checkout test</p>
        <h1 className="text-4xl font-black tracking-tight">BoB payment test.</h1>
        <p className="mt-4 text-sm leading-7 text-neutral-300">
          A real <strong className="text-white">KSh 1 M-Pesa</strong> payment checks the BoB Swifta checkout,
          generates a clearly marked test code, and submits a confirmation SMS through Sozuri.
          <strong className="mt-2 block text-orange-300">This does NOT reserve a BoB copy.</strong>
        </p>
        <button type="button" onClick={() => setOpen(true)} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-4 font-black text-black hover:bg-orange-400">
          <Smartphone size={20} aria-hidden="true" /> Test with KSh 1
        </button>
        <div className="mt-6 flex items-center gap-2 text-xs text-neutral-400">
          <TicketCheck size={16} aria-hidden="true" /> Only approve the STK prompt if you intend to send KSh 1.
        </div>
        <Link href="/" className="mt-7 inline-flex items-center gap-2 text-sm text-orange-200 hover:text-white"><ArrowLeft size={16} aria-hidden="true" /> Back to Rieng254</Link>
      </div>
      <BoBPreorderDialog open={open} onOpenChange={setOpen} testMode />
    </main>
  )
}
