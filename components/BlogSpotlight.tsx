import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import { blogPosts } from '@/lib/blog'

export default function BlogSpotlight() {
  const posts = blogPosts.slice(0, 3)

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[#070707]">
      <div className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />

      <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6 md:px-12 md:py-24">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-primary">
              <BookOpen className="h-4 w-4" />
              RIENG Editorial
            </div>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight tracking-[-0.035em] text-white sm:text-4xl md:text-5xl">
              The feed moves fast. We keep the stories worth arguing about.
            </h2>
          </div>

          <Link
            href="/blog"
            className="group inline-flex w-max items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:border-primary/40 hover:bg-primary/10"
          >
            Open the blog
            <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={`group overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 ${
                index === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              <div className={`relative overflow-hidden ${
                index === 0 ? 'aspect-[16/8]' : 'aspect-[16/10] lg:aspect-auto lg:h-[245px]'
              }`}>
                <Image
                  src={post.image}
                  alt={post.imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes={index === 0 ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 1024px) 100vw, 33vw'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/65 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-primary backdrop-blur-md">
                  {post.category}
                </span>
              </div>

              <div className="p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">
                  {post.dateLabel} · {post.readTime}
                </p>
                <h3 className={`mt-2 font-black leading-tight tracking-[-0.025em] text-white group-hover:text-primary ${
                  index === 0 ? 'text-2xl sm:text-3xl' : 'text-xl'
                }`}>
                  {post.title}
                </h3>
                <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-white/45">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
