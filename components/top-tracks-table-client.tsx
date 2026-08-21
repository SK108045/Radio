'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Music, Play, Download, Copy, Check, Calendar, Tag, Info,
  Trash2, AlertTriangle, Loader2
} from 'lucide-react'
import { deleteTrackAction } from '@/app/sales/actions'

export interface TrackDetailItem {
  track_id: string
  artist_id: string
  track_title: string
  stage_name: string
  description?: string | null
  price_ksh: number
  mp3_file_path?: string | null
  created_at?: string | null
  total_streams: number
  total_downloads: number
  total_revenue_ksh: number
}

interface TopTracksTableClientProps {
  tracks: TrackDetailItem[]
  error?: string | null
}

export function TopTracksTableClient({ tracks, error }: TopTracksTableClientProps) {
  const router = useRouter()
  const [trackList, setTrackList] = useState<TrackDetailItem[]>(tracks)
  const [selectedTrack, setSelectedTrack] = useState<TrackDetailItem | null>(null)
  const [copied, setCopied] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null)

  // Keep trackList updated when props change
  if (tracks !== trackList && tracks.length !== trackList.length) {
    setTrackList(tracks)
  }

  const handleCopyUrl = (url?: string | null) => {
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Recently Added'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  // ── Delete Track from Supabase ──
  const handleDeleteTrack = async (track: TrackDetailItem) => {
    setDeletingId(track.track_id)
    try {
      const res = await deleteTrackAction(track.track_id, track.mp3_file_path)
      if (res?.error) {
        alert(`Delete failed: ${res.error}`)
      } else {
        setTrackList((prev) => prev.filter((t) => t.track_id !== track.track_id))
        setDeleteNotice(`"${track.track_title}" deleted permanently from Supabase.`)
        setSelectedTrack(null)
        setShowDeleteConfirm(false)
        router.refresh()
        setTimeout(() => setDeleteNotice(null), 4000)
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Could not delete track. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      {deleteNotice && (
        <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3 text-emerald-400 text-sm font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{deleteNotice}</span>
          </div>
          <button onClick={() => setDeleteNotice(null)} className="text-emerald-400/60 hover:text-emerald-400 text-xs">Dismiss</button>
        </div>
      )}

      <Card className="bg-card border-border mb-6 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              Top Performing Tracks &amp; Uploads
            </CardTitle>
            <CardDescription>
              {error ? 'Could not load tracks.' : 'Click on any song row to view full details, audio preview, or delete'}
            </CardDescription>
          </div>
          {trackList.length > 0 && (
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs font-semibold px-3 py-1">
              {trackList.length} Track{trackList.length !== 1 ? 's' : ''} in Catalog
            </Badge>
          )}
        </CardHeader>

        <CardContent>
          {trackList.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border rounded-xl bg-card/50">
              <Music className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No tracks uploaded yet</p>
              <p className="text-xs text-muted-foreground mt-1">Use the upload form below to add your first track to the store.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                    <TableHead className="text-muted-foreground font-semibold">Track</TableHead>
                    <TableHead className="text-center text-muted-foreground font-semibold">Price</TableHead>
                    <TableHead className="text-right text-muted-foreground font-semibold">Streams</TableHead>
                    <TableHead className="text-right text-muted-foreground font-semibold">Downloads</TableHead>
                    <TableHead className="text-right text-muted-foreground font-semibold">Revenue</TableHead>
                    <TableHead className="text-center text-muted-foreground font-semibold w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trackList.map((track, index) => (
                    <TableRow
                      key={track.track_id}
                      onClick={() => {
                        setSelectedTrack(track)
                        setShowDeleteConfirm(false)
                      }}
                      className="border-border hover:bg-primary/10 cursor-pointer transition-colors group"
                      title="Click to view song details"
                    >
                      {/* Track Info */}
                      <TableCell className="font-medium py-4">
                        <div className="flex items-center gap-3.5">
                          <Badge
                            variant="secondary"
                            className="w-7 h-7 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0"
                          >
                            {index + 1}
                          </Badge>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                              {track.track_title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {track.stage_name}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Price Badge */}
                      <TableCell className="text-center py-4">
                        <span className="inline-flex items-center gap-1 font-bold text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                          KSh {track.price_ksh}
                        </span>
                      </TableCell>

                      {/* Streams */}
                      <TableCell className="text-right py-4 font-semibold text-primary">
                        {Number(track.total_streams) >= 1000
                          ? `${(Number(track.total_streams) / 1000).toFixed(0)}K`
                          : track.total_streams}
                      </TableCell>

                      {/* Downloads */}
                      <TableCell className="text-right py-4 font-semibold text-foreground/80">
                        {Number(track.total_downloads) >= 1000
                          ? `${(Number(track.total_downloads) / 1000).toFixed(1)}K`
                          : track.total_downloads}
                      </TableCell>

                      {/* Revenue */}
                      <TableCell className="text-right py-4 font-bold text-foreground">
                        KSh {Number(track.total_revenue_ksh).toLocaleString()}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTrack(track)
                              setShowDeleteConfirm(false)
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-colors"
                            title="View Track Details"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTrack(track)
                              setShowDeleteConfirm(true)
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete Track from Supabase"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── TRACK DETAILS & DELETE MODAL ── */}
      <Dialog open={!!selectedTrack} onOpenChange={(open) => { if (!open) { setSelectedTrack(null); setShowDeleteConfirm(false) } }}>
        <DialogContent className="max-w-xl bg-[#0d0d0d] border border-white/10 text-foreground shadow-2xl p-6 sm:p-8 rounded-2xl">
          {selectedTrack && (
            <>
              {/* Header */}
              <DialogHeader className="space-y-2">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest bg-primary/15 text-primary border border-primary/30 px-3 py-1 rounded-full">
                    <Music className="w-3.5 h-3.5" />
                    Track Information
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3.5 py-1 rounded-full shadow-sm">
                    KSh {selectedTrack.price_ksh}
                  </span>
                </div>

                <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                  {selectedTrack.track_title}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm font-medium">
                  By <strong className="text-foreground">{selectedTrack.stage_name}</strong>
                </DialogDescription>
              </DialogHeader>

              {/* Delete Confirmation Warning Box */}
              {showDeleteConfirm && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl space-y-3 animate-in fade-in my-2">
                  <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>Permanent Deletion Confirmation</span>
                  </div>
                  <p className="text-xs text-destructive/90 leading-relaxed">
                    Are you sure you want to delete <strong>"{selectedTrack.track_title}"</strong>? This will permanently delete the audio MP3 file from Supabase storage and remove the track from your store catalog.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === selectedTrack.track_id}
                      onClick={() => handleDeleteTrack(selectedTrack)}
                      className="font-bold text-xs"
                    >
                      {deletingId === selectedTrack.track_id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Deleting from Supabase…
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Yes, Delete Permanently
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="border-white/10 hover:bg-white/10 text-xs font-bold"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Audio Player Preview */}
              {selectedTrack.mp3_file_path && !showDeleteConfirm && (
                <div className="my-2 p-4 bg-white/[0.03] border border-white/10 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1.5 text-primary font-bold">
                      <Play className="w-3.5 h-3.5 fill-current" /> Audio Preview
                    </span>
                    <span>Direct MP3 Stream</span>
                  </div>
                  <audio
                    controls
                    src={selectedTrack.mp3_file_path}
                    className="w-full h-10 accent-primary rounded-lg"
                    preload="metadata"
                  >
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Price</p>
                  <p className="text-base font-black text-emerald-400">KSh {selectedTrack.price_ksh}</p>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Streams</p>
                  <p className="text-base font-black text-primary">{selectedTrack.total_streams}</p>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Downloads</p>
                  <p className="text-base font-black text-foreground">{selectedTrack.total_downloads}</p>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Revenue</p>
                  <p className="text-base font-black text-foreground">KSh {selectedTrack.total_revenue_ksh}</p>
                </div>
              </div>

              {/* Description & Metadata */}
              <div className="space-y-3 my-2">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-primary" /> Track Description
                  </p>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {selectedTrack.description || 'No description provided for this track.'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground px-1 flex-wrap gap-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Uploaded: {formatDate(selectedTrack.created_at)}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground/70">
                    ID: {selectedTrack.track_id.substring(0, 8)}…
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-white/10 mt-2">
                {/* Delete Button */}
                {!showDeleteConfirm ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full sm:w-auto text-destructive hover:bg-destructive/10 hover:text-destructive text-xs font-bold mr-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Delete Track
                  </Button>
                ) : null}

                <div className="flex items-center gap-2 w-full sm:w-auto ml-auto justify-end">
                  {selectedTrack.mp3_file_path && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyUrl(selectedTrack.mp3_file_path)}
                        className="w-full sm:w-auto border-white/10 hover:bg-white/10 text-xs font-bold"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                            Copied Audio Link
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 mr-1.5" />
                            Copy Audio URL
                          </>
                        )}
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto border-white/10 hover:bg-white/10 text-xs font-bold"
                      >
                        <a href={selectedTrack.mp3_file_path} target="_blank" rel="noopener noreferrer" download>
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                          Download File
                        </a>
                      </Button>
                    </>
                  )}
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedTrack(null)
                      setShowDeleteConfirm(false)
                    }}
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs"
                  >
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
