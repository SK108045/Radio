// Public-facing pages where the single Catfish zone should be active.
// Keep the ad off standalone payment, authentication and sales-admin screens.
const catfishPages = [
  '/',
  '/shows',
  '/trending',
  '/videos',
  '/albums',
  '/merch',
  '/ethics',
  '/other-artists',
  '/dj-mix-sales',
]

export function hasCatfishAd(pathname: string) {
  return catfishPages.some(path => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`)))
}
