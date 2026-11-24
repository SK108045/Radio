import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Clock3, ExternalLink } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { blogPosts, getBlogPost, getRelatedBlogPosts } from '@/lib/blog'

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return blogPosts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    return {
      title: 'Story not found | RIENG',
    }
  }

  const url = `https://www.riengradio.co.ke/blog/${post.slug}`

  return {
    title: `${post.title} | RIENG Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url,
      publishedTime: post.publishedAt,
      images: [
        {
          url: post.image,
          alt: post.imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  }
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) notFound()

  const related = getRelatedBlogPosts(post.slug)
  const articleUrl = `https://www.riengradio.co.ke/blog/${post.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: [`https://www.riengradio.co.ke${post.image}`],
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: articleUrl,
    author: {
      '@type': 'Organization',
      name: 'RIENG Editorial',
      url: 'https://www.riengradio.co.ke',
    },
    publisher: {
      '@type': 'Organization',
      name: 'RIENG',
      url: 'https://www.riengradio.co.ke',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.riengradio.co.ke/logo.png',
      },
    },
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <article>
        <header className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0">
            <Image
              src={post.image}
              alt=""
              fill
              priority
              className="object-cover opacity-30 blur-[1px]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,5,5,0.45),#050505_92%)]" />
          </div>

          <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24">
            <Link
              href="/blog"
              className="mb-10 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/45 transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to RIENG Blog
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-primary">
                {post.category}
              </span>
              <span>{post.dateLabel}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                {post.readTime}
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.045em] sm:text-5xl md:text-7xl">
              {post.title}
            </h1>

            <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-white/55 sm:text-lg">
              {post.excerpt}
            </p>

            <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/5">
                <Image src="/logo.png" alt="RIENG" fill className="object-contain p-1" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white">
                  RIENG Editorial
                </p>
                <p className="mt-1 text-xs font-medium text-white/35">
                  Kenyan music, culture and the conversations around it.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,1fr)_260px] md:py-18">
          <div className="min-w-0">
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-[24px] border border-white/10">
              <Image
                src={post.image}
                alt={post.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
            </div>

            <div className="space-y-10">
              {post.sections.map((section, index) => (
                <section key={`${post.slug}-section-${index}`}>
                  {section.heading && (
                    <h2 className="mb-5 text-2xl font-black tracking-[-0.025em] text-white sm:text-3xl">
                      {section.heading}
                    </h2>
                  )}
                  <div className="space-y-5">
                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                      <p
                        key={`${post.slug}-paragraph-${index}-${paragraphIndex}`}
                        className="text-[17px] font-medium leading-8 text-white/68"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-12 rounded-3xl border border-primary/20 bg-primary/[0.06] p-6 sm:p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                RIENG note
              </p>
              <p className="mt-3 text-lg font-black leading-7">
                We’d rather have a point of view than pretend every press release is breaking news.
              </p>
              <p className="mt-3 text-sm font-medium leading-6 text-white/45">
                These pieces mix reported context with RIENG editorial opinion. Source links are
                included below when a story relies on outside reporting.
              </p>
            </div>

            {post.sources && post.sources.length > 0 && (
              <section className="mt-12 border-t border-white/10 pt-8">
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/70">
                  Sources & further reading
                </h2>
                <div className="mt-4 space-y-3">
                  {post.sources.map(source => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm font-semibold leading-6 text-white/50 transition-colors hover:border-primary/30 hover:text-white"
                    >
                      <span>{source.label}</span>
                      <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-primary opacity-70 transition-opacity group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="hidden md:block">
            <div className="sticky top-28 rounded-3xl border border-white/10 bg-[#0a0a0a] p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                Keep listening
              </p>
              <h2 className="mt-3 text-xl font-black leading-tight">
                The article ends. The station doesn’t.
              </h2>
              <p className="mt-3 text-sm font-medium leading-6 text-white/40">
                Jump back into the live RIENG stream and hear what is actually in rotation.
              </p>
              <Link
                href="/#live-player"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-black"
              >
                Listen live
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </article>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 md:px-12 md:py-20">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                Keep reading
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">More from RIENG</h2>
            </div>
            <Link
              href="/blog"
              className="hidden items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/50 hover:text-white sm:inline-flex"
            >
              All stories
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {related.map(item => (
              <Link
                key={item.slug}
                href={`/blog/${item.slug}`}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] transition-all hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                    {item.category}
                  </p>
                  <h3 className="mt-2 text-lg font-black leading-tight group-hover:text-primary">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
