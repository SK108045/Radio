'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { AD_DOMAIN, CATFISH_ZONE_ID, loadAdNetwork, releaseAdZone } from '@/lib/ad-network'
import { hasCatfishAd } from '@/lib/catfish'

const containerId = `zone_${CATFISH_ZONE_ID}`

function CatfishZone() {
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = container.current
    if (!node) return
    let cancelled = false
    let frame = 0
    const observed = new Set<Element>()
    const resize = new ResizeObserver(() => scheduleMeasure())
    const measure = () => {
      frame = 0
      let height = 0
      for (const element of [node, ...Array.from(node.querySelectorAll('*'))]) {
        const style = getComputedStyle(element)
        if (style.position !== 'fixed' || style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue
        if (!observed.has(element)) { resize.observe(element); observed.add(element) }
        const rect = element.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom >= window.innerHeight - 4) {
          height = Math.max(height, Math.ceil(window.innerHeight - rect.top))
        }
      }
      document.documentElement.style.setProperty('--catfish-height', `${height}px`)
    }
    const scheduleMeasure = () => { if (!frame) frame = requestAnimationFrame(measure) }
    const mutation = new MutationObserver(scheduleMeasure)
    mutation.observe(node, { childList: true, subtree: true, attributes: true })
    resize.observe(node)
    window.addEventListener('resize', scheduleMeasure)
    node.addEventListener('load', scheduleMeasure, true)
    scheduleMeasure()
    void loadAdNetwork().then(Network => {
      if (!cancelled) new Network(containerId, { id: CATFISH_ZONE_ID, domain: AD_DOMAIN })
    }).catch(() => { /* An unavailable ad must never interrupt the radio. */ })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      mutation.disconnect()
      resize.disconnect()
      window.removeEventListener('resize', scheduleMeasure)
      node.removeEventListener('load', scheduleMeasure, true)
      releaseAdZone(containerId, node)
      document.documentElement.style.removeProperty('--catfish-height')
    }
  }, [])
  return <div id={containerId} ref={container} aria-label="Advertisement" />
}

export default function CatfishAd() {
  const pathname = usePathname()
  // Root-layout ownership keeps a single anchor across public-page navigation.
  return hasCatfishAd(pathname) ? <CatfishZone /> : null
}
