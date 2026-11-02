export const TRENDING_UPDATED_AT = '2026-10-05'
export const TRENDING_UPDATED_LABEL = '5 Oct 2026'

export interface TrendingItem {
  id: string
  category: string
  title: string
  link: string
  videoId?: string
  image: string
  imageAlt: string
  excerpt: string
  source: string
  sourceUrl: string
  dateLabel: string
  stats: string
  aiArtwork: boolean
}

// Curated from the linked coverage and official programme on 5 October 2026.
// The order is editorial; it does not represent a measured national ranking.
export const trendingItems: TrendingItem[] = [
  {
    id: '01',
    category: 'Music',
    title: 'Maandy — Inzaagi',
    link: 'https://www.youtube.com/watch?v=rgbi7jrQXjk',
    videoId: 'rgbi7jrQXjk',
    image: '/trending/maandy-inzaagi.webp',
    imageAlt: 'AI editorial illustration of a microphone, vinyl and Nairobi nightlife',
    excerpt: 'KenyanVibe’s October round-up highlights Maandy’s TikTok favourite, now part of her Re EP. Watch the official music video.',
    source: 'KenyanVibe',
    sourceUrl: 'https://www.kenyanvibe.com/crispy-fresh-new-kenyan-music-to-kick-off-october/',
    dateLabel: '2 Oct 2026',
    stats: 'Kenyan music pick',
    aiArtwork: true,
  },
  {
    id: '02',
    category: 'News',
    title: 'Buruburu protests follow viral bullying video',
    link: 'https://citizen.digital/article/youth-protest-outside-buruburu-church-over-viral-bullying-video-n391409',
    image: '/trending/kenya-solidarity.webp',
    imageAlt: 'AI conceptual illustration of supportive hands and community solidarity',
    excerpt: 'Young people gathered in Buruburu in solidarity with Jahenda after a bullying video circulated online. Citizen Digital reports on the protests and responses.',
    source: 'Citizen Digital',
    sourceUrl: 'https://citizen.digital/article/youth-protest-outside-buruburu-church-over-viral-bullying-video-n391409',
    dateLabel: '4 Oct 2026',
    stats: 'In the conversation',
    aiArtwork: true,
  },
  {
    id: '03',
    category: 'Creators',
    title: 'Digital Media Awards: entries close 5 October',
    link: 'https://www.kbc.co.ke/deadline-extended-for-digital-media-awards/',
    image: '/trending/digital-media-awards.webp',
    imageAlt: 'AI editorial illustration of a camera, smartphone and abstract glass award',
    excerpt: 'Kenya’s creatives have until 5 October at 11:59 PM to submit to the Digital Media Awards, following an extension announced by the organisers.',
    source: 'KBC Digital',
    sourceUrl: 'https://www.kbc.co.ke/deadline-extended-for-digital-media-awards/',
    dateLabel: '3 Oct 2026',
    stats: 'Deadline: 5 Oct 2026',
    aiArtwork: true,
  },
  {
    id: '04',
    category: 'Culture',
    title: 'NBO Film Festival: cinema across Nairobi',
    link: 'https://www.nbofilmfest.com/',
    image: '/trending/nbo-film-festival.webp',
    imageAlt: 'AI editorial illustration of a projector, film strip and Nairobi skyline',
    excerpt: 'The festival returns from 15–25 October with African stories, fiction, documentaries and community screenings. Explore the official programme and find your next film.',
    source: 'NBO Film Festival',
    sourceUrl: 'https://www.nbofilmfest.com/',
    dateLabel: '15–25 Oct 2026',
    stats: 'Coming up · Nairobi',
    aiArtwork: true,
  },
]
