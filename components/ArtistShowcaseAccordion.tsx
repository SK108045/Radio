'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Disc3,
  Flame,
  Bell,
  Sparkles,
  Check,
  Zap,
  Headphones,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'

interface ArtistDrop {
  id: string
  name: string
  subtitle: string
  badge: string
  status: string
  accentColor: string
  glowColor: string
  description: string
  features: string[]
  primaryImage: string
  posterImage: string
  gallery: { src: string; label: string }[]
  merchLink?: string
}

const ARTIST_ROSTER: ArtistDrop[] = [
  {
    id: 'kapitani',
    name: 'Kapitani',
    subtitle: 'Heavyweight Lyricist & Street Icon',
    badge: 'Control Era Live',
    status: 'Club Master In Assembly',
    accentColor: 'from-orange-500 via-amber-500 to-yellow-500',
    glowColor: 'bg-orange-500/20',
    description:
      'Unapologetic flow and commanding street presence. The mastermind behind the Kitemeo and Control eras is compiling heavy-hitting DJ mix edits and direct studio stems built strictly for real sound systems and Nairobi nightlife.',
    features: [
      'Control Tape Mix Stems',
      'Kitemeo Club Edits',
      'Soundboard DJ Set',
      'Capsule Merch Pass',
    ],
    primaryImage: '/artists/kapitani/kapitani-stage-hero.png',
    posterImage: '/artists/kapitani/kapitani-poster-01.png',
    gallery: [
      { src: '/artists/kapitani/kapitani-stage-hero.png', label: 'Stage Spotlight' },
      { src: '/artists/kapitani/kapitani-poster-01.png', label: 'Capsule Poster' },
      { src: '/artists/kapitani/kapitani-poster-02.png', label: 'Studio Portrait' },
    ],
    merchLink: '/merch',
  },
  {
    id: 'metro-stunner',
    name: 'Metro Stunner',
    subtitle: 'Nairobi Next-Wave Selector & DJ',
    badge: 'Fresh Talent Spotlight',
    status: 'Debut Rieng Set Dropping Soon',
    accentColor: 'from-yellow-400 via-orange-500 to-red-600',
    glowColor: 'bg-yellow-500/20',
    description:
      'One of the fiercest selectors reshaping Nairobi underground dance floors. Fast transitions, heavyweight 808 drills, and seamless East African street rhythms compiled into a nonstop 60-minute peak-hour mix series.',
    features: [
      '60-Min Underground Mix',
      '808 Drill & Sheng Mashups',
      'Sound System EQ Mastered',
      'Instant Phone Download',
    ],
    primaryImage: '/artists/metro-stunner/metro-stunner-hero.png',
    posterImage: '/artists/metro-stunner/metro-stunner-poster.png',
    gallery: [
      { src: '/artists/metro-stunner/metro-stunner-hero.png', label: 'Selector Hero' },
      { src: '/artists/metro-stunner/metro-stunner-poster.png', label: 'Official Poster' },
    ],
  },
  {
    id: 'ethics-entertainment',
    name: 'Ethics Entertainment',
    subtitle: 'Gengetone Pioneers & Street Legends',
    badge: 'Official RIENG Partnership',
    status: 'Master Drops in Production',
    accentColor: 'from-red-600 via-orange-500 to-amber-500',
    glowColor: 'bg-red-500/20',
    description:
      'The iconic 4-man trailblazers (Rekles, Swat Mtoto wa Eunice, Seska, and Zilla) who sparked East Africa’s Gengetone revolution. Preparing unreleased master recordings, live festival soundboard cuts, and raw street DJ mixes exclusive to RIENG.',
    features: [
      'Unreleased Master Sessions',
      'Exclusive RIENG Soundboard Mix',
      '320kbps MP3 + 24-bit WAV',
      'Direct M-Pesa Drop',
    ],
    primaryImage: '/artists/ethics/ethics-entertainment-hero.png',
    posterImage: '/artists/ethics/ethics-entertainment-poster.png',
    gallery: [
      { src: '/artists/ethics/ethics-entertainment-hero.png', label: 'Widescreen Session' },
      { src: '/artists/ethics/ethics-entertainment-poster.png', label: 'Official Poster' },
      { src: '/artists/ethics/ethics-entertainment-studio.png', label: 'Studio Cut' },
    ],
    merchLink: '/merch',
  },
]

