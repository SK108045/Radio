import { supabase } from '@/lib/supabase'
import { TopTracksTableClient, TrackDetailItem } from './top-tracks-table-client'

export async function TopTracksTable({ artistId }: { artistId?: string } = {}) {
  // 1. Fetch tracks for this artist
  let rawQuery = supabase
    .from('tracks')
    .select('id, title, description, price_ksh, mp3_file_path, created_at, artist_id, artists(stage_name)')
    .order('created_at', { ascending: false })

  if (artistId) {
    rawQuery = rawQuery.eq('artist_id', artistId)
  }

  // 2. Fetch performance stats
  let perfQuery = supabase.from('vw_top_performing_tracks').select('*')
  if (artistId) {
    perfQuery = perfQuery.eq('artist_id', artistId)
  }

  const [{ data: rawTracks, error }, { data: perfRows }] = await Promise.all([
    rawQuery.limit(25),
    perfQuery,
  ])

  // 3. Map performance by track ID
  const perfMap = new Map<string, { streams: number; downloads: number; revenue: number }>()
  if (perfRows) {
    for (const p of perfRows) {
      perfMap.set(p.track_id, {
        streams: Number(p.total_streams ?? 0),
        downloads: Number(p.total_downloads ?? 0),
        revenue: Number(p.total_revenue_ksh ?? 0),
      })
    }
  }

  // 4. Build comprehensive track details
  const tracks: TrackDetailItem[] = (rawTracks ?? []).map((t: any) => {
    const perf = perfMap.get(t.id) || { streams: 0, downloads: 0, revenue: 0 }
    return {
      track_id: t.id,
      artist_id: t.artist_id,
      track_title: t.title,
      stage_name: t.artists?.stage_name || 'Artist',
      description: t.description || null,
      price_ksh: Number(t.price_ksh ?? 0),
      mp3_file_path: t.mp3_file_path || null,
      created_at: t.created_at || null,
      total_streams: perf.streams,
      total_downloads: perf.downloads,
      total_revenue_ksh: perf.revenue,
    }
  })

  return <TopTracksTableClient tracks={tracks} error={error ? error.message : null} />
}
