import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { SalesRefresh } from '@/components/sales-refresh'
import { RequestPayoutButton } from '@/components/request-payout-button'
import { getSession } from '@/lib/auth'
import { adminDb, requireData } from '@/lib/supabase-admin'
import { splitSale } from '@/lib/sales-pricing'

export const dynamic = 'force-dynamic'

export default async function PaymentsPage() {
  const session = await getSession()
  if (!session) redirect('/sales/login')

  const db = adminDb()
  const [sales, tracks, payouts] = await Promise.all([
    db.from('sales_receipts').select('id,track_id,amount,transaction_id,reference,confirmed_at').eq('artist_id', session.artistId).order('confirmed_at',{ascending:false}).then(requireData),
    db.from('tracks').select('id,title').eq('artist_id', session.artistId).then(requireData),
    db.from('sales_artist_payout_requests').select('id,amount,status,requested_at,processed_at').eq('artist_id', session.artistId).order('requested_at',{ascending:false}).then(requireData),
  ])

  const titles = new Map(tracks.map(track => [track.id, track.title]))
  const gross = sales.reduce((sum, sale) => sum + Number(sale.amount), 0)
  const totals = splitSale(gross)
  const reserved = payouts.filter(p => p.status === 'requested' || p.status === 'paid').reduce((sum,p)=>sum+Number(p.amount),0)
  const available = Math.max(0, Math.round((totals.artist - reserved) * 100) / 100)
  const hasPending = payouts.some(p => p.status === 'requested')

  return <div className="flex min-h-screen bg-background"><Sidebar /><div className="flex-1 md:ml-64">
    <Header session={session} />
    <main className="pt-20 p-4 md:p-8"><SalesRefresh />
      <div className="mt-8 mb-8">
        <h1 className="text-4xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-2">Track sales, earnings and payout requests for {session.stageName}.</p>
      </div>

      <div className="rounded-xl border border-primary/25 bg-primary/5 p-5 mb-8">
        <p className="font-semibold">Revenue split</p>
        <p className="text-sm text-muted-foreground mt-2">You receive 80% of every confirmed track sale. Riengflix receives 20%.</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border bg-card p-6"><p className="text-sm text-muted-foreground">Available to request</p><p className="text-3xl font-bold mt-3">KSh {available.toLocaleString('en-KE')}</p></div>
        <div className="rounded-xl border bg-card p-6"><p className="text-sm text-muted-foreground">Your earnings · 80%</p><p className="text-3xl font-bold mt-3">KSh {totals.artist.toLocaleString('en-KE')}</p></div>
        <div className="rounded-xl border bg-card p-6"><p className="text-sm text-muted-foreground">Riengflix · 20%</p><p className="text-3xl font-bold mt-3">KSh {totals.riengflix.toLocaleString('en-KE')}</p></div>
        <div className="rounded-xl border bg-card p-6"><p className="text-sm text-muted-foreground">Confirmed sales</p><p className="text-3xl font-bold mt-3">{sales.length}</p></div>
      </div>

      <section className="rounded-xl border bg-card p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h2 className="text-2xl font-bold">Request payment</h2>
            <p className="text-sm text-muted-foreground mt-2">Request your currently available artist earnings. Once requested, the amount is reserved so it cannot be requested twice.</p>
          </div>
          <RequestPayoutButton available={available} hasPending={hasPending} />
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 mb-8">
        <h2 className="text-2xl font-bold mb-5">Sales</h2>
        {!sales.length ? <p className="text-muted-foreground">No confirmed sales yet.</p> : <div className="overflow-x-auto"><table className="w-full text-sm text-left">
          <thead><tr className="border-b"><th className="p-3">Track</th><th className="p-3">Sale</th><th className="p-3">Artist · 80%</th><th className="p-3">Riengflix · 20%</th><th className="p-3">Transaction</th><th className="p-3">Confirmed</th></tr></thead>
          <tbody>{sales.map(sale => { const split = splitSale(Number(sale.amount)); return <tr key={sale.id} className="border-b">
            <td className="p-3">{titles.get(sale.track_id) || 'Track'}</td>
            <td className="p-3">KSh {split.gross.toLocaleString('en-KE')}</td>
            <td className="p-3">KSh {split.artist.toLocaleString('en-KE')}</td>
            <td className="p-3">KSh {split.riengflix.toLocaleString('en-KE')}</td>
            <td className="p-3"><p>{sale.transaction_id}</p><p className="text-xs text-muted-foreground">{sale.reference}</p></td>
            <td className="p-3">{new Date(sale.confirmed_at).toLocaleString('en-KE',{timeZone:'Africa/Nairobi'})}</td>
          </tr> })}</tbody>
        </table></div>}
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h2 className="text-2xl font-bold mb-5">Payment requests</h2>
        {!payouts.length ? <p className="text-muted-foreground">No payment requests yet.</p> : <div className="overflow-x-auto"><table className="w-full text-sm text-left">
          <thead><tr className="border-b"><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Requested</th><th className="p-3">Processed</th></tr></thead>
          <tbody>{payouts.map(payout => <tr key={payout.id} className="border-b">
            <td className="p-3">KSh {Number(payout.amount).toLocaleString('en-KE')}</td>
            <td className="p-3 capitalize">{payout.status}</td>
            <td className="p-3">{new Date(payout.requested_at).toLocaleString('en-KE',{timeZone:'Africa/Nairobi'})}</td>
            <td className="p-3">{payout.processed_at ? new Date(payout.processed_at).toLocaleString('en-KE',{timeZone:'Africa/Nairobi'}) : '—'}</td>
          </tr>)}</tbody>
        </table></div>}
      </section>
    </main>
  </div></div>
}
