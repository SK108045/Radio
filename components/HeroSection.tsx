import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight, Disc3, Headphones, Play, Radio, Tv } from 'lucide-react'
import styles from './HomeEnhancements.module.css'

const shortcuts = [
  { href: '#line-up', label: 'The line-up', detail: 'Find your next favourite show', icon: Radio },
  { href: '#trending', label: 'Trending now', detail: 'Stay in the loop', icon: Disc3 },
  { href: '#rieng-tv', label: 'RIENG TV', detail: 'Watch the latest sessions', icon: Tv },
]

export default function HeroSection() {
  return (
    <section className="relative pt-20 md:pt-28 overflow-hidden border-b border-white/10">
      {/* Background Image */}
      <div className={`absolute inset-0 z-0 ${styles.heroImage}`}>
        <Image 
          src="/KarteloandMiracleBaby.jpg"
          alt="Kartelo and Miracle Baby"
          fill
          priority
          className="object-cover object-top"
          quality={90}
          sizes="100vw"
        />
        {/* Dark overlay to maintain the dark theme */}
        <div className="absolute inset-0 bg-black/75 bg-gradient-to-t from-background via-black/50 to-background/30" />
      </div>
      <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${styles.heroGlow}`} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className={`${styles.heroEnter} inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-black/40 px-4 py-2 mb-6 backdrop-blur-md`}>
            <span aria-hidden="true" className={`h-2 w-2 rounded-full bg-primary ${styles.liveDot}`} />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-orange-200">Straight out of Nairobi. Always on.</span>
          </div>
          <h1 className={`${styles.heroEnter} text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-6 tracking-tight text-balance uppercase drop-shadow-xl`} style={{ animationDelay: '80ms' }}>
            Welcome to <span className="text-primary drop-shadow-[0_0_15px_rgba(255,107,53,0.5)]">RIENG</span>
          </h1>
          <p className={`${styles.heroEnter} text-lg md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto text-balance font-medium leading-relaxed drop-shadow`} style={{ animationDelay: '160ms' }}>
            The pulse of Kenyan youth culture. Sheng, comedy, podcasts, and the sickest live mixes. 
          </p>
          <div className={`${styles.heroEnter} flex flex-col sm:flex-row gap-3 justify-center`} style={{ animationDelay: '240ms' }}>
            <Link href="#live-player" className={`${styles.primaryButton} inline-flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 transition-all text-base shadow-lg shadow-primary/20 hover:-translate-y-1`}>
              <Headphones size={19} aria-hidden="true" />
              Tune In Live
              <span aria-hidden="true" className="flex items-center gap-0.5 h-4 ml-1">
                {[0, 1, 2, 3].map(i => <span key={i} className={styles.miniBar} style={{ animationDelay: `${i * -180}ms` }} />)}
              </span>
            </Link>
            <Link href="/dj-mix-sales" className="inline-flex items-center justify-center gap-3 bg-black/40 backdrop-blur-md border border-white/25 text-white px-8 py-4 rounded-full font-bold hover:border-primary hover:bg-primary/10 transition-all text-base hover:-translate-y-1">
              <Disc3 size={17} aria-hidden="true" />
              DJ MIX SALES
            </Link>
          </div>
          <Link href="#line-up" className={`${styles.heroEnter} inline-flex items-center gap-2 mt-7 mb-12 md:mb-16 text-xs font-medium text-gray-400 hover:text-white transition-colors`} style={{ animationDelay: '320ms' }}>
            Your next favourite is just a scroll away <ArrowDown size={14} aria-hidden="true" />
          </Link>
        </div>
        <nav aria-label="Explore the homepage" className={`${styles.heroEnter} grid sm:grid-cols-3 border-t border-white/10`} style={{ animationDelay: '400ms' }}>
          {shortcuts.map(({ href, label, detail, icon: Icon }) => (
            <Link key={href} href={href} className="group flex items-center gap-4 px-3 py-5 md:px-6 md:py-6 border-b sm:border-b-0 sm:border-r last:border-0 border-white/10 hover:bg-white/5 transition-colors">
              <span className="flex size-8 shrink-0 items-center justify-center text-primary group-hover:text-orange-200 transition-colors"><Icon size={19} aria-hidden="true" /></span>
              <span className="flex-1"><span className="block text-sm font-bold text-white">{label}</span><span className="block text-xs text-gray-400 mt-1">{detail}</span></span>
              <ArrowUpRight size={16} aria-hidden="true" className="text-gray-500 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
