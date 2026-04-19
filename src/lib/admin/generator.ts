import {
  INSTRUMENTS,
  InstrumentSpec,
  SETUPS,
  EMOTIONS_BEFORE,
  EMOTIONS_AFTER_WIN,
  EMOTIONS_AFTER_LOSS,
  POST_MORTEMS_WIN,
  POST_MORTEMS_LOSS,
  SESSION_HOURS_UTC,
  Session,
} from './instruments'

export type SyntheticTrade = {
  user_id: string
  actif: string
  direction: 'long' | 'short'
  date_entree: string
  prix_entree: number
  prix_sl: number
  prix_tp: number | null
  prix_sortie: number
  lot_size: number
  rationnel: string
  emotion_avant: string
  emotion_pendant: string | null
  emotion_apres: string
  post_mortem: string
  rr_prevu: number
  rr_reel: number
  tags: string[]
  statut: 'fermé'
  pnl_dollars: number
  pnl_pct: number
}

const MAX_R_MULTIPLE = 5
const MAX_PNL_PCT = 9999
const MIN_PNL_PCT = -9999

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function roundTick(value: number, tick: number) {
  return Math.round(value / tick) * tick
}

function fmtTick(value: number, tick: number) {
  const decimals = Math.max(0, -Math.floor(Math.log10(tick)))
  return Number(value.toFixed(decimals))
}

function sessionToHour(session: Session): number {
  const [start, end] = SESSION_HOURS_UTC[session]
  return start + Math.floor(Math.random() * (end - start))
}