export function ArtistShowcaseAccordion() {
  const [activeArtistIndex, setActiveArtistIndex] = useState<number | null>(0)
  const [selectedPhotoMap, setSelectedPhotoMap] = useState<Record<string, string>>({
    kapitani: '/artists/kapitani/kapitani-poster-01.png',
    'metro-stunner': '/artists/metro-stunner/metro-stunner-poster.png',
    'ethics-entertainment': '/artists/ethics/ethics-entertainment-poster.png',
  })

  const [notificationContact, setNotificationContact] = useState('')
  const [notificationSubmitted, setNotificationSubmitted] = useState(false)
  const [selectedArtistForAlert, setSelectedArtistForAlert] = useState('All Artists')

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!notificationContact.trim()) return
    setNotificationSubmitted(true)
    setTimeout(() => {
      setNotificationContact('')
      setNotificationSubmitted(false)
    }, 4500)
  }

  const handleSelectPhoto = (artistId: string, photoSrc: string) => {
    setSelectedPhotoMap(prev => ({ ...prev, [artistId]: photoSrc }))
  }

  return (
    <>
      {/* ── CINEMATIC HERO HEADER ── */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 border-b border-white/5 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div>
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,107,53,0.15)]">
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_12px_rgba(255,107,53,1)]" />
                <span className="text-xs font-black uppercase tracking-[0.25em] text-orange-200">
                  Direct Artist Marketplace · Dropping Soon
                </span>
              </div>

              {/* Title */}
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem] font-black uppercase tracking-tighter leading-[0.9] text-white">
                DJ Mix
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-yellow-500 italic pr-6 drop-shadow-[0_0_40px_rgba(255,107,53,0.35)]">
                  Sales
                </span>
              </h1>
            </div>

            {/* Description & Value Proposition */}
            <div className="max-w-xl border-l-[3px] border-primary/50 pl-6 lg:mb-4">
              <p className="text-lg md:text-xl text-gray-300 font-medium leading-relaxed mb-4">
                Official audio releases, soundboard master recordings, and exclusive DJ sets directly from Nairobi’s top artists.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                <ShieldCheck size={16} /> 100% Direct Artist Royalties · Pure Master Quality
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <div className="p-3 sm:p-4">
              <span className="block text-2xl sm:text-3xl font-black text-white">03</span>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">Headlining Artists</span>
            </div>
            <div className="p-3 sm:p-4 border-l border-white/5">
              <span className="block text-2xl sm:text-3xl font-black text-primary">320K</span>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">MP3 / 24-Bit WAV Audio</span>
            </div>
            <div className="p-3 sm:p-4 border-l border-white/5">
              <span className="block text-2xl sm:text-3xl font-black text-orange-400">M-PESA</span>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">Instant 1-Tap Checkout</span>
            </div>
            <div className="p-3 sm:p-4 border-l border-white/5">
              <span className="block text-2xl sm:text-3xl font-black text-green-400">100%</span>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">Artist Direct Revenue</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE HEADLINE ACCORDION SECTION (SHOWS TECHNIQUE) ── */}
      <section className="relative z-20 py-20 md:py-28 overflow-hidden bg-[#020202]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Disc3 className="text-primary animate-spin [animation-duration:10s]" size={20} />
              </div>
              <div>
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                  Featured Artist Roster
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 font-medium">
                  Hover or tap any panel to reveal the upcoming session artwork and sound profile
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 font-bold">
              <span>Swipe / Hover to expand</span>
              <span className="text-primary font-black">→</span>
            </div>
          </div>

          {/* Interactive Sliding Accordion (Exact smooth technique from Weekend Shows) */}
          <div className="flex flex-col lg:flex-row gap-3 h-[850px] lg:h-[680px]">
            {ARTIST_ROSTER.map((artist, index) => {
              const isActive = activeArtistIndex === index
              const currentPoster = selectedPhotoMap[artist.id] || artist.posterImage

              return (
                <div
                  key={artist.id}
                  onMouseEnter={() => setActiveArtistIndex(index)}
                  className={`relative rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] flex-shrink-0 group border border-white/10 ${
                    isActive
                      ? 'lg:flex-[3.5] flex-[4] border-primary/40 shadow-[0_20px_60px_rgba(255,107,53,0.15)]'
                      : activeArtistIndex === null
                      ? 'lg:flex-1 flex-1'
                      : 'lg:flex-[0.55] flex-[0.5] hover:border-white/20'
                  }`}
                >
                  {/* Background Artist Image */}
                  <div className="absolute inset-0 bg-[#050505]">
                    <Image
                      src={artist.primaryImage}
                      alt={artist.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 1200px"
                      priority={index === 0}
                      className={`object-cover transition-all duration-[1500ms] ease-out ${
                        isActive
                          ? 'scale-105 opacity-80'
                          : 'scale-100 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60'
                      }`}
                    />
                    {/* Atmospheric Gradients */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-b from-[#020202]/30 via-[#020202]/60 to-[#020202] transition-opacity duration-700 ${
                        isActive ? 'opacity-100' : 'opacity-90'
                      }`}
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-[#020202]/90 via-transparent to-[#020202]/70 pointer-events-none`}
                    />
                  </div>

                  {/* Top-Right Index Pill */}
                  <div className="absolute top-6 right-6 z-20 pointer-events-none">
                    <span className="text-white/40 font-black text-xs sm:text-sm tracking-widest uppercase px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Inactive State: Vertical Bold Typography */}
                  <div
                    className={`absolute bottom-8 left-8 z-10 transition-all duration-500 flex flex-col items-start ${
                      isActive
                        ? 'opacity-0 translate-y-4 pointer-events-none'
                        : 'opacity-100 translate-y-0 delay-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 lg:hidden border border-white/20">
                      <span className="text-white text-xs font-black">{index + 1}</span>
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-2 hidden lg:block">
                      Upcoming Drop
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter [writing-mode:vertical-rl] lg:rotate-180 whitespace-nowrap hidden lg:block drop-shadow-lg">
                      {artist.name}
                    </h3>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter lg:hidden drop-shadow-xl">
                      {artist.name}
                    </h3>
                  </div>

                  {/* Active State: Rich Content & 3D Floating Poster */}
                  <div
                    className={`absolute inset-0 p-6 md:p-10 lg:p-12 flex flex-col justify-end z-20 transition-all duration-[800ms] ease-out ${
                      isActive
                        ? 'opacity-100 translate-y-0 delay-100 pointer-events-auto'
                        : 'opacity-0 translate-y-8 pointer-events-none'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 lg:gap-10 w-full">
                      
                      {/* Left: Artist Information & Bio */}
                      <div className="flex-1 w-full max-w-2xl">
                        
                        {/* Status Pills */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 text-primary px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                            {artist.badge}
                          </div>
                          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-gray-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                            <Sparkles size={12} className="text-yellow-400" />
                            {artist.status}
                          </div>
                        </div>

                        {/* Artist Title */}
                        <h3 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight mb-2 leading-[0.95] drop-shadow-2xl">
                          {artist.name}
                        </h3>
                        <p className="text-primary font-bold text-xs sm:text-sm uppercase tracking-widest mb-4">
                          {artist.subtitle}
                        </p>

                        {/* Bio Description */}
                        <p className="text-gray-200 text-sm sm:text-base leading-relaxed mb-6 drop-shadow font-medium max-w-xl">
                          {artist.description}
                        </p>

                        {/* Sound Features / Highlights */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {artist.features.map((feat, fIdx) => (
                            <span
                              key={fIdx}
                              className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-gray-300 uppercase tracking-wider border border-white/15"
                            >
                              ✓ {feat}
                            </span>
                          ))}
                        </div>

                        {/* Interactive Photo Switcher (Toggle Photoshoot Images) */}
                        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Photoshoot Angles:
                          </span>
                          <div className="flex items-center gap-2">
                            {artist.gallery.map((item, gIdx) => (
                              <button
                                key={gIdx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSelectPhoto(artist.id, item.src)
                                }}
                                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border ${
                                  currentPoster === item.src
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-105'
                                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/15'
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 mt-6">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedArtistForAlert(artist.name)
                              const el = document.getElementById('drop-alert-section')
                              el?.scrollIntoView({ behavior: 'smooth' })
                            }}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-full transition-all shadow-xl shadow-primary/25 hover:scale-105 active:scale-95"
                          >
                            <Bell size={14} /> Notify Me on Release
                          </button>

                          {artist.merchLink && (
                            <Link
                              href={artist.merchLink}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs uppercase tracking-widest px-5 py-3.5 rounded-full transition-all"
                            >
                              <ShoppingBag size={14} /> View Merch Capsule
                            </Link>
                          )}

                          <a
                            href="#tracks-section"
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white font-bold text-xs uppercase tracking-widest px-5 py-3.5 rounded-full transition-all"
                          >
                            Listen to Music Store ↓
                          </a>
                        </div>

                      </div>

                      {/* Right: Floating 3D Tilted Poster Card */}
                      <div
                        className={`hidden md:block w-48 lg:w-64 xl:w-72 aspect-[4/5] relative rounded-2xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.9)] border border-white/20 shrink-0 transform transition-all duration-[1000ms] ease-[cubic-bezier(0.25,1,0.5,1)] origin-bottom ${
                          isActive
                            ? 'translate-y-0 opacity-100 scale-100 lg:rotate-[-3deg] lg:hover:rotate-0 lg:hover:scale-105'
                            : 'translate-y-32 opacity-0 scale-75 rotate-12'
                        }`}
                      >
                        <Image
                          src={currentPoster}
                          alt={`${artist.name} Poster`}
                          fill
                          sizes="350px"
                          className="object-cover transition-all duration-700"
                        />
                        {/* Overlay Glass Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/15 pointer-events-none mix-blend-overlay" />
                        <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-center">
                          <span className="block text-[10px] font-black uppercase tracking-widest text-primary">
                            Rieng Master Vault
                          </span>
                          <span className="block text-xs font-black uppercase tracking-tight text-white truncate">
                            {artist.name}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ── DROP ALERT NOTIFICATION FORM ── */}
      <section
        id="drop-alert-section"
        className="relative py-20 border-t border-b border-white/5 bg-[#050505] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-orange-600/5 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="size-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
            <Bell size={28} className="text-primary animate-bounce" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4 text-white">
            Be First When The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-red-500 italic">Masters Drop</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
            These exclusive DJ sets and studio tracks are released in limited digital batches with instant M-Pesa access. Join the notification list so you don’t miss out.
          </p>

          <form
            onSubmit={handleNotifySubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto justify-center"
          >
            <input
              type="text"
              required
              placeholder="Enter your M-Pesa phone number or email..."
              value={notificationContact}
              onChange={(e) => setNotificationContact(e.target.value)}
              className="flex-1 bg-black/80 border border-white/20 rounded-full px-6 py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-full transition-all shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 shrink-0"
            >
              Get Alert
            </button>
          </form>

          {notificationSubmitted && (
            <div className="mt-4 inline-flex items-center gap-2 text-green-400 text-sm font-bold bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full animate-fade-in">
              <Check size={16} /> You&apos;re registered! We&apos;ll ping you the instant {selectedArtistForAlert} drops.
            </div>
          )}
        </div>
      </section>

      {/* ── WHY BUY DIRECT ON RIENG? ── */}
      <section className="py-20 md:py-28 bg-[#020202] border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-primary mb-3 block">
              The Rieng Standard
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-4">
              Direct Sound. Zero Middlemen.
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Why buying DJ mixes and tracks directly on RIENG changes the game for Nairobi artists.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all group">
              <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <Flame size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-3">
                100% Artist Direct
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Stream platforms pay pennies. On RIENG, every coin paid via M-Pesa goes directly into the artist&apos;s pocket, empowering genuine Nairobi independent music.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-orange-500/30 transition-all group">
              <div className="size-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6 text-orange-400 group-hover:scale-110 transition-transform">
                <Headphones size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-3">
                Uncompressed Masters
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                No lossy streaming compression. Download clean, full-dynamic 320kbps MP3 and pristine 24-bit studio WAV files designed to blow the roof off sound systems.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-yellow-500/30 transition-all group">
              <div className="size-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-6 text-yellow-400 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-3">
                Instant M-Pesa Checkout
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Pay in seconds via STK push. The high-speed download link generates right on your phone without annoying accounts or complex subscriptions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
