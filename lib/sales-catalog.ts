import 'server-only'
import { adminDb, requireData } from './supabase-admin'
export type CatalogTrack = { id: string; title: string; description: string | null; price: number; artist: string }
export async function publicCatalog(): Promise<CatalogTrack[]> {
  const rows = requireData(await adminDb().from('tracks').select('id,title,description,price_ksh,artists!inner(id)').eq('sales_status','ready').not('preview_file_path','is',null).order('created_at', { ascending: false }))
  const artists = requireData(await adminDb().from('sales_artist_registry').select('artist_id,stage_name'))
  const names = new Map(artists.map(a => [a.artist_id, a.stage_name]))
  return rows.filter(row => names.has((row.artists as unknown as { id: string }).id)).map(row => ({ id: row.id, title: row.title, description: row.description, price: Number(row.price_ksh), artist: names.get((row.artists as unknown as { id: string }).id)! }))
}
