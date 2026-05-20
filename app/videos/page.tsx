'use client'

import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { songsForSale } from '@/lib/musicData'

// Data Sets
const mainHeroVideo = {
  id: '3bdhwSoeZ9g',
  title: 'Sing Ama Pilipili | Kartelo ft. Modesto',
  desc: 'One of RIENGFLIX’s absolute biggest public hits. A wild Pilipili-style studio episode with Kartelo and Modesto that takes zero prisoners and pushes the boundaries of raw radio.',
  badge: 'Blockbuster Hit',
  image: '/VidsHero.png' // <-- Download your image to the "public" folder and change this name to match (e.g., '/my-hero-pic.jpg')
}

const theSeriesVideos = [
  {
    id: 'OUFm3s1wn48',
    title: 'ANSWER AMA PILIPILI | Miracle Baby in Tears',
    desc: 'A high-performing RIENG Radio episode built around the answer-or-bite format.',
    duration: '22:15'
  },
  {
    id: 'SlagKsO_xAU',
    title: 'MISTARI AMA PILIPILI | Kartelo vs. Miracle Baby',
    desc: 'Legendary installment focusing strictly on song lyrics. One of the most watched sessions.',
    duration: '18:40'
  },
  {
    id: 'DrdbQ1I-aIA',
    title: 'Rieng Radio Reunion | How Big Dreams Die',
    desc: 'Reunion-style episode with the core crew; an intensely strong returning format.',
    duration: '45:10'
  },
  {
    id: '-DMoaDCixNo',
    title: 'Rieng Radio Reggae Session Ep 1 | Mc Shalkido',
    desc: 'The reggae session video that cements the brand’s culture-heavy reputation.',
    duration: '1:10:05'
  }
]

const theSeriesRow2 = [
  {
    id: 'yaiNt80SjiM',
    title: '"Miracle Baby Aliteka Karao" | Police Brutality',
    desc: 'A raw, honest podcast episode where Kartelo and Miracle Baby tackle the serious issue of police brutality in the streets.',
    duration: '69K Views'
  },
  {
    id: 'M9tIVvCgowg',
    title: '"Kuimpress Madame Ni Ngumu" | Heartbreaks',
    desc: 'Kartelo and Modesto discuss relationships, heartbreaks, and the difficulties of navigating romance in the city.',
    duration: '65K Views'
  },
  {
    id: 'DrdbQ1I-aIA',
    title: 'Rieng Radio Reunion | How Big Dreams Die',
    desc: 'A massive milestone episode featuring the core trio reuniting to speak frankly about the struggles of the entertainment industry.',
    duration: '107K Views'
  },
  {
    id: 'JeFwy18F1mA',
    title: 'Reggae Session Vol. 2 | MC Shalkido & DJ C4',
    desc: 'The second installment of their successful live mix series. A heavy Reggae and Dancehall set curated by DJ C4.',
    duration: '34K Views'
  }
]

const socialDrops = [
  {
    platform: 'YouTube',
    videoId: 'q5KpAN3Wg0s',
    title: 'DRYSPELL SI FUNNY',
    desc: 'A classic, honest, and hilarious conversation episode featuring Modesto and Kartelo getting real about street life.',
    image: 'https://img.youtube.com/vi/q5KpAN3Wg0s/hqdefault.jpg',
    color: 'bg-red-600',
    aspect: 'aspect-[4/5]'
  },
  {
    platform: 'Facebook',
    title: 'Basic Needs Za Kayole',
    desc: 'Branded social video post tied directly to Kartelo and Modesto.',
    url: 'https://www.facebook.com/karteloofficialke/videos/1152025615168295/',
    image: '/KarteloandMiracleBaby.jpg',
    color: 'bg-blue-600',
    aspect: 'aspect-square'
  },
  {
    platform: 'YouTube',
    videoId: 'v9Nor4dkT0M',
    title: 'Pilipili Primary School Edition',
    desc: 'Another massive spin-off of their famous Pilipili challenge, this time doing primary school trivia. High comedy value.',
    image: 'https://img.youtube.com/vi/v9Nor4dkT0M/hqdefault.jpg',
    color: 'bg-red-600',
    aspect: 'aspect-[4/5]'
  },
  {
    platform: 'Facebook',
    title: 'Tuko na episode mpya ya RIENG RADIO',
    desc: 'Promo post pushing the new RIENG Radio episodes out to the public.',
    url: 'https://www.facebook.com/karteloofficialke/posts/462573182194892/',
    image: '/Studio.jpg',
    color: 'bg-blue-600',
    aspect: 'aspect-square'
  },
  {
    platform: 'YouTube',
    videoId: '5iJXQA0JP28',
    title: 'JUA SHENG Episode 2',
    desc: 'A bite-sized segment testing modern Nairobi slang. Pure street culture and extremely fast-paced.',
    image: 'https://img.youtube.com/vi/5iJXQA0JP28/hqdefault.jpg',
    color: 'bg-red-600',
    aspect: 'aspect-[4/5]'
  }
]

