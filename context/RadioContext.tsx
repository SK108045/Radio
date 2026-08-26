'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { getCurrentShow, ShowDetails } from '@/lib/getCurrentShow'

const STREAM_URL = 'https://riengradio.xubi.org/listen/stream/radio.mp3'

interface RadioContextValue {
  isPlaying: boolean
  currentShow: ShowDetails
  togglePlay: () => void
  /** true once we've attempted autoplay (even if browser blocked it) */
  hasInteracted: boolean
}

const RadioContext = createContext<RadioContextValue | null>(null)

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [currentShow, setCurrentShow] = useState<ShowDetails>({
    title: 'RIENG Radio',
    host: 'RIENG Radio',
    image: '/KarteloandMiracleBaby.jpg',
  })

  // Resolve current show on mount
  useEffect(() => {
    const now = new Date()
    setCurrentShow(getCurrentShow(now.getDay(), now.getHours()))
  }, [])

  // Create the audio element once and try to autoplay
  useEffect(() => {
    const audio = new Audio(STREAM_URL)
    audio.preload = 'none'
    audioRef.current = audio

    // Update React state when the browser pauses/plays the audio externally
    audio.addEventListener('play', () => setIsPlaying(true))
    audio.addEventListener('pause', () => setIsPlaying(false))

    // Attempt autoplay — browsers will likely block this on first load
    const tryAutoplay = async () => {
      try {
        await audio.play()
        setIsPlaying(true)
        setHasInteracted(true)
      } catch {
        // Browser blocked autoplay — we'll wait for a user gesture
        setIsPlaying(false)
      }
    }

    tryAutoplay()

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  // If browser blocked autoplay, start on the first user interaction anywhere on the page
  useEffect(() => {
    if (hasInteracted) return

    const handleFirstInteraction = async () => {
      if (!audioRef.current || hasInteracted) return
      try {
        await audioRef.current.play()
        setIsPlaying(true)
        setHasInteracted(true)
      } catch {
        // Still blocked — user will need to press the play button
      }
    }

    window.addEventListener('click', handleFirstInteraction, { once: true })
    window.addEventListener('keydown', handleFirstInteraction, { once: true })
    window.addEventListener('touchstart', handleFirstInteraction, { once: true })

    return () => {
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
    }
  }, [hasInteracted])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      try {
        await audio.play()
        setIsPlaying(true)
        setHasInteracted(true)
      } catch (err) {
        console.error('Audio playback failed:', err)
      }
    }
  }, [isPlaying])

  return (
    <RadioContext.Provider value={{ isPlaying, currentShow, togglePlay, hasInteracted }}>
      {children}
    </RadioContext.Provider>
  )
}

export function useRadio() {
  const ctx = useContext(RadioContext)
  if (!ctx) throw new Error('useRadio must be used inside <RadioProvider>')
  return ctx
}
