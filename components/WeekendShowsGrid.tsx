'use client'

import { useState, useEffect, useRef } from 'react'
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
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const scrollLeft = container.scrollLeft
    const cardWidth = 400
    const gap = 48
    const itemWidth = cardWidth + gap
    const newIdx = Math.round(scrollLeft / itemWidth)
    
    setActiveIdx(Math.max(0, Math.min(newIdx, weekendShows.length - 1)))
  }

  const getCardTransform = (idx: number) => {
    const distance = Math.abs(idx - activeIdx)
    
    if (distance === 0) {
      return { scale: 1, blur: 0, opacity: 1, zIndex: 50 }
    } else if (distance === 1) {
      return { scale: 0.85, blur: 8, opacity: 0.7, zIndex: 30 }
    } else if (distance === 2) {
      return { scale: 0.7, blur: 15, opacity: 0.5, zIndex: 20 }
    } else {
      return { scale: 0.6, blur: 20, opacity: 0.3, zIndex: 10 }
    }
  }

  if (!mounted) return null

  return (
    <section className="relative w-full bg-black py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-16">
          <p className="text-primary font-black uppercase tracking-[0.3em] text-sm mb-3">Weekend Vibes</p>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
            Scroll the<br className="hidden md:inline" /> Weekend Sound
          </h2>
        </div>

        {/* Scroll Carousel */}
        <div className="relative">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-40 pointer-events-none"></div>
          
          {/* Carousel container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="flex gap-12 px-20 py-6">
              {weekendShows.map((show, idx) => {
                const transform = getCardTransform(idx)
                
                return (
                  <div
                    key={idx}
                    className="flex-shrink-0 transition-all duration-500"
                    style={{
                      width: '400px',
                      transform: `scale(${transform.scale})`,
                      opacity: transform.opacity,
                      zIndex: transform.zIndex,
                      filter: `blur(${transform.blur}px)`,
                      transformOrigin: 'center',
                    }}
                  >
                    <div className="relative h-96 rounded-2xl overflow-hidden group cursor-grab active:cursor-grabbing shadow-2xl">
                      {/* Image */}
                      <Image
                        src={show.image}
                        alt={show.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        priority={idx === 0}
                      />

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${show.accentColor}40 0%, transparent 100%)`,
                        }}
                      ></div>

                      {/* Content */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-between">
                        {/* Day badge */}
                        <div className="flex justify-end">
                          <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md border border-white/30 rounded-full text-xs font-bold text-white uppercase tracking-widest">
                            {show.day}
                          </span>
                        </div>

                        {/* Title & info */}
                        <div>
                          <h3 className="text-4xl font-black text-white mb-3 leading-tight">
                            {show.title}
                          </h3>
                          <p className="text-sm text-gray-200 line-clamp-2 mb-3">
                            {show.description}
                          </p>
                          <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">
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

          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-40 pointer-events-none"></div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-12">
          {weekendShows.map((show, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (scrollContainerRef.current) {
                  const scrollLeft = idx * (400 + 48)
                  scrollContainerRef.current.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth',
                  })
                }
              }}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: activeIdx === idx ? 32 : 8,
                backgroundColor: activeIdx === idx ? show.accentColor : 'rgba(255, 255, 255, 0.2)',
              }}
            ></button>
          ))}
        </div>

        {/* Hint */}
        <p className="text-center text-gray-500 text-sm mt-8">Scroll horizontally to explore the weekend lineup</p>
      </div>

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
