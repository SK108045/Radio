'use client'

import { useState, useEffect, type CSSProperties } from 'react'
import Image from '@/components/FallbackImage'
import Link from 'next/link'
import { ArrowUpRight, Volume2, VolumeX } from 'lucide-react'
import { useRadio } from '@/context/RadioContext'
import styles from './HomeEnhancements.module.css'

export default function LivePlayer() {
  const { isPlaying, currentShow, togglePlay, volume, setVolume, toggleMute } = useRadio()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <section id="live-player" className="bg-background py-8 md:py-12 border-b border-border shadow-2xl relative z-20 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-[#101010] overflow-hidden border-y border-white/10">
          {/* Background glow rings */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">

            {/* Show Art */}
            <div className="relative w-36 md:w-44 aspect-square flex-shrink-0">
              <div className={`absolute inset-0 bg-primary/20 blur-2xl rounded-full transition-opacity duration-700 ${isPlaying ? 'opacity-100' : 'opacity-0'}`} />
              <div className={`relative w-full h-full rounded-sm overflow-hidden transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
                <Image
                  src={mounted ? currentShow.image : '/KarteloandMiracleBaby.jpg'}
                  alt="Live Show Art"
                  fill
                  sizes="(max-width: 767px) 144px, 176px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-5">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,1)]" />
                    <span className="text-xs font-bold text-white tracking-widest uppercase">Live Now</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left w-full">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full mb-6 relative">
                <span aria-hidden="true" className={`size-1.5 rounded-full bg-primary ${styles.liveDot}`} />
                <span className="text-xs font-extrabold uppercase tracking-[0.2em] relative z-10">Now Broadcasting</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight uppercase drop-shadow-lg">
                {mounted ? currentShow.title : 'RIENG'}
              </h2>

              <p className="text-xl md:text-2xl text-gray-400 mb-8 font-medium">
                <span className="text-white font-bold">{mounted ? currentShow.host : 'RIENG'}</span> <span className="text-gray-500">/</span> Live on RIENG
              </p>

              {/* Player Controls */}
              <div className="flex flex-row items-center gap-4 border-y border-white/10 py-4">
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause live radio' : 'Play live radio'}
                  aria-pressed={isPlaying}
                  className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 transform flex-shrink-0 ${
                    isPlaying
                      ? 'bg-primary text-white scale-100 shadow-[0_0_40px_rgba(255,107,53,0.5)]'
                      : 'bg-white text-black hover:scale-105 hover:bg-gray-200 shadow-xl'
                  }`}
                >
                  {isPlaying ? (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                  ) : (
                    <svg className="w-10 h-10 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>

                {/* Visualizer */}
                <div aria-hidden="true" className={`flex-1 w-full flex items-center justify-between gap-1 h-12 px-2 ${isPlaying ? styles.visualizerPlaying : ''}`}>
                  {Array.from({ length: 40 }, (_, i) => (
                      <div
                        key={i}
                        className={styles.visualizerBar}
                        style={{
                          '--bar-duration': `${650 + (i % 7) * 130}ms`,
                          '--bar-delay': `${i * -83}ms`,
                        } as CSSProperties}
                      />
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap justify-center md:justify-between items-center gap-x-6 gap-y-4 mt-5">
                <p role="status" className="text-xs text-gray-400">{isPlaying ? 'You’re tuned in. Enjoy the vibes.' : 'Press play. Find your frequency.'}</p>
                <div className="flex items-center gap-3">
                  <button onClick={toggleMute} aria-label={volume === 0 ? 'Unmute live radio' : 'Mute live radio'} className="text-gray-400 hover:text-primary p-2 rounded-full transition-colors">
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input aria-label="Radio volume" type="range" min="0" max="100" value={Math.round(volume * 100)} onChange={e => setVolume(Number(e.target.value) / 100)} className="w-24 h-1 accent-primary cursor-pointer" />
                  <span className="text-[11px] text-gray-500 tabular-nums w-8">{Math.round(volume * 100)}%</span>
                </div>
              </div>
              <Link href="/shows" className="inline-flex items-center gap-1.5 mt-5 text-xs text-primary font-semibold hover:text-orange-200 transition-colors">Explore the full schedule <ArrowUpRight size={14} aria-hidden="true" /></Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
