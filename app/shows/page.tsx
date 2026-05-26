'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
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
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/KenyanOldSchool.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL0tlbnlhbk9sZFNjaG9vbC5qcGciLCJpYXQiOjE3Nzg5MjkyNzksImV4cCI6MTgxMDQ2NTI3OX0.v6fsoH7FpaX9-sDUtk1Kwk_5hiRTzvK_c9HIBHHU-LI',
    color: 'from-orange-500 to-orange-900',
    features: ['Diamond Platnumz', 'Nandy', 'Harmonize']
  },
  {
    title: 'Naija',
    day: 'Saturday',
    schedule: '3:00 PM - 5:00 PM',
    description: 'Pure Afrobeats energy for the weekend takeover: danceable drums, sing-along choruses, and glossy crossover records. Burna Boy, Wizkid, Davido, and Fireboy DML are all solid anchors here.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Underground.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1VuZGVyZ3JvdW5kLmpwZyIsImlhdCI6MTc3ODkyOTUxNiwiZXhwIjoxODEwNDY1NTE2fQ.pKGmaixaUTCozsgsdKO5vn2DMu8HpNniojn6Zc8bRR8',
    color: 'from-green-500 to-green-900',
    features: ['Afrobeats', 'Burna Boy', 'Wizkid', 'Davido']
  },
  {
    title: 'Piano',
    day: 'Saturday',
    schedule: '5:00 PM - 7:00 PM',
    description: 'Amapiano is the South African township sound built on jazz/house roots, warm keys, and deep log-drum grooves. Kabza De Small, DJ Maphorisa, Kamo Mphela, Tyla, and Boohle fit this lane nicely.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Gospel.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL0dvc3BlbC5qcGciLCJpYXQiOjE3Nzc2MTg2OTAsImV4cCI6MTgwOTE1NDY5MH0.FiCgYciSVoTbmjsZ039KJG8_hlbPa18hY7rl10hUzrw',
    color: 'from-yellow-500 to-yellow-900',
    features: ['Amapiano', 'Kabza De Small', 'DJ Maphorisa']
  },
  {
    title: 'Lingala',
    day: 'Saturday',
    schedule: '7:00 PM - 9:00 PM',
    description: 'The Congolese rumba/soukous power slot: bright guitars, big dance energy, and that rich Lingala feel that always sounds like a celebration. Fally Ipupa, Koffi Olomidé, Werrason, and Awilo Longomba.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Gengetone2.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL0dlbmdldG9uZTIuanBnIiwiaWF0IjoxNzc5MjcxMjcxLCJleHAiOjE4MTA4MDcyNzF9.8g2lcsHxZHP3zTn1nnGaS7WDdO51ILslPaQA_t8O5IM',
    color: 'from-red-500 to-red-900',
    features: ['Rumba', 'Fally Ipupa', 'Koffi Olomidé']
  },
  {
    title: 'Gospel / Worship',
    day: 'Sunday',
    schedule: '5:00 AM - 7:00 AM',
    description: 'A proper sunrise worship block, separate from the weekday run. Think big-voice praise, choir moments, and testimony-driven worship with Kirk Franklin, CeCe Winans, Mercy Chinwo, and Benjamin Dube.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/InkMatik.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvSW5rTWF0aWsuanBnIiwiaWF0IjoxNzc4ODYyNTY3LCJleHAiOjE4MTAzOTg1Njd9.PGiJ15a-fGAhA8e0v2HZwnkVIP2jBx4KSrWiPuwX-fA',
    color: 'from-purple-500 to-purple-900',
    features: ['Sunrise Worship', 'Kirk Franklin', 'CeCe Winans']
  },
  {
    title: 'US R&B',
    day: 'Sunday',
    schedule: '1:00 PM - 3:00 PM',
    description: 'Smooth, emotional, glossy R&B with a little soul and hip-hop drizzle on top. SZA, H.E.R., Chris Brown, and The Weeknd are strong names for this block.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/RnB.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1JuQi5qcGciLCJpYXQiOjE3NzkyNjcwMzYsImV4cCI6MTgxMDgwMzAzNn0.1n19oWoG6A-EDrXaILLNof75PFG_mg7iLSLI7_aAl9I',
    color: 'from-blue-500 to-blue-900',
    features: ['SZA', 'H.E.R.', 'Chris Brown']
  },
  {
    title: 'US Hip-Hop',
    day: 'Sunday',
    schedule: '3:00 PM - 5:00 PM',
    description: 'The bars-and-attitude slot: lyric-heavy, culture-heavy, and built for replay value. Kendrick Lamar and Drake are the cleanest headliners here.',
    image: '/Bura.jpg',
    color: 'from-gray-500 to-gray-900',
    features: ['Kendrick Lamar', 'Drake', 'J. Cole']
  },
  {
    title: 'New Kenyan Music',
    day: 'Sunday',
    schedule: '7:00 PM - 9:00 PM',
    description: 'The fresh-evening lane for the current wave: Kenya’s most-streamed space is now heavily rap, hip-hop, Afropop, and Afrobeats-driven. Featuring Bien, Sauti Sol, Wakadinali, Nyashinski, Lil Maina, and Okello Max.',
    image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/UpdatedShows/Politics.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvVXBkYXRlZFNob3dzL1BvbGl0aWNzLmpwZyIsImlhdCI6MTc3OTQ1NjgwOSwiZXhwIjoxODEwOTkyODA5fQ.cL7be6KjlWm1cMDWqElTql568ju6o8GznaYZvAAim8o',
    color: 'from-primary to-orange-900',
    features: ['Bien', 'Wakadinali', 'Nyashinski']
  }
]

