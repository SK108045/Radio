'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { otherArtistsList } from '@/lib/otherArtistsData'
import type { CatalogTrack } from '@/lib/sales-catalog'

// Restored presentation from the original app/other-artists page (697c3ca).
const tickerTags = [
  'Mr MAPEMA PRODUCER', 'Ethic Entertainment', '30s Free Audio Previews',
  '12-Hour Full Access Passes', 'Instant M-Pesa Streaming',
  "Direct From Kenya's Hitmakers", 'RIENG Music Store',
]

// ─── Animated Counter Hook ────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let started = false
    let timer: ReturnType<typeof setInterval> | undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        started = true
        const step = target / (duration / 16)
        let current = 0
        timer = setInterval(() => {
          current += step
          if (current >= target) { setCount(target); clearInterval(timer) }
          else setCount(Math.floor(current))
        }, 16)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => { observer.disconnect(); if (timer) clearInterval(timer) }
  }, [target, duration])

  return { count, ref }
}

// ─── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({ value, suffix, label, color }: { value: number; suffix: string; label: string; color: string }) {
  const { count, ref } = useCounter(value)
  return (
    <div ref={ref} className="group relative bg-[#080808] border border-white/5 rounded-[1.5rem] p-8 overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,107,53,0.08)]">
      <div className={`absolute top-0 right-0 w-32 h-32 ${color} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity rounded-full pointer-events-none`}></div>
      <p className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-2">
        {count.toLocaleString()}<span className="text-primary">{suffix}</span>
      </p>
      <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">{label}</p>
    </div>
  )
}

// ─── Waveform Bars Component ──────────────────────────────────────────────────
function WaveformBars() {
  return (
    <div className="flex items-end gap-[3px] h-8">
      {[4, 8, 3, 9, 6, 10, 5, 8, 4, 9, 7, 3, 10, 6, 4, 8, 5, 9, 3, 7].map((h, i) => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full opacity-75"
          style={{
            height: `${h * 10}%`,
            animation: `wave ${0.6 + (i % 5) * 0.15}s ease-in-out ${i * 0.05}s infinite alternate`
          }}
        />
      ))}
    </div>
  )
}

