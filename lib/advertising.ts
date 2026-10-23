import { CATFISH_ZONE_ID } from './ad-network'

export type AdPlacement = 'player' | 'feed' | 'footer'

// These must be provider-issued INLINE zones. Never clone the Catfish anchor.
const configuredZones: Record<AdPlacement, string | undefined> = {
  player: process.env.NEXT_PUBLIC_AD_ZONE_PLAYER,
  feed: process.env.NEXT_PUBLIC_AD_ZONE_FEED,
  footer: process.env.NEXT_PUBLIC_AD_ZONE_FOOTER,
}

export function getInlineZoneId(placement: AdPlacement): number | null {
  const value = configuredZones[placement]?.trim()
  if (!value || !/^\d+$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 && id !== CATFISH_ZONE_ID ? id : null
}
