'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { getCurrentShow, ShowDetails } from '@/lib/getCurrentShow'

const STREAM_URL = 'https://mixes.casacam.net/listen/rieng_radio/radio.mp3'

interface RadioContextValue {
  isPlaying: boolean
  currentShow: ShowDetails
  togglePlay: () => void
  play: () => Promise<void>
  pause: () => void
  hasInteracted: boolean
  volume: number
  setVolume: (v: number) => void
  toggleMute: () => void
}

const RadioContext = createContext<RadioContextValue | null>(null)

// Global reference across client navigation so audio is never destroyed between pages
let globalAudio: HTMLAudioElement | null = null

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [volume, setVolumeState] = useState(1)
  const volumeBeforeMute = useRef(1)
  const [currentShow, setCurrentShow] = useState<ShowDetails>({
    title: 'RIENG',
    host: 'RIENG',
    image: '/KarteloandMiracleBaby.jpg',
  })

  // Update current show based on day/hour
  useEffect(() => {
    const updateShow = () => {
      const now = new Date()
      setCurrentShow(getCurrentShow(now.getDay(), now.getHours(), now.getMinutes()))
    }
    updateShow()
    const interval = setInterval(updateShow, 60000)
    return () => clearInterval(interval)
  }, [])

  // The BoB page has its own artist mix; do not mount a competing live-radio stream there.
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (pathname === '/bob') {
      if (globalAudio) {
        globalAudio.pause()
        globalAudio.removeAttribute('src')
        globalAudio.load()
      }
      setIsPlaying(false)
      return
    }

    if (!globalAudio) {
      globalAudio = new Audio()
      globalAudio.preload = 'none'
      globalAudio.crossOrigin = null
    }

    const audio = globalAudio
    // The stream host doesn't return CORS headers. Native media playback doesn't need
    // anonymous CORS mode, so leave crossOrigin unset to let the browser play the stream.
    audio.crossOrigin = null
    // Keep live radio playing across ordinary route changes; only reload if /bob removed it.
    if (!audio.src) {
      audio.src = STREAM_URL
      audio.preload = 'auto'
      audio.load()
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleError = () => {
      if (isPlaying) {
        window.setTimeout(() => {
          if (globalAudio) {
            globalAudio.crossOrigin = null
            globalAudio.src = STREAM_URL
            globalAudio.load()
            globalAudio.play().catch(() => {})
          }
        }, 2000)
      }
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('error', handleError)

    setIsPlaying(!audio.paused)

    const tryAutoplay = async () => {
      try {
        await audio.play()
        setIsPlaying(true)
        setHasInteracted(true)
      } catch {
        // Browser requires a user gesture before starting audible playback.
        setIsPlaying(false)
      }
    }

    void tryAutoplay()

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('error', handleError)
    }
  }, [pathname])

  // Don't let the global stream's first-tap unlocker compete with the BoB mix.
  useEffect(() => {
    if (pathname === '/bob') {
      if (globalAudio && !globalAudio.paused) globalAudio.pause()
      return
    }
    if (hasInteracted && isPlaying) return

    const unlockAndPlay = async () => {
      if (!globalAudio) return

      try {
        if (globalAudio.paused && globalAudio.src) {
          await globalAudio.play()
          setIsPlaying(true)
        }
        setHasInteracted(true)
      } catch {
        // Playback is unavailable until the stream can be loaded or a gesture is allowed.
      }
    }

    const trustedEvents = ['pointerdown', 'click', 'touchstart', 'keydown']
    trustedEvents.forEach((evt) => {
      window.addEventListener(evt, unlockAndPlay, { capture: true, once: true })
    })

    return () => {
      trustedEvents.forEach((evt) => {
        window.removeEventListener(evt, unlockAndPlay, { capture: true })
      })
    }
  }, [hasInteracted, isPlaying, pathname])

  const play = useCallback(async () => {
    if (!globalAudio) return
    try {
      if (!globalAudio.src) {
        globalAudio.crossOrigin = null
        globalAudio.src = STREAM_URL
        globalAudio.load()
      }
      await globalAudio.play()
      setIsPlaying(true)
      setHasInteracted(true)
    } catch {
      setIsPlaying(false)
    }
  }, [])

  const pause = useCallback(() => {
    if (!globalAudio) return
    globalAudio.pause()
    setIsPlaying(false)
  }, [])

  const togglePlay = useCallback(async () => {
    if (!globalAudio) return
    if (!globalAudio.paused) {
      pause()
    } else {
      await play()
    }
  }, [play, pause])

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val))
    if (clamped > 0) volumeBeforeMute.current = clamped
    setVolumeState(clamped)
    if (globalAudio) {
      globalAudio.volume = clamped
    }
  }, [])

  const toggleMute = useCallback(() => {
    setVolume(volume === 0 ? volumeBeforeMute.current : 0)
  }, [volume, setVolume])

  return (
    <RadioContext.Provider
      value={{
        isPlaying,
        currentShow,
        togglePlay,
        play,
        pause,
        hasInteracted,
        volume,
        setVolume,
        toggleMute,
      }}
    >
      {children}
    </RadioContext.Provider>
  )
}

export function useRadio() {
  const ctx = useContext(RadioContext)
  if (!ctx) throw new Error('useRadio must be used inside <RadioProvider>')
  return ctx
}
