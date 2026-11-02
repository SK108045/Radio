'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { Flame, Radio } from 'lucide-react'

export default function EthicsPage() {
  return (
    <main className="min-h-screen bg-[#050505] selection:bg-primary selection:text-white text-white flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      {/* ── HERO SECTION WITH LANDING PAGE PHOTO & FADED OVERLAY ── */}
      <section className="relative py-20 md:py-32 overflow-hidden flex-1 flex items-center justify-center border-b border-white/5">
        {/* Background Image (Same as Landing Page) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/KarteloandMiracleBaby.jpg"
            alt="RIENG"
            fill
            priority
            className="object-cover object-top"
            quality={90}
          />
          {/* Fading Dark Gradient Overlays matching HomePage */}
          <div className="absolute inset-0 bg-black/80 bg-gradient-to-t from-[#050505] via-black/65 to-[#050505]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-transparent to-[#050505]/90" />
        </div>

        {/* Floating Centered Content Box */}
        <div className="relative z-10 max-w-3xl sm:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <div className="bg-black/75 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 sm:p-10 md:p-14 shadow-[0_0_100px_rgba(0,0,0,0.85)] relative overflow-hidden">
            {/* Top subtle glow line */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Partnership Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 text-primary px-4 py-1.5 rounded-full mb-6 shadow-[0_0_20px_rgba(255,107,53,0.2)]">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                Official Partnership · Ethics Entertainment × RIENG
              </span>
            </div>

            {/* Title - Scaled properly to fit smoothly within the container */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-tight mb-5 drop-shadow-2xl">
              Ethics<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-red-500 italic inline-block">
                Entertainment
              </span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-xl mx-auto font-medium leading-relaxed mb-8 drop-shadow">
              <strong className="text-white">Ethics Entertainment</strong> is partnering exclusively with <strong className="text-white">RIENG</strong> for future releases, unreleased studio masters, and direct drops.
            </p>

            {/* Faded Teaser Box */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-7 max-w-lg mx-auto mb-8 backdrop-blur-md">
              <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-[0.25em] text-[11px] mb-2">
                <Flame className="w-4 h-4" />
                <span>Future Releases</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-2">
                New Releases Coming Soon
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Stay tuned to RIENG for release schedules, premiere listening sessions, and official drop dates.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8">
              <Link
                href="/shows"
                className="w-full sm:w-auto bg-primary hover:bg-white text-white hover:text-black transition-all duration-300 px-7 py-3.5 rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,107,53,0.35)] hover:-translate-y-0.5"
              >
                <Radio className="w-4 h-4" />
                Tune In To Live Shows
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-7 py-3.5 rounded-full font-black uppercase tracking-widest text-xs transition-all hover:-translate-y-0.5"
              >
                Back To Main Station
              </Link>
            </div>

            {/* ── BONIFACE MWANGI KANYINGI (Only once at the bottom) ── */}
            <div className="pt-5 border-t border-white/10 text-center">
              <p className="text-[11px] font-bold text-gray-400 tracking-[0.25em] uppercase select-none">
                BONIFACE MWANGI KANYINGI
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
