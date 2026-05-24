'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const weekendShows = [
  {
    title: 'Bongo',
    day: 'Saturday',
    schedule: '1:00 PM - 3:00 PM',
    description: 'A Swahili-heavy East African heat check: catchy hooks, street poetry, and that Tanzanian pop/hip-hop bounce that makes Bongo Flava so sticky. Featuring Diamond Platnumz, Nandy, Harmonize, Alikiba, and Rayvanny.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    accentColor: '#ff8c00'
  },
  {
    title: 'Naija',
    day: 'Saturday',
    schedule: '3:00 PM - 5:00 PM',
    description: 'Pure Afrobeats energy for the weekend takeover: danceable drums, sing-along choruses, and glossy crossover records. Burna Boy, Wizkid, Davido, and Fireboy DML are all solid anchors here.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    accentColor: '#22c55e'
  },
  {
    title: 'Piano/Amapiano',
    day: 'Saturday',
    schedule: '5:00 PM - 7:00 PM',
    description: 'Deep groove piano keys meet hypnotic basslines: Amapiano is the South African sound that\'s taking over. Piano-driven production with Kabza De Small, Focalistic, and Lady Du vibes.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    accentColor: '#a855f7'
  },
  {
    title: 'Lingala',
    day: 'Saturday',
    schedule: '7:00 PM - 9:00 PM',
    description: 'The hypnotic polyrhythmic grooves of Congo and Central Africa. Soukous guitars, infectious percussion, and the unmistakable bounce that gets everyone dancing.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    accentColor: '#3b82f6'
  },
  {
    title: 'Gospel / Worship',
    day: 'Sunday',
    schedule: '5:00 AM - 7:00 AM',
    description: 'Start your Sunday with spiritual awakening and uplifting melodies. Kenya\'s finest gospel artists bringing messages of hope and healing.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Gospel.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL0dvc3BlbC5qcGciLCJpYXQiOjE3Nzc2MTg2OTAsImV4cCI6MTgwOTE1NDY5MH0.FiCgYciSVoTbmjsZ039KJG8_hlbPa18hY7rl10hUzrw',
    accentColor: '#eab308'
  },
  {
    title: 'US R&B',
    day: 'Sunday',
    schedule: '1:00 PM - 3:00 PM',
    description: 'Smooth, soulful American RnB vibes. From Frank Ocean to The Weeknd, dive deep into the sound that soothes the soul.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/RnB.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1JuQi5qcGciLCJpYXQiOjE3NzkyNjcwMzYsImV4cCI6MTgxMDgwMzAzNn0.1n19oWoG6A-EDrXaILLNof75PFG_mg7iLSLI7_aAl9I',
    accentColor: '#6366f1'
  },
  {
    title: 'US Hip-Hop',
    day: 'Sunday',
    schedule: '3:00 PM - 5:00 PM',
    description: 'Hard-hitting beats and lyrical wizardry from the States. Kendrick, Drake, J. Cole, and the latest heat dominate the airwaves.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    accentColor: '#ef4444'
  },
  {
    title: 'New Kenyan Music',
    day: 'Sunday',
    schedule: '7:00 PM - 9:00 PM',
    description: 'Fresh sounds from Kenya\'s rising stars. New drops, underground bangers, and the next generation of talent pushing the culture forward.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/KenyanOldSchool.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL0tlbnlhbk9sZFNjaG9vbC5qcGciLCJpYXQiOjE3Nzg5MjkyNzksImV4cCI6MTgxMDQ2NTI3OX0.v6fsoH7FpaX9-sDUtk1Kwk_5hiRTzvK_c9HIBHHU-LI',
    accentColor: '#84cc16'
  },
]

