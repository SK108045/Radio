import { NextRequest } from 'next/server'
import { adminDb, requireData } from '@/lib/supabase-admin'
import { browserHash, json, uuid } from '@/lib/sales-http'
import { activeEntitlement } from '@/lib/track-payments'
import { playbackTTL } from '@/lib/sales-security'
export async function GET(req: NextRequest) {
  try {
    const trackId = req.nextUrl.searchParams.get('trackId'), full = req.nextUrl.searchParams.get('mode') === 'full'
    if (!uuid(trackId)) return json({ error: 'Invalid track.' }, 400)
    const db = adminDb(), { data: track, error } = await db.from('tracks').select('mp3_file_path,preview_file_path,sales_status').eq('id', trackId).in('sales_status', ['ready','archived']).maybeSingle()
    if (error) throw new Error('Playback is unavailable.')
    if (!track) return json({ error: 'Track not found.' }, 404)
    let ttl = 60, expiresAt: string | null = null
    if (full) {
      const browser = browserHash(req), entitlement = browser ? await activeEntitlement(browser, trackId) : null
      if (!entitlement) return json({ error: 'Purchase 12-hour listening access first.' }, 403)
      expiresAt = entitlement.expires_at; ttl = playbackTTL(entitlement.expires_at)
      if (ttl < 1) return json({ error: 'Listening access has expired.' }, 403)
    } else if (track.sales_status !== 'ready') return json({ error: 'Preview is unavailable.' }, 404)
    const path = full ? track.mp3_file_path : track.preview_file_path
    if (!path || path.startsWith('http')) return json({ error: 'Playback is unavailable.' }, 503)
    const signed = requireData(await db.storage.from(full ? 'artist-tracks' : 'artist-previews').createSignedUrl(path, ttl))
    return json({ url: signed.signedUrl, urlExpiresAt: new Date(Date.now() + ttl * 1000).toISOString(), expiresAt, previewSeconds: full ? null : 30 })
  } catch { return json({ error: 'Playback could not be prepared. Please retry.' }, 503) }
}
