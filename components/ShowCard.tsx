'use client'

import Image from '@/components/FallbackImage';
import Link from 'next/link'
import { useRadio } from '@/context/RadioContext'

export default function ShowCard({
  title,
  host,
  schedule,
  description,
  image,
}: {
  title: string
  host: string
  schedule: string
  description: string
  image: string
}) {
  const { currentShow } = useRadio()
  const isLive = currentShow.title === title

  return (
    <div className="group relative bg-[#080808] rounded-[2rem] overflow-hidden border border-white/5 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(255,107,53,0.15)] flex flex-col h-full">
      <div className="relative h-[240px] w-full overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay"></div>
        <Image 
          src={image || '/placeholder.jpg'} 
          alt={title} 
          fill 
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-transparent z-10"></div>
      </div>
      
      <div className="relative z-20 flex-1 p-6 md:p-8 pt-0 flex flex-col justify-between -mt-12">
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full w-max mb-5 ${
            isLive 
              ? 'bg-red-500/20 border border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
              : 'bg-primary/20 border border-primary/30 text-primary shadow-[0_0_15px_rgba(255,107,53,0.2)]'
          }`}>
            {isLive && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>}
            {isLive ? 'LIVE NOW' : schedule}
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Host: <span className="text-white">{host}</span>
          </p>
        </div>
        
        <div className="mt-auto">
          <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium line-clamp-3">
            {description}
          </p>
          <Link href={isLive ? '/#live-player' : '/shows'} className="flex w-max items-center font-black text-xs tracking-widest uppercase text-primary hover:text-orange-200 transition-all duration-300 hover:translate-x-1">
            {isLive ? 'Tune in live' : 'View schedule'} <span aria-hidden="true" className="ml-2 text-lg">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