export default function WeekendShowsGrid() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle scroll to update active index
  const handleScroll = () => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const scrollLeft = container.scrollLeft
    const cardWidth = 400 // approximate card width
    const newIdx = Math.round(scrollLeft / cardWidth)
    
    setActiveIdx(Math.max(0, Math.min(newIdx, weekendShows.length - 1)))
  }

  // Calculate card transform based on position
  const getCardTransform = (idx: number) => {
    const distance = Math.abs(idx - activeIdx)
    
    if (idx === activeIdx) {
      return {
        scale: 1,
        opacity: 1,
        zIndex: 50,
        rotateY: 0,
      }
    } else if (idx === activeIdx - 1) {
      return {
        scale: 0.85,
        opacity: 0.7,
        zIndex: 30,
        rotateY: 25,
      }
    } else if (idx === activeIdx + 1) {
      return {
        scale: 0.85,
        opacity: 0.7,
        zIndex: 30,
        rotateY: -25,
      }
    } else {
      return {
        scale: 0.7,
        opacity: 0.4,
        zIndex: 10,
        rotateY: idx < activeIdx ? 45 : -45,
      }
    }
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#000000] flex flex-col items-center justify-center overflow-hidden py-20">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-radial from-orange-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-radial from-blue-500/15 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-20 px-6">
        <span className="inline-block text-primary font-black uppercase tracking-[0.3em] text-xs mb-4">Weekend Vibes</span>
        <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight mb-6">
          Weekend Sound <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">Spectrum</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">Scroll through the weekend soundtrack. From sunrise worship to late-night Kenyan heat — Saturday and Sunday get their own sonic identity.</p>
      </div>

      {/* Carousel Container */}
      <div className="relative z-20 w-full flex items-center justify-center px-4 md:px-8">
        {/* Left gradient fade */}
        <div className="hidden md:block absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-30 pointer-events-none"></div>
        
        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full max-w-7xl overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
          style={{
            perspective: '1200px',
            scrollBehavior: 'smooth',
          }}
        >
          <div className="flex gap-12 px-12 md:px-20 py-12">
            {weekendShows.map((show, idx) => {
              const transform = getCardTransform(idx)
              
              return (
                <div
                  key={idx}
                  className="flex-shrink-0 group snap-center"
                  style={{
                    width: '380px',
                    perspective: '1200px',
                  }}
                >
                  <div
                    className="relative h-96 rounded-3xl overflow-hidden transition-all duration-500 ease-out cursor-grab active:cursor-grabbing"
                    style={{
                      transform: `scaleX(${transform.scale}) scaleY(${transform.scale}) rotateY(${transform.rotateY}deg)`,
                      opacity: transform.opacity,
                      zIndex: transform.zIndex,
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'center',
                    }}
                  >
                    {/* Image */}
                    <Image
                      src={show.image}
                      alt={show.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      priority={idx === 0}
                    />

                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
                    <div
                      className="absolute inset-0 opacity-40 mix-blend-multiply"
                      style={{
                        background: `linear-gradient(135deg, ${show.accentColor}30, ${show.accentColor}10)`,
                      }}
                    ></div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-between p-6">
                      {/* Day badge */}
                      <div className="flex items-center justify-between">
                        <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-bold text-white uppercase tracking-widest">
                          {show.day}
                        </span>
                      </div>

                      {/* Bottom content */}
                      <div>
                        <h3 className="text-4xl md:text-5xl font-black text-white uppercase mb-3 leading-tight">
                          {show.title}
                        </h3>
                        <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-4 line-clamp-3">
                          {show.description}
                        </p>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {show.schedule}
                        </div>
                      </div>
                    </div>

                    {/* Accent line */}
                    <div
                      className="absolute top-0 left-0 h-1 w-full"
                      style={{
                        background: `linear-gradient(90deg, ${show.accentColor}, ${show.accentColor}00)`,
                      }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right gradient fade */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-30 pointer-events-none"></div>
      </div>

      {/* Indicator Dots */}
      <div className="relative z-20 flex items-center justify-center gap-3 mt-12">
        {weekendShows.map((show, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (scrollContainerRef.current) {
                const scrollLeft = idx * 400 + idx * 48 // card width + gap
                scrollContainerRef.current.scrollTo({
                  left: scrollLeft,
                  behavior: 'smooth',
                })
              }
            }}
            className="group relative h-3 transition-all duration-300"
            style={{
              width: activeIdx === idx ? 32 : 12,
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                backgroundColor: activeIdx === idx ? show.accentColor : 'rgba(255, 255, 255, 0.2)',
              }}
            ></div>
          </button>
        ))}
      </div>

      {/* Hint text */}
      <p className="relative z-20 text-gray-500 text-sm mt-8 text-center">Scroll horizontally to explore the weekend lineup</p>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
