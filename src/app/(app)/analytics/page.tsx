import { redirect } from 'next/navigation'
import { Activity, Target, TrendingUp, Heart, LineChart, Coins } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardBody, StatCard, EmptyState } from '@/components/ui'
import CapitalChart from './capital-chart'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('taille_compte, capital_actuel')
    .eq('id', user.id)
    .single()

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .eq('statut', 'fermé')
    .order('date_entree', { ascending: true })

  const { data: snapshots } = await supabase
    .from('capital_snapshots')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const closed = trades ?? []
  const wins = closed.filter((t) => Number(t.pnl_dollars) > 0)
  const losses = closed.filter((t) => Number(t.pnl_dollars) < 0)

  const totalPnl = closed.reduce((sum, t) => sum + Number(t.pnl_dollars ?? 0), 0)
  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0
  const avgWin =
    wins.length > 0 ? wins.reduce((s, t) => s + Number(t.pnl_dollars), 0) / wins.length : 0
  const avgLoss =
    losses.length > 0
      ? losses.reduce((s, t) => s + Number(t.pnl_dollars), 0) / losses.length
      : 0

  const expectancy =
    closed.length > 0 ? (winRate / 100) * avgWin + (1 - winRate / 100) * avgLoss : 0

  const avgRR =
    closed.filter((t) => t.rr_reel !== null).length > 0
      ? closed.reduce((s, t) => s + Number(t.rr_reel ?? 0), 0) /
        closed.filter((t) => t.rr_reel !== null).length
      : 0

  const emotionStats = new Map<string, { count: number; pnl: number; wins: number }>()
  closed.forEach((t) => {
    if (!t.emotion_avant) return
    const stat = emotionStats.get(t.emotion_avant) ?? { count: 0, pnl: 0, wins: 0 }
    stat.count++
    stat.pnl += Number(t.pnl_dollars ?? 0)
    if (Number(t.pnl_dollars) > 0) stat.wins++
    emotionStats.set(t.emotion_avant, stat)
  })

  const assetStats = new Map<string, { count: number; pnl: number; wins: number }>()
  closed.forEach((t) => {
    const stat = assetStats.get(t.actif) ?? { count: 0, pnl: 0, wins: 0 }
    stat.count++
    stat.pnl += Number(t.pnl_dollars ?? 0)
    if (Number(t.pnl_dollars) > 0) stat.wins++
    assetStats.set(t.actif, stat)
  })

  const capitalInitial = Number(profile?.taille_compte ?? 0)
  const capitalActuel = Number(profile?.capital_actuel ?? 0)
  const rendementPct =
    capitalInitial > 0 ? ((capitalActuel - capitalInitial) / capitalInitial) * 100 : 0

  const chartData = [
    { date: null, value: capitalInitial },
    ...(snapshots ?? []).map((s) => ({
      date: s.created_at,
      value: Number(s.solde),
    })),
  ]

  const fmtMoney = (n: number) =>
    `${n >= 0 ? '+' : ''}$${Math.abs(n).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}`

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">
          Analytics
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Stats sur {closed.length} trade{closed.length > 1 ? 's' : ''} clôturé
          {closed.length > 1 ? 's' : ''}.
        </p>
      </header>

      {closed.length === 0 ? (
        <EmptyState
          icon={<LineChart size={20} />}
          title="Pas encore de stats"
          description="Clôture au moins un trade pour voir tes statistiques."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard
              label="Rendement"
              value={`${rendementPct >= 0 ? '+' : ''}${rendementPct.toFixed(2)}%`}
              tone={rendementPct >= 0 ? 'success' : 'danger'}
              icon={<TrendingUp size={14} />}
            />
            <StatCard
              label="PnL total"
              value={fmtMoney(totalPnl)}
              tone={totalPnl >= 0 ? 'success' : 'danger'}
              icon={<Coins size={14} />}
            />
            <StatCard
              label="Win rate"
              value={`${winRate.toFixed(1)}%`}
              tone="brand"
              icon={<Target size={14} />}
            />
            <StatCard
              label="Expectancy"
              value={fmtMoney(expectancy)}
              tone={expectancy >= 0 ? 'success' : 'danger'}
              icon={<Activity size={14} />}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Trades gagnants" value={wins.length} />
            <StatCard label="Trades perdants" value={losses.length} />
            <StatCard
              label="Gain moyen"
              value={fmtMoney(avgWin)}
              tone={avgWin > 0 ? 'success' : 'neutral'}
            />
            <StatCard
              label="Perte moyenne"
              value={fmtMoney(avgLoss)}
              tone={avgLoss < 0 ? 'danger' : 'neutral'}
            />
          </div>

          <Card className="mb-6">
            <CardHeader
              title="Courbe de capital"
              icon={<LineChart size={14} />}
              hint={`R:R moyen réel : ${avgRR.toFixed(2)}R`}
            />
            <CardBody>
              <CapitalChart data={chartData} />
            </CardBody>
          </Card>

          <Card className="mb-6">
            <CardHeader
              title="Performance par émotion"
              icon={<Heart size={14} />}
              hint="Émotion avant le trade"
            />
            <CardBody>
              {emotionStats.size === 0 ? (
                <p className="text-zinc-500 text-sm">
                  Renseigne tes émotions dans les trades pour voir cette analyse.
                </p>
              ) : (
                <BreakdownList
                  items={Array.from(emotionStats.entries())
                    .sort((a, b) => b[1].pnl - a[1].pnl)
                    .map(([k, s]) => ({ label: k, ...s }))}
                />
              )}
            </CardBody>
          </Card>

          <Card className="mb-6">
            <CardHeader title="Performance par actif" icon={<Coins size={14} />} />
            <CardBody>
              <BreakdownList
                items={Array.from(assetStats.entries())
                  .sort((a, b) => b[1].pnl - a[1].pnl)
                  .map(([k, s]) => ({ label: k, ...s }))}
              />
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}

function BreakdownList({
  items,
}: {
  items: { label: string; count: number; pnl: number; wins: number }[]
}) {
  const maxAbs = Math.max(...items.map((i) => Math.abs(i.pnl)), 1)
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const winRate = (item.wins / item.count) * 100
        const isPositive = item.pnl >= 0
        const barWidth = (Math.abs(item.pnl) / maxAbs) * 100
        return (
          <div key={item.label} className="group">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-zinc-200 truncate">{item.label}</span>
                <span className="text-xs text-zinc-500 font-nums whitespace-nowrap">
                  {item.count} · {winRate.toFixed(0)}% WR
                </span>
              </div>
              <span
                className={`font-nums font-semibold text-sm whitespace-nowrap ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}${item.pnl.toFixed(2)}
              </span>
            </div>
            <div className="h-1 rounded-full bg-zinc-900 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isPositive ? 'bg-emerald-500/50' : 'bg-red-500/50'
                }`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
