'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import { useTranslation } from '@/components/locale-provider'
import type { TradeRow } from '@/lib/trade-metrics'

type Filter = 'ALL' | 'WIN' | 'LOSS' | 'OPEN'

export function JournalView({ trades }: { trades: TradeRow[] }) {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>('ALL')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return trades.filter((tr) => {
      const pnl = tr.pnl_dollars === null ? null : Number(tr.pnl_dollars)
      if (filter === 'WIN' && !(pnl !== null && pnl > 0)) return false
      if (filter === 'LOSS' && !(pnl !== null && pnl < 0)) return false
      if (filter === 'OPEN' && tr.statut !== 'ouvert') return false
      if (
        search &&
        !tr.actif.toLowerCase().includes(search.toLowerCase())
      )
        return false
      return true
    })
  }, [trades, filter, search])

  const totalPnl = filtered.reduce(
    (s, tr) => s + (tr.pnl_dollars === null ? 0 : Number(tr.pnl_dollars)),
    0
  )
  const wins = filtered.filter(
    (tr) => tr.pnl_dollars !== null && Number(tr.pnl_dollars) > 0
  ).length
  const closedCount = filtered.filter((tr) => tr.pnl_dollars !== null).length
  const winRate = closedCount > 0 ? (wins / closedCount) * 100 : 0

  const fmt = (n: number) =>
    n.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  return (
    <div className="col gap-md">
      <div className="dash-greet">
        <h1 className="page-title">{t('nav.journal')}</h1>
        <div className="row gap-sm">
          <Link href="/trades/new" className="lbtn lbtn-primary lbtn-sm">
            <Plus size={14} />
            {t('nav.newTrade')}
          </Link>
        </div>
      </div>

      <div
        className="kpi-row"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        <div className="lcard kpi-card">
          <div className="kpi-label">
            {locale === 'fr' ? 'Total trades' : 'Total trades'}
          </div>
          <div className="kpi-value">{filtered.length}</div>
        </div>
        <div className="lcard kpi-card">
          <div className="kpi-label">Net P&L</div>
          <div
            className="kpi-value"
            style={{ color: totalPnl >= 0 ? 'var(--win)' : 'var(--loss)' }}
          >
            {totalPnl >= 0 ? '$' : '-$'}
            {fmt(Math.abs(totalPnl))}
          </div>
        </div>
        <div className="lcard kpi-card">
          <div className="kpi-label">
            {locale === 'fr' ? 'Taux de réussite' : 'Win rate'}
          </div>
          <div className="kpi-value">{winRate.toFixed(1)}%</div>
        </div>
        <div className="lcard kpi-card">
          <div className="kpi-label">
            {locale === 'fr' ? 'Gagnants / Perdants' : 'Winners / Losers'}
          </div>
          <div className="kpi-value mono">
            {wins} / {closedCount - wins}
          </div>
        </div>
      </div>

      <div className="lcard">
        <div
          className="row"
          style={{ justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}
        >
          <div className="lseg">
            {(['ALL', 'WIN', 'LOSS', 'OPEN'] as Filter[]).map((f) => (
              <button
                key={f}
                className={filter === f ? 'active' : ''}
                onClick={() => setFilter(f)}
              >
                {f === 'ALL'
                  ? locale === 'fr'
                    ? 'TOUS'
                    : 'ALL'
                  : f === 'WIN'
                    ? locale === 'fr'
                      ? 'GAIN'
                      : 'WIN'
                    : f === 'LOSS'
                      ? locale === 'fr'
                        ? 'PERTE'
                        : 'LOSS'
                      : locale === 'fr'
                        ? 'OUVERTS'
                        : 'OPEN'}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', minWidth: 220 }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-mute)',
              }}
            />
            <input
              className="linput"
              placeholder={locale === 'fr' ? 'Rechercher…' : 'Search…'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 32, width: '100%' }}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div
            className="dim"
            style={{ textAlign: 'center', padding: 32, fontSize: 13 }}
          >
            {locale === 'fr' ? 'Aucun trade trouvé' : 'No trades found'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ltable ltable-lg">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>{locale === 'fr' ? 'Actif' : 'Symbol'}</th>
                  <th>{locale === 'fr' ? 'Sens' : 'Side'}</th>
                  <th>{locale === 'fr' ? 'Statut' : 'Status'}</th>
                  <th style={{ textAlign: 'right' }}>
                    {locale === 'fr' ? 'Entrée' : 'Entry'}
                  </th>
                  <th style={{ textAlign: 'right' }}>SL</th>
                  <th style={{ textAlign: 'right' }}>TP</th>
                  <th style={{ textAlign: 'right' }}>Net P&L</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tr) => {
                  const pnl = tr.pnl_dollars === null ? null : Number(tr.pnl_dollars)
                  return (
                    <tr
                      key={tr.id}
                      onClick={() => router.push(`/trades/${tr.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="mono">
                        {new Date(tr.date_entree).toLocaleDateString(
                          locale === 'fr' ? 'fr-FR' : 'en-US',
                          { day: '2-digit', month: '2-digit', year: '2-digit' }
                        )}
                      </td>
                      <td className="mono">{tr.actif}</td>
                      <td>
                        <span
                          className={`side-pill ${tr.direction === 'long' ? 'long' : 'short'}`}
                        >
                          {tr.direction.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="chip-soft">
                          {tr.statut === 'ouvert'
                            ? locale === 'fr'
                              ? 'Ouvert'
                              : 'Open'
                            : locale === 'fr'
                              ? 'Clôturé'
                              : 'Closed'}
                        </span>
                      </td>
                      <td className="mono" style={{ textAlign: 'right' }}>
                        {Number(tr.prix_entree)}
                      </td>
                      <td
                        className="mono"
                        style={{ textAlign: 'right', color: 'var(--loss)' }}
                      >
                        {tr.prix_sl !== null ? Number(tr.prix_sl) : '—'}
                      </td>
                      <td
                        className="mono"
                        style={{ textAlign: 'right', color: 'var(--win)' }}
                      >
                        {tr.prix_tp !== null ? Number(tr.prix_tp) : '—'}
                      </td>
                      <td
                        className="mono"
                        style={{
                          textAlign: 'right',
                          fontWeight: 600,
                          color:
                            pnl === null
                              ? 'var(--text-mute)'
                              : pnl >= 0
                                ? 'var(--win)'
                                : 'var(--loss)',
                        }}
                      >
                        {pnl === null
                          ? '—'
                          : `${pnl >= 0 ? '$' : '-$'}${Math.abs(pnl).toFixed(2)}`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
