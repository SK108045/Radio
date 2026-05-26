'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'

const dailyShows = [
  {
    title: 'Kenyan Old School',
    host: 'Muthoni Kenya',
    schedule: 'Weekdays | 5:00 AM - 10:00 AM',
    description: 'Journey through the greatest hits from 2000s to 2004/5 Kenyan music. Featuring e Sir, Mr. Lenny, Kleptomaniax, and Dux Vultures.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/KenyanOldSchool.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL0tlbnlhbk9sZFNjaG9vbC5qcGciLCJpYXQiOjE3Nzg5MjkyNzksImV4cCI6MTgxMDQ2NTI3OX0.v6fsoH7FpaX9-sDUtk1Kwk_5hiRTzvK_c9HIBHHU-LI',
    color: 'from-orange-500/20 to-transparent',
    features: ['e Sir', 'Mr. Lenny', 'Kleptomaniax', 'Dux Vultures']
  },
  {
    title: 'Gengetone / Arbantone',
    host: 'Kartelo',
    schedule: 'Weekdays | 10:00 AM - 3:00 PM',
    description: 'The hardest beats and hottest flows from the Gengetone and Arbantone scenes. Pure energy from Kenya&apos;s underground.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Gengetone2.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL0dlbmdldG9uZTIuanBnIiwiaWF0IjoxNzc5MjcxMjcxLCJleHAiOjE4MTA4MDcyNzF9.8g2lcsHxZHP3zTn1nnGaS7WDdO51ILslPaQA_t8O5IM',
    color: 'from-red-500/20 to-transparent',
    features: ['Live Gengetone', 'New Drops', 'Beat Breakdowns']
  },
  {
    title: 'Reggae / Dancehall',
    host: 'inkmatic',
    schedule: 'Weekdays | 3:00 PM - 7:00 PM',
    description: 'Unwind with smooth reggae vibes and infectious dancehall rhythms. Island sounds dominate the airwaves.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/InkMatik.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvSW5rTWF0aWsuanBnIiwiaWF0IjoxNzc4ODYyNTY3LCJleHAiOjE4MTAzOTg1Njd9.PGiJ15a-fGAhA8e0v2HZwnkVIP2jBx4KSrWiPuwX-fA',
    color: 'from-purple-500/20 to-transparent',
    features: ['Reggae Classics', 'Dancehall Hits', 'Dubplates']
  },
  {
    title: 'Underground Kenyan HipHop',
    host: 'Joy Ohon',
    schedule: 'Weekdays | 7:00 PM - 11:00 PM',
    description: 'Featuring Ukoo Flani, Walanguzi, Katapila, Moroko Kalahari, Virusi Mbaya, Shrap, and Wakadinali Drill.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    color: 'from-green-500/20 to-transparent',
    features: ['Ukoo Flani', 'Walanguzi', 'Wakadinali Drill', 'Shrap']
  },
  {
    title: 'Kenyan RnB',
    host: 'Modesto',
    schedule: 'Weekdays | 11:00 PM - 3:00 AM',
    description: 'Smooth Kenyan RnB featuring Bensoul, Nviiri, Otile Brown, Kodong Clan, Sauti Sol, and more.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/RnB.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1JuQi5qcGciLCJpYXQiOjE3NzkyNjcwMzYsImV4cCI6MTgxMDgwMzAzNn0.1n19oWoG6A-EDrXaILLNof75PFG_mg7iLSLI7_aAl9I',
    color: 'from-blue-500/20 to-transparent',
    features: ['Bensoul', 'Nviiri', 'Otile Brown', 'Sauti Sol']
  },
  {
    title: 'Gospel Kenya',
    host: 'RIENG Radio',
    schedule: 'Sundays | All Day + Daily | 3:00 AM - 5:00 AM',
    description: 'Spiritual awakening with Kenya&apos;s finest gospel music. Start your day with uplifting messages and powerful melodies.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Gospel.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL0dvc3BlbC5qcGciLCJpYXQiOjE3Nzc2MTg2OTAsImV4cCI6MTgwOTE1NDY5MH0.FiCgYciSVoTbmjsZ039KJG8_hlbPa18hY7rl10hUzrw',
    color: 'from-yellow-500/20 to-transparent',
    features: ['Gospel Hits', 'Spiritual Messages', 'Uplifting Vibes']
  },
  {
    title: 'SPORTS SHOW',
    host: 'Bura & Swat',
    schedule: 'Saturday | 8:00 AM - 12:00 PM',
    description: 'The ultimate sports breakdown. Hot takes, live analysis, and all the weekend action from local and international sports.',
    image: '/Bura.jpg',
    color: 'from-green-500/20 to-transparent',
    features: ['Live Sports Analysis', 'Athlete Interviews', 'Fantasy Football Talk']
  },
  {
    title: 'POLITICS SHOW - STARTING SOON',
    host: 'HON MICHAEL THIONGO KAZIDUU',
    schedule: 'Saturday | 9:00 AM - 1:00 PM',
    description: 'In-depth political interviews with leading politicians and presidential aspirants. No questions off-limits.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Politics.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1BvbGl0aWNzLmpwZyIsImlhdCI6MTc3OTQ1NjgwOSwiZXhwIjoxODEwOTkyODA5fQ.cL7be6KjlWm1cMDWqElTql568ju6o8GznaYZvAAim8o',
    color: 'from-blue-500/20 to-transparent',
    features: ['Political Interviews', 'Policy Discussions', 'Election Coverage']
  },
]

