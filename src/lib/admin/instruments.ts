export type AssetClass = 'forex_usd' | 'forex_jpy' | 'crypto' | 'metals' | 'indices' | 'stocks'

export type InstrumentSpec = {
  symbol: string
  asset: AssetClass
  anchor: number
  tickSize: number
  minSlPct: number
  maxSlPct: number
  tpMultipliers: number[]
  sessions: Session[]
}

export type Session = 'asia' | 'london' | 'ny'

export const SESSION_HOURS_UTC: Record<Session, [number, number]> = {
  asia: [0, 7],
  london: [7, 13],
  ny: [13, 21],
}

export const INSTRUMENTS: InstrumentSpec[] = [
  {
    symbol: 'EURUSD',
    asset: 'forex_usd',
    anchor: 1.0835,
    tickSize: 0.00001,
    minSlPct: 0.08,
    maxSlPct: 0.25,
    tpMultipliers: [1.2, 1.5, 2, 2.5, 3],
    sessions: ['london', 'ny'],
  },
  {
    symbol: 'GBPUSD',
    asset: 'forex_usd',
    anchor: 1.2652,
    tickSize: 0.00001,
    minSlPct: 0.1,
    maxSlPct: 0.3,
    tpMultipliers: [1.2, 1.5, 2, 2.5, 3],
    sessions: ['london', 'ny'],
  },
  {
    symbol: 'USDJPY',
    asset: 'forex_jpy',
    anchor: 151.42,
    tickSize: 0.001,
    minSlPct: 0.1,
    maxSlPct: 0.3,
    tpMultipliers: [1.2, 1.5, 2, 2.5, 3],
    sessions: ['asia', 'london', 'ny'],
  },
  {
    symbol: 'XAUUSD',
    asset: 'metals',
    anchor: 2342.5,
    tickSize: 0.01,
    minSlPct: 0.15,
    maxSlPct: 0.45,
    tpMultipliers: [1.2, 1.5, 2, 2.5, 3.5],
    sessions: ['london', 'ny'],
  },
  {
    symbol: 'BTCUSD',
    asset: 'crypto',
    anchor: 68250,
    tickSize: 0.5,
    minSlPct: 0.4,
    maxSlPct: 1.2,
    tpMultipliers: [1.2, 1.5, 2, 3, 4],
    sessions: ['asia', 'london', 'ny'],
  },
  {
    symbol: 'ETHUSD',
    asset: 'crypto',
    anchor: 3520,
    tickSize: 0.05,
    minSlPct: 0.5,
    maxSlPct: 1.4,
    tpMultipliers: [1.2, 1.5, 2, 3, 4],
    sessions: ['asia', 'london', 'ny'],
  },
  {
    symbol: 'NAS100',
    asset: 'indices',
    anchor: 18650,
    tickSize: 0.25,
    minSlPct: 0.15,
    maxSlPct: 0.4,
    tpMultipliers: [1.2, 1.5, 2, 2.5, 3],
    sessions: ['ny'],
  },
  {
    symbol: 'US30',
    asset: 'indices',
    anchor: 39420,
    tickSize: 1,
    minSlPct: 0.12,
    maxSlPct: 0.35,
    tpMultipliers: [1.2, 1.5, 2, 2.5, 3],
    sessions: ['ny'],
  },
  {
    symbol: 'SPX500',
    asset: 'indices',
    anchor: 5245,
    tickSize: 0.25,
    minSlPct: 0.1,
    maxSlPct: 0.3,
    tpMultipliers: [1.2, 1.5, 2, 2.5, 3],
    sessions: ['ny'],
  },
  {
    symbol: 'AAPL',
    asset: 'stocks',
    anchor: 187.4,
    tickSize: 0.01,
    minSlPct: 0.4,
    maxSlPct: 1.2,
    tpMultipliers: [1.2, 1.5, 2, 2.5],
    sessions: ['ny'],
  },
  {
    symbol: 'TSLA',
    asset: 'stocks',
    anchor: 178.9,
    tickSize: 0.01,
    minSlPct: 0.6,
    maxSlPct: 1.8,
    tpMultipliers: [1.2, 1.5, 2, 2.5, 3],
    sessions: ['ny'],
  },
  {
    symbol: 'NVDA',
    asset: 'stocks',
    anchor: 925.4,
    tickSize: 0.01,
    minSlPct: 0.6,
    maxSlPct: 1.6,
    tpMultipliers: [1.2, 1.5, 2, 2.5, 3],
    sessions: ['ny'],
  },
]

export const SETUPS: string[] = [
  'BOS continuation',
  'Order block retest',
  'Fair value gap',
  'Breakout pullback',
  'Liquidity sweep',
  'SMC reversal',
  'Range rejection',
  'Trend continuation',
  'Double bottom',
  'Double top',
  'Flag breakout',
  'Supply rejection',
  'Demand bounce',
]

export const EMOTIONS_BEFORE = ['Confiant', 'Calme', 'Focus', 'Hésitant']
export const EMOTIONS_AFTER_WIN = ['Calme', 'Focus', 'Confiant', 'Euphorique']
export const EMOTIONS_AFTER_LOSS = ['Calme', 'Frustré', 'Fatigué', 'Focus']

export const POST_MORTEMS_WIN = [
  'Exécution propre, respect du plan.',
  'Patience payante, entrée au bon niveau.',
  'Gestion du TP disciplinée.',
  'Setup A+, rien à redire.',
  'Bon timing sur la session, biais respecté.',
]

export const POST_MORTEMS_LOSS = [
  'SL touché proprement, trade invalidé.',
  'Biais correct mais timing prématuré.',
  'J\'ai pris la perte sans hésiter, discipline OK.',
  'Setup dégradé par la news, j\'aurais pu skip.',
  'Pas le bon contexte, leçon retenue.',
]