function PremiumWeekendAccordion() {
  const satShows = weekendShows.filter(s => s.day === 'Saturday')
  const sunShows = weekendShows.filter(s => s.day === 'Sunday')
  
  const [activeSat, setActiveSat] = useState<number | null>(0)
  const [activeSun, setActiveSun] = useState<number | null>(0)

  return (
    <section className="relative z-20 bg-[#020202] py-24 md:py-32 overflow-hidden border-t border-white/5">
      {/* Decorative Blur Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-1.5 rounded-full mb-6 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Curated Selection</span>
            </div>
            <h2 className="text-5xl md:text-8xl lg:text-[9rem] font-black uppercase tracking-tighter leading-none text-white">
              Weekend
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-yellow-500 italic pr-4 drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]">Anthems</span>
            </h2>
          </div>
          <p className="max-w-md text-gray-400 font-medium text-lg leading-relaxed border-l-[3px] border-primary/50 pl-6 lg:mb-8">
            Step into the sonic underground. Carefully curated, deeply rooted, and broadcasted live. Explore our premium weekend roster.
          </p>
        </div>

        {/* Saturday Container */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Saturday
            </h3>
            <span className="text-4xl md:text-5xl font-black text-primary/40">/01</span>
            <div className="h-[2px] bg-white/10 flex-1 ml-4 rounded-full"></div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-3 h-[800px] lg:h-[650px]">
            {satShows.map((show, i) => (
              <div 
                key={i}
                onMouseEnter={() => setActiveSat(i)}
                onMouseLeave={() => setActiveSat(null)}
                className={`relative rounded-[2rem] overflow-hidden cursor-crosshair transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] flex-shrink-0 group
                  ${activeSat === i ? 'lg:flex-[3.5] flex-[4]' : activeSat === null ? 'lg:flex-1 flex-1' : 'lg:flex-[0.5] flex-[0.5]'}`}
              >
                <div className="absolute inset-0 bg-[#050505]">
                  <Image src={show.image} alt={show.title} fill className={`object-cover transition-all duration-[1500ms] ease-out ${activeSat === i ? 'scale-105 opacity-80' : 'scale-100 opacity-40 grayscale group-hover:grayscale-0'}`} />
                  <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-[#020202]/50 to-[#020202] transition-opacity duration-700 ${activeSat === i ? 'opacity-100' : 'opacity-90'}`} />
                </div>
                
                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end pointer-events-none">
                   
                   {/* Inactive Title (Always bottom left, fade out when active) */}
                   <div className={`absolute bottom-6 md:bottom-10 left-6 md:left-10 transition-all duration-500 flex flex-col items-start
                     ${activeSat === i ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0 delay-200'}`}>
                      <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 lg:hidden border border-white/20">
                        <span className="text-white text-xs font-black">{i + 1}</span>
                      </div>
                      <h4 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter [writing-mode:vertical-rl] lg:rotate-180 lg:text-3xl whitespace-nowrap hidden lg:block">
                        {show.title}
                      </h4>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tighter lg:hidden drop-shadow-xl">
                        {show.title}
                      </h4>
                   </div>

                   {/* Active Content */}
                   <div className={`relative z-10 transition-all duration-[800ms] ease-out w-full ${activeSat === i ? 'opacity-100 translate-y-0 delay-100 pointer-events-auto' : 'opacity-0 translate-y-8 absolute pointer-events-none'}`}>
                     <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 lg:gap-8 w-full">
                       
                       {/* Text Side */}
                       <div className="flex-1 w-full max-w-3xl">
                          <div className="inline-flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 mb-6">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            <span className="text-white text-xs font-bold uppercase tracking-widest">{show.schedule}</span>
                          </div>
                          <h4 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter mb-4 lg:mb-6 leading-[0.9] drop-shadow-2xl">
                            {show.title}
                          </h4>
                          <p className="text-gray-200 font-medium text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed drop-shadow-lg">
                            {show.description}
                          </p>
                          
                          {/* Features/Tags if any */}
                          {show.features && (
                            <div className="flex flex-wrap gap-2 mt-6 lg:mt-8">
                               {show.features.map((feature, fIdx) => (
                                 <span key={fIdx} className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-widest border border-white/20 shadow-xl hover:bg-white hover:text-black transition-colors cursor-default">
                                   {feature}
                                 </span>
                               ))}
                            </div>
                          )}
                       </div>

                       {/* Poster Side */}
                       <div className={`hidden md:block w-48 lg:w-72 xl:w-[320px] aspect-[4/5] relative rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 shrink-0 transform transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] origin-bottom ${activeSat === i ? 'translate-y-0 opacity-100 scale-100 lg:rotate-[-4deg] lg:hover:rotate-0 lg:hover:scale-105' : 'translate-y-32 opacity-0 scale-75 rotate-12'}`}>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          <Image src={(show as any).poster || show.image} alt={`${show.title} Poster`} fill className="object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none mix-blend-overlay"></div>
                       </div>

                     </div>
                   </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sunday Container */}
        <div>
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Sunday
            </h3>
            <span className="text-4xl md:text-5xl font-black text-primary/40">/02</span>
            <div className="h-[2px] bg-white/10 flex-1 ml-4 rounded-full"></div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-3 h-[800px] lg:h-[650px]">
            {sunShows.map((show, i) => (
              <div 
                key={i}
                onMouseEnter={() => setActiveSun(i)}
                onMouseLeave={() => setActiveSun(null)}
                className={`relative rounded-[2rem] overflow-hidden cursor-crosshair transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] flex-shrink-0 group
                  ${activeSun === i ? 'lg:flex-[3.5] flex-[4]' : activeSun === null ? 'lg:flex-1 flex-1' : 'lg:flex-[0.5] flex-[0.5]'}`}
              >
                <div className="absolute inset-0 bg-[#050505]">
                  <Image src={show.image} alt={show.title} fill className={`object-cover transition-all duration-[1500ms] ease-out ${activeSun === i ? 'scale-105 opacity-80' : 'scale-100 opacity-40 grayscale group-hover:grayscale-0'}`} />
                  <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-[#020202]/50 to-[#020202] transition-opacity duration-700 ${activeSun === i ? 'opacity-100' : 'opacity-90'}`} />
                </div>
                
                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end pointer-events-none">
                   
                   {/* Inactive Title */}
                   <div className={`absolute bottom-6 md:bottom-10 left-6 md:left-10 transition-all duration-500 flex flex-col items-start
                     ${activeSun === i ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0 delay-200'}`}>
                      <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 lg:hidden border border-white/20">
                        <span className="text-white text-xs font-black">{i + 1}</span>
                      </div>
                      <h4 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter [writing-mode:vertical-rl] lg:rotate-180 lg:text-3xl whitespace-nowrap hidden lg:block">
                        {show.title}
                      </h4>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tighter lg:hidden drop-shadow-xl">
                        {show.title}
                      </h4>
                   </div>

                   {/* Active Content */}
                   <div className={`relative z-10 transition-all duration-[800ms] ease-out w-full ${activeSun === i ? 'opacity-100 translate-y-0 delay-100 pointer-events-auto' : 'opacity-0 translate-y-8 absolute pointer-events-none'}`}>
                     <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 lg:gap-8 w-full">
                       
                       {/* Text Side */}
                       <div className="flex-1 w-full max-w-3xl">
                          <div className="inline-flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 mb-6">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            <span className="text-white text-xs font-bold uppercase tracking-widest">{show.schedule}</span>
                          </div>
                          <h4 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter mb-4 lg:mb-6 leading-[0.9] drop-shadow-2xl">
                            {show.title}
                          </h4>
                          <p className="text-gray-200 font-medium text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed drop-shadow-lg">
                            {show.description}
                          </p>
                          
                          {/* Features/Tags if any */}
                          {show.features && (
                            <div className="flex flex-wrap gap-2 mt-6 lg:mt-8">
                               {show.features.map((feature, fIdx) => (
                                 <span key={fIdx} className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-widest border border-white/20 shadow-xl hover:bg-white hover:text-black transition-colors cursor-default">
                                   {feature}
                                 </span>
                               ))}
                            </div>
                          )}
                       </div>

                       {/* Poster Side */}
                       <div className={`hidden md:block w-48 lg:w-72 xl:w-[320px] aspect-[4/5] relative rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 shrink-0 transform transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] origin-bottom ${activeSun === i ? 'translate-y-0 opacity-100 scale-100 lg:rotate-[-4deg] lg:hover:rotate-0 lg:hover:scale-105' : 'translate-y-32 opacity-0 scale-75 rotate-12'}`}>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          <Image src={(show as any).poster || show.image} alt={`${show.title} Poster`} fill className="object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none mix-blend-overlay"></div>
                       </div>

                     </div>
                   </div>

                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
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

      {/* Weekend Specials — Premium Accordion */}
      <PremiumWeekendAccordion />

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