const weekendShows = [
  {
    title: 'Bongo',
    day: 'Saturday',
    schedule: '1:00 PM - 3:00 PM',
    description: 'A Swahili-heavy East African heat check: catchy hooks, street poetry, and that Tanzanian pop/hip-hop bounce that makes Bongo Flava so sticky. Featuring Diamond Platnumz, Nandy, Harmonize, Alikiba, and Rayvanny.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    color: 'from-orange-500 to-orange-900'
  },
  {
    title: 'Naija',
    day: 'Saturday',
    schedule: '3:00 PM - 5:00 PM',
    description: 'Pure Afrobeats energy for the weekend takeover: danceable drums, sing-along choruses, and glossy crossover records. Burna Boy, Wizkid, Davido, and Fireboy DML are all solid anchors here.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    color: 'from-green-500 to-green-900'
  },
  {
    title: 'Piano',
    day: 'Saturday',
    schedule: '5:00 PM - 7:00 PM',
    description: 'Amapiano is the South African township sound built on jazz/house roots, warm keys, and deep log-drum grooves. Kabza De Small, DJ Maphorisa, Kamo Mphela, Tyla, and Boohle fit this lane nicely.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    color: 'from-yellow-500 to-yellow-900'
  },
  {
    title: 'Lingala',
    day: 'Saturday',
    schedule: '7:00 PM - 9:00 PM',
    description: 'The Congolese rumba/soukous power slot: bright guitars, big dance energy, and that rich Lingala feel that always sounds like a celebration. Fally Ipupa, Koffi Olomidé, Werrason, and Awilo Longomba.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    color: 'from-red-500 to-red-900'
  },
  {
    title: 'Gospel / Worship',
    day: 'Sunday',
    schedule: '5:00 AM - 7:00 AM',
    description: 'A proper sunrise worship block, separate from the weekday run. Think big-voice praise, choir moments, and testimony-driven worship with Kirk Franklin, CeCe Winans, Mercy Chinwo, and Benjamin Dube.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    color: 'from-purple-500 to-purple-900'
  },
  {
    title: 'US R&B',
    day: 'Sunday',
    schedule: '1:00 PM - 3:00 PM',
    description: 'Smooth, emotional, glossy R&B with a little soul and hip-hop drizzle on top. SZA, H.E.R., Chris Brown, and The Weeknd are strong names for this block.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    color: 'from-blue-500 to-blue-900'
  },
  {
    title: 'US Hip-Hop',
    day: 'Sunday',
    schedule: '3:00 PM - 5:00 PM',
    description: 'The bars-and-attitude slot: lyric-heavy, culture-heavy, and built for replay value. Kendrick Lamar and Drake are the cleanest headliners here.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    color: 'from-gray-500 to-gray-900'
  },
  {
    title: 'New Kenyan Music',
    day: 'Sunday',
    schedule: '7:00 PM - 9:00 PM',
    description: 'The fresh-evening lane for the current wave: Kenya’s most-streamed space is now heavily rap, hip-hop, Afropop, and Afrobeats-driven. Featuring Bien, Sauti Sol, Wakadinali, Nyashinski, Lil Maina, and Okello Max.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    color: 'from-primary to-orange-900'
  }
]

/* ─── Scramble Text ───────────────────────────────────────────── */
function ScrambleText({ text, active }: { text: string; active: boolean }) {
  const [out, setOut] = useState(text)
  useEffect(() => {
    if (!active) { setOut(text); return }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let iter = 0
    const id = setInterval(() => {
      setOut(text.split('').map((c, i) => {
        if (c === ' ') return ' '
        if (i < iter) return text[i]
        return chars[Math.floor(Math.random() * chars.length)]
      }).join(''))
      iter += 0.9
      if (iter > text.length) { clearInterval(id); setOut(text) }
    }, 32)
    return () => clearInterval(id)
  }, [active, text])
  return <>{out}</>
}

