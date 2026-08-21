import { NextRequest, NextResponse } from 'next/server'
import { enhanceTrackDescription } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { title, artistName, rawDescription, genre } = await req.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const enhanced = await enhanceTrackDescription({
      title,
      artistName: artistName || 'Kenyan Creator',
      rawDescription: rawDescription || '',
      genre: genre || 'Kenyan Urban / Arbantone / Gengetone',
    })

    return NextResponse.json({ enhancedDescription: enhanced })
  } catch (err) {
    console.error('AI Enhance route error:', err)
    return NextResponse.json(
      { error: 'Failed to enhance description with AI' },
      { status: 500 }
    )
  }
}
