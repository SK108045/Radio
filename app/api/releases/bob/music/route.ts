import { adminDb } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BUCKET = 'Swat-Metro-Stunna'
const TRACKS = [
  { title: 'Gari Kubwa', path: 'Gari Kubwa.mp3' },
  { title: 'MOLLY · Metro Stunna', path: 'METRO STUNNA - MOLLY (official video)DIR RONXX.mp3' },
] as const

export async function GET() {
  try {
    const storage = adminDb().storage.from(BUCKET)
    const tracks = await Promise.all(TRACKS.map(async (track) => {
      const { data, error } = await storage.createSignedUrl(track.path, 6 * 60 * 60)
      if (error || !data?.signedUrl) throw new Error('Unable to sign audio track.')
      return { title: track.title, url: data.signedUrl }
    }))

    return Response.json(
      { tracks },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch {
    return Response.json(
      { error: 'Background music is temporarily unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  }
}
