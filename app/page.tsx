'use client'

import { useRef, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import BoBReleaseSpotlight from '@/components/BoBReleaseSpotlight'
import LivePlayer from '@/components/LivePlayer'
import BuySongPromo from '@/components/BuySongPromo'
import BlogSpotlight from '@/components/BlogSpotlight'
import Footer from '@/components/Footer'
import PartnersSlider from '@/components/PartnersSlider'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import styles from '@/components/HomeEnhancements.module.css'
import { trendingItems as trendingContent } from '@/lib/trending'
import { HomeLineup, HomeTrending, HomeVideos, HomeReviews } from '@/components/HomeEditorial'
import { SHOW_SCHEDULE } from '@/lib/showSchedule'

const dailyShows = SHOW_SCHEDULE

const trendingCategories = ['All', ...new Set(trendingContent.map(item => item.category))]

const riengVideos = [
  {
    title: 'Sing Ama Pilipili | Kartelo ft. Modesto',
    videoId: 'RCUEd7LaHKY',
    views: '379K',
    badge: 'Trending',
  },
  {
    title: 'Rieng Reggae Session Episode 1 | Mc Shalkido And Dj C4',
    videoId: '-DMoaDCixNo',
    views: '80K',
    badge: 'Live Mix',
  },
  {
    title: '9 Minutes Of Miracle Baby Speaking English',
    videoId: 'SlagKsO_xAU',
    views: '69K',
    badge: "Editor's Pick",
  },
]

const riengReviews = [
  {
    albumTitle: 'Victims of Madness 2.0',
    artist: 'Wakadinali',
    rating: '5.0',
  },
  {
    albumTitle: '40 & Four-Tune (EP)',
    artist: 'Sanaipei Tande',
    rating: '4.5',
  },
  {
    albumTitle: 'To Whom It May Concern',
    artist: 'Nyashinski',
    rating: '4.8',
  },
]



export default function Home() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState('All');
  const videoTrigger = useRef<HTMLElement | null>(null);
  const videoDialog = useRef<HTMLDivElement | null>(null);
  const filteredContent = activeCategory === 'All' ? trendingContent : trendingContent.filter(item => item.category === activeCategory);

  const handleOpenModal = (videoId: string, title: string) => {
    setActiveVideoId(videoId);
    setActiveVideoTitle(title);
    videoTrigger.current = document.activeElement as HTMLElement;
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className={`${styles.home} min-h-screen bg-background`}>
        <Navbar />
      
        {/* Hero Section */}
        <HeroSection />

        {/* Featured upcoming release */}
        <BoBReleaseSpotlight />

        {/* Live Player Section */}
        <LivePlayer />

        <HomeLineup shows={dailyShows} />
        <PartnersSlider />
        <HomeTrending
          items={filteredContent}
          categories={trendingCategories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onVideoClick={handleOpenModal}
        />
        <BlogSpotlight />
        <BuySongPromo />
        <HomeVideos videos={riengVideos} onVideoClick={handleOpenModal} />
        <HomeReviews reviews={riengReviews} />

        <Footer />

        <Dialog open={activeVideoId !== null} onOpenChange={open => { if (!open) setActiveVideoId(null) }}>
          <DialogContent
            ref={videoDialog}
            aria-describedby="home-video-description"
            className={`${styles.home} w-[calc(100%-2rem)] sm:max-w-4xl gap-0 overflow-hidden rounded-2xl border-white/15 bg-[#0a0a0a] p-0 shadow-[0_0_80px_rgba(255,107,53,0.15)]`}
            onOpenAutoFocus={event => {
              event.preventDefault()
              videoDialog.current?.querySelector<HTMLButtonElement>('[data-slot="dialog-close"]')?.focus()
            }}
            onCloseAutoFocus={event => {
              event.preventDefault()
              videoTrigger.current?.focus()
            }}
          >
            <div className="px-5 py-4 pr-12 border-b border-white/10">
              <DialogTitle className="text-sm sm:text-base leading-snug">{activeVideoTitle}</DialogTitle>
              <DialogDescription id="home-video-description" className="sr-only">Watch this RIENG video. Press Escape to close the player.</DialogDescription>
            </div>
            {activeVideoId && <iframe
              src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`}
              title={activeVideoTitle}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />}
          </DialogContent>
        </Dialog>
      </main>
    </MotionConfig>
  )
}
