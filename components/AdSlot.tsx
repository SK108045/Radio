'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AD_DOMAIN, loadAdNetwork, releaseAdZone } from '@/lib/ad-network'
import { getInlineZoneId, type AdPlacement } from '@/lib/advertising'
import { hasCatfishAd } from '@/lib/catfish'
import styles from './AdSlot.module.css'

const promotions = {
  player: { title: 'Your brand. In the mix.', description: 'Connect with the RIENG community through music, culture and live radio.', cta: 'Advertise with RIENG', href: 'tel:+254114021853' },
  feed: { title: 'Culture, on screen.', description: 'Studio sessions, interviews and the latest from RIENG TV.', cta: 'Watch RIENG TV', href: '/videos' },
  footer: { title: 'Good music deserves your support.', description: 'Discover Kenyan releases and support the artists behind the sound.', cta: 'Explore the catalogue', href: '/albums' },
}

function InlineZone({ placement, zoneId }: { placement: AdPlacement; zoneId: number | null }) {
  const uniqueId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const containerId = `rieng-ad-${placement}-${uniqueId}`
  const container = useRef<HTMLDivElement>(null)
  const [filled, setFilled] = useState(false)
  const promo = promotions[placement]

  useEffect(() => {
    const node = container.current
    if (!node || !zoneId) return
    let cancelled = false
    let started = false
    const measure = () => {
      setFilled(Array.from(node.querySelectorAll('iframe, img, video, canvas')).some(element => {
        const rect = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        return rect.width > 20 && rect.height > 20 && style.visibility !== 'hidden' && style.display !== 'none'
      }))
    }
    const resize = new ResizeObserver(measure)
    resize.observe(node)
    const mutation = new MutationObserver(measure)
    mutation.observe(node, { childList: true, subtree: true, attributes: true })
    const intersection = new IntersectionObserver(entries => {
      if (started || !entries.some(entry => entry.isIntersecting)) return
      started = true
      intersection.disconnect()
      void loadAdNetwork().then(Network => {
        if (!cancelled) new Network(containerId, { id: zoneId, domain: AD_DOMAIN })
      }).catch(() => { /* Keep the RIENG promotion when blocked or unfilled. */ })
    }, { rootMargin: '200px' })
    intersection.observe(node)
    return () => {
      cancelled = true
      intersection.disconnect()
      mutation.disconnect()
      resize.disconnect()
      releaseAdZone(containerId, node)
    }
  }, [containerId, zoneId])

  return (
    <aside className={styles.slot} aria-label={filled ? 'Advertisement' : 'RIENG promotion'} data-ad-slot={placement} data-ad-status={filled ? 'filled' : 'house'}>
      <div className={styles.inner}>
        <div className={styles.label}><span>{filled ? 'Advertisement' : 'RIENG promotion'}</span><span>Music. Culture. Kenya.</span></div>
        <div className={`${styles.creative} ${filled ? styles.filled : ''}`}>
          <div id={containerId} ref={container} className={styles.network} />
          <a className={styles.house} href={promo.href}>
            <span className={styles.brand}>RIENG /</span>
            <span className={styles.copy}><span className={styles.headline}>{promo.title}</span><span className={styles.description}>{promo.description}</span></span>
            <span className={styles.cta}>{promo.cta} <span aria-hidden="true">↗</span></span>
          </a>
        </div>
      </div>
    </aside>
  )
}

export default function AdSlot({ placement }: { placement: AdPlacement }) {
  const pathname = usePathname()
  if (!hasCatfishAd(pathname)) return null
  // Route changes create a fresh container; rerenders never refresh an ad.
  return <InlineZone key={`${pathname}:${placement}`} placement={placement} zoneId={getInlineZoneId(placement)} />
}
