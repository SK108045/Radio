'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { getCurrentShow, ShowDetails } from '@/lib/getCurrentShow'

const STREAM_URL = 'https://riengradio.xubi.org/listen/stream/radio.mp3'

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

// Global reference across client transitions so audio is never destroyed between pages
let globalAudio: HTMLAudioElement | null = null

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [volume, setVolumeState] = useState(1)
  const [currentShow, setCurrentShow] = useState<ShowDetails>({
    title: 'RIENG Radio',
    host: 'RIENG Radio',
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

  // Initialize persistent global audio instance
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
      console.warn('Radio stream temporary error, attempting recovery...')
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

    // Try instant autoplay on mount
    const startAutoplay = async () => {
      try {
        await audio.play()
        setIsPlaying(true)
        setHasInteracted(true)
      } catch {
        // Autoplay policy prevented immediate unprompted play
        setIsPlaying(false)
      }
    }

    startAutoplay()

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('error', handleError)
    }
  }, [])

  // Proactive gesture unlocker — triggers on ANY first interaction anywhere on viewport
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
      } catch (e) {
        console.warn('Auto-play unlock attempt:', e)
      }
    }

    const events = ['click', 'touchstart', 'pointerdown', 'keydown', 'scroll', 'wheel']
    events.forEach((evt) => {
      window.addEventListener(evt, unlockAndPlay, { capture: true, once: true })
    })

    return () => {
      events.forEach((evt) => {
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
    } catch (err) {
      console.error('Audio play failed:', err)
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
