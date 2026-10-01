'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useRadio } from '@/context/RadioContext'
import { Play, Pause, Volume2, VolumeX, Radio, Maximize2 } from 'lucide-react'

export default function FloatingRadioBar() {
  const pathname = usePathname()
  const { isPlaying, currentShow, togglePlay, volume, setVolume } = useRadio()
  const [isMuted, setIsMuted] = useState(false)
  const [prevVolume, setPrevVolume] = useState(1)
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (pathname === '/domain-payment' || pathname === '/payment-test') return null

  const handleToggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume || 1)
      setIsMuted(false)
    } else {
      setPrevVolume(volume)
      setVolume(0)
      setIsMuted(true)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-auto">
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-[#0a0a0a]/90 hover:bg-black border border-primary/40 text-white p-3.5 rounded-full shadow-[0_10px_30px_rgba(255,107,53,0.3)] backdrop-blur-xl flex items-center gap-2 group transition-all"
          title="Open RIENG Player"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <Radio className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider pr-1">Live Stream</span>
        </button>
      ) : (
        <div className="bg-[#080808]/95 border border-white/10 rounded-2xl p-3 sm:p-3.5 shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex items-center gap-3.5 max-w-sm sm:max-w-md w-full relative overflow-hidden transition-all duration-300 group">
          {/* Top orange gradient line */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-orange-500 to-red-500" />

          {/* Show Image / Art */}
          <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
            <Image
              src={currentShow.image || '/KarteloandMiracleBaby.jpg'}
              alt={currentShow.title}
              fill
              className="object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-primary/20 animate-pulse" />
            )}
          </div>

          {/* Title and Host */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Live On Air
              </span>
            </div>
            <p className="text-xs font-black text-white truncate uppercase tracking-tight">
              {currentShow.title}
            </p>
            <p className="text-[10px] text-gray-400 truncate font-semibold">
              {currentShow.host}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mute/Volume Toggle */}
            <button
              onClick={handleToggleMute}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isPlaying
                  ? 'bg-primary text-white shadow-[0_0_20px_rgba(255,107,53,0.5)]'
                  : 'bg-white text-black hover:bg-primary hover:text-white'
              }`}
              title={isPlaying ? 'Pause Live Stream' : 'Play Live Stream'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Minimize / Collapse */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-white/40 hover:text-white text-xs px-1 transition-colors"
              title="Minimize"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
