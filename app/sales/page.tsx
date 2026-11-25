import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { UploadTrackForm } from '@/components/upload-track-form'
import { SalesRefresh } from '@/components/sales-refresh'
import { getSession } from '@/lib/auth'
import { adminDb, requireData } from '@/lib/supabase-admin'
import { ArchiveTrackButton } from '@/components/archive-track-button'
import { TrackSalesCard } from '@/components/track-sales-card'
import { logoutAction } from './actions'
import { Button } from '@/components/ui/button'
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/sales/login')

  if (session.authSource === 'cloudflare') {
    return <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-sm font-semibold text-primary">RIENG ARTIST PORTAL</p>
            <h1 className="text-4xl font-bold mt-2">{session.stageName}</h1>
            <p className="text-muted-foreground mt-2">Your private artist account is active.</p>
          </div>
          <form action={logoutAction}><Button type="submit" variant="outline">Sign out</Button></form>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border bg-card p-6"><p className="text-sm text-muted-foreground">Account status</p><p className="text-2xl font-bold mt-3">Active</p></div>
          <div className="rounded-xl border bg-card p-6"><p className="text-sm text-muted-foreground">Sign-in</p><p className="text-2xl font-bold mt-3">Phone + password</p></div>
          <div className="rounded-xl border bg-card p-6"><p className="text-sm text-muted-foreground">Phone</p><p className="text-xl font-bold mt-3">{session.phone}</p></div>
        </div>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="text-2xl font-bold">Artist workspace</h2>
          <p className="text-muted-foreground mt-3">Authentication is ready for this Cloudflare-backed account. Music uploads and sales data are not connected to this account yet, so the paused Supabase service will not block you from signing in.</p>
        </section>
      </div>
    </main>
  }

  const db = adminDb()
  const [sales, tracks] = await Promise.all([
    db.from('sales_receipts').select('id,track_id,amount,transaction_id,reference,provider_id,confirmed_at').eq('artist_id',session.artistId).order('confirmed_at',{ascending:false}).then(requireData),
    db.from('tracks').select('id,title,description,price_ksh,sales_status').eq('artist_id',session.artistId).order('created_at',{ascending:false}).then(requireData),
  ])
  const total = sales.reduce((sum,row)=>sum+Number(row.amount),0)
  const titles = new Map(tracks.map(t=>[t.id,t.title]))
  const visibleTracks = tracks.filter(t=>t.sales_status!=='archived')
  const testTracks = session.isTest ? visibleTracks.filter(t=>t.sales_status==='ready') : []

  return <div className="flex min-h-screen bg-background"><Sidebar /><div className="flex-1 md:ml-64">
    <Header session={session} />
    <main className="pt-20 p-4 md:p-8"><SalesRefresh />
      <h1 className="text-4xl font-bold mt-8">{session.stageName}</h1>
      <p className="text-muted-foreground mt-2 mb-8">Music and confirmed sales</p>
      {session.isTest && <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 mb-8">
        <p className="font-semibold">Test artist portal</p>
        <p className="text-sm text-muted-foreground mt-2">Your published uploads appear on the public DJ sales page and as sales cards here. You can use a KSh 1 track to try preview, payment, playback, and sales reporting. M-Pesa payments are real charges.</p>
      </div>}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[['Confirmed revenue',`KSh ${total.toLocaleString('en-KE')}`],['Confirmed sales',String(sales.length)],['Published tracks',String(tracks.filter(t=>t.sales_status==='ready').length)]].map(([label,v])=>
          <div className="rounded-xl border bg-card p-6" key={label}><p className="text-sm text-muted-foreground">{label}</p><p className="text-3xl font-bold mt-3">{v}</p></div>)}
      </div>
      <UploadTrackForm artistId={session.artistId} isTest={session.isTest} />
      {session.isTest && <section id="test-sales-cards" className="mb-8">
        <h2 className="text-2xl font-bold mb-5">Try the sales experience</h2>
        {testTracks.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testTracks.map(track=><TrackSalesCard key={track.id} track={{id:track.id,title:track.title,description:track.description,price:Number(track.price_ksh),artist:session.stageName}} />)}
        </div> : <p className="text-muted-foreground">Upload your own audio to see its test sales card here.</p>}
      </section>}
      <section className="rounded-xl border bg-card p-6 mb-8">
        <h2 className="text-2xl font-bold mb-5">Your tracks</h2>
        {!visibleTracks.length && <p className="text-muted-foreground">No tracks to show. Upload a track to publish it.</p>}
        <div className="space-y-4">{visibleTracks.map(track=><div className="flex justify-between gap-4 items-center border-b pb-4" key={track.id}>
          <div><p className="font-semibold">{track.title}</p><p className="text-sm text-muted-foreground">KSh {track.price_ksh} · {track.sales_status}</p></div>
          <ArchiveTrackButton trackId={track.id} />
        </div>)}</div>
      </section>
      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-2xl font-bold mb-5">Confirmed sales</h2>
        {!sales.length ? <p className="text-muted-foreground">No confirmed payments yet.</p> : <div className="overflow-x-auto"><table className="w-full text-sm text-left">
          <thead><tr className="border-b"><th className="p-3">Track</th><th className="p-3">Amount</th><th className="p-3">Transaction / reference</th><th className="p-3">Confirmed at</th></tr></thead>
          <tbody>{sales.map(sale=><tr key={sale.id} className="border-b">
            <td className="p-3">{titles.get(sale.track_id)}</td><td className="p-3">KSh {Number(sale.amount).toLocaleString('en-KE')}</td>
            <td className="p-3"><p>{sale.transaction_id}</p><p className="text-xs text-muted-foreground">{sale.reference}</p></td>
            <td className="p-3">{new Date(sale.confirmed_at).toLocaleString('en-KE',{timeZone:'Africa/Nairobi'})}</td>
          </tr>)}</tbody>
        </table></div>}
      </section>
    </main>
  </div></div>
}
