'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Show {
  title: string
  day: 'Saturday' | 'Sunday'
  schedule: string
  description: string
  image: string
  accentColor: string
}

const weekendShows: Show[] = [
  {
    title: 'Bongo',
    day: 'Saturday',
    schedule: '1:00 PM - 3:00 PM',
    description: 'A Swahili-heavy East African heat check: catchy hooks, street poetry, and that Tanzanian pop/hip-hop bounce.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    accentColor: '#ff8c00'
  },
  {
    title: 'Naija',
    day: 'Saturday',
    schedule: '3:00 PM - 5:00 PM',
    description: 'Pure Afrobeats energy: danceable drums, sing-along choruses, and glossy crossover records.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    accentColor: '#22c55e'
  },
  {
    title: 'Piano/Amapiano',
    day: 'Saturday',
    schedule: '5:00 PM - 7:00 PM',
    description: 'Deep groove piano keys meet hypnotic basslines: Amapiano is the South African sound taking over.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    accentColor: '#a855f7'
  },
  {
    title: 'Lingala',
    day: 'Saturday',
    schedule: '7:00 PM - 9:00 PM',
    description: 'Hypnotic polyrhythmic grooves of Congo and Central Africa with soukous guitars and infectious percussion.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    accentColor: '#3b82f6'
  },
  {
    title: 'Gospel / Worship',
    day: 'Sunday',
    schedule: '5:00 AM - 7:00 AM',
    description: 'Start your Sunday with spiritual awakening. Kenya\'s finest gospel artists bringing messages of hope.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Gospel.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL0dvc3BlbC5qcGciLCJpYXQiOjE3Nzc2MTg2OTAsImV4cCI6MTgwOTE1NDY5MH0.FiCgYciSVoTbmjsZ039KJG8_hlbPa18hY7rl10hUzrw',
    accentColor: '#eab308'
  },
  {
    title: 'US R&B',
    day: 'Sunday',
    schedule: '1:00 PM - 3:00 PM',
    description: 'Smooth, soulful American R&B vibes from Frank Ocean to The Weeknd.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/RnB.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1JuQi5qcGciLCJpYXQiOjE3NzkyNjcwMzYsImV4cCI6MTgxMDgwMzAzNn0.1n19oWoG6A-EDrXaILLNof75PFG_mg7iLSLI7_aAl9I',
    accentColor: '#6366f1'
  },
  {
    title: 'US Hip-Hop',
    day: 'Sunday',
    schedule: '3:00 PM - 5:00 PM',
    description: 'Hard-hitting beats and lyrical wizardry. Kendrick, Drake, J. Cole leading the charge.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    accentColor: '#ef4444'
  },
  {
    title: 'New Kenyan Music',
    day: 'Sunday',
    schedule: '7:00 PM - 9:00 PM',
    description: 'Fresh sounds from Kenya\'s rising stars pushing the culture forward.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/KenyanOldSchool.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL0tlbnlhbk9sZFNjaG9vbC5qcGciLCJpYXQiOjE3Nzg5MjkyNzksImV4cCI6MTgxMDQ2NTI3OX0.v6fsoH7FpaX9-sDUtk1Kwk_5hiRTzvK_c9HIBHHU-LI',
    accentColor: '#84cc16'
  },
]