/* ─── Weekend Card (3-D tilt + spotlight + scramble) ───────────── */
type WKShow = typeof weekendShows[0]
function WeekendCard({ show, delay }: { show: WKShow; delay: number }) {
  const cardRef   = useRef<HTMLDivElement>(null)
  const imgRef    = useRef<HTMLDivElement>(null)
  const spotRef   = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const rafRef    = useRef<number>()
  const [hovered, setHovered] = useState(false)

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const el = cardRef.current; if (!el) return
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top)  / r.height
      const rx = (y - 0.5) * -22
      const ry = (x - 0.5) *  26
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.06)`
      const img = imgRef.current
      if (img) img.style.transform = `scale(1.14) translate(${ry * -0.55}px, ${rx * 0.45}px)`
      const spot = spotRef.current
      if (spot) spot.style.background =
        `radial-gradient(circle at ${x*100}% ${y*100}%, rgba(255,140,0,0.5) 0%, rgba(255,140,0,0.15) 38%, transparent 62%)`
    })
  }, [])

  const onEnter = useCallback(() => {
    const el = cardRef.current
    if (el) {
      el.style.transition = 'transform 0.07s linear, box-shadow 0.3s ease'
      el.style.boxShadow  = '0 32px 80px rgba(0,0,0,0.95), 0 0 0 1.5px rgba(255,140,0,0.65), 0 0 50px rgba(255,140,0,0.22)'
    }
    const img = imgRef.current
    if (img) img.style.transition = 'transform 0.07s linear'
    const spot = spotRef.current
    if (spot) { spot.style.opacity = '1' }
    const ov = overlayRef.current
    if (ov) ov.style.clipPath = 'inset(0% 0 0 0)'
    setHovered(true)
  }, [])

  const onLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const el = cardRef.current
    if (el) {
      el.style.transition = 'transform 0.7s cubic-bezier(0.23,1,0.32,1), box-shadow 0.5s ease'
      el.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)'
      el.style.boxShadow  = 'none'
    }
    const img = imgRef.current
    if (img) {
      img.style.transition = 'transform 0.7s cubic-bezier(0.23,1,0.32,1)'
      img.style.transform  = 'scale(1.08)'
    }
    const spot = spotRef.current
    if (spot) spot.style.opacity = '0'
    const ov = overlayRef.current
    if (ov) ov.style.clipPath = 'inset(100% 0 0 0)'
    setHovered(false)
  }, [])

  return (
    <div
      ref={cardRef}
      className="wk-card relative aspect-square overflow-hidden cursor-none select-none"
      style={{
        animationDelay: `${delay}s`,
        transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: 'transform 0.7s cubic-bezier(0.23,1,0.32,1)',
        willChange: 'transform',
      }}
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Poster with parallax headroom */}
      <div ref={imgRef} className="absolute inset-0" style={{ transform: 'scale(1.08)', willChange: 'transform' }}>
        <Image src={show.image} alt={show.title} fill className="object-cover" />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent pointer-events-none" />

      {/* Cursor spotlight */}
      <div
        ref={spotRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0, transition: 'opacity 0.35s ease', mixBlendMode: 'screen', willChange: 'background, opacity' }}
      />

      {/* Resting label */}
      <div
        className="absolute bottom-0 left-0 right-0 p-4 md:p-6 pointer-events-none"
        style={{ opacity: hovered ? 0 : 1, transform: hovered ? 'translateY(6px)' : 'translateY(0)', transition: 'opacity 0.35s, transform 0.35s' }}
      >
        <span className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] block mb-1">{show.schedule}</span>
        <h3 className="text-white font-black uppercase tracking-tight text-lg md:text-xl leading-tight">{show.title}</h3>
      </div>

      {/* Clip-path wipe overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/88 backdrop-blur-md flex flex-col justify-end p-5 md:p-7 pointer-events-none"
        style={{ clipPath: 'inset(100% 0 0 0)', transition: 'clip-path 0.58s cubic-bezier(0.33,1,0.68,1)' }}
      >
        <span
          className="inline-block bg-primary text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3 w-max"
          style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.4s 0.1s, transform 0.4s 0.1s' }}
        >{show.day} · {show.schedule}</span>
        <h3
          className="text-white font-black uppercase tracking-tight text-xl md:text-2xl leading-tight mb-3"
          style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.4s 0.16s, transform 0.4s 0.16s' }}
        ><ScrambleText text={show.title} active={hovered} /></h3>
        <p
          className="text-gray-300 text-xs md:text-sm leading-relaxed line-clamp-4"
          style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.4s 0.22s, transform 0.4s 0.22s' }}
        >{show.description}</p>
      </div>
    </div>
  )
}

export default function ShowsPage() {
  const [currentHour, setCurrentHour] = useState(12)
  const [currentDay, setCurrentDay] = useState(0)
  const [mounted, setMounted] = useState(false)


  useEffect(() => {
    const now = new Date()
    setCurrentHour(now.getHours())
    setCurrentDay(now.getDay())
    setMounted(true)
  }, [])

  return (
    <main className="min-h-screen bg-[#050505] selection:bg-primary selection:text-white">
      <Navbar />
      
      {/* Fixed Parallax Background */}
      <div className="fixed top-0 left-0 w-full h-[50vh] z-0 pointer-events-none">
        <Image 
          src="/Banner.jpg"
          alt="Parallax Background"
          fill
          className="object-cover opacity-40 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/80 to-[#050505]"></div>
      </div>

      {/* Massive Cinematic Header */}
      <section className="relative pt-24 pb-16 border-b border-white/5 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-6 relative">
             The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 italic pr-6 inline-block drop-shadow-2xl">Line-Up</span>
           </h1>
           <p className="text-xl text-gray-300 font-medium max-w-2xl border-l-[6px] border-primary pl-6 shadow-2xl">
             No generic playlists. No automated loops. Just pure, unadulterated Kenyan culture broadcasted live from our studios 24/7.
           </p>
        </div>
      </section>

      {/* Shows List - Full Width Horizontal Rows Instead of Cards */}
      <section className="relative z-20 bg-[#050505]">
        {dailyShows.map((show, idx) => {
          
          let isLive = false;
          if (mounted) {
            if (show.title === 'Kenyan Old School' && currentHour >= 5 && currentHour < 10) isLive = true;
            if (show.title === 'Gengetone / Arbantone' && currentHour >= 10 && currentHour < 15) isLive = true;
            if (show.title === 'Reggae / Dancehall' && currentHour >= 15 && currentHour < 19) isLive = true;
            if (show.title === 'Underground Kenyan HipHop' && currentHour >= 19 && currentHour < 23) isLive = true;
            if (show.title === 'Kenyan RnB' && (currentHour >= 23 || currentHour < 3)) isLive = true;
            if (show.title === 'Gospel Kenya' && (currentDay === 0 || (currentHour >= 3 && currentHour < 5))) isLive = true;
            if (show.title === 'SPORTS SHOW' && currentDay === 6 && currentHour >= 8 && currentHour < 12) isLive = true;
            if (show.title === 'POLITICS SHOW' && currentDay === 6 && currentHour >= 15 && currentHour < 19) isLive = true;
          }

          return (
            <div key={idx} className={`relative border-b border-white/5 ${idx % 2 === 0 ? 'bg-[#080808]' : 'bg-[#050505]'}`}>
              {/* Dynamic subtle background glow per show */}
              <div className={`absolute inset-0 bg-gradient-to-r ${show.color} opacity-30 pointer-events-none hidden md:block`}></div>
              
              <div className="max-w-7xl auto mx-auto flex flex-col lg:flex-row min-h-[600px]">
                
               {/* Left/Right Text Content */}
                <div className={`flex-1 p-8 md:p-16 lg:p-24 flex flex-col justify-center relative z-10 ${idx % 2 !== 0 ? 'lg:order-2' : ''}`}>
                  {isLive && (
                    <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-1.5 rounded-full mb-8 w-max relative">
                       <span className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-60"></span>
                       <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,1)]"></span>
                       <span className="text-xs font-black uppercase tracking-[0.2em] relative z-10">Live On Air</span>
                    </div>
                  )}
                  {!isLive && (
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-400 px-4 py-1.5 rounded-full mb-8 w-max">
                       <span className="text-xs font-black uppercase tracking-[0.2em]">{show.schedule}</span>
                    </div>
                  )}
                  
                  <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-4">{show.title}</h2>
                  <p className="text-primary font-bold tracking-widest uppercase mb-8 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 14.5c-2.481 0-4.5-2.019-4.5-4.5S9.519 7.5 12 7.5s4.5 2.019 4.5 4.5-2.019 4.5-4.5 4.5zm0-7.5c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z"/></svg>
                    Hosted by {show.host}
                  </p>
                  
                  <p className="text-gray-400 md:text-lg leading-relaxed mb-10 max-w-xl">
                    {show.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                     {show.features.map((feature, fIdx) => (
                       <span key={fIdx} className="bg-white/5 px-4 py-2 rounded-sm text-xs font-bold text-gray-300 uppercase tracking-[0.1em] border border-white/5 shadow-inner">
                         {feature}
                       </span>
                     ))}
                  </div>
                </div>

                {/* Left/Right Image Content */}
                <div className={`flex-1 relative min-h-[400px] overflow-hidden group ${idx % 2 !== 0 ? 'lg:order-1' : ''}`}>
                   <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 z-10 mix-blend-overlay"></div>
                   <Image 
                     src={show.image}
                     alt={show.title}
                     fill
                     className="object-cover transition-transform duration-1000 group-hover:scale-105"
                   />
                   {/* Gradient fade to seamlessly blend image edge with text side */}
                   <div className={`absolute inset-0 z-10 pointer-events-none ${idx % 2 !== 0 ? 'bg-gradient-to-t lg:bg-gradient-to-r' : 'bg-gradient-to-t lg:bg-gradient-to-l'} from-[#050505] via-transparent to-transparent opacity-100`}></div>
                </div>

              </div>
            </div>
          )
        })}
      </section>

      {/* Weekend Specials — Full-Bleed Editorial Card Grid */}
      <section className="relative z-20 bg-[#050505] border-t border-white/5">

        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="flex items-end justify-between flex-wrap gap-6">
            <div>
              <span className="text-primary font-black uppercase tracking-[0.4em] text-sm block mb-3">Weekend Specials</span>
              <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">
                Sat &amp; <span className="text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.6)] italic">Sun</span>
              </h2>
            </div>
            <p className="text-gray-400 max-w-sm text-lg leading-relaxed border-l-4 border-primary pl-5">
              From sunrise worship to late-night Kenyan heat — every weekend gets its own sound.
            </p>
          </div>
        </div>

        {/* ── SATURDAY BLOCK ── */}
        <div className="relative border-t border-white/[0.06]">
          {/* Giant ghost day label */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-white/[0.06] font-black uppercase text-[5rem] md:text-[8rem] leading-none tracking-tighter select-none">SAT</span>
              <div>
                <p className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-1">Saturday</p>
                <p className="text-gray-500 text-sm">{weekendShows.filter(s => s.day === 'Saturday').length} shows</p>
              </div>
            </div>
            <div className="h-px flex-1 mx-8 bg-white/[0.06] hidden md:block"></div>
          </div>

          {/* 4-col full-bleed grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px]">
            {weekendShows.filter(s => s.day === 'Saturday').map((show, cardIdx) => (
              <WeekendCard key={weekendShows.indexOf(show)} show={show} delay={cardIdx * 0.09} />
            ))}
          </div>
        </div>

        {/* ── SUNDAY BLOCK ── */}
        <div className="relative border-t border-white/[0.06] mt-[2px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-white/[0.06] font-black uppercase text-[5rem] md:text-[8rem] leading-none tracking-tighter select-none">SUN</span>
              <div>
                <p className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-1">Sunday</p>
                <p className="text-gray-500 text-sm">{weekendShows.filter(s => s.day === 'Sunday').length} shows</p>
              </div>
            </div>
            <div className="h-px flex-1 mx-8 bg-white/[0.06] hidden md:block"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px]">
            {weekendShows.filter(s => s.day === 'Sunday').map((show, cardIdx) => (
              <WeekendCard key={weekendShows.indexOf(show)} show={show} delay={cardIdx * 0.09} />
            ))}
          </div>
        </div>

        <div className="pb-24"></div>
      </section>

      {/* Guest Mixes Banner Section */}
      <section className="bg-primary relative overflow-hidden py-24 md:py-32">
         <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(#000 3px, transparent 3px)', backgroundSize: '24px 24px' }}></div>
         <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-2xl">
               <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6 leading-none">Weekend <br/><span className="text-black italic">Takeovers.</span></h2>
               <p className="text-black font-black uppercase tracking-widest md:text-xl mb-10 border-l-4 border-black pl-5">Every weekend we hand the keys to the studio over to Kenya&apos;s hardest underground DJs for unfiltered, 4-hour live sets.</p>
               <a href="mailto:shows@riengradio.co.ke" className="inline-flex items-center gap-4 bg-black hover:bg-white text-white hover:text-black font-black uppercase tracking-widest px-10 py-5 rounded-full transition-all duration-300 shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] w-max">
                 Apply for a Guest Mix <span className="text-2xl">→</span>
               </a>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  )
}

