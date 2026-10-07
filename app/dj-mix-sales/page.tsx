import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { publicCatalog } from '@/lib/sales-catalog'
import { TrackSalesCard } from '@/components/track-sales-card'
import { ArtistShowcaseAccordion } from '@/components/ArtistShowcaseAccordion'

export const dynamic = 'force-dynamic'

export default async function DJMixSalesPage() {
  const tracks = await publicCatalog()

  return (
    <main className="min-h-screen bg-[#020202] text-white selection:bg-primary selection:text-white">
      <Navbar />

      {/* ── TOP: ARTIST SHOWCASE ACCORDION (WEEKEND SHOWS TECHNIQUE) ── */}
      <ArtistShowcaseAccordion />

      {/* ── BOTTOM: LIVE DJ MIX & TRACK SALES FEATURE ── */}
      <section id="tracks-section" className="max-w-7xl mx-auto px-5 py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-primary text-xs font-bold tracking-[0.25em] uppercase mb-2">
              Rieng Music Store
            </p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase">
              DJ Mix &amp; Track Sales
            </h2>
          </div>
          <p className="text-gray-400 text-sm max-w-md">
            Preview 30 seconds. Pay with M-Pesa to stream the full track in this browser for 12 hours.
          </p>
        </div>

        {tracks.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {tracks.map(track => (
              <TrackSalesCard key={track.id} track={track} />
            ))}
          </div>
        ) : (
          <div className="mt-12 py-16 text-center border border-white/5 rounded-3xl bg-white/[0.02]">
            <p className="text-gray-400 text-sm">No tracks have been published yet. Check back soon!</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
