'use client'

import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import PaymentModal from '@/components/PaymentModal'
import {
  otherArtistsList,
  artistReviews,
  OtherArtistTrack,
} from '@/lib/otherArtistsData'
import { supabase } from '@/lib/supabase'

// ─── Ticker Items ────────────────────────────────────────────────────────────
const tickerTags = [
  'Mr MAPEMA PRODUCER',
  'Ethic Entertainment',
  '15s Free Audio Previews',
  '15-Minute Full Access Passes',
  'Instant M-Pesa Streaming',
  'Direct From Kenya\'s Hitmakers',
  'RIENG Music Store',
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

interface UnlockedSession {
  token: string
  expiresAt: number
}

const PREVIEW_DURATION_SECONDS = 15

export default function OtherArtistsPage() {
  const [hoveredSong, setHoveredSong] = useState<string | number | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'mr-mapema-producer' | 'ethic-entertainment'>('all')
  const [tracks, setTracks] = useState<OtherArtistTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSongForBuy, setSelectedSongForBuy] = useState<any>(null)
  
  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | number | null>(null)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [previewNotification, setPreviewNotification] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 15-Minute Unlocked Sessions map: { [trackId]: { token, expiresAt } }
  const [unlockedMap, setUnlockedMap] = useState<Record<string, UnlockedSession>>({})
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(Date.now())

  // ── Load unlocked tokens from localStorage ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rieng_unlocked_tracks')
      if (saved) {
        const parsed: Record<string, UnlockedSession> = JSON.parse(saved)
        const now = Date.now()
        const active: Record<string, UnlockedSession> = {}
        for (const [id, session] of Object.entries(parsed)) {
          if (session.expiresAt > now) {
            active[id] = session
          }
        }
        setUnlockedMap(active)
      }
    } catch {
      // ignore
    }
  }, [])

  // ── 1-Second Timer for Live Countdown Tickers ──
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      setCurrentTimeMs(now)
      setUnlockedMap((prev) => {
        let changed = false
        const updated: Record<string, UnlockedSession> = {}
        for (const [id, session] of Object.entries(prev)) {
          if (session.expiresAt > now) {
            updated[id] = session
          } else {
            changed = true
          }
        }
        if (changed) {
          try {
            localStorage.setItem('rieng_unlocked_tracks', JSON.stringify(updated))
          } catch {}
          return updated
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // ── Handle Return from Paystack Redirect (URL Query Params) ──
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const payment = params.get('payment')
    const ref = params.get('reference') || params.get('trxref')
    const trackId = params.get('trackId')

    if (payment === 'success' && ref && trackId) {
      window.history.replaceState({}, '', '/other-artists')

      fetch('/api/access/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref, trackId }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.token) {
            handleUnlockSuccess(trackId, data.token, data.expiresAt)
            setPreviewNotification('Payment Successful! 15-Minute Full Access Pass Unlocked.')
            setTimeout(() => setPreviewNotification(null), 6000)
          }
        })
        .catch((e) => console.warn('Callback verify error:', e))
    }
  }, [tracks])

  // ── Sync ONLY Real Tracks from Supabase Database ──
  useEffect(() => {
    async function fetchLiveTracks() {
      try {
        const { data: dbTracks, error } = await supabase
          .from('tracks')
          .select('id, title, description, price_ksh, mp3_file_path, created_at, artist_id, artists(stage_name)')
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('Could not fetch dynamic tracks:', error)
          setLoading(false)
          return
        }

        if (dbTracks && dbTracks.length > 0) {
          const mapemaDbId = '33333333-3333-3333-3333-333333333334'
          const ethicDbId = '33333333-3333-3333-3333-333333333333'

          const list: OtherArtistTrack[] = dbTracks.map((t: any) => {
            const isMapema = t.artist_id === mapemaDbId
            const isEthic = t.artist_id === ethicDbId

            let artistSlug = 'other-creators'
            let artistName = t.artists?.stage_name || 'Kenyan Creator'
            let image = '/Banner.jpg'
            let genre = 'Kenyan Urban'
            let feat = t.artists?.stage_name || 'Kenyan Creator'

            if (isMapema) {
              artistSlug = 'mr-mapema-producer'
              artistName = 'Mr MAPEMA PRODUCER'
              image = '/Studio.jpg'
              genre = 'Arbantone / Hip-Hop'
              feat = `Produced by Mr. Mapema · ${t.artists?.stage_name || 'Mr MAPEMA PRODUCER'}`
            } else if (isEthic) {
              artistSlug = 'ethic-entertainment'
              artistName = 'Ethic Entertainment'
              image = '/Group.jpg'
              genre = 'Gengetone'
              feat = `Ethic Entertainment · ${t.artists?.stage_name || 'Ethic'}`
            }

            return {
              id: t.id,
              artistId: artistSlug,
              artistDbId: t.artist_id,
              artistName,
              title: t.title,
              feat,
              desc: t.description || `Official audio release by ${artistName} on the RIENG Store.`,
              price: `KSH ${t.price_ksh}`,
              priceNum: Number(t.price_ksh),
              genre,
              image,
              tag: 'Available Now 🔥',
              bpm: '125 BPM',
              duration: '3:20',
              releaseDate: 'Instant Streaming',
              status: 'Available Now',
              downloadUrl: t.mp3_file_path,
              isLive: true,
            }
          })

          setTracks(list)
        } else {
          setTracks([])
        }
      } catch (err) {
        console.error('Error querying live tracks:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLiveTracks()
  }, [])

  const filteredTracks = selectedFilter === 'all'
    ? tracks
    : tracks.filter(t => t.artistId === selectedFilter)

  // ── Audio Time Update & 15-Second Limiter ──
  const handleTimeUpdate = () => {
    if (!audioRef.current || !playingAudioId) return
    const current = audioRef.current.currentTime
    setPlaybackTime(current)

    const isUnlocked = isTrackUnlocked(String(playingAudioId))

    // If NOT unlocked, limit audio to PREVIEW_DURATION_SECONDS (15s)
    if (!isUnlocked && current >= PREVIEW_DURATION_SECONDS) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlayingAudioId(null)
      setPlaybackTime(0)

      const track = tracks.find(t => String(t.id) === String(playingAudioId))
      if (track) {
        setPreviewNotification(`15-Second Free Preview Ended! Unlock full 15-minute access for ${track.price}`)
        handleBuyClick(track)
      }
    }
  }

  // ── Helper to check if a track is unlocked ──
  const isTrackUnlocked = (trackId: string | number) => {
    const session = unlockedMap[String(trackId)]
    return !!(session && session.expiresAt > currentTimeMs)
  }

  // ── Helper to get remaining time string MM:SS ──
  const getRemainingTimeStr = (trackId: string | number) => {
    const session = unlockedMap[String(trackId)]
    if (!session) return null
    const diffSec = Math.max(0, Math.floor((session.expiresAt - currentTimeMs) / 1000))
    const mins = Math.floor(diffSec / 60)
    const secs = diffSec % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // ── Audio Preview Play/Pause ──
  const togglePlayPreview = (track: OtherArtistTrack) => {
    if (!track.downloadUrl) return

    if (playingAudioId === track.id) {
      audioRef.current?.pause()
      setPlayingAudioId(null)
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.downloadUrl
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(e => console.warn('Audio autoplay blocked:', e))
        setPlayingAudioId(track.id)
        setPlaybackTime(0)
      }
    }
  }

  // ── Handle Buy Trigger ──
  const handleBuyClick = (track: OtherArtistTrack) => {
    setSelectedSongForBuy({
      id: track.id,
      title: track.title,
      feat: track.feat,
      price: track.price,
      priceNum: track.priceNum || 300,
      genre: track.genre,
      image: track.image,
      downloadUrl: track.downloadUrl || '',
      fileName: `${track.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.mp3`,
    })
  }

  // ── Handle Payment Success & Unlock 15-Minute Pass ──
  const handleUnlockSuccess = (trackId: string, token: string, expiresAt: number) => {
    setUnlockedMap((prev) => {
      const updated = {
        ...prev,
        [trackId]: { token, expiresAt },
      }
      try {
        localStorage.setItem('rieng_unlocked_tracks', JSON.stringify(updated))
      } catch {}
      return updated
    })

    setPreviewNotification(null)

    // Automatically start full track playback
    const track = tracks.find(t => String(t.id) === String(trackId))
    if (track && track.downloadUrl && audioRef.current) {
      audioRef.current.src = track.downloadUrl
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(e => console.warn('Audio play blocked:', e))
      setPlayingAudioId(track.id)
      setPlaybackTime(0)
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] selection:bg-primary selection:text-white overflow-x-hidden">
      <Navbar />

      {/* Hidden audio element for preview */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setPlayingAudioId(null)
          setPlaybackTime(0)
        }}
        onError={() => {
          setPlayingAudioId(null)
          setPlaybackTime(0)
        }}
      />

      {/* Top Banner Alert for Preview Notification */}
      {previewNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] w-full max-w-xl px-4 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-[#111] border border-primary/40 rounded-2xl p-4 shadow-[0_0_50px_rgba(255,107,53,0.3)] flex items-center justify-between gap-3 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-primary animate-ping"></span>
              <p className="text-white text-xs sm:text-sm font-bold">{previewNotification}</p>
            </div>
            <button
              onClick={() => setPreviewNotification(null)}
              className="text-white/40 hover:text-white text-xs font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
                  15S FREE PREVIEW · 15-MIN UNLOCKED PASS · M-PESA
                </span>
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-[8.5rem] font-black text-white uppercase tracking-tighter leading-[0.88] mb-8">
                Other<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300 italic pr-4">
                  Artists Drops
                </span>
              </h1>
              
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl font-medium border-l-4 border-primary pl-6 leading-relaxed">
                Enjoy <span className="text-white font-bold">15 seconds of free audio preview</span> on every release. Unlock full 15-minute streaming access with M-Pesa.
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
                  <span className="text-white font-black text-sm">15s Preview &amp; Unlock</span>
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
            <StatCard value={15} suffix=" Sec" label="Free Audio Preview" color="bg-amber-500" />
            <StatCard value={15} suffix=" Min" label="Full Access Pass" color="bg-primary" />
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
              const artistTrackCount = tracks.filter(t => t.artistId === artist.id).length

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
                        <p className="text-white font-black text-base sm:text-lg">{artist.stats.listeners}</p>
                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Listeners</p>
                      </div>
                      <div className="border-x border-white/5">
                        <p className="text-white font-black text-base sm:text-lg">{artistTrackCount} Tracks</p>
                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">In Store</p>
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

      {/* ── MUSIC TRACKS SECTION ── */}
      <section id="tracks-section" className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-white/5 pb-10 gap-6">
            <div>
              <span className="text-primary font-black uppercase tracking-[0.4em] text-xs block mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-primary inline-block"></span>
                Official Releases · 15s Preview Available
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
                Featured <span className="italic text-primary pr-2">Music Catalog</span>
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
                All Tracks ({tracks.length})
              </button>
              <button
                onClick={() => setSelectedFilter('mr-mapema-producer')}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 border ${
                  selectedFilter === 'mr-mapema-producer'
                    ? 'border-primary bg-primary text-white shadow-[0_0_20px_rgba(255,107,53,0.4)]'
                    : 'border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                Mr MAPEMA PRODUCER ({tracks.filter(t => t.artistId === 'mr-mapema-producer').length})
              </button>
              <button
                onClick={() => setSelectedFilter('ethic-entertainment')}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 border ${
                  selectedFilter === 'ethic-entertainment'
                    ? 'border-primary bg-primary text-white shadow-[0_0_20px_rgba(255,107,53,0.4)]'
                    : 'border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                Ethic Entertainment ({tracks.filter(t => t.artistId === 'ethic-entertainment').length})
              </button>
            </div>
          </div>

          {/* Empty State if no real tracks exist in DB for this filter */}
          {filteredTracks.length === 0 && !loading && (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-[2.5rem] bg-[#080808]/50 max-w-2xl mx-auto p-8">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">No Releases in this Category</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed mb-6">
                No songs have been uploaded to the database for this artist yet. Upload new songs via the Artist Portal to have them appear here automatically.
              </p>
              <Link
                href="/sales/login"
                className="inline-flex items-center gap-2 bg-primary/15 hover:bg-primary text-primary hover:text-white border border-primary/30 text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full transition-all duration-300"
              >
                Artist Portal Login →
              </Link>
            </div>
          )}

          {/* Track Cards */}
          <div className="flex flex-col gap-8">
            {filteredTracks.map((song, idx) => {
              const isUnlocked = isTrackUnlocked(song.id)
              const remainingTimeStr = getRemainingTimeStr(song.id)
              const isCurrentPlaying = playingAudioId === song.id

              return (
                <div
                  key={song.id}
                  onMouseEnter={() => setHoveredSong(song.id)}
                  onMouseLeave={() => setHoveredSong(null)}
                  className={`group relative flex flex-col md:flex-row border rounded-[2rem] overflow-hidden transition-all duration-700 bg-[#080808] ${
                    isUnlocked
                      ? 'border-emerald-500/50 shadow-[0_0_80px_rgba(16,185,129,0.15)]'
                      : 'border-white/8 hover:border-primary/50 hover:shadow-[0_0_80px_rgba(255,107,53,0.15)]'
                  }`}
                >
                  {/* Left image */}
                  <div className="relative w-full md:w-80 lg:w-96 aspect-[4/3] md:aspect-auto flex-shrink-0 overflow-hidden">
                    <Image
                      src={song.image}
                      alt={song.title}
                      fill
                      className="object-cover transition-transform duration-[3s] group-hover:scale-110 opacity-75 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#080808] hidden md:block pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080808] to-transparent md:hidden pointer-events-none"></div>
                    
                    {/* Status Badge */}
                    {isUnlocked ? (
                      <span className="absolute top-5 left-5 text-white text-[10px] font-black px-3.5 py-1.5 uppercase tracking-widest shadow-lg bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        FULL ACCESS · {remainingTimeStr}
                      </span>
                    ) : (
                      <span className="absolute top-5 left-5 text-white text-[10px] font-black px-3.5 py-1.5 uppercase tracking-widest shadow-lg bg-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                        15s Free Preview 🎧
                      </span>
                    )}

                    {/* Artist Tag on Card */}
                    <span className="absolute top-5 right-5 md:right-auto md:left-5 md:top-14 bg-black/70 backdrop-blur-md border border-white/10 text-white/80 text-[9px] font-black px-3 py-1 uppercase tracking-widest">
                      {song.artistName}
                    </span>

                    {/* Audio Preview Button */}
                    {song.downloadUrl && (
                      <button
                        onClick={() => togglePlayPreview(song)}
                        className={`absolute bottom-5 left-5 z-20 border text-white text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-2 backdrop-blur-md transition-all duration-300 shadow-xl ${
                          isUnlocked
                            ? 'bg-emerald-600/90 hover:bg-emerald-500 border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                            : 'bg-black/80 hover:bg-primary border-white/20 hover:border-primary'
                        }`}
                      >
                        {isCurrentPlaying ? (
                          <>
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                            <span>Pause {isUnlocked ? 'Track' : 'Preview'}</span>
                            <span className="text-[11px] font-mono opacity-80">
                              ({Math.floor(playbackTime)}s{isUnlocked ? '' : '/15s'})
                            </span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            <span>{isUnlocked ? 'Play Full Master' : 'Play 15s Preview'}</span>
                          </>
                        )}
                      </button>
                    )}

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
                        {isUnlocked ? (
                          <span className="text-emerald-400 border-emerald-400/30 bg-emerald-400/10 font-bold uppercase tracking-[0.2em] text-[10px] border px-3 py-1 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Unlocked ({remainingTimeStr} left)
                          </span>
                        ) : (
                          <span className="text-amber-400 border-amber-400/20 bg-amber-400/5 font-bold uppercase tracking-[0.2em] text-[10px] border px-3 py-1 rounded-full">
                            15s Free Preview
                          </span>
                        )}
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

                    {/* Animated waveform when hovered or playing */}
                    <div className={`mt-6 transition-all duration-500 ${hoveredSong === song.id || isCurrentPlaying ? 'opacity-100 h-10' : 'opacity-0 h-0 overflow-hidden'}`}>
                      <WaveformBars />
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-10 pt-8 border-t border-white/5">
                      <div>
                        <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mb-1">
                          {isUnlocked ? 'Access Status' : 'Unlock Price (15-Min Access)'}
                        </p>
                        <p className={`text-3xl md:text-4xl font-black tracking-tighter transition-colors duration-700 ${isUnlocked ? 'text-emerald-400' : 'text-white group-hover:text-primary'}`}>
                          {isUnlocked ? `ACTIVE (${remainingTimeStr})` : song.price}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        {isUnlocked ? (
                          /* Unlocked Mode: Prominent Play Full Master / Pause Button */
                          <button
                            onClick={() => togglePlayPreview(song)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-[0_0_35px_rgba(16,185,129,0.3)] hover:shadow-[0_0_45px_rgba(16,185,129,0.5)] transform hover:scale-105"
                          >
                            {isCurrentPlaying ? (
                              <>
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                <span>Pause Master Track</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                <span>Play Full Master Track</span>
                              </>
                            )}
                          </button>
                        ) : (
                          /* Locked Mode: 15s Preview and Unlock Full Track Buttons */
                          <>
                            {song.downloadUrl && (
                              <button
                                onClick={() => togglePlayPreview(song)}
                                className="bg-white/5 hover:bg-white/15 border border-white/10 text-white font-bold text-xs uppercase tracking-widest px-6 py-4 rounded-full transition-all flex items-center gap-2"
                              >
                                {isCurrentPlaying ? (
                                  <>
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                    <span>Pause</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    <span>Play 15s Preview</span>
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              onClick={() => handleBuyClick(song)}
                              className="relative bg-primary hover:bg-white text-white hover:text-black transition-all duration-300 px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-[0_0_35px_rgba(255,107,53,0.3)] hover:shadow-[0_0_45px_rgba(255,107,53,0.5)] transform hover:scale-105"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              Unlock Full Track ({song.price})
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
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

      {/* ── PAYSTACK PAYMENT MODAL ── */}
      <PaymentModal
        isOpen={!!selectedSongForBuy}
        onClose={() => setSelectedSongForBuy(null)}
        song={selectedSongForBuy}
        onSuccessUnlock={handleUnlockSuccess}
      />

      {/* Keyframe Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
        @keyframes slideLine {
          from { opacity: 0.2; transform: translateX(-5%); }
          to   { transform: scaleY(1); }
        }
      ` }} />

      <Footer />
    </main>
  )
}
