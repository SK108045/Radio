import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { publicCatalog } from '@/lib/sales-catalog'
import { TrackSalesCard } from '@/components/track-sales-card'
import { DJSalesIntro } from '@/components/dj-sales-intro'
export const dynamic = 'force-dynamic'
export default async function DJMixSalesPage() {
  const tracks = await publicCatalog()
  return <main className="min-h-screen bg-[#050505] text-white">
    <Navbar />
    <DJSalesIntro tracks={tracks} />
    <section id="tracks-section" className="max-w-7xl mx-auto px-5 py-24">
      <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-3">Rieng Music Store</p>
      <h2 className="text-4xl md:text-6xl font-black tracking-tight">DJ Mix &amp; Track Sales</h2>
      <p className="text-gray-400 mt-5 max-w-xl">Preview 30 seconds. Pay with M-Pesa to stream the full track in this browser for 12 hours.</p>
      {tracks.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">{tracks.map(track => <TrackSalesCard key={track.id} track={track} />)}</div> : <p className="mt-12 py-12 border-y border-white/10 text-gray-400">No tracks have been published yet.</p>}
    </section>
    <Footer />
  </main>
}
