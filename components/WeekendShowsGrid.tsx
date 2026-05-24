'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [activeIdx, setActiveIdx] = useState(0)
  const [direction, setDirection] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleNext = () => {
    setDirection(1)
    setActiveIdx((prev) => (prev + 1) % weekendShows.length)
  }

  const handlePrev = () => {
    setDirection(-1)
    setActiveIdx((prev) => (prev - 1 + weekendShows.length) % weekendShows.length)
  }

  const handleDotClick = (idx: number) => {
    setDirection(idx > activeIdx ? 1 : -1)
    setActiveIdx(idx)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  const getShowOrder = (idx: number) => {
    const relative = (idx - activeIdx + weekendShows.length) % weekendShows.length
    return relative
  }

  return (
    <section className="relative z-20 bg-background overflow-hidden py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-1/4 w-80 h-80 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-24">
          <span className="text-primary font-black uppercase tracking-[0.3em] text-sm block mb-4">Weekend Vibes</span>
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Weekend
            </span>
            <br />
            <span className="text-white">Sound Spectrum</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Immerse yourself in our curated weekend shows. Navigate through eight distinct sounds, from spiritual gospel mornings to electrifying late-night beats.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative h-[500px] md:h-[600px] perspective" ref={containerRef}>
          {/* Background blur slides */}
          <AnimatePresence mode="sync">
            {weekendShows.map((show, idx) => {
              const order = getShowOrder(idx)
              const isCenter = order === 0
              const isLeft = order === weekendShows.length - 1
              const isRight = order === 1
              const isFarLeft = order > 1 && order <= weekendShows.length / 2
              const isFarRight = order > weekendShows.length / 2

              // Position logic
              let xPos = 0
              let yPos = 0
              let scale = 0.65
              let opacity = 0.4
              let blur = 'blur(12px)'
              let zIndex = 10

              if (isCenter) {
                scale = 1
                opacity = 1
                blur = 'blur(0px)'
                zIndex = 50
              } else if (isRight) {
                xPos = 280
                scale = 0.75
                opacity = 0.5
                blur = 'blur(8px)'
                zIndex = 40
              } else if (isLeft) {
                xPos = -280
                scale = 0.75
                opacity = 0.5
                blur = 'blur(8px)'
                zIndex = 40
              } else if (isFarRight) {
                xPos = 500
                scale = 0.6
                opacity = 0.3
                blur = 'blur(15px)'
                zIndex = 20
              } else if (isFarLeft) {
                xPos = -500
                scale = 0.6
                opacity = 0.3
                blur = 'blur(15px)'
                zIndex = 20
              }

              return (
                <motion.div
                  key={`show-${idx}-${direction}`}
                  initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
                  animate={{
                    opacity,
                    x: xPos,
                    scale,
                    filter: blur,
                    zIndex,
                  }}
                  exit={{ opacity: 0, x: direction > 0 ? -300 : 300 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 md:w-80 h-96 md:h-[480px] rounded-3xl overflow-hidden cursor-pointer group"
                  onClick={() => {
                    if (isRight) handleNext()
                    else if (isLeft) handlePrev()
                  }}
                >
                  {/* Image */}
                  <Image
                    src={show.image}
                    alt={show.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    quality={80}
                  />

                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0 opacity-60"
                    style={{
                      background: `linear-gradient(135deg, ${show.accentColor}40 0%, ${show.accentColor}20 50%, transparent 100%)`,
                    }}
                  ></div>

                  {/* Dark base overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80"></div>

                  {/* Content — only show for center */}
                  {isCenter && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: 0.1 }}
                      className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 z-20"
                    >
                      <div>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="inline-block text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/70 mb-3"
                        >
                          {show.day}
                        </motion.span>
                        <motion.h3
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 }}
                          className="text-4xl md:text-5xl font-black text-white leading-tight mb-4"
                        >
                          {show.title}
                        </motion.h3>
                      </div>

                      <div>
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-white/80 text-sm md:text-base leading-relaxed mb-6"
                        >
                          {show.description}
                        </motion.p>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                          className="flex items-center justify-between pt-4 border-t border-white/30"
                        >
                          <span className="text-primary font-black text-xs md:text-sm uppercase tracking-[0.15em]">
                            {show.schedule}
                          </span>
                          <span
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white/90 border border-white/30 transition-all hover:bg-white/10"
                            style={{ borderColor: `${show.accentColor}80` }}
                          >
                            Play
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Glow effect for center */}
                  {isCenter && (
                    <div
                      className="absolute inset-0 rounded-3xl shadow-2xl pointer-events-none"
                      style={{
                        boxShadow: `0 0 60px ${show.accentColor}40, inset 0 0 60px ${show.accentColor}20`,
                      }}
                    ></div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-center gap-6 mt-16 md:mt-20">
          <button
            onClick={handlePrev}
            className="group relative w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/30 hover:border-primary transition-all duration-300 flex items-center justify-center hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/30"
            aria-label="Previous show"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Dot Indicators */}
          <div className="flex items-center gap-2 md:gap-3">
            {weekendShows.map((show, idx) => (
              <motion.button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className="transition-all duration-300 rounded-full"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: activeIdx === idx ? 32 : 10,
                  height: 10,
                  backgroundColor: activeIdx === idx ? show.accentColor : 'rgba(255,255,255,0.2)',
                  border: activeIdx === idx ? `2px solid ${show.accentColor}` : '2px solid rgba(255,255,255,0.1)',
                }}
                aria-label={`Go to ${show.title}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="group relative w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/30 hover:border-primary transition-all duration-300 flex items-center justify-center hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/30"
            aria-label="Next show"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="text-center mt-12 text-white/40 text-xs md:text-sm">
          <p>Use arrow keys or buttons to navigate • Click side shows to jump</p>
        </div>
      </div>
    </section>
  )
}
