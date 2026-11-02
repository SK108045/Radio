import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { adminDb, requireData, rateLimit } from '@/lib/supabase-admin'
import { inputJson, json, uuid } from '@/lib/sales-http'
import { randomUUID } from 'node:crypto'
export const runtime = 'nodejs'
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(); if (!session) return json({ error: 'Please sign in again.' }, 401)
    const input = await inputJson(req)
    await rateLimit(`upload:${session.artistId}`, 30, 3600)
    const db = adminDb()
    let track, uploaded = false
    if (input.resumeId) {
      if (!uuid(input.resumeId)) return json({ error: 'Invalid upload.' }, 400)
      track = requireData(await db.from('tracks').select('*').eq('id', input.resumeId).eq('artist_id', session.artistId).eq('sales_status', 'draft').single())
      if (Number(track.audio_size) !== input.size || track.audio_content_type !== input.contentType) return json({ error: 'Select the original file to resume.' }, 400)
      // Publishing can fail after TUS has finished. Preserve the completed
      // private original and retry preview creation without uploading again.
      const stored = await db.storage.from('artist-tracks').info(track.mp3_file_path)
      uploaded = !!stored.data && Number(stored.data.size) === Number(track.audio_size)
    } else {
      const title = typeof input.title === 'string' ? input.title.trim() : ''
      const description = typeof input.description === 'string' ? input.description.trim().slice(0, 3000) : ''
      const price = Number(input.price), size = Number(input.size)
      const allowed = ['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/mp4','audio/aac','audio/ogg','application/octet-stream']
      if (!title || title.length > 160 || !Number.isInteger(price) || price < 1 || price > 100000 || !Number.isInteger(size) || size < 1 || size > 50 * 1024 * 1024 || !allowed.includes(input.contentType)) return json({ error: 'Enter a title, a whole KSh price, and audio up to 50 MB.' }, 400)
      const id = randomUUID(), path = `${session.artistId}/${id}/original`
      track = requireData(await db.from('tracks').insert({ id, artist_id: session.artistId, title, description, price_ksh: price, mp3_file_path: path, audio_content_type: input.contentType, audio_size: size, sales_status: 'draft' }).select('*').single())
    }
    const grant = uploaded ? { token: '' } : requireData(await db.storage.from('artist-tracks').createSignedUploadUrl(track.mp3_file_path))
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!)
    if (!url.hostname.endsWith('.supabase.co')) throw new Error('Configure the direct Supabase project URL for resumable uploads.')
    const project = url.hostname.split('.')[0]
    return json({ trackId: track.id, path: track.mp3_file_path, token: grant.token, endpoint: `https://${project}.storage.supabase.co/storage/v1/upload/resumable/sign`, contentType: track.audio_content_type, uploaded })
  } catch (e) { return json({ error: e instanceof Error ? e.message : 'Upload could not start.' }, 400) }
}
