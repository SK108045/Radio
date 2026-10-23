export const CATFISH_ZONE_ID = 1892228828
export const AD_DOMAIN = 'ftd.agency'

type AdZone = { div: HTMLElement }
type AdNetwork = {
  new (containerId: string, options: { id: number; domain: string }): AdZone
  zones: Record<string, AdZone>
}

declare global { interface Window { ABN?: AdNetwork } }

let pending: Promise<AdNetwork> | undefined

// Share one script across the anchor and separately configured inline banners.
export function loadAdNetwork(): Promise<AdNetwork> {
  if (window.ABN) return Promise.resolve(window.ABN)
  if (pending) return pending
  pending = new Promise<AdNetwork>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = 'rieng-ad-network'
    script.async = true
    script.src = `https://cdn.${AD_DOMAIN}/libs/e.js`
    script.onload = () => {
      if (window.ABN) resolve(window.ABN)
      else { script.remove(); reject(new Error('Ad provider unavailable')) }
    }
    script.onerror = () => { script.remove(); reject(new Error('Ad provider unavailable')) }
    document.head.appendChild(script)
  }).catch(error => { pending = undefined; throw error })
  return pending
}

export function releaseAdZone(containerId: string, container: HTMLElement) {
  const zones = window.ABN?.zones
  if (zones?.[containerId]?.div === container) delete zones[containerId]
}
