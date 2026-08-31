'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Flame, Tv, Play, Disc, TrendingUp } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const [showBreaking, setShowBreaking] = useState(true)

  // Handle scroll effect for dynamic blur/background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home', icon: Flame },
    { href: '/shows', label: 'Shows', icon: Tv },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/videos', label: 'Videos', icon: Play },
    { href: '/albums', label: 'Albums', icon: Disc },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {showBreaking && (
        <div className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white py-2.5 px-6 text-center text-xs font-black uppercase tracking-wider relative z-[60] flex items-center justify-center gap-3 overflow-hidden shadow-[0_4px_20px_rgba(239,68,68,0.4)] border-b border-red-500/30">
          {/* Glowing animated background lines */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.08)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.08)_75%,transparent_75%,transparent)] bg-[length:30px_30px] animate-[pulse_2s_infinite] opacity-40" />
          
          <div className="relative z-10 flex items-center justify-center gap-2 flex-wrap pr-6 text-center">
            <span className="bg-white text-red-700 px-2 py-0.5 rounded font-black text-[9px] tracking-widest animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]">BREAKING NEWS</span>
            <span className="font-bold normal-case sm:uppercase">
              We are partnering with Ethics Entertainment for exclusive future drops! 🎙️🔥
            </span>
          </div>
          
          <button 
            onClick={() => setShowBreaking(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            aria-label="Dismiss news"
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>
      )}
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.05] shadow-[0_4px_30px_rgba(0,0,0,0.6)]' 
          : 'bg-[#050505]/40 backdrop-blur-md border-b border-white/[0.02]'
      }`}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-12">
        <div className="flex items-center justify-between h-16">
          
          {/* Animated Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 relative flex-shrink-0 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image
                src="/logo.png"
                alt="RIENG Radio Logo"
                fill
                sizes="48px"
                className="object-contain relative z-10"
                priority
              />
            </div>
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase hidden sm:inline relative">
              RIENG<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 group-hover:from-orange-400 group-hover:to-red-500 transition-all duration-500">FLIX</span>
            </span>
          </Link>
          
          {/* Desktop Navigation - Premium Pill Design */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-5 py-2 group"
                >
                  <span className={`relative z-10 text-[13px] font-black uppercase tracking-widest transition-all duration-300 ${
                    active ? 'text-white' : 'text-white/40 group-hover:text-white/90'
                  }`}>
                    {link.label}
                  </span>
                  
                  {/* Active/Hover Pill Background */}
                  {active && (
                    <div className="absolute inset-0 bg-white/10 rounded-full z-0" />
                  )}
                  {!active && (
                    <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-0 transform scale-75 group-hover:scale-100 origin-center" />
                  )}
                  
                  {/* Glowing Active Indicator */}
                  {active && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)]" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Desktop Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-5">
            {/* Listen Live Premium Button */}
            <Link href="#live-player" className="hidden sm:flex items-center gap-2 group relative">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-500 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
               <div className="relative px-6 py-2 bg-black border border-white/10 rounded-full flex items-center gap-2 text-xs md:text-sm font-black uppercase tracking-widest text-white transform group-hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                  Listen Live
               </div>
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
              aria-label="Toggle menu"
            >
              <div className="absolute inset-0 rounded-full bg-red-500/10 blur-md opacity-0 hover:opacity-100 transition-opacity" />
              <div className="relative z-10 transform transition-transform duration-300">
                {isOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
              </div>
            </button>
          </div>
        </div>

        {/* Cinematic Mobile Navigation Overlay */}
        <div className={`lg:hidden absolute top-[65px] left-0 w-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-top ${
          isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
        }`}>
          <div className="px-6 py-6 pb-8 space-y-2 bg-[#050505]/95 backdrop-blur-2xl border-b border-white/[0.05] shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
            {navLinks.map((link, idx) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between group p-3 rounded-xl transition-all duration-300 ${
                    active ? 'bg-white/5 border border-white/10' : 'border border-transparent hover:bg-white/5'
                  }`}
                  style={{ transitionDelay: isOpen ? `${idx * 50}ms` : '0ms', opacity: isOpen ? 1 : 0, transform: isOpen ? 'translateY(0)' : 'translateY(-10px)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      active ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white'
                    }`}>
                      <link.icon size={18} strokeWidth={active ? 2.5 : 2} />
                    </div>
                    <span className={`font-black uppercase tracking-widest text-sm transition-colors duration-300 ${
                      active ? 'text-white' : 'text-white/50 group-hover:text-white'
                    }`}>
                      {link.label}
                    </span>
                  </div>
                  {active && <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />}
                </Link>
              )
            })}
            
            <div className="pt-6 mt-4 border-t border-white/5" style={{ transitionDelay: `${navLinks.length * 50}ms`, opacity: isOpen ? 1 : 0, transform: isOpen ? 'translateY(0)' : 'translateY(-10px)', transitionProperty: 'opacity, transform', transitionDuration: '500ms' }}>
              <Link href="#live-player" onClick={() => setIsOpen(false)} className="w-full relative flex items-center justify-center group py-1">
                 <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition duration-500"></div>
                 <div className="relative w-full bg-black border border-white/10 rounded-2xl px-4 py-4 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest text-white transform group-hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,1)]" />
                    Listen Live
                 </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
    </>
  )
}
