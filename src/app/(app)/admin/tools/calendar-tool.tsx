'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2, Check, Loader2 } from 'lucide-react'
import { useTranslation } from '@/components/locale-provider'
import type { TradeRow } from '@/lib/trade-metrics'

function startOfMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m, 1))
}

function daysInMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
}

function isoDay(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m, d)).toISOString()
}

export function CalendarTool({
  trades,
  pending,
  onSetDay,
  onClearDay,
}: {
  trades: TradeRow[]
  pending: boolean
  onSetDay: (args: { dayISO: string; targetPnl: number; count?: number; replace?: boolean }) => void
  onClearDay: (dayISO: string) => void
}) {
  const { locale } = useTranslation()
  const now = new Date()
  const [year, setYear] = useState(now.getUTCFullYear())
  const [month, setMonth] = useState(now.getUTCMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [draftPnl, setDraftPnl] = useState('')
  const [draftCount, setDraftCount] = useState('')

  const byDay = useMemo(() => {
    const m = new Map<string, { pnl: number; n: number }>()
    for (const t of trades) {
      if (t.pnl_dollars === null || t.pnl_dollars === undefined) continue
      const d = new Date(t.date_entree)
      if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month) continue
      const key = String(d.getUTCDate())
      const cur = m.get(key) ?? { pnl: 0, n: 0 }
      cur.pnl += Number(t.pnl_dollars)
      cur.n += 1
      m.set(key, cur)
    }
    return m
  }, [trades, year, month])

  const daysN = daysInMonth(year, month)
  const firstDow = startOfMonth(year, month).getUTCDay()
  const blanks = Array.from({ length: firstDow }, (_, i) => i)
  const monthFmt = new Date(Date.UTC(year, month, 1)).toLocaleDateString(
    locale === 'fr' ? 'fr-FR' : 'en-US',
    { month: 'long', year: 'numeric', timeZone: 'UTC' },
  )

  function shiftMonth(delta: number) {
    const next = new Date(Date.UTC(year, month + delta, 1))
    setYear(next.getUTCFullYear())
    setMonth(next.getUTCMonth())
    setSelectedDay(null)
  }

  function openDay(d: number) {
    setSelectedDay(d)
    const key = String(d)
    const existing = byDay.get(key)
    setDraftPnl(existing ? existing.pnl.toFixed(0) : '')
    setDraftCount(existing ? String(existing.n) : '')
  }

  function apply() {
    if (selectedDay === null) return
    const pnl = Number(draftPnl)
    if (!Number.isFinite(pnl)) return
    onSetDay({
      dayISO: isoDay(year, month, selectedDay),
      targetPnl: pnl,
      count: draftCount ? Math.max(1, Number(draftCount)) : undefined,
      replace: true,
    })
  }

  function clear() {
    if (selectedDay === null) return
    onClearDay(isoDay(year, month, selectedDay))
  }

  const weekdays =
    locale === 'fr'
      ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="grid-2-eq">
      <div className="lcard">
        <div className="row gap-sm" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" className="ltop-icon" onClick={() => shiftMonth(-1)}>
            <ChevronLeft size={16} />
          </button>
          <div className="lcard-title" style={{ textTransform: 'capitalize' }}>
            {monthFmt}
          </div>
          <button type="button" className="ltop-icon" onClick={() => shiftMonth(1)}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 4,
            marginTop: 12,
          }}
        >
          {weekdays.map((w) => (
            <div
              key={w}
              style={{
                fontSize: 10,
                color: 'var(--text-mute)',
                textAlign: 'center',
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: '4px 0',
              }}
            >
              {w}
            </div>
          ))}
          {blanks.map((b) => (
            <div key={`b-${b}`} />
          ))}
          {Array.from({ length: daysN }, (_, i) => i + 1).map((d) => {
            const entry = byDay.get(String(d))
            const selected = selectedDay === d
            const pnl = entry?.pnl ?? 0
            const color =
              !entry || pnl === 0
                ? 'var(--text-dim)'
                : pnl > 0
                  ? 'var(--win)'
                  : 'var(--loss)'
            return (
              <button
                key={d}
                type="button"
                onClick={() => openDay(d)}
                className="lcal-cell"
                style={{
                  borderColor: selected ? 'var(--accent)' : 'var(--line-2)',
                  background: selected ? 'var(--surface-2)' : 'transparent',
                  padding: '8px 6px',
                  borderRadius: 8,
                  border: '1px solid',
                  cursor: 'pointer',
                  textAlign: 'left',
                  minHeight: 58,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{d}</span>
                {entry && (
                  <>
                    <span
                      className="mono"
                      style={{ fontSize: 11, fontWeight: 600, color }}
                    >
                      {pnl >= 0 ? '+' : ''}${Math.round(pnl)}
                    </span>
                    <span style={{ fontSize: 9, color: 'var(--text-mute)' }}>
                      {entry.n}×
                    </span>
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="lcard">
        <div className="lcard-head">
          <div className="lcard-title">
            {selectedDay
              ? locale === 'fr'
                ? `Jour ${selectedDay}`
                : `Day ${selectedDay}`
              : locale === 'fr'
                ? 'Sélectionne un jour'
                : 'Pick a day'}
          </div>
          <div className="lcard-sub">
            {locale === 'fr'
              ? 'Remplace les trades du jour par un PnL cible'
              : 'Replaces the day\u2019s trades with a target PnL'}
          </div>
        </div>

        {selectedDay ? (
          <div className="col gap-md">
            <div className="lfield">
              <label>{locale === 'fr' ? 'PnL du jour ($)' : 'Day PnL ($)'}</label>
              <input
                type="number"
                step="any"
                className="linput mono"
                value={draftPnl}
                onChange={(e) => setDraftPnl(e.target.value)}
              />
            </div>
            <div className="lfield">
              <label>{locale === 'fr' ? 'Nombre de trades' : 'Number of trades'}</label>
              <input
                type="number"
                min="1"
                max="10"
                placeholder={locale === 'fr' ? 'auto' : 'auto'}
                className="linput mono"
                value={draftCount}
                onChange={(e) => setDraftCount(e.target.value)}
              />
            </div>

            <div className="row gap-sm">
              <button
                type="button"
                className="lbtn-primary"
                disabled={pending}
                onClick={apply}
              >
                {pending ? (
                  <Loader2 size={14} className="animate-spin" style={{ marginRight: 6, verticalAlign: '-2px' }} />
                ) : (
                  <Check size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                )}
                {locale === 'fr' ? 'Appliquer' : 'Apply'}
              </button>
              <button
                type="button"
                className="lbtn-ghost"
                disabled={pending}
                onClick={clear}
              >
                <Trash2 size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                {locale === 'fr' ? 'Vider le jour' : 'Clear day'}
              </button>
            </div>
          </div>
        ) : (
          <div className="dim" style={{ textAlign: 'center', padding: 32, fontSize: 13 }}>
            {locale === 'fr'
              ? 'Clique une case du calendrier pour éditer le PnL du jour.'
              : 'Click a day in the calendar to edit its PnL.'}
          </div>
        )}
      </div>
    </div>
  )
}
