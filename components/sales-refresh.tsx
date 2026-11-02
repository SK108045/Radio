'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
export function SalesRefresh() {
  const router = useRouter()
  useEffect(() => { const id = setInterval(() => { if (document.visibilityState === 'visible') router.refresh() }, 5000); const focus=()=>router.refresh(); window.addEventListener('focus',focus); return ()=> { clearInterval(id); window.removeEventListener('focus',focus) } }, [router])
  return null
}