export function DJSalesIntro({ tracks }: { tracks: CatalogTrack[] }) {
  const [selectedFilter,setSelectedFilter] = useState('all')
  return <div id="dj-sales-intro">
      {/* ── HERO ── */}
      <section className="relative pt-28 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[750px] h-[750px] bg-primary/10 blur-[150px] rounded-full pointer-events-none"></div>
        
        {/* Ambient Grid Lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent w-full"
              style={{ top: `${15 + i * 20}%`, animation: `slideLine ${3 + i}s ease-in-out ${i * 0.4}s infinite alternate` }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-end justify-between">
            <div className="flex-1">
              
              {/* Back to Albums & Badge */}
              <div className="flex items-center gap-4 flex-wrap mb-6">
                <Link
                  href="/albums"
                  className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-300 group"
                >
                  <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Albums
                </Link>
                <span className="text-primary font-black uppercase tracking-[0.3em] text-xs flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  30S FREE PREVIEW · 12-HOUR STREAMING PASS · M-PESA
                </span>
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-[8.5rem] font-black text-white uppercase tracking-tighter leading-[0.88] mb-8">
                Other<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300 italic pr-4">
                  Artists Drops
                </span>
              </h1>
              
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl font-medium border-l-4 border-primary pl-6 leading-relaxed">
                Enjoy <span className="text-white font-bold">30 seconds of free audio preview</span> on every release. Unlock full 12-hour streaming access with M-Pesa.
              </p>

              {/* Quick Jump Buttons */}
              <div className="flex items-center gap-4 mt-8 flex-wrap">
                <a
                  href="#tracks-section"
                  onClick={() => setSelectedFilter('mr-mapema-producer')}
                  className="bg-white/5 hover:bg-primary border border-white/10 hover:border-primary text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg"
                >
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                  Mr MAPEMA PRODUCER
                </a>
                <a
                  href="#tracks-section"
                  onClick={() => setSelectedFilter('ethic-entertainment')}
                  className="bg-white/5 hover:bg-primary border border-white/10 hover:border-primary text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-full transition-all duration-300 flex items-center gap-2 shadow-lg"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Ethic Entertainment
                </a>
              </div>
            </div>

            {/* Live Audio Visualizer Card */}
            <div className="flex flex-col items-end gap-4">
              <div className="bg-[#080808] border border-white/10 rounded-2xl px-6 py-5 flex items-center gap-5 shadow-2xl">
                <div className="flex flex-col">
                  <span className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Catalog Status</span>
                  <span className="text-white font-black text-sm">30s Preview &amp; Unlock</span>
                </div>
                <WaveformBars />
              </div>
              <div className="flex gap-3">
                <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                  {tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'} Live
                </span>
                <span className="bg-white/5 border border-white/10 text-white/60 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                  M-Pesa Instant Unlock
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="w-full overflow-hidden bg-[#080808] border-y border-white/5 py-4 flex whitespace-nowrap">
        <div className="marquee-left flex items-center min-w-max">
          {[...tickerTags, ...tickerTags, ...tickerTags, ...tickerTags].map((tag, i) => (
            <span key={i} className="text-white/30 font-black uppercase tracking-[0.3em] text-xs mx-6 flex items-center gap-6">
              {tag} <span className="w-1.5 h-1.5 bg-primary/60 rounded-full inline-block"></span>
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard value={2} suffix=" Artists" label="Featured Creators" color="bg-primary" />
            <StatCard value={tracks.length} suffix=" Tracks" label="Live in Store" color="bg-orange-500" />
            <StatCard value={30} suffix=" Sec" label="Free Audio Preview" color="bg-amber-500" />
            <StatCard value={12} suffix=" Hrs" label="Full Access Pass" color="bg-primary" />
          </div>
        </div>
      </section>

      {/* ── ARTIST PROFILES ── */}
      <section className="py-20 border-b border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-14">
            <span className="text-primary font-black uppercase tracking-[0.4em] text-xs block mb-3 flex items-center gap-3">
              <span className="w-8 h-px bg-primary inline-block"></span>
              Featured Heavyweights
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
              Artist <span className="italic text-primary pr-2">Profiles</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {otherArtistsList.map((artist) => {
              const isSelected = selectedFilter === artist.id
              const artistTrackCount = tracks.filter(t => t.artist === artist.name).length

              return (
                <div
                  key={artist.id}
                  className={`group relative bg-[#080808] border rounded-[2.5rem] overflow-hidden transition-all duration-700 p-8 md:p-10 flex flex-col justify-between ${
                    isSelected ? 'border-primary shadow-[0_0_50px_rgba(255,107,53,0.15)]' : 'border-white/8 hover:border-primary/40'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors"></div>

                  <div>
                    {/* Top Row */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/10 flex-shrink-0 group-hover:border-primary/50 transition-colors shadow-2xl">
                        <Image
                          src={artist.image}
                          alt={artist.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="inline-block bg-primary/15 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                          {artist.badge}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                          {artist.name}
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wider">{artist.role}</p>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8 border-l-2 border-primary/30 pl-4">
                      {artist.bio}
                    </p>

                    {/* Popular tracks list */}
                    <div className="mb-6">
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Catalog Anthems:</p>
                      <div className="flex gap-2 flex-wrap">
                        {artist.popularTracks.map((pt, i) => (
                          <span key={i} className="text-xs font-bold text-white/80 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                            {pt}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-3 gap-3 mb-8 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center">
                      <div>
                        <p className="text-white font-black text-base sm:text-lg">{artistTrackCount}</p>
                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Published Tracks</p>
                      </div>
                      <div className="border-x border-white/5">
                        <p className="text-white font-black text-base sm:text-lg">{artistTrackCount} Tracks</p>
                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">In Store</p>
                      </div>
                      <div>
                        <p className="text-primary font-black text-base sm:text-lg">{artistTrackCount ? 'Available' : 'No releases yet'}</p>
                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Status</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/5 gap-4">
                    <button
                      onClick={() => {
                        setSelectedFilter(artist.id)
                        const el = document.getElementById('tracks-section')
                        el?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="bg-primary/10 hover:bg-primary border border-primary/30 hover:border-primary text-primary hover:text-white font-black uppercase tracking-widest text-xs px-6 py-3.5 rounded-full transition-all duration-300 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      View {artist.name.split(' ')[0]} Releases ({artistTrackCount})
                    </button>
                    <span className="text-white/30 text-xs font-bold uppercase tracking-wider">Direct Store</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

    <style>{`
      @keyframes wave {
        from { transform: scaleY(0.4); }
        to { transform: scaleY(1); }
      }
      @keyframes slideLine {
        from { opacity: 0.2; transform: translateX(-5%); }
        to { transform: scaleY(1); }
      }
      @media (prefers-reduced-motion: reduce) {
        #dj-sales-intro [style*="animation"], #dj-sales-intro .marquee-left {
          animation: none !important;
        }
      }
    `}</style>
  </div>
}
