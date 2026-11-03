export const TRACK_PRICE_KSH = 350
export const ARTIST_SHARE_RATE = 0.80
export const RIENGFLIX_SHARE_RATE = 0.20

const money = (value: number) => Math.round(value * 100) / 100

export function splitSale(amount: number) {
  const gross = money(Number(amount) || 0)
  const artist = money(gross * ARTIST_SHARE_RATE)
  return { gross, artist, riengflix: money(gross - artist) }
}
