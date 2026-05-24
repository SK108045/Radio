'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const weekendShows = [
  {
    title: 'Bongo',
    day: 'Saturday',
    schedule: '1:00 PM - 3:00 PM',
    description: 'A Swahili-heavy East African heat check: catchy hooks, street poetry, and that Tanzanian pop/hip-hop bounce that makes Bongo Flava so sticky. Featuring Diamond Platnumz, Nandy, Harmonize, Alikiba, and Rayvanny.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    gradient: 'from-orange-500 via-orange-600 to-red-700'
  },
  {
    title: 'Naija',
    day: 'Saturday',
    schedule: '3:00 PM - 5:00 PM',
    description: 'Pure Afrobeats energy for the weekend takeover: danceable drums, sing-along choruses, and glossy crossover records. Burna Boy, Wizkid, Davido, and Fireboy DML are all solid anchors here.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    gradient: 'from-green-500 via-emerald-600 to-teal-700'
  },
  {
    title: 'Piano/Amapiano',
    day: 'Saturday',
    schedule: '5:00 PM - 7:00 PM',
    description: 'Deep groove piano keys meet hypnotic basslines: Amapiano is the South African sound that&apos;s taking over. Piano-driven production with Kabza De Small, Focalistic, and Lady Du vibes.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    gradient: 'from-purple-500 via-pink-600 to-rose-700'
  },
  {
    title: 'Lingala',
    day: 'Saturday',
    schedule: '7:00 PM - 9:00 PM',
    description: 'The hypnotic polyrhythmic grooves of Congo and Central Africa. Soukous guitars, infectious percussion, and the unmistakable bounce that gets everyone dancing.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    gradient: 'from-blue-500 via-cyan-600 to-sky-700'
  },
  {
    title: 'Gospel / Worship',
    day: 'Sunday',
    schedule: '5:00 AM - 7:00 AM',
    description: 'Start your Sunday with spiritual awakening and uplifting melodies. Kenya&apos;s finest gospel artists bringing messages of hope and healing.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Gospel.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL0dvc3BlbC5qcGciLCJpYXQiOjE3Nzc2MTg2OTAsImV4cCI6MTgwOTE1NDY5MH0.FiCgYciSVoTbmjsZ039KJG8_hlbPa18hY7rl10hUzrw',
    gradient: 'from-yellow-500 via-amber-600 to-orange-700'
  },
  {
    title: 'US R&B',
    day: 'Sunday',
    schedule: '1:00 PM - 3:00 PM',
    description: 'Smooth, soulful American RnB vibes. From Frank Ocean to The Weeknd, dive deep into the sound that soothes the soul.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/RnB.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1JuQi5qcGciLCJpYXQiOjE3NzkyNjcwMzYsImV4cCI6MTgxMDgwMzAzNn0.1n19oWoG6A-EDrXaILLNof75PFG_mg7iLSLI7_aAl9I',
    gradient: 'from-indigo-500 via-purple-600 to-pink-700'
  },
  {
    title: 'US Hip-Hop',
    day: 'Sunday',
    schedule: '3:00 PM - 5:00 PM',
    description: 'Hard-hitting beats and lyrical wizardry from the States. Kendrick, Drake, J. Cole, and the latest heat dominate the airwaves.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    gradient: 'from-red-500 via-orange-600 to-yellow-700'
  },
  {
    title: 'New Kenyan Music',
    day: 'Sunday',
    schedule: '7:00 PM - 9:00 PM',
    description: 'Fresh sounds from Kenya&apos;s rising stars. New drops, underground bangers, and the next generation of talent pushing the culture forward.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/KenyanOldSchool.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL0tlbnlhbk9sZFNjaG9vbC5qcGciLCJpYXQiOjE3Nzg5MjkyNzksImV4cCI6MTgxMDQ2NTI3OX0.v6fsoH7FpaX9-sDUtk1Kwk_5hiRTzvK_c9HIBHHU-LI',
    gradient: 'from-lime-500 via-green-600 to-emerald-700'
  },
]

interface CardState {
  [key: number]: { x: number; y: number }
}

export default function WeekendShowsGrid() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [cardRotation, setCardRotation] = useState<CardState>({})

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    setMousePos({ x, y })
    setCardRotation((prev) => ({
      ...prev,
      [idx]: {
        x: (y - 0.5) * 8,
        y: (x - 0.5) * -8,
      },
    }))
  }

  const handleMouseLeave = (idx: number) => {
    setHoveredIdx(null)
    setCardRotation((prev) => ({
      ...prev,
      [idx]: { x: 0, y: 0 },
    }))
  }

  return (
    <section className="relative z-20 bg-background overflow-hidden py-24">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <span className="text-primary font-black uppercase tracking-[0.3em] text-sm block">Weekend Vibes</span>
          </div>
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Weekend
            </span>
            <br />
            <span className="text-white">Sound Spectrum</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Eight curated shows across Saturday and Sunday. From gospel sunrise to late-night Kenyan heat — find your perfect weekend soundtrack.
          </p>
        </div>

        {/* Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {weekendShows.map((show, idx) => {
            const rotation = cardRotation[idx] || { x: 0, y: 0 }
            const isHovered = hoveredIdx === idx

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseMove={(e) => handleMouseMove(e, idx)}
                onMouseLeave={() => handleMouseLeave(idx)}
                className="group perspective h-full cursor-pointer"
              >
                <div
                  className="relative h-96 rounded-2xl overflow-hidden transition-transform duration-300"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.05 : 1})`,
                  }}
                >
                  {/* Background Image */}
                  <Image
                    src={show.image}
                    alt={show.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    quality={85}
                  />

                  {/* Gradient Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${show.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-500 mix-blend-multiply`}
                  ></div>

                  {/* Dark Base Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40 transition-opacity duration-500 ${isHovered ? 'opacity-40' : 'opacity-70'}`}></div>

                  {/* Glass Morphism Card */}
                  <div
                    className={`absolute inset-0 backdrop-blur-sm transition-all duration-500 ${
                      isHovered ? 'bg-white/10 border border-white/30' : 'bg-white/5 border border-white/10'
                    }`}
                  ></div>

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                    {/* Top */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white/70 text-xs font-bold uppercase tracking-[0.15em] mb-2">
                          {show.day}
                        </p>
                        <h3
                          className={`font-black uppercase tracking-tighter transition-all duration-500 ${
                            isHovered ? 'text-4xl text-white' : 'text-2xl text-white/90'
                          }`}
                        >
                          {show.title}
                        </h3>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isHovered
                            ? 'bg-primary border border-primary shadow-lg shadow-primary/50'
                            : 'bg-white/10 border border-white/20'
                        }`}
                      >
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Bottom */}
                    <div className={`transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <p className="text-white/80 text-sm mb-4 leading-relaxed line-clamp-3">
                        {show.description}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-white/20">
                        <span className="text-primary font-bold text-sm uppercase tracking-[0.1em]">
                          {show.schedule}
                        </span>
                        <span className="text-white/60 text-xs">Tap to explore</span>
                      </div>
                    </div>
                  </div>

                  {/* Glow Effect on Hover */}
                  {isHovered && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-transparent to-blue-500/20 opacity-50 blur-xl pointer-events-none"></div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <p className="text-gray-400 mb-6">Ready to discover your weekend groove?</p>
          <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-primary rounded-full font-black uppercase tracking-widest text-background transition-all duration-300 hover:shadow-xl hover:shadow-primary/50 hover:scale-105">
            Start Listening
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
