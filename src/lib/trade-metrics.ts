export type TradeRow = {
  id: string
  actif: string
  direction: string
  statut: string
  date_entree: string
  prix_entree: number | string
  prix_sl: number | string | null
  prix_tp: number | string | null
  pnl_dollars: number | string | null
  pnl_pct: number | string | null
}

export type TradeKpis = {
  netPnl: number
  netPnlTrades: number
  tradeExpectancy: number
  profitFactor: number
  winPct: number
  winners: number
  losers: number
  avgWin: number
  avgLoss: number
  avgWinLoss: number
}

export function computeKpis(trades: TradeRow[]): TradeKpis {
  const closed = trades.filter((t) => t.pnl_dollars !== null && t.pnl_dollars !== undefined)
  const pnls = closed.map((t) => Number(t.pnl_dollars))
  const winsList = pnls.filter((p) => p > 0)
  const lossList = pnls.filter((p) => p < 0)
  const netPnl = pnls.reduce((s, p) => s + p, 0)
  const winners = winsList.length
  const losers = lossList.length
  const totalClosed = winners + losers
  const winPct = totalClosed > 0 ? (winners / totalClosed) * 100 : 0
  const avgWin = winners > 0 ? winsList.reduce((s, p) => s + p, 0) / winners : 0
  const avgLossAbs =
    losers > 0 ? Math.abs(lossList.reduce((s, p) => s + p, 0) / losers) : 0
  const grossProfit = winsList.reduce((s, p) => s + p, 0)
  const grossLoss = Math.abs(lossList.reduce((s, p) => s + p, 0))
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0
  const tradeExpectancy = totalClosed > 0 ? netPnl / totalClosed : 0
  const avgWinLoss = avgLossAbs > 0 ? avgWin / avgLossAbs : avgWin > 0 ? 99 : 0

  return {
    netPnl,
    netPnlTrades: totalClosed,
    tradeExpectancy,
    profitFactor,
    winPct,
    winners,
    losers,
    avgWin,
    avgLoss: avgLossAbs,
    avgWinLoss,
  }
}

export function computeTradeScore(k: TradeKpis): { dims: { k: string; v: number }[]; score: number } {
  // Each dimension scored 0..100
  const winScore = Math.max(0, Math.min(100, k.winPct))
  const pfScore = Math.max(0, Math.min(100, (k.profitFactor / 3) * 100))
  const awlScore = Math.max(0, Math.min(100, (k.avgWinLoss / 3) * 100))
  const recoveryScore = Math.max(0, Math.min(100, k.netPnl > 0 ? 70 + k.netPnlTrades : 30))
  const drawdownScore = Math.max(0, Math.min(100, 100 - k.losers * 5))
  const consistency = Math.max(0, Math.min(100, (k.winPct + pfScore) / 2))

  const dims = [
    { k: 'Win %', v: Math.round(winScore) },
    { k: 'Profit factor', v: Math.round(pfScore) },
    { k: 'Avg win/loss', v: Math.round(awlScore) },
    { k: 'Recovery', v: Math.round(recoveryScore) },
    { k: 'Drawdown', v: Math.round(drawdownScore) },
    { k: 'Consistency', v: Math.round(consistency) },
  ]
  const score = Math.round(dims.reduce((s, d) => s + d.v, 0) / dims.length)
  return { dims, score }
}

export function cumulativePnl(trades: TradeRow[]): number[] {
  const closed = trades
    .filter((t) => t.pnl_dollars !== null && t.pnl_dollars !== undefined)
    .slice()
    .sort(
      (a, b) => new Date(a.date_entree).getTime() - new Date(b.date_entree).getTime()
    )
  const pts = [0]
  let v = 0
  for (const t of closed) {
    v += Number(t.pnl_dollars)
    pts.push(Math.round(v * 100) / 100)
  }
  return pts
}

export function dailyPnlSeries(trades: TradeRow[], days = 30): number[] {
  const now = new Date()
  const series: number[] = []
  const byDay = new Map<string, number>()
  for (const t of trades) {
    if (t.pnl_dollars === null || t.pnl_dollars === undefined) continue
    const d = new Date(t.date_entree)
    const key = d.toISOString().slice(0, 10)
    byDay.set(key, (byDay.get(key) ?? 0) + Number(t.pnl_dollars))
  }
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    series.push(Math.round((byDay.get(key) ?? 0) * 100) / 100)
  }
  return series
}

export function calendarDaysForMonth(
  trades: TradeRow[],
  year: number,
  month: number
): { d: number; pnl: number; trades: number }[] {
  const map = new Map<number, { pnl: number; trades: number }>()
  for (const t of trades) {
    if (t.pnl_dollars === null || t.pnl_dollars === undefined) continue
    const d = new Date(t.date_entree)
    if (d.getFullYear() !== year || d.getMonth() !== month) continue
    const key = d.getDate()
    const cur = map.get(key) ?? { pnl: 0, trades: 0 }
    cur.pnl += Number(t.pnl_dollars)
    cur.trades += 1
    map.set(key, cur)
  }
  return Array.from(map.entries())
    .map(([d, v]) => ({ d, pnl: Math.round(v.pnl * 100) / 100, trades: v.trades }))
    .sort((a, b) => a.d - b.d)
}
