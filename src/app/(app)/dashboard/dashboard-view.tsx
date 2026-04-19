'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Plus, Edit3 } from 'lucide-react'
import { useTranslation } from '@/components/locale-provider'
import {
  HalfGauge,
  WinDonut,
  DualBar,
  TradeScoreRadar,
  CumulativeArea,
  DailyBars,
  TradeCalendar,
} from '@/components/charts'
import {
  computeKpis,
  computeTradeScore,
  cumulativePnl,
  dailyPnlSeries,
  calendarDaysForMonth,
  type TradeRow,
} from '@/lib/trade-metrics'

export function DashboardView({
  capitalActuel,
  capitalInitial,
  trades,
}: {
  capitalActuel: number
  capitalInitial: number
  trades: TradeRow[]
}) {
  const { t, locale } = useTranslation()

  const kpis = useMemo(() => computeKpis(trades), [trades])
  const score = useMemo(() => computeTradeScore(kpis), [kpis])
  const cumulative = useMemo(() => cumulativePnl(trades), [trades])
  const daily = useMemo(() => dailyPnlSeries(trades, 30), [trades])

  const now = new Date()
  const calYear = now.getFullYear()
  const calMonth = now.getMonth()
  const calDays = useMemo(
    () => calendarDaysForMonth(trades, calYear, calMonth),
    [trades, calYear, calMonth]
  )

  const openPositions = trades
    .filter((t) => t.statut === 'ouvert')
    .slice(0, 6)
  const recentTrades = trades
    .filter((t) => t.pnl_dollars !== null && t.pnl_dollars !== undefined)
    .slice(0, 6)

  const fmtMoney = (n: number) =>
    n.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  return (
    <div className="col gap-md">
      <div className="dash-greet">
        <div>
          <h1 className="page-title">{t('dashboard.title')}</h1>
          <div className="greet-sub">
            ${fmtMoney(capitalActuel)}
            <span className="dim">
              {' · '}
              {trades.length} {t('dashboard.openTrades').toLowerCase()}
            </span>
          </div>
        </div>
        <div className="row gap-sm">
          <Link href="/calculator" className="lbtn lbtn-ghost lbtn-sm">
            <Edit3 size={14} />
            {t('nav.calculator')}
          </Link>
          <Link href="/trades/new" className="lbtn lbtn-primary lbtn-sm">
            <Plus size={14} />
            {t('nav.newTrade')}
          </Link>
        </div>
      </div>

      <div className="kpi-row">
        <div className="lcard kpi-card">
          <div className="kpi-label">
            Net P&L
            <span className="kpi-chip">{kpis.netPnlTrades}</span>
          </div>
          <div
            className="kpi-value"
            style={{ color: kpis.netPnl >= 0 ? 'var(--win)' : 'var(--loss)' }}
          >
            {kpis.netPnl >= 0 ? '$' : '-$'}
            {fmtMoney(Math.abs(kpis.netPnl))}
          </div>
        </div>

        <div className="lcard kpi-card">
          <div className="kpi-label">Trade Expectancy</div>
          <div className="kpi-row-inner">
            <div className="kpi-value">
              {kpis.tradeExpectancy >= 0 ? '$' : '-$'}
              {fmtMoney(Math.abs(kpis.tradeExpectancy))}
            </div>
            <HalfGauge
              value={kpis.tradeExpectancy}
              min={-500}
              max={500}
              thresholds={[0, 250]}
              size={88}
            />
          </div>
        </div>

        <div className="lcard kpi-card">
          <div className="kpi-label">Profit Factor</div>
          <div className="kpi-row-inner">
            <div className="kpi-value">{kpis.profitFactor.toFixed(2)}</div>
            <HalfGauge
              value={kpis.profitFactor}
              min={0}
              max={3}
              thresholds={[1, 2]}
              size={88}
            />
          </div>
        </div>

        <div className="lcard kpi-card">
          <div className="kpi-label">
            Win %
            <span className="kpi-chip win">{kpis.winners}</span>
            <span className="kpi-chip loss">{kpis.losers}</span>
          </div>
          <div className="kpi-row-inner">
            <div className="kpi-value">{kpis.winPct.toFixed(1)}%</div>
            <WinDonut win={kpis.winners} loss={kpis.losers} size={72} />
          </div>
        </div>

        <div className="lcard kpi-card">
          <div className="kpi-label">Avg W / L</div>
          <div className="kpi-row-inner">
            <div className="kpi-value">{kpis.avgWinLoss.toFixed(2)}</div>
            <div style={{ flex: 1, marginLeft: 12 }}>
              <DualBar win={kpis.avgWin} loss={kpis.avgLoss} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid-3-eq">
        <div className="lcard">
          <div className="lcard-head">
            <div className="lcard-title">Trade Score</div>
          </div>
          <TradeScoreRadar
            data={score.dims}
            score={score.score}
            size={260}
            label={locale === 'fr' ? 'Ton Trade Score' : 'Your Trade Score'}
          />
        </div>

        <div className="lcard">
          <div className="lcard-head">
            <div className="lcard-title">
              {locale === 'fr' ? 'P&L Cumulé' : 'Cumulative P&L'}
            </div>
          </div>
          <CumulativeArea data={cumulative} />
        </div>

        <div className="lcard">
          <div className="lcard-head">
            <div className="lcard-title">
              {locale === 'fr' ? 'P&L journalier (30j)' : 'Daily P&L (30d)'}
            </div>
          </div>
          <DailyBars data={daily} />
        </div>
      </div>

      <TradeCalendar
        days={calDays}
        initialYear={calYear}
        initialMonth={calMonth}
        locale={locale}
      />

      <div className="grid-2-eq">
        <div className="lcard">
          <div className="lcard-head">
            <div className="lcard-title">
              {locale === 'fr' ? 'Positions ouvertes' : 'Open Positions'}
            </div>
          </div>
          {openPositions.length === 0 ? (
            <div className="dim" style={{ padding: 16, textAlign: 'center', fontSize: 12.5 }}>
              {locale === 'fr' ? 'Aucune position ouverte' : 'No open positions'}
            </div>
          ) : (
            <table className="ltable">
              <thead>
                <tr>
                  <th>{locale === 'fr' ? 'Ouvert' : 'Opened'}</th>
                  <th>{locale === 'fr' ? 'Actif' : 'Symbol'}</th>
                  <th>{locale === 'fr' ? 'Sens' : 'Side'}</th>
                  <th style={{ textAlign: 'right' }}>
                    {locale === 'fr' ? 'Entrée' : 'Entry'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {openPositions.map((o) => (
                  <tr key={o.id}>
                    <td className="mono">
                      {new Date(o.date_entree).toLocaleDateString(
                        locale === 'fr' ? 'fr-FR' : 'en-US',
                        { day: '2-digit', month: '2-digit', year: '2-digit' }
                      )}
                    </td>
                    <td className="mono">{o.actif}</td>
                    <td>
                      <span
                        className={`side-pill ${o.direction === 'long' ? 'long' : 'short'}`}
                      >
                        {o.direction.toUpperCase()}
                      </span>
                    </td>
                    <td className="mono" style={{ textAlign: 'right' }}>
                      {Number(o.prix_entree)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="lcard">
          <div className="lcard-head">
            <div className="lcard-title">{t('dashboard.recentTrades')}</div>
            <Link href="/journal" className="lcard-sub hover:text-[var(--brand)]">
              {t('dashboard.viewAll')}
            </Link>
          </div>
          {recentTrades.length === 0 ? (
            <div className="dim" style={{ padding: 16, textAlign: 'center', fontSize: 12.5 }}>
              {t('dashboard.emptyTitle')}
            </div>
          ) : (
            <table className="ltable">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>{locale === 'fr' ? 'Actif' : 'Symbol'}</th>
                  <th>{locale === 'fr' ? 'Sens' : 'Side'}</th>
                  <th style={{ textAlign: 'right' }}>Net P&L</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((r) => {
                  const pnl = Number(r.pnl_dollars)
                  return (
                    <tr key={r.id}>
                      <td className="mono">
                        {new Date(r.date_entree).toLocaleDateString(
                          locale === 'fr' ? 'fr-FR' : 'en-US',
                          { day: '2-digit', month: '2-digit', year: '2-digit' }
                        )}
                      </td>
                      <td className="mono">{r.actif}</td>
                      <td>
                        <span
                          className={`side-pill ${r.direction === 'long' ? 'long' : 'short'}`}
                        >
                          {r.direction.toUpperCase()}
                        </span>
                      </td>
                      <td
                        className="mono"
                        style={{
                          textAlign: 'right',
                          color: pnl >= 0 ? '#12a679' : '#d0556b',
                        }}
                      >
                        {pnl >= 0 ? '$' : '-$'}
                        {Math.abs(pnl).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {capitalInitial > 0 && (
        <div className="greet-sub dim" style={{ marginTop: 4 }}>
          {locale === 'fr' ? 'Capital initial' : 'Starting capital'}: $
          {fmtMoney(capitalInitial)}
        </div>
      )}
    </div>
  )
}