const categoryData = [
  {
    name: 'Music',
    num: '01',
    accentColor: '#f97316',
    accentClass: 'bg-orange-500',
    glow: 'rgba(249,115,22,0.15)',
    borderActive: 'border-orange-500/50',
    textActive: 'text-orange-400',
    // Dynamically sourced from lib/musicData.ts — add songs there to update this
    videos: [] as { id: string; title: string; views: string; image?: string; isAudio?: boolean }[],
  },
  {
    name: 'Comedy',
    num: '02',
    accentColor: '#eab308',
    accentClass: 'bg-yellow-400',
    glow: 'rgba(234,179,8,0.15)',
    borderActive: 'border-yellow-400/50',
    textActive: 'text-yellow-400',
    videos: [
      { id: 'OUFm3s1wn48', title: 'ANSWER AMA PILIPILI | Miracle Baby in Tears', views: '107K Views' },
      { id: 'SlagKsO_xAU', title: 'MISTARI AMA PILIPILI | Kartelo vs. Miracle Baby', views: '69K Views' },
      { id: 'v9Nor4dkT0M', title: 'Pilipili Primary School Edition', views: '55K Views' },
      { id: '5iJXQA0JP28', title: 'JUA SHENG Episode 2', views: '42K Views' },
      { id: 'q5KpAN3Wg0s', title: 'DRYSPELL SI FUNNY', views: '65K Views' },
    ] as { id: string; title: string; views: string }[],
  },
  {
    name: 'Sports',
    num: '03',
    accentColor: '#22c55e',
    accentClass: 'bg-green-500',
    glow: 'rgba(34,197,94,0.15)',
    borderActive: 'border-green-500/50',
    textActive: 'text-green-400',
    videos: [
      { 
        id: 'f_Jb27a3VfM', 
        title: 'ARSENAL ARE PREMIER LEAGUE CHAMPIONS! 🏆🔴 Gunners celebrate as Man City draw 1-1', 
        views: 'BREAKING',
        image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/Arsenal.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvQXJzZW5hbC5qcGciLCJpYXQiOjE3NzkyMjQwNTcsImV4cCI6MTgxMDc2MDA1N30.NIT9WSkM2QVSTt1WWHeuGvHK5KamJZDLqNXzyHChSN0',
        isImageOnly: true
      },
      { 
        id: 'sky-sports-mancity-bournemouth', 
        title: 'Manchester City 1-1 Bournemouth | Match Highlights & Title Handed to Arsenal', 
        views: '1.2M Views',
        image: 'https://dkmdvhzdixefykoojhgt.supabase.co/storage/v1/object/sign/Mp3/maxresdefault.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NTUxYTk2MC04YjVhLTRkNjEtOTJkMS1jMjVkNWNlY2IxMDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNcDMvbWF4cmVzZGVmYXVsdC5qcGciLCJpYXQiOjE3NzkyODU0NzUsImV4cCI6MTgxMDgyMTQ3NX0.iKRLOfGYqwUZQPj7u0JwGHw1P35RtCewDDQQ_DOkE_Y',
        link: 'https://youtu.be/zcKqgfJYsz0?si=5O5V_Dy1T7QXBGL6'
      },
      { 
        id: 'ayi8P9Pfufo', 
        title: 'The Long Wait is Over: Arsenal Fans Celebrate Historic Title Win!', 
        views: '450K Views' 
      }
    ] as { id: string; title: string; views: string; image?: string; isImageOnly?: boolean; link?: string }[],
  },
  {
    name: 'Movies',
    num: '04',
    accentColor: '#a855f7',
    accentClass: 'bg-purple-500',
    glow: 'rgba(168,85,247,0.15)',
    borderActive: 'border-purple-500/50',
    textActive: 'text-purple-400',
    videos: [] as { id: string; title: string; views: string }[],
  },
  {
    name: 'Reality',
    num: '05',
    accentColor: '#ec4899',
    accentClass: 'bg-pink-500',
    glow: 'rgba(236,72,153,0.15)',
    borderActive: 'border-pink-500/50',
    textActive: 'text-pink-400',
    videos: [
      { id: 'yaiNt80SjiM', title: '"Miracle Baby Aliteka Karao" | Police Brutality', views: '69K Views' },
      { id: 'M9tIVvCgowg', title: '"Kuimpress Madame Ni Ngumu" | Heartbreaks', views: '65K Views' },
      { id: 'DrdbQ1I-aIA', title: 'Rieng Radio Reunion | How Big Dreams Die', views: '107K Views' },
    ] as { id: string; title: string; views: string }[],
  },
  {
    name: 'News',
    num: '06',
    accentColor: '#38bdf8',
    accentClass: 'bg-sky-400',
    glow: 'rgba(56,189,248,0.15)',
    borderActive: 'border-sky-400/50',
    textActive: 'text-sky-400',
    videos: [] as { id: string; title: string; views: string }[],
  },
  {
    name: 'Books',
    num: '07',
    accentColor: '#2dd4bf',
    accentClass: 'bg-teal-400',
    glow: 'rgba(45,212,191,0.15)',
    borderActive: 'border-teal-400/50',
    textActive: 'text-teal-400',
    videos: [
      { id: 'f_Jb27a3VfM', title: 'Kidagaa Kimemwozea Audiobook Summary & Analysis', views: '12K Views' },
      { id: 'ayi8P9Pfufo', title: 'The River Between Complete Book Discussion', views: '8.5K Views' }
    ] as { id: string; title: string; views: string; image?: string; isImageOnly?: boolean; link?: string }[],
  },
  {
    name: 'Entertainment Podcasts',
    num: '08',
    accentColor: '#818cf8',
    accentClass: 'bg-indigo-400',
    glow: 'rgba(129,140,248,0.15)',
    borderActive: 'border-indigo-400/50',
    textActive: 'text-indigo-400',
    videos: [
      { id: '-DMoaDCixNo', title: 'Rieng Radio Reggae Session Ep 1 | Mc Shalkido', views: '80K Views' },
      { id: 'JeFwy18F1mA', title: 'Reggae Session Vol. 2 | MC Shalkido & DJ C4', views: '34K Views' },
      { id: 'RCUEd7LaHKY', title: 'Sing Ama Pilipili | Kartelo ft. Modesto', views: '379K Views' },
      { id: 'OUFm3s1wn48', title: 'ANSWER AMA PILIPILI | Miracle Baby in Tears', views: '107K Views' },
      { id: 'M9tIVvCgowg', title: '"Kuimpress Madame Ni Ngumu" | Heartbreaks', views: '65K Views' },
      { id: 'DrdbQ1I-aIA', title: 'Rieng Radio Reunion | How Big Dreams Die', views: '107K Views' },
      { id: '5iJXQA0JP28', title: 'JUA SHENG Episode 2', views: '42K Views' },
    ] as { id: string; title: string; views: string; image?: string; isImageOnly?: boolean; link?: string }[],
  },
  {
    name: 'Politics',
    num: '09',
    accentColor: '#e11d48',
    accentClass: 'bg-rose-500',
    glow: 'rgba(225,29,72,0.15)',
    borderActive: 'border-rose-500/50',
    textActive: 'text-rose-400',
    videos: [
      { id: 'aH837tU7eDk', title: 'Inside the Senate: Live Debates & Policy Decisions', views: '100K Views' },
      { id: 'vJ_l94v0r1k', title: 'Analysis of the New Economic Policies and Trade Agreements', views: '65K Views' }
    ] as { id: string; title: string; views: string; image?: string; isImageOnly?: boolean; link?: string }[],
  },
  {
    name: 'Vines',
    num: '10',
    accentColor: '#84cc16',
    accentClass: 'bg-lime-500',
    glow: 'rgba(132,204,22,0.15)',
    borderActive: 'border-lime-500/50',
    textActive: 'text-lime-400',
    videos: [
      { id: 'SlagKsO_xAU', title: 'The Funniest Vines and Street Comedy of the Week', views: '120K Views' },
      { id: 'OUFm3s1wn48', title: 'Best Funny Moments Compilation', views: '85K Views' }
    ] as { id: string; title: string; views: string; image?: string; isImageOnly?: boolean; link?: string }[],
  },
  {
    name: 'Business',
    num: '11',
    accentColor: '#10b981',
    accentClass: 'bg-emerald-500',
    glow: 'rgba(16,185,129,0.15)',
    borderActive: 'border-emerald-500/50',
    textActive: 'text-emerald-400',
    videos: [
      { id: 'M9tIVvCgowg', title: 'Starting a Small Business in Nairobi: Key Tips & Pitfalls', views: '45K Views' },
      { id: 'DrdbQ1I-aIA', title: 'Tech Startups Showcase: Funding & Innovation in East Africa', views: '32K Views' }
    ] as { id: string; title: string; views: string; image?: string; isImageOnly?: boolean; link?: string }[],
  },
]