function randomDateInDay(day: Date, session: Session): Date {
  const h = sessionToHour(session)
  const m = Math.floor(Math.random() * 60)
  const out = new Date(day)
  out.setUTCHours(h, m, 0, 0)
  return out
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function distributeWithVariance(total: number, n: number): number[] {
  if (n <= 0) return []
  if (n === 1) return [total]
  const weights = Array.from({ length: n }, () => 0.5 + Math.random())
  const sum = weights.reduce((a, b) => a + b, 0)
  return weights.map((w) => (w / sum) * total)
}

function computePnlSplit(
  totalPnl: number,
  wins: number,
  losses: number,
): { winPnls: number[]; lossPnls: number[] } {
  if (wins === 0 && losses === 0) return { winPnls: [], lossPnls: [] }
  if (wins === 0) {
    return { winPnls: [], lossPnls: distributeWithVariance(totalPnl, losses) }
  }
  if (losses === 0) {
    return { winPnls: distributeWithVariance(totalPnl, wins), lossPnls: [] }
  }

  const baseLoss = losses > 0 ? losses * rand(40, 90) : 0
  const baseWin = totalPnl + baseLoss
  const winPnls = distributeWithVariance(baseWin, wins).map((v) => Math.max(1, Math.abs(v)))
  const lossPnls = distributeWithVariance(baseLoss, losses).map((v) => -Math.abs(v))

  const actualSum = winPnls.reduce((a, b) => a + b, 0) + lossPnls.reduce((a, b) => a + b, 0)
  const drift = totalPnl - actualSum
  if (Math.abs(drift) > 0.01) {
    const adj = drift / wins
    for (let i = 0; i < winPnls.length; i++) winPnls[i] += adj
  }
  return { winPnls, lossPnls }
}

export type TargetSpec = {
  userId: string
  totalPnl: number
  capital: number
  riskPct: number
  from: Date
  to: Date
  winRate?: number
  tradesPerDay?: [number, number]
  tradeDaysRatio?: number
}

export function generateTradesForTarget(spec: TargetSpec): SyntheticTrade[] {
  const {
    userId,
    totalPnl,
    capital,
    from,
    to,
    winRate = 0.58,
    tradesPerDay = [1, 3],
    tradeDaysRatio = 0.7,
  } = spec

  const days: Date[] = []
  const cursor = new Date(from)
  cursor.setUTCHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setUTCHours(0, 0, 0, 0)
  while (cursor <= end) {
    const dow = cursor.getUTCDay()
    if (dow !== 0 && dow !== 6) days.push(new Date(cursor))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  const activeDays = days.filter(() => Math.random() < tradeDaysRatio)
  if (activeDays.length === 0 && days.length > 0) activeDays.push(days[Math.floor(days.length / 2)])

  const countPerDay: number[] = activeDays.map(() => {
    const [lo, hi] = tradesPerDay
    return lo + Math.floor(Math.random() * (hi - lo + 1))
  })
  const totalTrades = countPerDay.reduce((a, b) => a + b, 0) || 1

  const wins = Math.max(0, Math.min(totalTrades, Math.round(totalTrades * winRate)))
  const losses = totalTrades - wins

  const { winPnls, lossPnls } = computePnlSplit(totalPnl, wins, losses)
  const pnls = shuffle([...winPnls, ...lossPnls])

  const avgLoss =
    lossPnls.length > 0 ? Math.abs(lossPnls.reduce((a, b) => a + b, 0) / lossPnls.length) : 0
  const avgWin =
    winPnls.length > 0 ? winPnls.reduce((a, b) => a + b, 0) / winPnls.length : 0
  const riskAmount = Math.max(1, avgLoss || avgWin || Math.max(capital, 100) * 0.01)

  const trades: SyntheticTrade[] = []
  let idx = 0
  for (let d = 0; d < activeDays.length; d++) {
    const day = activeDays[d]
    const n = countPerDay[d]
    for (let t = 0; t < n; t++) {
      if (idx >= pnls.length) break
      const pnl = pnls[idx++]
      trades.push(buildTrade(userId, day, pnl, riskAmount, capital))
    }
  }

  trades.sort(
    (a, b) => new Date(a.date_entree).getTime() - new Date(b.date_entree).getTime(),
  )
  return trades
}

export function buildTrade(
  userId: string,
  day: Date,
  pnl: number,
  riskAmount: number,
  capital: number,
): SyntheticTrade {
  const inst = pick(INSTRUMENTS)
  const session = pick(inst.sessions)
  const date = randomDateInDay(day, session)

  const direction: 'long' | 'short' = Math.random() < 0.5 ? 'long' : 'short'
  const slPct = rand(inst.minSlPct, inst.maxSlPct) / 100
  const drift = rand(-0.02, 0.02)
  const entry = roundTick(inst.anchor * (1 + drift), inst.tickSize)
  const slDistance = roundTick(entry * slPct, inst.tickSize)

  const prixSl =
    direction === 'long'
      ? roundTick(entry - slDistance, inst.tickSize)
      : roundTick(entry + slDistance, inst.tickSize)

  const plannedR = pick(inst.tpMultipliers)
  const tpDistance = roundTick(slDistance * plannedR, inst.tickSize)
  const prixTp =
    direction === 'long'
      ? roundTick(entry + tpDistance, inst.tickSize)
      : roundTick(entry - tpDistance, inst.tickSize)

  const rawRealR = riskAmount > 0 ? pnl / riskAmount : 0
  const realR = clamp(rawRealR, -MAX_R_MULTIPLE, MAX_R_MULTIPLE)
  const realDistance = roundTick(Math.abs(slDistance * realR), inst.tickSize)
  const isWin = pnl >= 0
  const prixSortie =
    direction === 'long'
      ? roundTick(entry + (isWin ? realDistance : -realDistance), inst.tickSize)
      : roundTick(entry - (isWin ? realDistance : -realDistance), inst.tickSize)

  const lotSize = computeLotSize(inst, slDistance, riskAmount)
  const rawPnlPct = capital > 0 ? (pnl / capital) * 100 : 0
  const pnlPct = clamp(rawPnlPct, MIN_PNL_PCT, MAX_PNL_PCT)

  return {
    user_id: userId,
    actif: inst.symbol,
    direction,
    date_entree: date.toISOString(),
    prix_entree: fmtTick(entry, inst.tickSize),
    prix_sl: fmtTick(prixSl, inst.tickSize),
    prix_tp: fmtTick(prixTp, inst.tickSize),
    prix_sortie: fmtTick(prixSortie, inst.tickSize),
    lot_size: lotSize,
    rationnel: buildRationale(direction, session, inst.symbol),
    emotion_avant: pick(EMOTIONS_BEFORE),
    emotion_pendant: null,
    emotion_apres: pick(isWin ? EMOTIONS_AFTER_WIN : EMOTIONS_AFTER_LOSS),
    post_mortem: pick(isWin ? POST_MORTEMS_WIN : POST_MORTEMS_LOSS),
    rr_prevu: Number(plannedR.toFixed(2)),
    rr_reel: Number(realR.toFixed(2)),
    tags: [session, isWin ? 'win' : 'loss'],
    statut: 'fermé',
    pnl_dollars: Number(pnl.toFixed(2)),
    pnl_pct: Number(pnlPct.toFixed(3)),
  }
}

function computeLotSize(inst: InstrumentSpec, slDistance: number, risk: number): number {
  if (slDistance <= 0 || risk <= 0) return 0
  let out = 0
  switch (inst.asset) {
    case 'forex_usd': {
      const pips = slDistance / 0.0001
      out = risk / (pips * 10)
      break
    }
    case 'forex_jpy': {
      const pips = slDistance / 0.01
      const pipMul = 1000 / inst.anchor
      out = risk / (pips * pipMul)
      break
    }
    case 'metals': {
      const pips = slDistance / 0.01
      out = risk / pips
      break
    }
    case 'indices':
      out = risk / slDistance
      break
    case 'crypto':
      out = risk / slDistance
      break
    case 'stocks':
    default:
      out = Math.max(1, Math.round(risk / slDistance))
      return out
  }
  const safe = clamp(out, 0.01, 99999)
  return Number(safe.toFixed(inst.asset === 'crypto' ? 4 : 2))
}

function buildRationale(
  direction: 'long' | 'short',
  session: Session,
  symbol: string,
): string {
  const setup = pick(SETUPS)
  const sessionLabel =
    session === 'asia' ? 'Asie' : session === 'london' ? 'Londres' : 'New York'
  const bias = direction === 'long' ? 'haussier' : 'baissier'
  return `${setup} sur ${symbol}, biais ${bias}, session ${sessionLabel}.`
}

export function generateSingleDayTrades(args: {
  userId: string
  day: Date
  targetPnl: number
  capital: number
  riskPct: number
  count?: number
  winRate?: number
}): SyntheticTrade[] {
  const { userId, day, targetPnl, capital, count, winRate = 0.6 } = args
  const n = count ?? (Math.abs(targetPnl) < 1 ? 1 : 1 + Math.floor(Math.random() * 2))
  const wins = Math.max(0, Math.min(n, Math.round(n * winRate)))
  const losses = n - wins
  const { winPnls, lossPnls } = computePnlSplit(targetPnl, wins, losses)
  const pnls = shuffle([...winPnls, ...lossPnls])
  const avgLoss =
    lossPnls.length > 0
      ? Math.abs(lossPnls.reduce((a, b) => a + b, 0) / lossPnls.length)
      : 0
  const avgWin =
    winPnls.length > 0 ? winPnls.reduce((a, b) => a + b, 0) / winPnls.length : 0
  const riskAmount = Math.max(1, avgLoss || avgWin || Math.max(capital, 100) * 0.01)
  return pnls.map((p) => buildTrade(userId, day, p, riskAmount, capital))
}