export default function WeekendShowsGrid() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        setSelectedIdx(prev => Math.min(prev + 1, weekendShows.length - 1))
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        setSelectedIdx(prev => Math.max(prev - 1, 0))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const selectedShow = weekendShows[selectedIdx]
  const saturdayShows = weekendShows.filter(s => s.day === 'Saturday')
  const sundayShows = weekendShows.filter(s => s.day === 'Sunday')

  return (
    <section className="relative w-full bg-black py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/3 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-20">
          <p className="text-primary font-black uppercase tracking-[0.3em] text-sm mb-3">Weekend Spectrum</p>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            Saturday & Sunday<br />Sound Journey
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl">Pick a show below and explore what's playing across your weekend.</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left: Show List */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Saturday */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 opacity-60">Saturday</h3>
              <div className="space-y-2">
                {saturdayShows.map((show, idx) => {
                  const actualIdx = weekendShows.indexOf(show)
                  const isSelected = selectedIdx === actualIdx
                  
                  return (
                    <button
                      key={actualIdx}
                      onClick={() => setSelectedIdx(actualIdx)}
                      onMouseEnter={() => setHoveredIdx(actualIdx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className="w-full text-left group relative overflow-hidden rounded-lg transition-all duration-300"
                    >
                      {/* Background */}
                      <div
                        className={`absolute inset-0 transition-all duration-300 ${
                          isSelected
                            ? 'bg-white/10 backdrop-blur-md'
                            : hoveredIdx === actualIdx
                            ? 'bg-white/5'
                            : 'bg-transparent'
                        }`}
                      ></div>

                      {/* Content */}
                      <div className="relative px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Indicator dot */}
                          <div
                            className={`flex-shrink-0 w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                              isSelected ? 'w-3 h-3' : ''
                            }`}
                            style={{
                              backgroundColor: show.accentColor,
                              boxShadow: isSelected ? `0 0 12px ${show.accentColor}` : 'none'
                            }}
                          ></div>

                          <div className="min-w-0 flex-1">
                            <h4 className={`font-black text-sm transition-colors duration-300 ${
                              isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
                            }`}>
                              {show.title}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">{show.schedule}</p>
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        {isSelected && (
                          <svg className="w-4 h-4 text-white flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>

                      {/* Bottom accent line */}
                      {isSelected && (
                        <div
                          className="absolute bottom-0 left-0 h-0.5 w-full"
                          style={{background: `linear-gradient(90deg, ${show.accentColor}, ${show.accentColor}00)`}}
                        ></div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sunday */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 opacity-60">Sunday</h3>
              <div className="space-y-2">
                {sundayShows.map((show, idx) => {
                  const actualIdx = weekendShows.indexOf(show)
                  const isSelected = selectedIdx === actualIdx
                  
                  return (
                    <button
                      key={actualIdx}
                      onClick={() => setSelectedIdx(actualIdx)}
                      onMouseEnter={() => setHoveredIdx(actualIdx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className="w-full text-left group relative overflow-hidden rounded-lg transition-all duration-300"
                    >
                      <div
                        className={`absolute inset-0 transition-all duration-300 ${
                          isSelected
                            ? 'bg-white/10 backdrop-blur-md'
                            : hoveredIdx === actualIdx
                            ? 'bg-white/5'
                            : 'bg-transparent'
                        }`}
                      ></div>

                      <div className="relative px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex-shrink-0 w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                              isSelected ? 'w-3 h-3' : ''
                            }`}
                            style={{
                              backgroundColor: show.accentColor,
                              boxShadow: isSelected ? `0 0 12px ${show.accentColor}` : 'none'
                            }}
                          ></div>

                          <div className="min-w-0 flex-1">
                            <h4 className={`font-black text-sm transition-colors duration-300 ${
                              isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
                            }`}>
                              {show.title}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">{show.schedule}</p>
                          </div>
                        </div>

                        {isSelected && (
                          <svg className="w-4 h-4 text-white flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>

                      {isSelected && (
                        <div
                          className="absolute bottom-0 left-0 h-0.5 w-full"
                          style={{background: `linear-gradient(90deg, ${show.accentColor}, ${show.accentColor}00)`}}
                        ></div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right: Show Preview */}
          {mounted && (
            <div className="lg:col-span-2">
              <div
                className="relative group rounded-3xl overflow-hidden backdrop-blur-xl border border-white/10 transition-all duration-500"
                style={{
                  backgroundColor: `${selectedShow.accentColor}08`,
                }}
              >
                {/* Background image with blur */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700">
                  <Image
                    src={selectedShow.image}
                    alt={selectedShow.title}
                    fill
                    className="object-cover blur-2xl"
                    priority
                  />
                </div>

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: `linear-gradient(135deg, ${selectedShow.accentColor}10 0%, transparent 100%)`
                  }}
                ></div>

                {/* Content */}
                <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-between min-h-96">
                  
                  {/* Top accent */}
                  <div
                    className="w-16 h-1.5 rounded-full mb-8 transition-all duration-500"
                    style={{backgroundColor: selectedShow.accentColor}}
                  ></div>

                  {/* Main content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                        {selectedShow.title}
                      </h3>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-3 mb-10">
                        <span
                          className="px-4 py-2 text-sm font-black text-white rounded-lg backdrop-blur-md transition-all duration-300"
                          style={{
                            backgroundColor: `${selectedShow.accentColor}30`,
                            border: `1px solid ${selectedShow.accentColor}60`
                          }}
                        >
                          {selectedShow.day}
                        </span>
                        <span className="px-4 py-2 text-sm font-bold text-gray-300 rounded-lg border border-white/20 backdrop-blur-md">
                          {selectedShow.schedule}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-lg text-gray-200 leading-relaxed max-w-xl">
                        {selectedShow.description}
                      </p>
                    </div>

                    {/* Play button */}
                    <button
                      className="w-fit px-8 py-3 rounded-lg font-black text-sm text-white uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 mt-10"
                      style={{backgroundColor: selectedShow.accentColor}}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                      </svg>
                      Play Now
                    </button>
                  </div>
                </div>

                {/* Corner glow */}
                <div
                  className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity duration-700"
                  style={{backgroundColor: selectedShow.accentColor}}
                ></div>
              </div>

              {/* Keyboard hint */}
              <p className="text-gray-500 text-sm mt-8">Use arrow keys to navigate shows</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
