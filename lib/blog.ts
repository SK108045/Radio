export interface BlogSource {
  label: string
  url: string
}

export interface BlogSection {
  heading?: string
  paragraphs: string[]
}

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: 'Music' | 'Culture' | 'Fresh Drops' | 'Events' | 'Opinion'
  publishedAt: string
  dateLabel: string
  readTime: string
  image: string
  imageAlt: string
  featured?: boolean
  keywords: string[]
  sections: BlogSection[]
  sources?: BlogSource[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'alusa-continua-bien-kenyan-album-with-a-passport',
    title: 'Alusa Continua: Bien Made a Kenyan Album With a Passport',
    excerpt:
      'The features are international, but the identity stays stubbornly Kenyan. That may be the smartest thing about Bien’s new album.',
    category: 'Music',
    publishedAt: '2026-11-24',
    dateLabel: '24 Nov 2026',
    readTime: '5 min read',
    image: '/Banner.jpg',
    imageAlt: 'RIENG editorial banner representing Kenyan music and culture',
    featured: true,
    keywords: ['Bien', 'Alusa Continua', 'Kenyan music', 'Sauti Sol', 'Kenyan albums 2026'],
    sections: [
      {
        paragraphs: [
          'Bien’s new 17-track album Alusa Continua arrived on 20 November with the kind of guest list that instantly gets screenshots moving: 2 Chainz, Joshua Baraka, Oxlade, Coster Ojwang, Ywaya Tajiri and more.',
          'But the features are not the most interesting part. Kenyan artists have been collaborating across borders for years. What makes this project worth sitting with is how little it seems interested in sanding off its Kenyan edges just to look “global”. On release day, Spotify put the album on its New Music Friday billboard in Times Square — a very global stage for a record that keeps home firmly in the frame.',
        ],
      },
      {
        heading: 'Home is part of the export',
        paragraphs: [
          'The album pulls vernacular language and Bien’s Isukha roots into a project built for a much wider audience. That choice matters. “Going international” can easily become code for making the music less specific, less local and, eventually, less memorable.',
          'Alusa Continua makes a better bet: the identity is not baggage you drop at the airport. It is the thing you travel with.',
        ],
      },
      {
        heading: 'Kenyan pop does not need to shrink itself',
        paragraphs: [
          'There is a version of African pop that feels engineered to fit whatever playlist is moving fastest that month. Sometimes it works. Sometimes it ages before the campaign is even over.',
          'A record that knows where it comes from has a longer runway. If Bien’s album connects outside Kenya, the win is bigger precisely because it did not have to pretend it came from nowhere.',
          'That is the part RIENG is watching. The next wave of Kenyan music should not have to ask permission to sound Kenyan before it travels.',
        ],
      },
    ],
    sources: [
      {
        label: 'KenyanVibe — Crispy Fresh! New Kenyan Music This Week (21 Nov 2026)',
        url: 'https://www.kenyanvibe.com/crispy-fresh-new-kenyan-music-this-week-20/',
      },
      {
        label: 'KenyanVibe — Bien announces 17-track album and collaborators',
        url: 'https://www.kenyanvibe.com/bien-new-17-track-album-features-2chainz-alikiba-and-femi-one/',
      },
      {
        label: 'KenyanVibe — Bien Takes Kenyan Music to Times Square With Alusa Continua',
        url: 'https://www.kenyanvibe.com/bien-takes-kenyan-music-to-times-square-with-alusa-continua/',
      },
    ],
  },
  {
    slug: 'boondocks-gang-gengetone-comeback',
    title: 'Boondocks Gang Are Back in the Conversation. Gengetone Never Really Left.',
    excerpt:
      'A reunion photo can trigger nostalgia. A real comeback has a harder job: prove the chemistry still works in the Kenya of 2026.',
    category: 'Culture',
    publishedAt: '2026-11-23',
    dateLabel: '23 Nov 2026',
    readTime: '6 min read',
    image: '/shows/gengetone.webp',
    imageAlt: 'RIENG artwork for Gengetone programming',
    keywords: ['Boondocks Gang', 'Gengetone', 'Arbantone', 'Kenyan music culture', 'Exray'],
    sections: [
      {
        paragraphs: [
          'A photo and short clip of Exray Taniua, Odi Wa Murang’a and Maddox was enough to pull Boondocks Gang straight back into Kenyan music timelines this month. The obvious question followed immediately: reunion, new music, or just three old friends in one frame?',
          'There is no confirmed comeback yet. Still, the reaction says something important about how much of that era remains lodged in Kenyan pop memory.',
        ],
      },
      {
        heading: 'Gengetone did not vanish. It leaked everywhere.',
        paragraphs: [
          'The genre stopped dominating headlines the way it once did, but its energy never disappeared. You can hear pieces of it in Arbantone, club playlists, street slang, production choices and the way younger acts attack hooks.',
          'The names changed. The BPM shifted. TikTok became a bigger part of the launch plan. The DNA stayed in the room.',
        ],
      },
      {
        heading: 'A comeback cannot live on nostalgia alone',
        paragraphs: [
          'That is why a Boondocks return would be more interesting now than it would have been two years ago. They would be walking into a scene they helped shape but no longer control.',
          'Trying to recreate late-2010s Gengetone exactly would probably be the wrong move. The better test is whether the group’s chemistry can survive contact with a faster, more fragmented Kenyan pop landscape.',
          'Nostalgia can earn the first click. The song has to earn the second one.',
        ],
      },
    ],
    sources: [
      {
        label: 'KenyanVibe — Boondocks Gang Reunite, But Has Kenyan Pop Moved On?',
        url: 'https://www.kenyanvibe.com/boondocks-gang-reunite-but-has-kenyan-pop-moved-on/',
      },
    ],
  },
  {
    slug: 'what-we-are-listening-to-november-2026',
    title: 'What We’re Listening To: The Kenyan Records Surviving the Release-Day Hype',
    excerpt:
      'Forget “song of the year” captions. The better test is simple: which record are you still playing three days later?',
    category: 'Fresh Drops',
    publishedAt: '2026-11-22',
    dateLabel: '22 Nov 2026',
    readTime: '4 min read',
    image: '/trending/maandy-inzaagi.webp',
    imageAlt: 'Editorial artwork of a microphone, vinyl and Nairobi nightlife',
    keywords: ['new Kenyan music', 'Kenyan songs 2026', 'Bien', 'Otile Brown', 'Joshua Baraka'],
    sections: [
      {
        paragraphs: [
          'November has been busy. Bien dropped Alusa Continua. Otile Brown followed with the five-track EP The Problem Child. Recent release round-ups have also carried music from Joshua Baraka with Watendawili, Tuku Kantu with Vic West and Scar Mkadinali, Ywaya Tajiri and Onyach Pala.',
          'The internet response to new music is usually predictable: fire emojis, “album of the year”, thirty-second clips, then another release arrives and the timeline moves on.',
        ],
      },
      {
        heading: 'The three-day test',
        paragraphs: [
          'RIENG prefers a less dramatic question: what are you still playing after the launch noise dies down?',
          'The strongest songs are not always the loudest on day one. Sometimes the real hit is the record that quietly survives the weekend, slips into matatu playlists, gets quoted in group chats and suddenly feels like it has always been around.',
        ],
      },
      {
        heading: 'Rotation should be earned',
        paragraphs: [
          'That is what we want this section of the blog to become: not a copy-and-paste release dump, but a running record of what actually deserves another spin.',
          'Keep an ear on the RIENG live stream. If a song keeps coming back, there is probably a reason.',
        ],
      },
    ],
    sources: [
      {
        label: 'KenyanVibe — Crispy Fresh! New Kenyan Music This Week (21 Nov 2026)',
        url: 'https://www.kenyanvibe.com/crispy-fresh-new-kenyan-music-this-week-20/',
      },
      {
        label: 'KenyanVibe — Crispy Fresh! New Kenyan Music This Week (13 Nov 2026)',
        url: 'https://www.kenyanvibe.com/crispy-fresh-new-kenyan-music-this-week-19/',
      },
      {
        label: 'KenyanVibe — Crispy Fresh! New Kenyan Music This Week (7 Nov 2026)',
        url: 'https://www.kenyanvibe.com/crispy-fresh-new-kenyan-music-this-week-18/',
      },
    ],
  },
  {
    slug: 'nairobi-december-2026-live-music-season',
    title: 'Nairobi Is Heading Into December Like a City That Remembers It Loves Live Music',
    excerpt:
      'Odeal at The Soulcial. Three days of Sol Fest. Different rooms, different crowds — and a healthier live scene because of it.',
    category: 'Events',
    publishedAt: '2026-11-21',
    dateLabel: '21 Nov 2026',
    readTime: '5 min read',
    image: '/Rieng_Radio.jpg',
    imageAlt: 'RIENG Radio artwork used for a Nairobi live music editorial',
    keywords: ['Nairobi concerts December 2026', 'Sol Fest 2026', 'Odeal Nairobi', 'The Soulcial', 'Kenya events'],
    sections: [
      {
        paragraphs: [
          'Nairobi is heading into December with something better than one oversized concert poster. It is starting to look like a proper live-music season.',
          'The Soulcial is set for 19 December at Kasarani Indoor Arena with British-Nigerian singer Odeal headlining a night built around R&B, soul and Afro-fusion. Sol Fest is scheduled for 17–19 December at Uhuru Gardens, putting a major Kenyan festival into the same week.',
        ],
      },
      {
        heading: 'A healthy city needs different rooms',
        paragraphs: [
          'One arena show does not make a scene. Neither does one festival. A strong music city gives people choices: underground rap nights, reggae sessions, live-band shows, electronic sets, huge festival stages and small rooms where an artist can still see every face in the crowd.',
          'That variety matters for artists too. Stars need arenas. Future stars need stages before anybody knows their names.',
        ],
      },
      {
        heading: 'Stop treating every packed show like a miracle',
        paragraphs: [
          'The opportunity for Nairobi is to build repeat behaviour. Promoters need audiences who trust the experience. Venues need calendars people actually check. Artists need a path from the small stage to the big one.',
          'December will be noisy. Good. Nairobi should sound like a city with too much music to fit into one weekend.',
        ],
      },
    ],
    sources: [
      {
        label: 'Citizen Digital — Odeal to headline inaugural The Soulcial concert in Nairobi',
        url: 'https://citizen.digital/article/odeal-to-headline-inaugural-the-soulcial-concert-in-nairobi-n388584',
      },
      {
        label: 'KenyanVibe — Sol Fest Secures New Partnership Ahead of December Music Festival',
        url: 'https://www.kenyanvibe.com/sol-fest-secures-new-partnership-ahead-of-december-music-festival/',
      },
    ],
  },
  {
    slug: 'kenyan-music-does-not-stay-in-one-lane',
    title: 'Kenyan Music Refuses to Stay in One Lane. That’s the Point.',
    excerpt:
      'Gengetone, Arbantone, hip-hop, Amapiano, R&B, Afro-house — the audience stopped asking for permission to mix genres a long time ago.',
    category: 'Opinion',
    publishedAt: '2026-11-20',
    dateLabel: '20 Nov 2026',
    readTime: '5 min read',
    image: '/shows/underground.webp',
    imageAlt: 'RIENG underground hip-hop and Shrap artwork',
    keywords: ['Kenyan music genres', 'Arbantone', 'Gengetone', 'Shrap', 'Amapiano Kenya'],
    sections: [
      {
        paragraphs: [
          'Spend one night following a Kenyan crowd and the genre argument starts looking a little outdated. A DJ can move from Gengetone to Arbantone, hip-hop, Amapiano, Afro-house and R&B without emptying the floor.',
          'Recent multi-genre events in Eldoret made the mix visible, but Nairobi listeners have been behaving this way for a while. The playlist won the argument before the industry finished naming the categories.',
        ],
      },
      {
        heading: 'Freedom for artists, pressure for weak songs',
        paragraphs: [
          'That flexibility is exciting because it gives artists more room to experiment. It is also brutal. Listeners who happily jump genres have very little reason to stay loyal to a mediocre record just because it belongs to “their” scene.',
          'If the song works, people will carry it across rooms and playlists. If it does not, calling it “the next wave” will not save it.',
        ],
      },
      {
        heading: 'Radio should sound like the people listening',
        paragraphs: [
          'That is why RIENG’s schedule moves the way it does: Kenyan old-school in the morning, new Kenyan R&B, Gengetone and Arbantone later, then Dancehall, Shrap, Reggae, Bongo and Lingala as the day turns.',
          'The audience already listens across borders and eras. Radio is more interesting when it stops pretending those walls still exist.',
        ],
      },
    ],
    sources: [
      {
        label: 'The Standard — From Gengetone to Amapiano, Eldoret showcases Kenya’s changing music scene',
        url: 'https://www.standardmedia.co.ke/amp/business/entertainment/article/2001558372/from-gengetone-to-amapiano-eldoret-showcases-kenyas-changing-music-scene',
      },
    ],
  },
]

export function getBlogPost(slug: string) {
  return blogPosts.find(post => post.slug === slug)
}

export function getRelatedBlogPosts(slug: string, limit = 3) {
  const current = getBlogPost(slug)
  if (!current) return blogPosts.filter(post => post.slug !== slug).slice(0, limit)

  const sameCategory = blogPosts.filter(
    post => post.slug !== slug && post.category === current.category
  )
  const others = blogPosts.filter(
    post => post.slug !== slug && post.category !== current.category
  )

  return [...sameCategory, ...others].slice(0, limit)
}
