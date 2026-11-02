import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { rateLimit } from '@/lib/supabase-admin'
import { sameOrigin } from '@/lib/sales-http'
import { enhanceTrackDescription } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    if (!sameOrigin(req)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })
    await rateLimit(`ai:${session.artistId}`, 30, 3600)
    const { title, rawDescription, genre } = await req.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const enhanced = await enhanceTrackDescription({
      title,
      artistName: session.stageName || 'Kenyan Creator',
      rawDescription: rawDescription || '',
      genre: genre || '',
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