export default function VideosPage() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [animateIn, setAnimateIn] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [displayedCategory, setDisplayedCategory] = useState<string | null>(null)

  const currentActiveCat = categoryData.find(c => c.name === activeCategory) || null

  useEffect(() => {
    if (activeVideo) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => setAnimateIn(true), 10)
    } else {
      document.body.style.overflow = 'unset'
      setAnimateIn(false)
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [activeVideo])

  const handleClose = () => {
    setAnimateIn(false)
    setTimeout(() => setActiveVideo(null), 400)
  }

  const handleCategoryClick = (name: string | null) => {
    if (name === activeCategory) return
    if (name === null) {
      setActiveCategory(null)
      setTimeout(() => setDisplayedCategory(null), 700)
    } else {
      setDisplayedCategory(name)
      setTimeout(() => setActiveCategory(name), 10)
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] selection:bg-red-500 selection:text-white">
      <Navbar />

      {/* Category Pills Bar */}
      <div className="w-full bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 sticky top-[65px] z-40 py-5 transition-all duration-500">
         {/* Dynamic Neon LED flow strip at the bottom of the bar */}
         <div 
           className="absolute bottom-0 left-0 right-0 h-[2px] led-flow-strip transition-all duration-750 ease-in-out"
           style={{
             background: activeCategory 
               ? `linear-gradient(90deg, transparent 0%, ${currentActiveCat?.accentColor || '#ef4444'}33 25%, ${currentActiveCat?.accentColor || '#ef4444'} 50%, ${currentActiveCat?.accentColor || '#ef4444'}33 75%, transparent 100%)` 
               : 'linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.1) 25%, rgba(239, 68, 68, 0.6) 50%, rgba(239, 68, 68, 0.1) 75%, transparent 100%)',
             boxShadow: activeCategory 
               ? `0 0 25px 4px ${currentActiveCat?.accentColor || '#ef4444'}` 
               : '0 0 12px 2px rgba(239, 68, 68, 0.25)',
             opacity: activeCategory ? 1 : 0.6
           }}
         />
         
         <div className="max-w-[1400px] mx-auto px-4 md:px-12 flex justify-center">
            {/* LED Snake Chase Wrapper */}
            <div 
              className="led-snake-border shadow-[0_0_30px_rgba(0,0,0,0.8)]"
              style={{
                '--led-color-1': currentActiveCat ? currentActiveCat.accentColor : '#ef4444',
                '--led-color-2': currentActiveCat ? '#ffffff' : '#f97316',
                boxShadow: activeCategory 
                  ? `0 0 30px ${currentActiveCat?.accentColor}30, inset 0 0 15px ${currentActiveCat?.accentColor}10`
                  : '0 0 20px rgba(239,68,68,0.1)',
              } as React.CSSProperties}
            >
              <div className="led-snake-content flex items-center gap-3 overflow-x-auto hide-scrollbar max-w-full px-5 py-2.5 bg-[#050505]/95 backdrop-blur-2xl">
                <button 
                  onClick={() => handleCategoryClick(null)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 border ${
                    activeCategory === null 
                      ? 'border-red-500 text-white bg-red-500/10' 
                      : 'border-white/5 bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/20'
                  }`}
                  style={activeCategory === null ? {
                    boxShadow: '0 0 15px rgba(239,68,68,0.4), inset 0 0 8px rgba(239,68,68,0.2)',
                    textShadow: '0 0 8px rgba(239,68,68,0.5)'
                  } : {}}
                >
                  All
                </button>
                {categoryData.map(cat => {
                  const isActive = activeCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => handleCategoryClick(cat.name)}
                      className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 border ${
                        isActive
                          ? 'text-white'
                          : 'border-white/5 bg-white/[0.03] text-white/60 hover:bg-white/[0.08]'
                      }`}
                      style={isActive ? {
                        borderColor: cat.accentColor,
                        backgroundColor: `${cat.accentColor}15`,
                        boxShadow: `0 0 15px ${cat.accentColor}40, inset 0 0 8px ${cat.accentColor}20`,
                        textShadow: `0 0 8px ${cat.accentColor}50`
                      } : {}}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = cat.accentColor;
                          e.currentTarget.style.boxShadow = `0 0 10px ${cat.accentColor}25, inset 0 0 5px ${cat.accentColor}10`;
                          e.currentTarget.style.color = '#ffffff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = '';
                          e.currentTarget.style.boxShadow = '';
                          e.currentTarget.style.color = '';
                        }
                      }}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
         </div>
      </div>

      {/* Expanded Video Panel - Pushes content down smoothly */}
      <div 
        className={`w-full bg-[#050505] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ${
          activeCategory ? 'max-h-[800px] border-b border-white/5 opacity-100' : 'max-h-0 border-transparent opacity-0'
        }`}
      >
        <div className={`max-w-[1400px] mx-auto px-4 md:px-12 transition-all duration-700 transform ${
          activeCategory ? 'translate-y-0 pb-8 pt-6 scale-100' : '-translate-y-10 pb-0 pt-0 scale-95'
        }`}>
          {displayedCategory && (() => {
            const cat = categoryData.find(c => c.name === displayedCategory) || categoryData[0]
            return (
                <div className="relative p-[1px] rounded-[2rem] overflow-hidden group/panel shadow-2xl">
                  {/* Animated border gradient */}
                  <div className="absolute inset-0 transition-opacity duration-700 opacity-30" style={{ background: `linear-gradient(135deg, ${cat.glow || '#ef4444'} 0%, transparent 50%, ${cat.glow || '#ef4444'} 100%)` }} />
                  
                  {/* Glowing blobs */}
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none transition-all duration-1000 -translate-y-1/2 translate-x-1/4 opacity-15" style={{ background: cat.glow || '#ef4444' }} />
                  <div className="absolute bottom-0 left-0 w-[400px] h-[400px] blur-[100px] rounded-full pointer-events-none transition-all duration-1000 translate-y-1/4 -translate-x-1/4 opacity-10" style={{ background: cat.glow || '#ef4444' }} />

                  <div className="relative rounded-[2rem] bg-[#050505]/90 backdrop-blur-2xl overflow-hidden flex flex-col h-[400px] md:h-[480px] w-full z-10"
                    style={{ boxShadow: `inset 0 0 80px ${cat.glow || 'rgba(255,255,255,0.1)'}10` }}>

                    {/* Premium Panel header */}
                    <div className="relative flex items-center justify-between px-6 md:px-10 py-6 border-b border-white/[0.04] flex-shrink-0 bg-white/[0.01]">
                      <div className="absolute left-0 top-0 w-1.5 h-full rounded-r-full" style={{ background: cat.accentColor || '#ef4444' }} />
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 bg-black shadow-inner" style={{ boxShadow: `inset 0 0 20px ${cat.glow || 'rgba(255,255,255,0.1)'}30` }}>
                           <span className="text-2xl opacity-80">{cat.name === 'Music' ? '🎵' : cat.name === 'Comedy' ? '😂' : cat.name === 'Sports' ? '⚽' : cat.name === 'Movies' ? '🍿' : cat.name === 'Reality' ? '🎬' : cat.name === 'News' ? '📰' : cat.name === 'Audio / Video Books' ? '📚' : '🎙️'}</span>
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-[0.2em] text-lg md:text-xl drop-shadow-lg" style={{ color: cat.accentColor || '#ef4444' }}>{cat.name}</p>
                          <p className="text-white/40 text-xs font-bold tracking-wider mt-0.5 uppercase">
                            {cat.name === 'Music'
                              ? `${songsForSale.length} Premium Tracks`
                              : cat.videos.length > 0 ? `${cat.videos.length} Exclusive Releases` : 'Coming Soon'}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleCategoryClick(null)}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 hover:rotate-90 transition-all duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col justify-center overflow-hidden w-full relative z-10">
                    {/* Music category */}
                    {cat.name === 'Music' ? (
                      songsForSale.length > 0 ? (
                        <div className="overflow-x-auto hide-scrollbar w-full">
                          <div className="flex gap-5 p-6 md:p-10 min-w-max">
                            {songsForSale.map((song) => (
                              <a
                                key={song.id}
                                href={`/albums`}
                                className="group relative w-[180px] md:w-[220px] flex-shrink-0 rounded-2xl overflow-hidden border border-white/5 hover:border-orange-500/40 transition-all duration-300 bg-[#0a0a0a] flex flex-col"
                              >
                                <div className="relative aspect-square w-full overflow-hidden">
                                  <Image
                                    src={song.image}
                                    alt={song.title}
                                    fill
                                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white border border-white/20 backdrop-blur-sm bg-orange-600/80 shadow-[0_0_30px_rgba(234,88,12,0.6)]">
                                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                                    </div>
                                  </div>
                                  <div className="absolute top-3 left-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">{song.genre}</span>
                                  </div>
                                  <div className="absolute bottom-3 right-3">
                                    <span className="text-[10px] font-black text-white/60">{song.duration}</span>
                                  </div>
                                </div>
                                <div className="p-4 flex flex-col gap-1">
                                  <h4 className="text-sm font-black text-white/90 group-hover:text-orange-400 transition-colors leading-snug">{song.title}</h4>
                                  <p className="text-[11px] text-white/40 font-medium truncate">{song.feat}</p>
                                  <p className="text-orange-400 font-black text-sm mt-1">{song.price}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center px-6 text-center">
                          <div className="text-6xl mb-6 opacity-30">🎵</div>
                          <p className="text-white/20 font-black uppercase tracking-widest text-sm mb-2">Coming Soon</p>
                          <p className="text-white/10 text-xs max-w-xs">Music tracks are being curated. Check back soon.</p>
                        </div>
                      )
                    ) : cat.videos.length > 0 ? (
                      <div className="overflow-x-auto hide-scrollbar w-full">
                        <div className="flex gap-5 p-6 md:p-10 min-w-max">
                          {cat.videos.map((vid, i) => (
                            <div
                              key={i}
                              onClick={() => setActiveVideo(vid.id)}
                              className="group relative w-[260px] md:w-[320px] flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-300 bg-black"
                            >
                              <div className="relative aspect-video">
                                <Image
                                  src={vid.image || `https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`}
                                  alt={vid.title}
                                  fill
                                  unoptimized
                                  className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white border border-white/20 backdrop-blur-sm"
                                    style={{ background: `${cat.glow || 'rgba(255,255,255,0.1)'}`, boxShadow: `0 0 30px ${cat.glow || 'rgba(255,255,255,0.1)'}` }}>
                                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                  </div>
                                </div>
                                <div className="absolute bottom-3 left-3">
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${cat.textActive || 'text-white'}`}>{vid.views}</span>
                                </div>
                              </div>
                              <div className="p-4">
                                <h4 className="text-sm font-bold text-white/80 group-hover:text-white transition-colors leading-snug line-clamp-2">{vid.title}</h4>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center px-6 text-center">
                        <div className="text-6xl mb-6 opacity-30">📺</div>
                        <p className="text-white/20 font-black uppercase tracking-widest text-sm mb-2">Coming Soon</p>
                        <p className="text-white/10 text-xs max-w-xs">{cat.name} content is being curated. Check back soon.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* 1. Massive Blockbuster Hero Section */}
      <section className="relative w-full min-h-[85vh] flex flex-col justify-end overflow-hidden group cursor-pointer" onClick={() => setActiveVideo(mainHeroVideo.id)}>
         <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-1000 z-10 mix-blend-overlay pointer-events-none"></div>
         <Image 
           src={mainHeroVideo.image || `https://img.youtube.com/vi/${mainHeroVideo.id}/hqdefault.jpg`}
           alt={mainHeroVideo.title}
           fill
           unoptimized
           priority
           className="object-cover transform transition-transform duration-[20s] group-hover:scale-110"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent z-10 pointer-events-none"></div>
         <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent z-10 pointer-events-none opacity-80"></div>

         <div className="relative z-20 pointer-events-none w-full p-6 pt-24 md:p-12 lg:p-20 flex flex-col justify-end">
            <div className="max-w-3xl transform transition-transform duration-700 group-hover:-translate-y-4">
              <span className="inline-block bg-red-600 text-white font-black text-[10px] sm:text-xs px-3 py-1 uppercase tracking-[0.2em] mb-4 shadow-[0_0_30px_rgba(220,38,38,0.8)] border border-red-500">
                {mainHeroVideo.badge}
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-tight mb-4 pt-1 pb-2">
                Sing Ama<br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 italic pr-6 inline-block">Pilipili</span>
              </h1>
              <p className="text-sm sm:text-base md:text-xl text-gray-300 font-medium max-w-2xl mb-6 line-clamp-3 md:line-clamp-none border-l-[3px] border-red-500 pl-4 md:pl-6">
                {mainHeroVideo.desc}
              </p>
              <button className="flex items-center gap-3 bg-white text-black hover:bg-red-600 hover:text-white transition-colors duration-300 px-6 py-3 md:px-8 md:py-4 rounded-full font-black uppercase tracking-widest pointer-events-auto text-xs md:text-sm group/btn">
                 <div className="w-8 h-8 md:w-10 h-10 bg-black text-white group-hover/btn:bg-white group-hover/btn:text-red-500 rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 md:w-5 md:h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                 </div>
                 Play Episode
              </button>
            </div>
         </div>
      </section>

      {/* 2. Dual Horizontal Filmstrips / The Series */}
      <section className="py-24 relative z-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-red-500/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 z-0"></div>
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 relative z-10 mb-12">
          <div className="flex items-end justify-between border-b border-white/10 pb-6">
             <div>
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">The <span className="italic text-red-500 pr-4">Series</span></h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs md:text-sm mt-3 bg-white/5 inline-block px-3 py-1 border border-white/10 rounded">Rieng Radio Originals</p>
             </div>
             <span className="hidden md:block text-white/30 font-black uppercase tracking-[0.2em] animate-pulse">Now Streaming &rarr;</span>
          </div>
        </div>

        {/* Row 1: Marquee Left */}
        <div className="relative w-full flex overflow-hidden mb-6 sm:mb-8">
           <div className="marquee-left flex items-center min-w-max gap-6 sm:gap-8 px-3">
             {[...theSeriesVideos, ...theSeriesVideos, ...theSeriesVideos].map((vid, idx) => (
               <div 
                 key={`r1-${idx}`} 
                 onClick={() => setActiveVideo(vid.id)}
                 className="relative w-[320px] sm:w-[450px] md:w-[500px] aspect-video flex-shrink-0 rounded-3xl overflow-hidden group cursor-pointer border border-white/10 bg-black shadow-2xl hover:border-red-500/50 transition-colors"
               >
                  <Image 
                    src={`https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`}
                    alt={vid.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/20 to-transparent mix-blend-overlay"></div>
                  <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[#050505] to-transparent">
                     <span className="bg-red-500/20 border border-red-500/50 text-red-500 text-[10px] uppercase font-black tracking-[0.2em] px-3 py-1.5 rounded-sm inline-block mb-4 backdrop-blur-md shadow-xl">
                       {vid.duration}
                     </span>
                     <h3 className="text-2xl font-bold text-white leading-snug line-clamp-2 md:line-clamp-1 group-hover:text-red-500 transition-colors uppercase tracking-tight">{vid.title}</h3>
                  </div>
                  {/* Center Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
                     <div className="w-20 h-20 bg-red-600/90 backdrop-blur-md rounded-full shadow-[0_0_50px_rgba(220,38,38,0.8)] flex items-center justify-center text-white border border-red-400/50">
                       <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                     </div>
                  </div>
               </div>
             ))}
           </div>
        </div>

        {/* Row 2: Marquee Right */}
        <div className="relative w-full flex overflow-hidden">
           <div className="marquee-right flex items-center min-w-max gap-6 sm:gap-8 px-3">
             {[...theSeriesRow2, ...theSeriesRow2, ...theSeriesRow2].map((vid, idx) => (
               <div 
                 key={`r2-${idx}`} 
                 onClick={() => setActiveVideo(vid.id)}
                 className="relative w-[320px] sm:w-[450px] md:w-[500px] aspect-video flex-shrink-0 rounded-3xl overflow-hidden group cursor-pointer border border-white/10 bg-black shadow-2xl hover:border-red-500/50 transition-colors"
               >
                  <Image 
                    src={`https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`}
                    alt={vid.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/20 to-transparent mix-blend-overlay"></div>
                  <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[#050505] to-transparent">
                     <span className="bg-red-500/20 border border-red-500/50 text-red-500 text-[10px] uppercase font-black tracking-[0.2em] px-3 py-1.5 rounded-sm inline-block mb-4 backdrop-blur-md shadow-xl">
                       {vid.duration}
                     </span>
                     <h3 className="text-2xl font-bold text-white leading-snug line-clamp-2 md:line-clamp-1 group-hover:text-red-500 transition-colors uppercase tracking-tight">{vid.title}</h3>
                  </div>
                  {/* Center Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
                     <div className="w-20 h-20 bg-red-600/90 backdrop-blur-md rounded-full shadow-[0_0_50px_rgba(220,38,38,0.8)] flex items-center justify-center text-white border border-red-400/50">
                       <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                     </div>
                  </div>
               </div>
             ))}
           </div>
        </div>

      </section>

      {/* 3. The Digital Culture Vault (Masonry Layout) */}
      <section className="py-24 relative overflow-hidden bg-[#030303]">
        {/* Subtle patterned overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)', backgroundSize: '60px 60px', backgroundPosition: '0 0, 30px 30px' }}></div>
        
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 relative z-10">
          
          <div className="mb-16 text-center max-w-4xl mx-auto border-t border-white/5 pt-20">
             <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6 relative inline-block">
               The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 italic pr-4">Streets</span>
             </h2>
             <p className="text-gray-400 font-bold md:text-xl border-l-[4px] border-blue-500 pl-6 text-left inline-block max-w-2xl bg-white/5 p-6 border-r border-y rounded-r-3xl">Raw untethered cuts straight from the timeline. Everything from viral TikTok challenges to behind the scenes studio chaos on Facebook and Instagram.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 auto-rows-auto">
            {socialDrops.map((drop, idx) => (
              <div 
                key={idx} 
                onClick={() => drop.videoId ? setActiveVideo(drop.videoId) : window.open(drop.url, '_blank')}
                className={`group relative overflow-hidden rounded-[2.5rem] ${drop.aspect} flex flex-col justify-end p-8 md:p-10 border border-white/10 hover:border-white/30 transition-all duration-500 shadow-2xl hover:-translate-y-4 cursor-pointer bg-black`}
              >
                {/* Embedded Image Background */}
                <Image 
                  src={drop.image}
                  alt={drop.title}
                  fill
                  unoptimized
                  className="object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-700 mix-blend-overlay pointer-events-none"
                />

                {/* Fallback pattern bg */}
                <div className={`absolute inset-0 ${drop.color} opacity-20 group-hover:opacity-40 transition-opacity duration-700 mix-blend-overlay`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/80 to-transparent z-10 pointer-events-none"></div>
                
                {/* Animated tech ring background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square border border-white/5 rounded-full group-hover:scale-110 transition-transform duration-[3s] pointer-events-none z-10"></div>

                <div className="relative z-20 pointer-events-none">
                   <div className="flex items-center gap-3 mb-6">
                     <span className={`w-3 h-3 rounded-full ${drop.color} shadow-[0_0_15px_currentColor] animate-pulse`}></span>
                     <span className="font-black text-white uppercase tracking-[0.2em] text-xs opacity-80 backdrop-blur border border-white/10 px-3 py-1 rounded">
                        {drop.platform === 'YouTube' ? 'Watch Episode' : `Watch on ${drop.platform}`}
                     </span>
                   </div>
                   <h3 className="text-3xl lg:text-4xl font-black text-white mb-4 leading-[1.1] uppercase tracking-tight group-hover:text-red-500 transition-all">{drop.title}</h3>
                   <p className="text-gray-400 text-sm md:text-base font-medium line-clamp-3">{drop.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Reusable YouTube Video Modal */}
      {activeVideo && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
          <div 
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl" 
            onClick={handleClose}
          ></div>
          <div className={`relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_150px_rgba(220,38,38,0.2)] border border-white/10 z-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${animateIn ? 'scale-100 translate-y-0' : 'scale-90 translate-y-16'}`}>
             <button 
                onClick={handleClose}
                className="absolute -top-16 right-0 md:top-6 md:right-6 w-14 h-14 bg-red-600/50 hover:bg-red-600 backdrop-blur-md rounded-full text-white flex items-center justify-center z-50 transition-all shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-500/50"
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
             {(() => {
               const allVideos = categoryData.flatMap(c => c.videos || [])
               const selectedVideo = allVideos.find(v => v.id === activeVideo)
               
               if (selectedVideo?.isImageOnly && selectedVideo?.image) {
                 return (
                   <div className="relative w-full h-full">
                     <Image 
                       src={selectedVideo.image} 
                       alt={selectedVideo.title}
                       fill 
                       className="object-contain"
                       unoptimized
                     />
                     <div className="absolute bottom-6 left-6 right-6 bg-black/70 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                       <h3 className="text-xl md:text-2xl font-black text-white mb-2">{selectedVideo.title}</h3>
                       <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-wider text-red-500">🏆 CHAMPIONS OF ENGLAND 🔴</p>
                     </div>
                   </div>
                 )
               }
               
               if (selectedVideo?.link) {
                 return (
                   <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/60 p-8 text-center">
                     <div className="text-6xl mb-4">⚽</div>
                     <h3 className="text-2xl md:text-3xl font-black text-white mb-4 max-w-2xl">{selectedVideo.title}</h3>
                     <p className="text-gray-400 mb-8 max-w-md">This video is hosted on Sky Sports. Click the button below to watch the official Premier League highlights directly on their platform.</p>
                     <a 
                       href={selectedVideo.link}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-sm rounded-full transition-all shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-105"
                     >
                       Watch on Sky Sports
                     </a>
                   </div>
                 )
               }
               
               return (
                 <iframe 
                   src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0&modestbranding=1`} 
                   className="w-full h-full"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                 ></iframe>
               )
             })()}
          </div>
        </div>
      )}



      {/* Global override so horizontal scrollbar disappears strictly for the slider but mouse can still target it easily */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes rotate-led {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes led-flow {
          0% { background-position: 200% 0%; }
          100% { background-position: -200% 0%; }
        }
        
        .led-snake-border {
          position: relative;
          border-radius: 9999px;
          padding: 2px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.5s ease;
        }
        
        .led-snake-border::before {
          content: '';
          position: absolute;
          top: -150%;
          left: -150%;
          width: 400%;
          height: 400%;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            transparent 20%,
            var(--led-color-1, #ef4444) 23%,
            var(--led-color-2, #ffffff) 25%,
            var(--led-color-1, #ef4444) 27%,
            transparent 30%,
            transparent 70%,
            var(--led-color-1, #ef4444) 73%,
            var(--led-color-2, #ffffff) 75%,
            var(--led-color-1, #ef4444) 77%,
            transparent 80%,
            transparent 100%
          );
          animation: rotate-led 6s linear infinite;
          border-radius: 50%;
        }
        
        .led-snake-content {
          position: relative;
          background: #050505;
          border-radius: 9999px;
          z-index: 1;
          width: 100%;
          height: 100%;
        }
        
        .led-flow-strip {
          background-size: 200% 100%;
          animation: led-flow 6s linear infinite;
        }
      `}} />

      <Footer />
    </main>
  )
}
