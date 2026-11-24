import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Clock3, Radio, Sparkles } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { blogPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'RIENG Blog | Kenyan Music, Culture, Events & Street Conversation',
  description:
    'RIENG editorial: sharp takes on Kenyan music, Gengetone, Arbantone, Shrap, Nairobi events, new releases and the culture moving Kenya.',
  alternates: {
    canonical: 'https://www.riengradio.co.ke/blog',
  },
  openGraph: {
    title: 'RIENG Blog | Kenyan Music, Culture & Events',
    description:
      'Kenyan music, culture, events and street conversation — written from inside the scene.',
    url: 'https://www.riengradio.co.ke/blog',
    type: 'website',
    images: ['/Banner.jpg'],
  },
}

export default function BlogPage() {
  const featured = blogPosts.find(post => post.featured) ?? blogPosts[0]
  const rest = blogPosts.filter(post => post.slug !== featured.slug)

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src="/Banner.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,107,53,0.22),transparent_35%),linear-gradient(to_bottom,rgba(5,5,5,0.5),#050505)]" />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-4 py-20 sm:px-6 md:px-12 md:py-28">
          <div className="mb-7 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              RIENG Editorial
            </span>
            <span className="hidden text-xs font-semibold text-white/35 sm:inline">
              Music. Culture. No corporate voice.
            </span>
          </div>

          <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-6xl md:text-8xl">
            The stories behind
            <span className="block bg-gradient-to-r from-primary via-orange-400 to-red-500 bg-clip-text text-transparent">
              the noise.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base font-medium leading-relaxed text-white/55 sm:text-lg">
            Kenyan music moves too fast for boring coverage. RIENG slows the feed down just
            enough to ask what matters, what lasts, and what everybody will be arguing about next.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:px-12 md:py-16">
        <Link
          href={`/blog/${featured.slug}`}
          className="group grid overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0b] lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="relative min-h-[340px] overflow-hidden sm:min-h-[440px]">
            <Image
              src={featured.image}
              alt={featured.imageAlt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0b0b0b]/30" />
            <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
              Lead story
            </div>
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-white/40">
              <span className="text-primary">{featured.category}</span>
              <span>•</span>
              <span>{featured.dateLabel}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                {featured.readTime}
              </span>
            </div>

            <h2 className="mt-5 text-3xl font-black leading-[1.02] tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              {featured.title}
            </h2>
            <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-white/50 sm:text-base">
              {featured.excerpt}
            </p>

            <div className="mt-8 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-white">
              Read the story
              <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6 md:px-12 md:pb-28">
        <div className="mb-7 flex items-end justify-between gap-6 border-b border-white/10 pb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">
              Latest from RIENG
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Read what the timeline skipped.
            </h2>
          </div>
          <Radio className="hidden h-8 w-8 text-white/15 sm:block" />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {rest.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_18px_60px_rgba(255,107,53,0.08)]"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/65 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-primary backdrop-blur-md">
                  {post.category}
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">
                  <span>{post.dateLabel}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="mt-3 text-2xl font-black leading-tight tracking-[-0.025em] group-hover:text-primary">
                  {post.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-white/45">
                  {post.excerpt}
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/65">
                  Open story
                  <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-gradient-to-r from-primary/10 via-transparent to-red-500/10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between md:px-12">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">
              Keep RIENG in your ears
            </p>
            <h2 className="mt-2 max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">
              Read the story. Then hear what we’re actually playing.
            </h2>
          </div>
          <Link
            href="/#live-player"
            className="inline-flex w-max items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-black transition-transform hover:-translate-y-0.5"
          >
            Listen live
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
