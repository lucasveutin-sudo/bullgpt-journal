'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { useTranslation } from '@/components/locale-provider'

type Args = {
  totalPnl: number
  fromISO: string
  toISO: string
  winRate: number
  tradesPerDayMin: number
  tradesPerDayMax: number
  tradeDaysRatio: number
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function TargetPnlTool({
  pending,
  onSubmit,
}: {
  pending: boolean
  onSubmit: (args: Args) => void
}) {
  const { locale } = useTranslation()
  const today = new Date()
  const monthAgo = new Date()
  monthAgo.setUTCDate(monthAgo.getUTCDate() - 30)

  const [totalPnl, setTotalPnl] = useState('2500')
  const [from, setFrom] = useState(isoDay(monthAgo))
  const [to, setTo] = useState(isoDay(today))
  const [winRate, setWinRate] = useState('58')
  const [minPerDay, setMinPerDay] = useState('1')
  const [maxPerDay, setMaxPerDay] = useState('3')
  const [daysRatio, setDaysRatio] = useState('70')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      totalPnl: Number(totalPnl) || 0,
      fromISO: new Date(from).toISOString(),
      toISO: new Date(to).toISOString(),
      winRate: (Number(winRate) || 58) / 100,
      tradesPerDayMin: Math.max(1, Number(minPerDay) || 1),
      tradesPerDayMax: Math.max(Number(minPerDay) || 1, Number(maxPerDay) || 3),
      tradeDaysRatio: Math.max(0.1, Math.min(1, (Number(daysRatio) || 70) / 100)),
    })
  }

  return (
    <div className="lcard">
      <div className="lcard-head">
        <div className="lcard-title">
          {locale === 'fr' ? 'Générer un PnL cible' : 'Generate target PnL'}
        </div>
        <div className="lcard-sub">
          {locale === 'fr'
            ? 'Crée N trades réalistes répartis sur la période pour atteindre ta cible'
            : 'Creates N realistic trades spread over the range to hit your target'}
        </div>
      </div>

      <form onSubmit={submit} className="col gap-md">
        <div className="grid-2">
          <div className="lfield">
            <label>{locale === 'fr' ? 'PnL cible ($)' : 'Target PnL ($)'}</label>
            <input
              type="number"
              step="any"
              className="linput mono"
              value={totalPnl}
              onChange={(e) => setTotalPnl(e.target.value)}
            />
          </div>
          <div className="lfield">
            <label>{locale === 'fr' ? 'Win rate (%)' : 'Win rate (%)'}</label>
            <input
              type="number"
              step="1"
              min="10"
              max="90"
              className="linput mono"
              value={winRate}
              onChange={(e) => setWinRate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="lfield">
            <label>{locale === 'fr' ? 'Du' : 'From'}</label>
            <input
              type="date"
              className="linput mono"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="lfield">
            <label>{locale === 'fr' ? 'Au' : 'To'}</label>
            <input
              type="date"
              className="linput mono"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>

        <div className="grid-3">
          <div className="lfield">
            <label>{locale === 'fr' ? 'Trades/jour min' : 'Trades/day min'}</label>
            <input
              type="number"
              min="1"
              className="linput mono"
              value={minPerDay}
              onChange={(e) => setMinPerDay(e.target.value)}
            />
          </div>
          <div className="lfield">
            <label>{locale === 'fr' ? 'Trades/jour max' : 'Trades/day max'}</label>
            <input
              type="number"
              min="1"
              className="linput mono"
              value={maxPerDay}
              onChange={(e) => setMaxPerDay(e.target.value)}
            />
          </div>
          <div className="lfield">
            <label>{locale === 'fr' ? 'Jours actifs (%)' : 'Active days (%)'}</label>
            <input
              type="number"
              min="10"
              max="100"
              className="linput mono"
              value={daysRatio}
              onChange={(e) => setDaysRatio(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="lbtn-primary" disabled={pending}>
          {pending ? (
            <Loader2 size={14} className="animate-spin" style={{ marginRight: 6, verticalAlign: '-2px' }} />
          ) : (
            <Sparkles size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />
          )}
          {locale === 'fr' ? 'Générer les trades' : 'Generate trades'}
        </button>

        <p className="dim" style={{ fontSize: 12 }}>
          {locale === 'fr'
            ? 'Les trades s\u2019ajoutent aux existants. Utilise le reset complet si tu veux repartir de zéro.'
            : 'Trades are added to the existing ones. Use full reset to start over.'}
        </p>
      </form>
    </div>
  )
}
