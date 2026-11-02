import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Music, Users } from 'lucide-react'
import { supabase, getMonthStart } from '@/lib/supabase'

interface KPICardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
}

function KPICard({ title, value, description, icon, trend, trendUp }: KPICardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="text-primary">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <p className={`text-xs font-semibold mt-2 ${trendUp ? 'text-primary' : 'text-destructive'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function trend(current: number, prev: number) {
  if (prev === 0) return undefined
  const pct = (((current - prev) / prev) * 100).toFixed(1)
  return { label: `${Math.abs(Number(pct))}% from last month`, up: Number(pct) >= 0 }
}

export async function KPICards({ artistId }: { artistId?: string } = {}) {
  const thisMonth = getMonthStart(0)
  const lastMonth = getMonthStart(-1)

  const artistQuery = artistId
    ? supabase.from('artists').select('total_active_listeners').eq('id', artistId).maybeSingle()
    : supabase.from('artists').select('total_active_listeners').limit(1).maybeSingle()

  let curQuery = supabase
    .from('track_performance')
    .select('streams, revenue_ksh, tracks!inner(artist_id)')
    .eq('metric_month', thisMonth)

  let prevQuery = supabase
    .from('track_performance')
    .select('streams, revenue_ksh, tracks!inner(artist_id)')
    .eq('metric_month', lastMonth)

  if (artistId) {
    curQuery = curQuery.eq('tracks.artist_id', artistId)
    prevQuery = prevQuery.eq('tracks.artist_id', artistId)
  }

  const [{ data: cur }, { data: prev }, { data: artist }] = await Promise.all([
    curQuery,
    prevQuery,
    artistQuery,
  ])

  const sum = (arr: typeof cur, key: 'streams' | 'revenue_ksh') =>
    (arr ?? []).reduce((s: number, r: any) => s + Number(r[key] ?? 0), 0)

  const curStreams = sum(cur, 'streams')
  const curRevenue = sum(cur, 'revenue_ksh')
  const prevStreams = sum(prev, 'streams')
  const prevRevenue = sum(prev, 'revenue_ksh')

  const streamTrend = trend(curStreams, prevStreams)
  const revTrend = trend(curRevenue, prevRevenue)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <KPICard
        title="Total Streams"
        value={fmt(curStreams)}
        description="This month"
        icon={<Music className="w-5 h-5" />}
        trend={streamTrend?.label}
        trendUp={streamTrend?.up}
      />
      <KPICard
        title="Revenue"
        value={`KSh ${curRevenue.toLocaleString()}`}
        description="This month"
        icon={<TrendingUp className="w-5 h-5" />}
        trend={revTrend?.label}
        trendUp={revTrend?.up}
      />
      <KPICard
        title="Active Listeners"
        value={(artist?.total_active_listeners ?? 0).toLocaleString()}
        description="Unique listeners"
        icon={<Users className="w-5 h-5" />}
      />
    </div>
  )
}
