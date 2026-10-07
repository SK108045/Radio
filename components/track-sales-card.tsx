'use client'
import { useEffect, useRef, useState } from 'react'
import type { CatalogTrack } from '@/lib/sales-catalog'
import { Play, Pause, Headphones, Lock, Loader2 } from 'lucide-react'
import { useRadio } from '@/context/RadioContext'
async function api(url: string, options?: RequestInit) { const res = await fetch(url, { ...options, cache: 'no-store' }); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Please retry.'); return data }
let browserSetup: Promise<void> | null = null
async function ensureBrowser() {
  // All cards share one initial cookie request; competing Set-Cookie responses
  // must not replace the browser identity after a checkout has begun.
  browserSetup ||= api('/api/music/checkout').then(() => {}).finally(() => { browserSetup = null })
  return browserSetup
}
export function TrackSalesCard({ track }: { track: CatalogTrack }) {
  const audio = useRef<HTMLAudioElement | null>(null), sourceExpiry = useRef(0), mode = useRef('preview'), playingRef = useRef(false), reconnectAt = useRef(0), attempt = useRef<string | null>(null)
  const [playing, setPlaying] = useState(false), [busy, setBusy] = useState(false), [checking, setChecking] = useState(false), [phone, setPhone] = useState(''), [error, setError] = useState(''), [order, setOrder] = useState<{status: string; note: string; reference: string} | null>(null), [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const radio = useRadio()
  const unlocked = !!expiresAt && new Date(expiresAt).getTime() > now
  async function check() {
    setChecking(true)
    try { await ensureBrowser(); const data = await api(`/api/music/status?trackId=${track.id}`); setOrder(data.order); setExpiresAt(data.expiresAt); if(['paid','failed'].includes(data.order?.status)) attempt.current=null } catch (e) { setError(e instanceof Error ? e.message : 'Status unavailable.') } finally { setChecking(false) }
  }
  useEffect(() => { void check(); return () => { audio.current?.pause() } }, [track.id])
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  useEffect(() => {
    if (!order || !['created','pending','uncertain'].includes(order.status)) return
    const id = setInterval(() => { void check() }, 3000); return () => clearInterval(id)
  }, [order?.status, track.id])
  useEffect(() => {
    if (mode.current === 'full' && !unlocked) { audio.current?.pause(); if (audio.current) { audio.current.removeAttribute('src'); audio.current.load() }; setPlaying(false) }
  }, [unlocked])
  useEffect(() => {
    const stopOther = (e: Event) => { if ((e as CustomEvent).detail !== track.id) audio.current?.pause() }
    window.addEventListener('rieng-track-play', stopOther); return () => window.removeEventListener('rieng-track-play', stopOther)
  }, [track.id])
  async function toggle() {
    if (!audio.current || busy) return
    if (playingRef.current) { audio.current.pause(); return }
    setError(''); setBusy(true)
    try {
      const target = unlocked ? 'full' : 'preview', element = audio.current
      if (mode.current !== target || sourceExpiry.current < Date.now() + 5000 || !element.src) {
        const position = mode.current === target && !element.ended ? element.currentTime : 0
        const data = await api(`/api/music/playback?trackId=${track.id}&mode=${target}`)
        element.src = data.url; mode.current = target; sourceExpiry.current = new Date(data.urlExpiresAt).getTime()
        element.currentTime = position >= 30 && target === 'preview' ? 0 : position
      }
      if (radio.isPlaying) radio.pause()
      window.dispatchEvent(new CustomEvent('rieng-track-play', { detail: track.id }))
      await element.play()
    } catch (e) { setError(e instanceof Error ? e.message : 'Playback unavailable.') } finally { setBusy(false) }
  }
  async function reconnect() {
    const element = audio.current
    if (!element?.src) return
    playingRef.current = false; setPlaying(false); sourceExpiry.current = 0
    if (mode.current !== 'full' || !unlocked || Date.now() - reconnectAt.current < 5000) { setError('Playback was interrupted. Press play to reconnect.'); return }
    reconnectAt.current = Date.now()
    try {
      const position = element.currentTime
      const data = await api(`/api/music/playback?trackId=${track.id}&mode=full`)
      element.src = data.url; sourceExpiry.current = new Date(data.urlExpiresAt).getTime(); element.currentTime = position
      await element.play()
    } catch { setError('Playback was interrupted. Press play to reconnect.') }
  }
  async function purchase(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      await ensureBrowser()
      attempt.current ||= crypto.randomUUID()
      const data = await api('/api/music/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackId: track.id, phone, attemptId: attempt.current }) })
      if (data.order) { setOrder(data.order); if (data.order.status === 'failed') attempt.current = null }
      if (data.expiresAt) setExpiresAt(data.expiresAt)
      await check()
    } catch (e) { setError(e instanceof Error ? e.message : 'Payment unavailable.') } finally { setBusy(false) }
  }
  const pending = order && ['created','pending','uncertain'].includes(order.status)
  return <article className="rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-xl"><div className="p-6 border-b border-white/10 flex items-center justify-between gap-4"><div><p className="text-primary text-xs font-bold uppercase tracking-widest">{track.artist}</p><h2 className="text-2xl font-bold mt-3 break-words">{track.title}</h2></div><Headphones className="text-primary shrink-0" size={30} /></div><div className="p-6 space-y-5"><p className="text-sm leading-relaxed text-gray-400">{track.description}</p><div className="flex items-center justify-between"><strong className="text-2xl">KSh {track.price.toLocaleString('en-KE')}</strong><span className="text-xs text-gray-400">12-hour streaming</span></div><button onClick={toggle} disabled={busy} className="w-full rounded-xl px-4 py-3 bg-white/10 hover:bg-white/15 flex items-center justify-center gap-2 disabled:opacity-50">{playing ? <Pause size={17} /> : <Play size={17} />}{busy ? 'Please wait…' : playing ? 'Pause' : unlocked ? 'Play full track' : 'Play 30-second preview'}</button><audio ref={audio} preload="none" controls={false} controlsList="nodownload noremoteplayback" onContextMenu={e => e.preventDefault()} onPlay={() => { playingRef.current=true; setPlaying(true) }} onPause={() => { playingRef.current=false; setPlaying(false) }} onEnded={() => { playingRef.current=false; setPlaying(false) }} onTimeUpdate={() => { const el=audio.current; if(el && ((mode.current==='preview' && el.currentTime>=30) || (mode.current==='full' && expiresAt && Date.now()>=new Date(expiresAt).getTime()))) el.pause() }} onError={() => { void reconnect() }} />
      {unlocked ? <p role="status" className="text-sm text-green-400">Listening unlocked until {new Date(expiresAt!).toLocaleString()}. Keep using this browser.</p> : <form onSubmit={purchase} className="space-y-3"><label htmlFor={`phone-${track.id}`} className="text-xs text-gray-400">M-Pesa phone number</label><input id={`phone-${track.id}`} type="tel" autoComplete="tel" required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="0712 345 678" disabled={!!pending || busy} className="w-full rounded-xl bg-black/30 border border-white/15 px-4 py-3 text-sm" /><button disabled={busy || !!pending} className="w-full bg-primary hover:bg-orange-600 rounded-xl px-4 py-3 font-bold flex items-center justify-center gap-2 disabled:opacity-60">{busy || pending ? <Loader2 size={17} className="animate-spin" /> : <Lock size={15} />}{busy ? 'Sending M-Pesa prompt…' : pending ? 'Awaiting payment confirmation' : `Pay KSh ${track.price} with M-Pesa`}</button></form>}
      {pending && <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 flex items-center gap-3"><Loader2 size={20} className="text-primary animate-spin shrink-0" /><div className="min-w-0"><p className="text-sm font-semibold text-white">Waiting for M-Pesa confirmation</p><p className="text-xs text-gray-400 mt-0.5">We’re checking automatically every few seconds.</p></div><span className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" /></div>}
      {order && <div role="status" className="text-xs text-gray-400 space-y-2"><p>{order.note}</p><p className="break-all">Reference: {order.reference}</p></div>}{(pending || order?.status==='paid') && !unlocked && <button type="button" onClick={()=> { if(order?.status==='failed') attempt.current=null; void check() }} disabled={checking} className="text-primary text-sm inline-flex items-center gap-2 disabled:opacity-60">{checking ? <><Loader2 size={14} className="animate-spin" />Checking…</> : 'Check payment status'}</button>}{error && <p role="alert" className="text-red-400 text-sm">{error}</p>}</div></article>
}
