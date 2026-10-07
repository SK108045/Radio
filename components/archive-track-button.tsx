'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTrackAction } from '@/app/sales/actions'
import { Button } from '@/components/ui/button'
export function ArchiveTrackButton({ trackId }: { trackId: string }) {
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),router=useRouter()
 return <div><Button type="button" variant="outline" disabled={busy} onClick={async()=>{
  if (!window.confirm('Delete this track from your portal and the public DJ sales page? Confirmed sales and already-paid access will be preserved.')) return
  setBusy(true);setError('')
  try { const result=await deleteTrackAction(trackId);if(result.error)setError(result.error);else router.refresh() }
  catch { setError('The track could not be deleted. Please try again.') }
  finally { setBusy(false) }
 }}>{busy ? 'Deleting…' : 'Delete track'}</Button>{error && <p role="alert">{error}</p>}</div>
}
