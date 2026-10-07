import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { UploadTrackForm } from '@/components/upload-track-form'
import { SalesRefresh } from '@/components/sales-refresh'
import { getSession } from '@/lib/auth'
import { adminDb, requireData } from '@/lib/supabase-admin'
import { ArchiveTrackButton } from '@/components/archive-track-button'
import { TrackSalesCard } from '@/components/track-sales-card'
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/sales/login')
  const db = adminDb()
  const [sales, tracks] = await Promise.all([
    db.from('sales_receipts').select('id,track_id,amount,transaction_id,reference,provider_id,confirmed_at').eq('artist_id',session.artistId).order('confirmed_at',{ascending:false}).then(requireData),
    db.from('tracks').select('id,title,description,price_ksh,sales_status').eq('artist_id',session.artistId).order('created_at',{ascending:false}).then(requireData),
  ])
  const total = sales.reduce((sum,row)=>sum+Number(row.amount),0)
  const titles = new Map(tracks.map(t=>[t.id,t.title]))
  const testTracks = session.isTest ? tracks.filter(t=>t.sales_status==='ready') : []

  return <div className="flex min-h-screen bg-background"><Sidebar /><div className="flex-1 md:ml-64">
    <Header session={session} />
    <main className="pt-20 p-4 md:p-8"><SalesRefresh />
      <h1 className="text-4xl font-bold mt-8">{session.stageName}</h1>
      <p className="text-muted-foreground mt-2 mb-8">Music and confirmed sales</p>
      {session.isTest && <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 mb-8">
        <p className="font-semibold">Test artist portal</p>
        <p className="text-sm text-muted-foreground mt-2">Your uploads appear as sales cards here. They stay off the public DJ sales page. You can use a KSh 1 track to try preview, payment, playback, and sales reporting. M-Pesa payments are real charges.</p>
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
        {!tracks.length && <p className="text-muted-foreground">You have not uploaded any tracks.</p>}
        <div className="space-y-4">{tracks.map(track=><div className="flex justify-between gap-4 items-center border-b pb-4" key={track.id}>
          <div><p className="font-semibold">{track.title}</p><p className="text-sm text-muted-foreground">KSh {track.price_ksh} · {track.sales_status}</p></div>
          {track.sales_status==='ready' && <ArchiveTrackButton trackId={track.id} />}
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
