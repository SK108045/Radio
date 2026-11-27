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

  return (
    <>
      <div id="zone_1718416788" />
      <div id="zone_1892228828" />
    </>
  )
}

export function CampaignPromoBanner() {
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)

  if (!pathname || !isPublicPage(pathname)) return null

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(PROMO_CODE)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <aside aria-label="AfroPari sponsored promotion" className="relative w-full border-b border-orange-400/50 bg-[#171008] px-3 py-3 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span className="rounded bg-orange-500 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-black">Sponsored</span>
          <span className="text-sm font-black text-white sm:text-base">AfroPari Promo Code</span>
          <span className="text-xs text-gray-300 sm:text-sm">Use on AfroPari</span>
        </div>
        <button type="button" onClick={copyCode} aria-label="Copy AfroPari promo code RGRAP300" className="inline-flex items-center gap-3 rounded-md border border-orange-400 bg-black px-4 py-2 text-sm font-black tracking-widest text-orange-300 transition-colors hover:bg-orange-500/15 sm:text-base">
          {PROMO_CODE}
          <span className="border-l border-orange-400/40 pl-3 text-xs font-semibold tracking-normal text-white" aria-live="polite">{copied ? 'Copied!' : 'Copy code'}</span>
        </button>
        <span className="text-[11px] font-medium text-gray-300">18+ · Terms apply</span>
      </div>
    </aside>
  )
}
