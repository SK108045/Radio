'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
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
}

const RadioContext = createContext<RadioContextValue | null>(null)

// Global reference across client navigation so audio is never destroyed between pages
let globalAudio: HTMLAudioElement | null = null

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [volume, setVolumeState] = useState(1)
  const [currentShow, setCurrentShow] = useState<ShowDetails>({
    title: 'RIENG',
    host: 'RIENG',
    image: '/KarteloandMiracleBaby.jpg',
  })

  // Update current show based on day/hour
  useEffect(() => {
    const updateShow = () => {
      const now = new Date()
      setCurrentShow(getCurrentShow(now.getDay(), now.getHours()))
    }
    updateShow()
    const interval = setInterval(updateShow, 60000)
    return () => clearInterval(interval)
  }, [])

  // Initialize persistent global audio instance with pre-buffering
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!globalAudio) {
      globalAudio = new Audio()
      globalAudio.src = STREAM_URL
      globalAudio.preload = 'auto'
      globalAudio.crossOrigin = 'anonymous'
    }

    const audio = globalAudio

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleError = () => {
      if (isPlaying) {
        setTimeout(() => {
          if (globalAudio) {
            globalAudio.src = STREAM_URL
            globalAudio.play().catch(() => {})
          }
        }, 2000)
      }
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('error', handleError)

    // Sync initial state
    setIsPlaying(!audio.paused)

    // Attempt instant autoplay silently on mount
    const tryAutoplay = async () => {
      try {
        await audio.play()
        setIsPlaying(true)
        setHasInteracted(true)
      } catch {
        // Browser requires first user gesture (pointerdown/click/touchstart/keydown)
        setIsPlaying(false)
      }
    }

    tryAutoplay()

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('error', handleError)
    }
  }, [])

  // Trusted gesture unlocker — starts playing on the absolute first tap/click/keypress anywhere on page
  useEffect(() => {
    if (hasInteracted && isPlaying) return

    const unlockAndPlay = async () => {
      if (!globalAudio) return

      try {
        if (globalAudio.paused) {
          await globalAudio.play()
          setIsPlaying(true)
        }
        setHasInteracted(true)
      } catch {
        // Silent catch
      }
    }

    // Only trusted browser user gestures that satisfy Chromium & WebKit Autoplay Policy
    const trustedEvents = ['pointerdown', 'click', 'touchstart', 'keydown']
    trustedEvents.forEach((evt) => {
      window.addEventListener(evt, unlockAndPlay, { capture: true, once: true })
    })

    return () => {
      trustedEvents.forEach((evt) => {
        window.removeEventListener(evt, unlockAndPlay, { capture: true })
      })
    }
  }, [hasInteracted, isPlaying])

  const play = useCallback(async () => {
    if (!globalAudio) return
    try {
      await globalAudio.play()
      setIsPlaying(true)
      setHasInteracted(true)
    } catch {
      // Audio playback failed
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
    setVolumeState(clamped)
    if (globalAudio) {
      globalAudio.volume = clamped
    }
  }, [])

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
