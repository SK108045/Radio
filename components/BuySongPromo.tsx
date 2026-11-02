import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function BuySongPromo() {
  return (
    <section className="bg-[#ff6b35] text-[#16120f] py-10 md:py-14 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-7">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Support the sound</p>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-[-0.055em] leading-none">Good music.<br /><span className="font-serif italic font-normal normal-case">Keep it.</span></h2>
        </div>
        <div className="sm:max-w-xs md:max-w-sm sm:border-l border-black/20 sm:pl-8">
          <p className="text-sm md:text-base leading-relaxed mb-5">Find your favourite Kenyan projects. Support the artists. Make them part of your collection.</p>
          <Link href="/albums" className="inline-flex items-center gap-3 text-sm font-bold border-b border-black/50 pb-2 hover:gap-5 transition-all">Browse the catalogue <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  )
}
