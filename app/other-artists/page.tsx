'use client'

import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import {
  otherArtistsList,
  otherArtistTracks,
  artistReviews,
} from '@/lib/otherArtistsData'

// ─── Ticker Items ────────────────────────────────────────────────────────────
const tickerTags = [
  'Mr MAPEMA PRODUCER',
  'Ethic Entertainment',
  'Future Music Drops',
  'KSH 300 on Release',
  'Late ft. Moti the NRG',
  'Candy Date - Ethic',
  'Umechoma - Mbogi Sembe (Prod. Mr Mapema)',
  'Dropping in the Future',
]

// ─── Animated Counter Hook ────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const step = target / (duration / 16)
        let current = 0
        const timer = setInterval(() => {
          current += step
          if (current >= target) { setCount(target); clearInterval(timer) }
          else setCount(Math.floor(current))
        }, 16)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
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

export default function OtherArtistsPage() {
  const [hoveredSong, setHoveredSong] = useState<number | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'mr-mapema-producer' | 'ethic-entertainment'>('all')

  const filteredTracks = selectedFilter === 'all'
    ? otherArtistTracks
    : otherArtistTracks.filter(t => t.artistId === selectedFilter)

  return (
    <main className="min-h-screen bg-[#050505] selection:bg-primary selection:text-white overflow-x-hidden">
      <Navbar />

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
                  FUTURE MUSIC SPOTLIGHT · KSH 300
                </span>
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-[8.5rem] font-black text-white uppercase tracking-tighter leading-[0.88] mb-8">
                Other<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300 italic pr-4">
                  Artists Drops
                </span>
              </h1>
              
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl font-medium border-l-4 border-primary pl-6 leading-relaxed">
                Spotlight on upcoming future music and studio masters from <span className="text-white font-bold">Mr MAPEMA PRODUCER</span> and <span className="text-white font-bold">Ethic Entertainment</span>. These projects will be dropping for <span className="text-primary font-black">KSH 300</span> on release.
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
                  <span className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Status: In Studio</span>
                  <span className="text-white font-black text-sm">Future Releases</span>
                </div>
                <WaveformBars />
              </div>
              <div className="flex gap-3">
                <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                  3 Future Drops
                </span>
                <span className="bg-white/5 border border-white/10 text-white/60 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                  KSH 300 on Release
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
            <StatCard value={300} suffix=" KSH" label="Price on Release" color="bg-orange-500" />
            <StatCard value={3} suffix=" Drops" label="Upcoming Tracks" color="bg-primary" />
            <StatCard value={100} suffix="%" label="Unreleased Masters" color="bg-amber-500" />
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
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Key Hits &amp; Productions:</p>
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
                        <p className="text-white font-black text-base sm:text-lg">{artist.stats.listeners}</p>
                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Listeners</p>
                      </div>
                      <div className="border-x border-white/5">
                        <p className="text-white font-black text-base sm:text-lg">{artist.stats.hits}</p>
                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Catalog</p>
                      </div>
                      <div>
                        <p className="text-primary font-black text-base sm:text-lg">{artist.stats.status}</p>
                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Status</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/5 gap-4">
                    <button
                      onClick={() => {
                        setSelectedFilter(artist.id as any)
                        const el = document.getElementById('tracks-section')
                        el?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="bg-primary/10 hover:bg-primary border border-primary/30 hover:border-primary text-primary hover:text-white font-black uppercase tracking-widest text-xs px-6 py-3.5 rounded-full transition-all duration-300 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      View {artist.name.split(' ')[0]} Future Drops
                    </button>
                    <span className="text-white/30 text-xs font-bold uppercase tracking-wider">KSH 300 on Drop</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 3 FUTURE MUSIC DROPS (KSH 300) ── */}
      <section id="tracks-section" className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-white/5 pb-10 gap-6">
            <div>
              <span className="text-primary font-black uppercase tracking-[0.4em] text-xs block mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-primary inline-block"></span>
                Upcoming Catalog · 3 Future Drops
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
                Future <span className="italic text-primary pr-2">Music Drops</span>
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 border ${
                  selectedFilter === 'all'
                    ? 'border-primary bg-primary text-white shadow-[0_0_20px_rgba(255,107,53,0.4)]'
                    : 'border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                All Future Drops ({otherArtistTracks.length})
              </button>
              <button
                onClick={() => setSelectedFilter('mr-mapema-producer')}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 border ${
                  selectedFilter === 'mr-mapema-producer'
                    ? 'border-primary bg-primary text-white shadow-[0_0_20px_rgba(255,107,53,0.4)]'
                    : 'border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                Mr MAPEMA PRODUCER ({otherArtistTracks.filter(t => t.artistId === 'mr-mapema-producer').length})
              </button>
              <button
                onClick={() => setSelectedFilter('ethic-entertainment')}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 border ${
                  selectedFilter === 'ethic-entertainment'
                    ? 'border-primary bg-primary text-white shadow-[0_0_20px_rgba(255,107,53,0.4)]'
                    : 'border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                Ethic Entertainment ({otherArtistTracks.filter(t => t.artistId === 'ethic-entertainment').length})
              </button>
            </div>
          </div>

          {/* Track Cards */}
          <div className="flex flex-col gap-8">
            {filteredTracks.map((song, idx) => (
              <div
                key={song.id}
                onMouseEnter={() => setHoveredSong(song.id)}
                onMouseLeave={() => setHoveredSong(null)}
                className="group relative flex flex-col md:flex-row border border-white/8 hover:border-primary/50 rounded-[2rem] overflow-hidden transition-all duration-700 hover:shadow-[0_0_80px_rgba(255,107,53,0.15)] bg-[#080808]"
              >
                {/* Left image */}
                <div className="relative w-full md:w-80 lg:w-96 aspect-[4/3] md:aspect-auto flex-shrink-0 overflow-hidden">
                  <Image
                    src={song.image}
                    alt={song.title}
                    fill
                    className="object-cover transition-transform duration-[3s] group-hover:scale-110 opacity-70 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#080808] hidden md:block pointer-events-none"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] to-transparent md:hidden pointer-events-none"></div>
                  
                  {/* Tag badge */}
                  <span className="absolute top-5 left-5 bg-primary text-white text-[10px] font-black px-3.5 py-1.5 uppercase tracking-widest shadow-[0_0_20px_rgba(255,107,53,0.5)]">
                    {song.tag}
                  </span>

                  {/* Artist Tag on Card */}
                  <span className="absolute top-5 right-5 md:right-auto md:left-5 md:top-14 bg-black/70 backdrop-blur-md border border-white/10 text-white/80 text-[9px] font-black px-3 py-1 uppercase tracking-widest">
                    {song.artistName}
                  </span>

                  {/* Watermark Index */}
                  <span className="absolute bottom-4 right-4 text-[90px] font-black text-white/5 leading-none select-none pointer-events-none">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Right info */}
                <div className="flex flex-col justify-between flex-1 p-8 md:p-10 lg:p-12">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap mb-4">
                      <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] border border-primary/30 px-3 py-1 rounded-full bg-primary/5">
                        {song.genre}
                      </span>
                      <span className="text-white/30 font-bold uppercase tracking-[0.3em] text-[10px] border border-white/10 px-3 py-1 rounded-full">
                        {song.bpm}
                      </span>
                      <span className="text-white/30 font-bold uppercase tracking-[0.3em] text-[10px] border border-white/10 px-3 py-1 rounded-full">
                        {song.duration}
                      </span>
                      <span className="text-amber-400 font-bold uppercase tracking-[0.3em] text-[10px] border border-amber-400/20 px-3 py-1 rounded-full bg-amber-400/5">
                        {song.releaseDate}
                      </span>
                    </div>

                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-tight mb-2 group-hover:text-primary transition-colors duration-300">
                      {song.title}
                    </h3>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-6">
                      {song.feat}
                    </p>
                    <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl border-l-[3px] border-white/10 group-hover:border-primary/50 pl-5 transition-colors duration-300">
                      {song.desc}
                    </p>
                  </div>

                  {/* Animated waveform when hovered */}
                  <div className={`mt-6 transition-all duration-500 ${hoveredSong === song.id ? 'opacity-100 h-10' : 'opacity-0 h-0 overflow-hidden'}`}>
                    <WaveformBars />
                  </div>

                  {/* Price & Future Release Status Badge (No Buying Buttons) */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-10 pt-8 border-t border-white/5">
                    <div>
                      <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mb-1">Expected Release Price</p>
                      <p className="text-3xl md:text-4xl font-black text-white tracking-tighter group-hover:text-primary transition-colors duration-700">
                        {song.price}
                      </p>
                    </div>
                    
                    {/* Future Release Status Pill */}
                    <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-full text-white/80 text-xs font-black uppercase tracking-widest shadow-inner">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_10px_rgba(251,146,60,0.8)]"></span>
                      <span>Future Drop · Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECT BREAKDOWNS & REVIEWS ── */}
      <section className="py-24 border-t border-white/5 relative overflow-hidden bg-[#040404]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-end justify-between mb-16 border-b border-white/5 pb-10">
            <div>
              <span className="text-primary font-black uppercase tracking-[0.4em] text-xs block mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-primary inline-block"></span>
                Key Projects &amp; Masters
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
                Project <span className="italic text-primary pr-2">Breakdowns</span>
              </h2>
            </div>
            <p className="hidden md:block text-gray-500 font-bold text-sm max-w-xs text-right leading-relaxed">
              Reviews and breakdown of landmark projects by Mr MAPEMA PRODUCER and Ethic Entertainment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {artistReviews.map((rev, idx) => (
              <div
                key={idx}
                className="group relative bg-[#080808] border border-white/5 hover:border-primary/30 rounded-[2rem] p-8 md:p-12 flex flex-col justify-between gap-8 transition-all duration-500 hover:shadow-[0_0_50px_rgba(255,107,53,0.1)]"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-primary/70 font-black uppercase tracking-[0.3em] text-[10px] bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                      {rev.genre}
                    </span>
                    <span className="text-white/20 font-black text-xs">{rev.year}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-[1.1] mb-2 group-hover:text-primary transition-colors duration-300">
                    {rev.albumTitle}
                  </h3>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mb-6">{rev.artist}</p>
                  <p className="text-gray-300 text-base leading-relaxed italic">"{rev.review}"</p>
                </div>

                <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/5">
                  <span className="text-white/20 font-black text-xs uppercase tracking-widest">RIENG Rating</span>
                  <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
                    </svg>
                    <span className="text-white font-black text-sm">{rev.rating}<span className="text-gray-500 font-bold">/5</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keyframe Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
        @keyframes slideLine {
          from { opacity: 0.2; transform: translateX(-5%); }
          to   { opacity: 0.8; transform: translateX(5%); }
        }
      ` }} />

      <Footer />
    </main>
  )
}
