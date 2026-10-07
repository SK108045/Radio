import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { adminDb, requireData } from '@/lib/supabase-admin'
import { inputJson, json, uuid } from '@/lib/sales-http'
import { makePreview } from '@/lib/audio-preview'
import { revalidatePath } from 'next/cache'
export const runtime = 'nodejs'
export const maxDuration = 180
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(); if (!session) return json({ error: 'Please sign in again.' }, 401)
    const input = await inputJson(req)
    if (!uuid(input.trackId)) return json({ error: 'Invalid track.' }, 400)
    const db = adminDb(), track = requireData(await db.from('tracks').select('*').eq('id', input.trackId).eq('artist_id', session.artistId).single())
    if (track.sales_status === 'ready') return json({ success: true })
    if (track.sales_status !== 'draft') return json({ error: 'This track is archived.' }, 400)
    const info = requireData(await db.storage.from('artist-tracks').info(track.mp3_file_path))
    if (Number(info.size) !== Number(track.audio_size)) return json({ error: 'Audio upload is incomplete.' }, 400)
    const signed = requireData(await db.storage.from('artist-tracks').createSignedUrl(track.mp3_file_path, 180))
    const preview = await makePreview(signed.signedUrl), previewPath = `${session.artistId}/${track.id}/preview.mp3`
    const { error } = await db.storage.from('artist-previews').upload(previewPath, preview, { contentType: 'audio/mpeg', upsert: true, cacheControl: '60' })
    if (error) throw new Error('Preview could not be saved. Retry publishing.')
    requireData(await db.from('tracks').update({ preview_file_path: previewPath, description: typeof input.description === 'string' ? input.description.slice(0, 3000) : track.description, sales_status: 'ready' }).eq('id', track.id).eq('artist_id', session.artistId).eq('sales_status', 'draft').select('id').single())
    revalidatePath('/dj-mix-sales'); revalidatePath('/sales')
    return json({ success: true })
  } catch (e) { return json({ error: e instanceof Error ? e.message : 'Track could not be published.' }, 400) }
}
