'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Play, Radio } from 'lucide-react'
import Image from '@/components/FallbackImage'
import { useRadio } from '@/context/RadioContext'
import { TRENDING_UPDATED_AT, TRENDING_UPDATED_LABEL, type TrendingItem } from '@/lib/trending'
import styles from './HomeEditorial.module.css'

type OpenVideo = (id: string, title: string) => void
type ShowPreview = { title: string; host: string; schedule: string; description: string; image: string }
type VideoPreview = { title: string; videoId: string; views: string; badge: string }
type ReviewPreview = { albumTitle: string; artist: string; rating: string }

export function HomeLineup({ shows }: { shows: ShowPreview[] }) {
  const { currentShow } = useRadio()

  return (
    <section id="line-up" className={`${styles.section} ${styles.lineupSection}`}>
      <div className={styles.wrap}>
        <div className={styles.lineupHeader}>
          <div>
            <p className={styles.kicker}><Radio size={14} aria-hidden="true" /> Find your frequency</p>
            <h2 className={styles.lineupHeading}>The <span className={styles.orange}>line-up.</span></h2>
          </div>
          <div className={styles.lineupAside}>
            <p>Old school mornings. Loud afternoons.<br />Underground nights. Every day.</p>
            <Link href="/shows" className={styles.textLink}>Full schedule <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className={styles.showGallery}>
          {shows.map((show, index) => {
            const live = currentShow.title === show.title
            return (
              <Link key={show.title} href={live ? '#live-player' : '/shows'} className={styles.showPoster}>
                <div className={styles.showPhoto}>
                  <Image src={show.image} alt={`${show.title} show artwork`} fill sizes="(max-width: 639px) 100vw, (max-width: 900px) 45vw, 33vw" className={styles.image} />
                  <span className={styles.posterNumber} aria-hidden="true">0{index + 1}</span>
                  {live && <span className={styles.posterLive}><i /> Live now</span>}
                </div>
                <div className={styles.posterCaption}>
                  <p className={styles.showTime}>{show.schedule}</p>
                  <h3>{show.title}<ArrowUpRight size={22} aria-hidden="true" /></h3>
                  <p className={styles.showDescription}>{show.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
        <p className={styles.galleryHint}>Swipe to explore the line-up →</p>
      </div>
    </section>
  )
}

function StoryImage({ item, onVideoClick, compact = false }: { item: TrendingItem; onVideoClick: OpenVideo; compact?: boolean }) {
  const visual = <>
    <Image src={item.image} alt={item.imageAlt} fill sizes={compact ? '(max-width: 639px) 88px, 150px' : '(max-width: 1023px) 100vw, 55vw'} className={styles.image} />
    {item.videoId && <span className={styles.imagePlay}><Play size={22} fill="currentColor" aria-hidden="true" /></span>}
    {!compact && item.aiArtwork && <span className={styles.artworkLabel}>Editorial artwork</span>}
  </>

  return item.videoId ? (
    <button type="button" aria-label={`Watch ${item.title}`} className={compact ? styles.storyThumb : styles.leadImage} onClick={() => onVideoClick(item.videoId!, item.title)}>{visual}</button>
  ) : (
    <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label={`Read ${item.title}`} className={compact ? styles.storyThumb : styles.leadImage}>{visual}</a>
  )
}

function StoryText({ item, onVideoClick, lead = false }: { item: TrendingItem; onVideoClick: OpenVideo; lead?: boolean }) {
  return <div className={lead ? styles.leadCopy : styles.storyCopy}>
    <p className={styles.storyMeta}>{item.category} <span>{item.dateLabel}</span></p>
    <h3 className={lead ? styles.leadTitle : styles.storyTitle}>
      {item.videoId ? <button type="button" onClick={() => onVideoClick(item.videoId!, item.title)}>{item.title}</button> : <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>}
    </h3>
    <p className={lead ? styles.leadExcerpt : styles.storyExcerpt}>{item.excerpt}</p>
    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`${item.videoId ? 'Read coverage' : 'Source'} at ${item.source}`} className={styles.sourceLink}>{item.videoId ? 'Read coverage · ' : ''}{item.source} <ArrowUpRight size={13} aria-hidden="true" /></a>
  </div>
}

export function HomeTrending({ items, categories, activeCategory, onCategoryChange, onVideoClick }: {
  items: TrendingItem[]; categories: string[]; activeCategory: string; onCategoryChange: (category: string) => void; onVideoClick: OpenVideo
}) {
  const [lead, ...rest] = items

  return (
    <section id="trending" className={`${styles.section} ${styles.trendingSection}`}>
      <div className={styles.wrap}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.kicker}>The Kenya edit</p>
            <h2 className={styles.heading}>Trending <span className={styles.orange}>now.</span></h2>
          </div>
          <div className={styles.headerAside}>
            <p>Updated <time dateTime={TRENDING_UPDATED_AT}>{TRENDING_UPDATED_LABEL}</time></p>
            <Link href="/trending" className={styles.textLink}>All stories <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
        <div role="group" aria-label="Filter trending content" className={styles.filters}>
          {categories.map(category => <button key={category} type="button" aria-pressed={activeCategory === category} aria-controls="trending-results" onClick={() => onCategoryChange(category)}>{category}</button>)}
        </div>
        <p role="status" className="sr-only">Showing {items.length} {activeCategory === 'All' ? 'trending' : activeCategory.toLowerCase()} stories.</p>
        <div id="trending-results" className={rest.length ? styles.storyGrid : styles.singleStory}>
          {lead && <article className={rest.length ? styles.leadStory : styles.filteredStory}>
            <StoryImage item={lead} onVideoClick={onVideoClick} />
            <StoryText item={lead} onVideoClick={onVideoClick} lead />
          </article>}
          {rest.length > 0 && <div className={styles.storyList}>
            {rest.map(item => <article key={item.id} className={styles.storyRow}>
              <StoryText item={item} onVideoClick={onVideoClick} />
              <StoryImage item={item} onVideoClick={onVideoClick} compact />
            </article>)}
          </div>}
        </div>
        <p className={styles.artworkNote}>AI-generated editorial illustrations. Original coverage linked on every story.</p>
      </div>
    </section>
  )
}

export function HomeVideos({ videos, onVideoClick }: { videos: VideoPreview[]; onVideoClick: OpenVideo }) {
  const [selectedId, setSelectedId] = useState(videos[0]?.videoId)
  const selected = videos.find(video => video.videoId === selectedId) ?? videos[0]
  if (!selected) return null

  return (
    <section id="rieng-tv" className={`${styles.section} ${styles.videoSection}`}>
      <div className={styles.wrap}>
        <div className={styles.tvHeader}>
          <h2 className={styles.tvHeading}>RIENG <span>TV</span><span className={styles.tvHeadingDot}>.</span></h2>
          <div className={styles.tvAside}>
            <p>Sessions, stories &amp; a little chaos.</p>
            <a href="https://www.youtube.com/@RiengRadio" target="_blank" rel="noopener noreferrer" className={styles.textLink}>Subscribe on YouTube <ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
        </div>
        <article id="tv-stage" className={styles.tvStage}>
          <button type="button" aria-label={`Watch ${selected.title}`} onClick={() => onVideoClick(selected.videoId, selected.title)} className={styles.stageButton}>
            <Image key={selected.videoId} src={`https://img.youtube.com/vi/${selected.videoId}/maxresdefault.jpg`} fallbackSrc={`https://img.youtube.com/vi/${selected.videoId}/hqdefault.jpg`} alt={selected.title} fill sizes="(max-width: 1280px) 100vw, 1216px" className={styles.stageImage} />
            <span className={styles.stageShade} />
            <span className={styles.stagePlay}><Play size={34} fill="currentColor" aria-hidden="true" /></span>
            <span className={styles.stageCopy}>
              <span className={styles.stageMeta}>{selected.badge} / {selected.views} views</span>
              <span className={styles.stageTitle}>{selected.title}</span>
              <span className={styles.watchLabel}>Watch session <ArrowUpRight size={16} aria-hidden="true" /></span>
            </span>
          </button>
        </article>
        <p className="sr-only" role="status">Selected session: {selected.title}</p>
        <div className={styles.filmstripHeader}><p>Choose a session</p><Link href="/videos" className={styles.textLink}>All videos <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        <div role="group" aria-label="Choose a RIENG TV session" className={styles.filmstrip}>
          {videos.map((video, index) => <button key={video.videoId} type="button" aria-label={`Select ${video.title}`} aria-pressed={selected.videoId === video.videoId} aria-controls="tv-stage" onClick={() => setSelectedId(video.videoId)} className={styles.filmstripItem}>
            <span className={styles.filmstripImage}><Image src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`} alt="" fill sizes="(max-width: 767px) 96px, 125px" className={styles.image} /><span className={styles.selectedMark}>{selected.videoId === video.videoId ? 'On screen' : `0${index + 1}`}</span></span>
            <span className={styles.filmstripCopy}><span className={styles.filmstripBadge}>{video.badge}</span><span className={styles.filmstripTitle}>{video.title}</span></span>
          </button>)}
        </div>
      </div>
    </section>
  )
}

export function HomeReviews({ reviews }: { reviews: ReviewPreview[] }) {
  return (
    <section id="album-reviews" className={`${styles.section} ${styles.reviewSection}`}>
      <div className={styles.wrap}>
        <div className={styles.reviewHeader}>
          <p className={styles.reviewEyebrow}>The breakdown / In our rotation</p>
          <h2 className={styles.reviewHeading}>For the <em>record.</em></h2>
          <p className={styles.reviewIntro}>Album reviews. A closer listen to the Kenyan projects in our rotation.</p>
        </div>
        <div className={styles.reviewColumns}>
          {reviews.map((review, index) => <article key={review.albumTitle} className={styles.reviewEntry}>
            <p className={styles.reviewArtist}><span aria-hidden="true">0{index + 1} / </span>{review.artist}</p>
            <p className={styles.rating} aria-label={`Rated ${review.rating} out of 5`}>{review.rating}<span>/ 5</span></p>
            <h3>{review.albumTitle}</h3>
            <p className={styles.scoreLabel}>RIENG rating</p>
          </article>)}
        </div>
        <div className={styles.reviewFooter}><span>Good projects deserve a second listen.</span><Link href="/albums" className={styles.textLink}>Explore albums <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </div>
    </section>
  )
}
