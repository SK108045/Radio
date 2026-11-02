import Image from '@/components/FallbackImage'

const cardClasses = 'group relative bg-[#080808] border border-white/5 rounded-[2rem] overflow-hidden hover:border-primary/50 hover:shadow-[0_0_30px_rgba(255,107,53,0.15)] transition-all duration-300 flex flex-col h-full w-full text-left'
const actionClasses = 'flex flex-col flex-1 w-full text-left cursor-pointer'

export default function MediaCard({
  category = 'Updates',
  title = 'Untitled',
  link = '#',
  image = '/placeholder.jpg',
  imageAlt,
  excerpt,
  source,
  sourceUrl,
  dateLabel,
  aiArtwork = false,
  videoId,
  onVideoClick,
}: {
  category?: string
  title: string
  link?: string
  image?: string
  imageAlt?: string
  excerpt?: string
  source?: string
  sourceUrl?: string
  dateLabel?: string
  aiArtwork?: boolean
  videoId?: string
  onVideoClick?: (videoId: string, title: string) => void
}) {
  const inner = (
    <>
      <div className="relative h-[220px] w-full overflow-hidden flex-shrink-0">
        <Image
          src={image}
          fallbackSrc={videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/placeholder.jpg'}
          alt={imageAlt || title}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/10 to-transparent" />
        <div className="absolute top-4 left-4 bg-black/65 backdrop-blur-sm border border-white/15 text-white text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full z-20">
          {category}
        </div>
        {aiArtwork && <span className="absolute bottom-6 right-4 text-[9px] text-white/70 tracking-wider uppercase">AI artwork</span>}
        {videoId && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-12 h-12 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center border border-white/40 transition-all group-hover:scale-110 group-hover:bg-primary/90">
              <svg aria-hidden="true" className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
        )}
      </div>
      <div className="px-5 pb-5 -mt-3 flex flex-col gap-3 flex-1 relative z-20">
        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors leading-snug">
          {title}
        </h3>
        {excerpt && <p className="text-xs leading-relaxed text-gray-400 line-clamp-3">{excerpt}</p>}
        <span className="mt-auto pt-2 flex items-center text-primary font-black text-[10px] tracking-widest uppercase">
          {videoId ? 'Watch official video' : category === 'Culture' ? 'Explore programme' : 'Read story'} <span aria-hidden="true" className="ml-2 text-base">↗</span>
        </span>
      </div>
    </>
  )

  return (
    <article className={cardClasses}>
      {videoId && onVideoClick ? (
        <button type="button" onClick={() => onVideoClick(videoId, title)} aria-label={`Watch ${title}`} className={actionClasses}>
          {inner}
        </button>
      ) : (
        <a href={link} target="_blank" rel="noopener noreferrer" className={actionClasses}>
          {inner}
        </a>
      )}
      {source && sourceUrl && (
        <div className="border-t border-white/10 mx-5 pt-3 pb-4">
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="block text-[11px] text-gray-400 hover:text-orange-200 transition-colors" aria-label={`${videoId ? 'Read coverage' : 'Source'} at ${source}`}>
            {source} <span aria-hidden="true">↗</span>
          </a>
          {dateLabel && <span className="block text-[10px] text-gray-500 mt-1">{dateLabel}</span>}
        </div>
      )}
    </article>
  )
}
