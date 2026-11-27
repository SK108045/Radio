'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const PROMO_CODE = 'RGRAP300'
const ZONES = [1718416788, 1892228828] as const
const DOMAIN = 'ftd.agency'
const SCRIPT_ID = 'rieng-ftd-campaign'
const PUBLIC_ROUTES = new Set([
  '/', '/shows', '/trending', '/blog', '/videos', '/albums',
  '/albums/other-artists', '/other-artists', '/ethics', '/merch',
  '/bob', '/dj-mix-sales',
])

function isPublicPage(path: string) {
  const normalized = path.replace(/\/+$/, '') || '/'
  return PUBLIC_ROUTES.has(normalized) || normalized.startsWith('/blog/')
}

type AdWindow = Window & {
  ABNS?: (...args: unknown[]) => void
  ABNSl?: unknown[][]
  ABNSh?: string
  ABN?: unknown
}

export default function CampaignAds() {
  const pathname = usePathname()
  const publicPage = Boolean(pathname && isPublicPage(pathname))
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // An external script cannot be unloaded reliably after a client-side navigation.
    // Leave the ad document entirely when moving to a non-public page.
    if (!publicPage) {
      if (document.getElementById(SCRIPT_ID)) window.location.reload()
      return
    }

    function leaveAdDocument(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey ||
          event.metaKey || event.shiftKey || event.altKey) return
      const anchor = event.target instanceof Element
        ? event.target.closest('a[href]') as HTMLAnchorElement | null : null
      if (!anchor || anchor.download || (anchor.target && anchor.target !== '_self')) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin === window.location.origin && !isPublicPage(url.pathname)) {
        event.preventDefault()
        window.location.assign(url.href)
      }
    }
    document.addEventListener('click', leaveAdDocument, true)

    // Both vendor placements use the same ABNS queue and library.
    // Register them once per document, including across public Next.js navigation.
    if (!document.getElementById(SCRIPT_ID)) {
      const w = window as AdWindow
      w.ABNS = w.ABNS || ((...args: unknown[]) => {
        (w.ABNSl ||= []).push(args)
      })
      w.ABNSh = DOMAIN
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.async = true
      script.src = 'https://cdn.' + DOMAIN + '/libs/e.js'
      for (const id of ZONES) {
        w.ABNS('zone_' + id, { id, domain: DOMAIN })
      }
      if (!w.ABN) document.head.appendChild(script)
    }
    return () => document.removeEventListener('click', leaveAdDocument, true)
  }, [publicPage])

  if (!publicPage) return null

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(PROMO_CODE)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <div id="zone_1718416788" />
      <div id="zone_1892228828" />
      <aside aria-label="Sponsored promotion" className="border-t border-white/10 bg-[#080808] px-4 py-4 text-center text-white">
        <span className="mr-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Sponsored promo code</span>
        <button type="button" onClick={copyCode} className="inline-flex items-center gap-3 rounded-lg border border-primary/40 px-3 py-2 text-sm font-bold tracking-wider text-primary">
          {PROMO_CODE}
          <span className="text-xs font-medium tracking-normal text-white" aria-live="polite">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </aside>
    </>
  )
}
