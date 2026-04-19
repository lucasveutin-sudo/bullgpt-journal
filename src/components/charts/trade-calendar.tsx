'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type CalendarDay = { d: number; pnl: number; trades: number }

const MONTH_NAMES_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]
const MONTH_NAMES_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const DOW_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const DOW_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function fmt(v: number) {
  return Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function TradeCalendar({
  days,
  initialYear,
  initialMonth,
  locale = 'fr',
}: {
  days: CalendarDay[]
  initialYear: number
  initialMonth: number
  locale?: 'fr' | 'en'
}) {
  const [cursor, setCursor] = useState({ y: initialYear, m: initialMonth })
  const monthNames = locale === 'fr' ? MONTH_NAMES_FR : MONTH_NAMES_EN
  const dow = locale === 'fr' ? DOW_FR : DOW_EN

  const { cells, weeks, monthTotal, monthDays } = useMemo(() => {
    const firstWeekday = new Date(cursor.y, cursor.m, 1).getDay()
    const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate()
    const cells: (CalendarDay | { empty: true; d: number | '' })[] = []
    for (let i = 0; i < firstWeekday; i++) cells.push({ empty: true, d: '' })
    for (let d = 1; d <= daysInMonth; d++) {
      const info = days.find((x) => x.d === d) || { d, pnl: 0, trades: 0 }
      cells.push(info)
    }
    while (cells.length % 7 !== 0) cells.push({ empty: true, d: '' })

    const weeks: (typeof cells)[] = []
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

    const monthTotal = days.reduce((a, c) => a + (c.pnl || 0), 0)
    const monthDays = days.filter((c) => c.trades > 0).length

    return { cells, weeks, monthTotal, monthDays }
  }, [cursor, days])

  function weekStat(w: typeof cells) {
    const filled = w.filter((c): c is CalendarDay => !('empty' in c) && c.trades > 0)
    const pnl = filled.reduce((a, c) => a + (c.pnl || 0), 0)
    const trades = filled.reduce((a, c) => a + (c.trades || 0), 0)
    return { pnl, trades }
  }

  function shift(delta: number) {
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }

  return (
    <div className="lcard">
      <div className="cal-head">
        <div className="row gap-sm">
          <button className="cal-nav" onClick={() => shift(-1)} aria-label="Previous">
            <ChevronLeft size={14} />
          </button>
          <div className="cal-month">
            {monthNames[cursor.m]} {cursor.y}
          </div>
          <button className="cal-nav" onClick={() => shift(1)} aria-label="Next">
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="row gap-md" style={{ alignItems: 'center' }}>
          <span className="cal-total-label">
            {locale === 'fr' ? 'Total du mois:' : 'Monthly stats:'}
          </span>
          <span
            className="cal-total"
            style={{ color: monthTotal >= 0 ? '#12a679' : '#d0556b' }}
          >
            {monthTotal >= 0 ? '$' : '-$'}
            {fmt(monthTotal)}
          </span>
          <span className="cal-days">
            {monthDays} {locale === 'fr' ? 'jours' : 'days'}
          </span>
        </div>
      </div>

      <div className="cal-grid-wrap">
        <div className="cal-grid">
          <div className="cal-row cal-dow">
            {dow.map((d) => (
              <div key={d} className="cal-dow-cell">
                {d}
              </div>
            ))}
          </div>
          {weeks.map((w, wi) => (
            <div key={wi} className="cal-row cal-week">
              {w.map((c, ci) => {
                if ('empty' in c) {
                  return (
                    <div key={ci} className="cal-cell empty">
                      <span className="cal-day-num dim">{c.d}</span>
                    </div>
                  )
                }
                const hasTrades = c.trades > 0
                const isWin = c.pnl > 0
                const isLoss = c.pnl < 0
                const cls = hasTrades ? (isWin ? 'win' : isLoss ? 'loss' : 'flat') : ''
                return (
                  <div key={ci} className={`cal-cell ${cls}`}>
                    <div className="cal-day-num">{c.d}</div>
                    {hasTrades && (
                      <>
                        <div className="cal-pnl">
                          {c.pnl >= 0 ? '$' : '-$'}
                          {fmt(c.pnl)}
                        </div>
                        <div className="cal-trades">
                          {c.trades} {c.trades > 1 ? (locale === 'fr' ? 'trades' : 'Trades') : (locale === 'fr' ? 'trade' : 'Trade')}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="cal-weeks">
          <div className="cal-week-head">&nbsp;</div>
          {weeks.map((w, wi) => {
            const s = weekStat(w)
            return (
              <div key={wi} className="cal-week-stat">
                {s.trades > 0 ? (
                  <>
                    <div
                      className={`cal-week-pnl ${s.pnl >= 0 ? 'win' : 'loss'}`}
                    >
                      {s.pnl >= 0 ? '$' : '-$'}
                      {fmt(s.pnl)}
                    </div>
                    <div className="cal-week-trades">
                      {s.trades} {locale === 'fr' ? 'trades' : 'Trades'}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="cal-week-pnl dim">$0</div>
                    <div className="cal-week-trades">
                      0 {locale === 'fr' ? 'trades' : 'Trades'}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
