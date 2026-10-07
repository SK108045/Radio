'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTrackAction } from '@/app/sales/actions'
import { Button } from '@/components/ui/button'
export function ArchiveTrackButton({ trackId }: { trackId: string }) {
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),router=useRouter()
 return <div><Button variant="outline" disabled={busy} onClick={async()=>{setBusy(true);const result=await deleteTrackAction(trackId);setBusy(false);if(result.error)setError(result.error);else router.refresh()}}>Archive</Button>{error && <p role="alert">{error}</p>}</div>
}
