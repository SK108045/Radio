// ─────────────────────────────────────────────────────────────────────────────
// Other Artists Store — Single Source of Truth
// Featured Artists: Mr MAPEMA PRODUCER & Ethic Entertainment
// ONLY Real Database Tracks are displayed. No placeholders.
// ─────────────────────────────────────────────────────────────────────────────

export const ARTIST_DB_MAP: Record<string, string> = {
  'mr-mapema-producer': '33333333-3333-3333-3333-333333333334',
  'ethic-entertainment': '33333333-3333-3333-3333-333333333333',
}

export const DB_TO_ARTIST_SLUG: Record<string, string> = {
  '33333333-3333-3333-3333-333333333334': 'mr-mapema-producer',
  '33333333-3333-3333-3333-333333333333': 'ethic-entertainment',
}

export interface ArtistProfile {
  id: string
  dbId: string
  name: string
  role: string
  bio: string
  image: string
  bannerImage: string
  badge: string
  stats: {
    listeners: string
    hits: string
    status: string
  }
  popularTracks: string[]
}

export interface OtherArtistTrack {
  id: string | number
  artistId: string
  artistDbId?: string
  artistName: string
  title: string
  feat: string
  desc: string
  price: string
  priceNum: number
  genre: string
  image: string
  tag: string
  bpm: string
  duration: string
  releaseDate: string
  status: 'Available Now' | 'Live Drop'
  downloadUrl?: string
  isLive: boolean
}

export const otherArtistsList: ArtistProfile[] = [
  {
    id: 'mr-mapema-producer',
    dbId: '33333333-3333-3333-3333-333333333334',
    name: 'Mr MAPEMA PRODUCER',
    role: 'Kenyan Hitmaker & Sound Engineer',
    badge: 'Certified Producer',
    bio: 'Mr. Mapema is one of Kenya\'s most respected music producers and audio engineers, widely acclaimed for his signature hard-hitting beats, 808s, and street collaborations across Kenyan Hip-Hop, Arbantone, and Dancehall. Mastermind behind street anthems with Mbogi Sembe, Moti the NRG, Mistari Mbaya, and Mtu Mboka.',
    image: '/Studio.jpg',
    bannerImage: '/Banner.jpg',
    stats: {
      listeners: '150K+',
      hits: '30+ Productions',
      status: 'Live on Store 🔥',
    },
    popularTracks: ['Late', 'Umechoma', 'Kashfa', '100 Years'],
  },
  {
    id: 'ethic-entertainment',
    dbId: '33333333-3333-3333-3333-333333333333',
    name: 'Ethic Entertainment',
    role: 'Pioneers of Gengetone',
    badge: 'Gengetone Legends',
    bio: 'Ethic Entertainment (Rekles, Swat Mtoto wa Eunice, Seska, and Zilla) are the iconic 4-man trailblazers who birthed the modern Gengetone revolution in East Africa. With groundbreaking records like "Lamba Lolo", "Pandana", "Tarimbo", and their album "Confidence", Ethic continues to drop raw street anthems.',
    image: '/Group.jpg',
    bannerImage: '/Shows1.jpg',
    stats: {
      listeners: '500K+',
      hits: '15M+ Streams',
      status: 'Live on Store 🔥',
    },
    popularTracks: ['LAMBA LOLO', 'Pandana', 'Tarimbo', 'Candy Date'],
  },
]

export const artistReviews = [
  {
    albumTitle: 'Confidence (Album)',
    artist: 'Ethic Entertainment',
    rating: '5.0',
    review: 'A groundbreaking project that solidified Ethic\'s status as the founders of Gengetone. Unfiltered Sheng lyrics, hypnotic beats, and raw energy across every single record.',
    genre: 'Gengetone / Sheng',
    year: '2023'
  },
  {
    albumTitle: 'Mapema Studio Masters & Productions',
    artist: 'Mr MAPEMA PRODUCER',
    rating: '5.0',
    review: 'Mr. Mapema demonstrates elite mixing prowess and sound design. From Mbogi Sembe bangers to Moti the NRG cuts, his 808 mastery sets the standard for modern East African urban music.',
    genre: 'Hip-Hop / Arbantone',
    year: '2024'
  }
]
