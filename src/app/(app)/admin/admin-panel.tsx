'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Target, CalendarRange, LineChart, Loader2, RotateCcw } from 'lucide-react'
import { useTranslation } from '@/components/locale-provider'
import type { TradeRow } from '@/lib/trade-metrics'
import {
  generateTargetPnl,
  setDayPnl,
  clearDay,
  adjustDayPnlDelta,
  resetAllTrades,
} from './actions'
import { TargetPnlTool } from './tools/target-pnl-tool'
import { CalendarTool } from './tools/calendar-tool'
import { CurveTool } from './tools/curve-tool'

type Tool = 'target' | 'calendar' | 'curve'

export default function AdminPanel({
  capitalActuel,
  capitalInitial,
  riskDefault,
  trades,
}: {
  capitalActuel: number
  capitalInitial: number
  riskDefault: number
  trades: TradeRow[]
}) {
  const { locale } = useTranslation()
  const router = useRouter()
  const [tool, setTool] = useState<Tool>('target')
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const totalPnl = useMemo(
    () =>
      trades.reduce((s, t) => {
        const v = Number(t.pnl_dollars ?? 0)
        return s + (Number.isFinite(v) ? v : 0)
      }, 0),
    [trades],
  )

  function runAction(fn: () => Promise<unknown>, successMsg: string) {
    startTransition(async () => {
      try {
        await fn()
        setMessage(successMsg)
        router.refresh()
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Erreur')
      }
    })
  }

  const tools: { value: Tool; labelFr: string; labelEn: string; icon: typeof Target }[] = [
    { value: 'target', labelFr: 'PnL global', labelEn: 'Target PnL', icon: Target },
    { value: 'calendar', labelFr: 'Calendrier', labelEn: 'Calendar', icon: CalendarRange },
    { value: 'curve', labelFr: 'Courbe', labelEn: 'Equity curve', icon: LineChart },
  ]

  return (
    <div className="col gap-md">
      <div className="dash-greet">
        <h1 className="page-title">Admin</h1>
        <p className="dim" style={{ fontSize: 13 }}>
          {locale === 'fr'
            ? 'Édite ton PnL, ton calendrier et ta courbe — tout reste cohérent via la table trades.'
            : 'Edit your PnL, calendar and curve — everything stays coherent via the trades table.'}
        </p>
      </div>

      <div className="lcard">
        <div className="row gap-sm" style={{ flexWrap: 'wrap' }}>
          <div className="lkv" style={{ flex: 1, minWidth: 160 }}>
            <span>{locale === 'fr' ? 'Capital actuel' : 'Current capital'}</span>
            <span className="mono">${capitalActuel.toLocaleString('en-US')}</span>
          </div>
          <div className="lkv" style={{ flex: 1, minWidth: 160 }}>
            <span>{locale === 'fr' ? 'Capital initial' : 'Starting capital'}</span>
            <span className="mono">${capitalInitial.toLocaleString('en-US')}</span>
          </div>
          <div className="lkv" style={{ flex: 1, minWidth: 160 }}>
            <span>{locale === 'fr' ? 'PnL cumulé' : 'Total PnL'}</span>
            <span
              className="mono"
              style={{ color: totalPnl >= 0 ? 'var(--win)' : 'var(--loss)' }}
            >
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="lkv" style={{ flex: 1, minWidth: 120 }}>
            <span>{locale === 'fr' ? 'Trades' : 'Trades'}</span>
            <span className="mono">{trades.length}</span>
          </div>
        </div>
      </div>

      <div className="row gap-sm" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div className="lseg">
          {tools.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTool(t.value)}
                className={tool === t.value ? 'active' : ''}
              >
                <Icon size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                {locale === 'fr' ? t.labelFr : t.labelEn}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          className="lbtn lbtn-ghost lbtn-sm"
          disabled={pending}
          onClick={() => {
            if (
              !window.confirm(
                locale === 'fr'
                  ? 'Supprimer TOUS tes trades ? Irréversible.'
                  : 'Delete ALL your trades? Irreversible.',
              )
            )
              return
            runAction(
              () => resetAllTrades(),
              locale === 'fr' ? 'Tous les trades supprimés.' : 'All trades deleted.',
            )
          }}
        >
          <RotateCcw size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />
          {locale === 'fr' ? 'Reset complet' : 'Full reset'}
        </button>
      </div>

      {message && (
        <div className="lcard" style={{ padding: '10px 14px' }}>
          <div className="row gap-sm" style={{ alignItems: 'center', fontSize: 13 }}>
            {pending && <Loader2 size={14} className="animate-spin" />}
            <span>{message}</span>
          </div>
        </div>
      )}

      {tool === 'target' && (
        <TargetPnlTool
          pending={pending}
          onSubmit={(args) =>
            runAction(
              () => generateTargetPnl(args),
              locale === 'fr'
                ? `Trades générés pour un PnL cible de $${args.totalPnl.toLocaleString('en-US')}.`
                : `Trades generated for target PnL $${args.totalPnl.toLocaleString('en-US')}.`,
            )
          }
        />
      )}

      {tool === 'calendar' && (
        <CalendarTool
          trades={trades}
          pending={pending}
          onSetDay={(args) =>
            runAction(
              () => setDayPnl(args),
              locale === 'fr' ? 'Jour mis à jour.' : 'Day updated.',
            )
          }
          onClearDay={(dayISO) =>
            runAction(
              () => clearDay(dayISO),
              locale === 'fr' ? 'Jour vidé.' : 'Day cleared.',
            )
          }
        />
      )}

      {tool === 'curve' && (
        <CurveTool
          trades={trades}
          capitalInitial={capitalInitial}
          pending={pending}
          onAdjustDay={(args) =>
            runAction(
              () => adjustDayPnlDelta(args),
              locale === 'fr' ? 'Courbe ajustée.' : 'Curve adjusted.',
            )
          }
        />
      )}
    </div>
  )
}
