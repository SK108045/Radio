'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Upload } from 'tus-js-client'
import { createAudioUpload, startOrResume, type UploadGrant } from '@/lib/resumable-upload'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
const storageKey = (artist: string) => `rieng-upload:${artist}`
async function post(url: string, input: unknown) { const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Request failed.'); return data }
export function UploadTrackForm({ artistId, isTest = false }: { artistId?: string; isTest?: boolean }) {
  const router = useRouter(), upload = useRef<Upload | null>(null), grant = useRef<UploadGrant | null>(null)
  const [title, setTitle] = useState(''), [description, setDescription] = useState(''), [price, setPrice] = useState(''), [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState(''), [error, setError] = useState(''), [progress, setProgress] = useState(0), [busy, setBusy] = useState(false), [paused, setPaused] = useState(false), [resumeId, setResumeId] = useState('')
  useEffect(() => {
    if (!artistId) return
    try { const saved = JSON.parse(localStorage.getItem(storageKey(artistId)) || 'null'); if (saved) { setResumeId(saved.trackId); setTitle(saved.title); setDescription(saved.description); setPrice(saved.price); setStatus(`Select ${saved.name} to resume your unfinished upload.`) } } catch { /* Ignore invalid saved state. */ }
    return () => { void upload.current?.abort() }
  }, [artistId])
  async function publish(finalDescription: string) {
    setStatus('Creating your 30-second preview and publishing…')
    await post('/api/sales/uploads/complete', { trackId: grant.current!.trackId, description: finalDescription })
    if (artistId) localStorage.removeItem(storageKey(artistId))
    setResumeId(''); grant.current = null; upload.current = null
    setTitle(''); setDescription(''); setPrice(''); setFile(null); setStatus(isTest ? 'Published. Your test sales card is ready in this portal.' : 'Published. Your track is now on /dj-mix-sales.'); router.refresh()
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!file || !artistId) { setError('Select your audio file and sign in.'); return }
    if (file.size > 50 * 1024 * 1024) { setError('Maximum audio size is 50 MB.'); return }
    setBusy(true); setPaused(false); setError(''); setStatus('Starting audio upload…')
    try {
      // Gemini starts concurrently; audio never waits for description enhancement.
      const enhancement = post('/api/ai/enhance-description', { title, rawDescription: description }).then(d => d.enhancedDescription || description).catch(() => description)
      const ext = file.name.split('.').pop()?.toLowerCase()
      const contentType = file.type || ({ mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', aac: 'audio/aac', ogg: 'audio/ogg' } as Record<string, string>)[ext || ''] || 'application/octet-stream'
      grant.current = await post('/api/sales/uploads', { resumeId: resumeId || undefined, title, description, price: Number(price), size: file.size, contentType })
      const g = grant.current!
      setResumeId(g.trackId)
      localStorage.setItem(storageKey(artistId), JSON.stringify({ trackId: g.trackId, title, description, price, name: file.name, size: file.size, lastModified: file.lastModified }))
      if (g.uploaded) { setProgress(100) }
      else {
        await new Promise<void>((resolve, reject) => {
          upload.current = createAudioUpload(file, g, n => { setProgress(n); setStatus(`Uploading audio ${n}%`) }, resolve, reject)
          void startOrResume(upload.current).catch(reject)
        })
      }
      setStatus('Audio uploaded. Finishing description…')
      const finalDescription = await enhancement
      setDescription(finalDescription)
      await publish(finalDescription)
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed. Select the same file and retry to resume.'); setStatus('Your unfinished upload is saved. Retry to resume or publish.'); }
    finally { setBusy(false); setPaused(false) }
  }
  async function togglePause() {
    if (!upload.current) return
    if (paused) { setPaused(false); upload.current.start() } else { await upload.current.abort(); setPaused(true); setStatus('Upload paused. Resume when ready.') }
  }
  return <Card className="mb-8"><CardHeader><CardTitle>Upload a track</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><label htmlFor="upload-title">Track title</label><Input id="upload-title" value={title} onChange={e => setTitle(e.target.value)} disabled={busy || !!resumeId} maxLength={160} required /><label htmlFor="upload-price">Price (KSh)</label><Input id="upload-price" type="number" min={1} max={100000} step={1} value={price} onChange={e => setPrice(e.target.value)} disabled={busy || !!resumeId} required /><label htmlFor="upload-description">Description</label><Textarea id="upload-description" value={description} onChange={e => setDescription(e.target.value)} maxLength={3000} disabled={busy} /><p className="text-sm text-muted-foreground">Gemini polishes your description while your audio uploads.</p><label htmlFor="upload-file">Audio file · up to 50 MB</label><Input id="upload-file" type="file" accept=".mp3,.wav,.m4a,.aac,.ogg,audio/*" disabled={busy} onChange={e => {
    const selected = e.target.files?.[0] || null
    if (resumeId && artistId && selected) { try { const saved = JSON.parse(localStorage.getItem(storageKey(artistId)) || '{}'); if (selected.name !== saved.name || selected.size !== saved.size || selected.lastModified !== saved.lastModified) { setError('Select the original file to resume this upload.'); setFile(null); return } } catch { /* Server also verifies size/type. */ } }
    setFile(selected); setError('')
  }} required />{busy && <progress value={progress} max={100} className="w-full" aria-label="Audio upload progress" />}<p role="status">{status}</p>{error && <p role="alert" className="text-red-400">{error}</p>}<div className="flex gap-3"><Button disabled={busy || !file}>{busy ? 'Uploading…' : resumeId ? 'Resume upload / retry publishing' : 'Upload and publish'}</Button>{busy && upload.current && progress < 100 && <Button type="button" variant="outline" onClick={togglePause}>{paused ? 'Resume' : 'Pause'}</Button>}</div></form></CardContent></Card>
}
