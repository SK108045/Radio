'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { getCurrentShow } from '@/lib/getCurrentShow'
import { SHOW_SCHEDULE } from '@/lib/showSchedule'

const dailyShows = SHOW_SCHEDULE

const weekendShows = ['Saturday', 'Sunday'].flatMap((day) =>
  SHOW_SCHEDULE.map((show) => ({
    ...show,
    day,
    schedule: show.schedule.replace('Every day | ', ''),
  })),
)

function PremiumWeekendAccordion() {
  const satShows = weekendShows.filter(s => s.day === 'Saturday')
  const sunShows = weekendShows.filter(s => s.day === 'Sunday')
  
  const [activeSat, setActiveSat] = useState<number | null>(0)
  const [activeSun, setActiveSun] = useState<number | null>(0)

  const [mounted, setMounted] = useState(false)
  const [currentHour, setCurrentHour] = useState(new Date().getHours())
  const [currentMinute, setCurrentMinute] = useState(new Date().getMinutes())
  const [currentDay, setCurrentDay] = useState(new Date().getDay())

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      const now = new Date()
      setCurrentHour(now.getHours())
      setCurrentMinute(now.getMinutes())
      setCurrentDay(now.getDay())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

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
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Same 24/7 Rotation</span>
            </div>
            <h2 className="text-5xl md:text-8xl lg:text-[9rem] font-black uppercase tracking-tighter leading-none text-white">
              Weekend
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-yellow-500 italic pr-4 drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]">Shows</span>
            </h2>
          </div>
          <p className="max-w-md text-gray-400 font-medium text-lg leading-relaxed border-l-[3px] border-primary/50 pl-6 lg:mb-8">
            Saturday and Sunday now run on the same RIENG station clock as the rest of the week — the full rotation, all weekend.
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
            {satShows.map((show, i) => {
              const isLive = mounted && getCurrentShow(currentDay, currentHour, currentMinute).title === show.title;
              return (
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
                          {isLive ? (
                            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-1.5 rounded-full mb-6 w-max relative">
                               <span className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-60"></span>
                               <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,1)]"></span>
                               <span className="text-xs font-black uppercase tracking-[0.2em] relative z-10">Live On Air</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 mb-6">
                              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                              <span className="text-white text-xs font-bold uppercase tracking-widest">{show.schedule}</span>
                            </div>
                          )}
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
            )})}
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
            {sunShows.map((show, i) => {
              const isLive = mounted && getCurrentShow(currentDay, currentHour, currentMinute).title === show.title;
              return (
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
                          {isLive ? (
                            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-1.5 rounded-full mb-6 w-max relative">
                               <span className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-60"></span>
                               <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,1)]"></span>
                               <span className="text-xs font-black uppercase tracking-[0.2em] relative z-10">Live On Air</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 mb-6">
                              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                              <span className="text-white text-xs font-bold uppercase tracking-widest">{show.schedule}</span>
                            </div>
                          )}
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
            )})}
          </div>
        </div>

      </div>
    </section>
  )
}


export default function ShowsPage() {
  const [currentHour, setCurrentHour] = useState(12)
  const [currentMinute, setCurrentMinute] = useState(0)
  const [currentDay, setCurrentDay] = useState(0)
  const [mounted, setMounted] = useState(false)


  useEffect(() => {
    const now = new Date()
    setCurrentHour(now.getHours())
    setCurrentMinute(now.getMinutes())
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
            isLive = getCurrentShow(currentDay, currentHour, currentMinute).title === show.title;
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

      {/* Weekend schedule — same rotation Saturday & Sunday */}
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

