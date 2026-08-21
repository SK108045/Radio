import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase, TopPerformingTrack } from '@/lib/supabase'

export async function TopTracksTable({ artistId }: { artistId?: string } = {}) {
  let query = supabase.from('vw_top_performing_tracks').select('*')
  if (artistId) {
    query = query.eq('artist_id', artistId)
  }
  const { data: viewTracks, error } = await query.limit(10)

  let rows: TopPerformingTrack[] = viewTracks ?? []

  // If view is empty, fall back to recent tracks from tracks table
  if (rows.length === 0) {
    let rawQuery = supabase
      .from('tracks')
      .select('id, title, price_ksh, artist_id, created_at, artists(stage_name)')
      
    if (artistId) {
      rawQuery = rawQuery.eq('artist_id', artistId)
    }
    
    const { data: rawTracks } = await rawQuery.order('created_at', { ascending: false }).limit(10)
    
    if (rawTracks && rawTracks.length > 0) {
      rows = rawTracks.map((t: any) => ({
        track_id: t.id,
        artist_id: t.artist_id,
        track_title: t.title,
        stage_name: t.artists?.stage_name || 'Artist',
        total_streams: 0,
        total_downloads: 0,
        total_revenue_ksh: 0,
      }))
    }
  }

  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader>
        <CardTitle>Top Performing Tracks &amp; Uploads</CardTitle>
        <CardDescription>
          {error ? 'Could not load tracks.' : 'Your catalog and performance overview'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No tracks uploaded yet. Use the form below to upload your first track.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Track</TableHead>
                  <TableHead className="text-right text-muted-foreground">Streams</TableHead>
                  <TableHead className="text-right text-muted-foreground">Downloads</TableHead>
                  <TableHead className="text-right text-muted-foreground">Revenue (KSh)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((track, index) => (
                  <TableRow key={track.track_id} className="border-border hover:bg-primary/5">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs bg-accent/20 text-accent"
                        >
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-semibold text-foreground">{track.track_title}</p>
                          <p className="text-xs text-muted-foreground">{track.stage_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-primary font-semibold">
                        {Number(track.total_streams) >= 1000
                          ? `${(Number(track.total_streams) / 1000).toFixed(0)}K`
                          : track.total_streams}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-accent font-semibold">
                        {Number(track.total_downloads) >= 1000
                          ? `${(Number(track.total_downloads) / 1000).toFixed(1)}K`
                          : track.total_downloads}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-foreground font-semibold">
                        KSh {Number(track.total_revenue_ksh).toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
