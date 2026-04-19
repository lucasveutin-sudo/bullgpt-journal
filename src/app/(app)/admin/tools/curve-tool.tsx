'use client'

import { useMemo, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from '@/components/locale-provider'
import type { TradeRow } from '@/lib/trade-metrics'

type DayPoint = {
  dayISO: string
  date: Date
  pnl: number
  cumulative: number
}

function buildDailySeries(trades: TradeRow[], capitalInitial: number): DayPoint[] {
  const byDay = new Map<string, number>()
  for (const t of trades) {
    if (t.pnl_dollars === null || t.pnl_dollars === undefined) continue
    const d = new Date(t.date_entree)
    d.setUTCHours(0, 0, 0, 0)
    const key = d.toISOString()
    byDay.set(key, (byDay.get(key) ?? 0) + Number(t.pnl_dollars))
  }
  const keys = Array.from(byDay.keys()).sort()
  let cum = capitalInitial
  const points: DayPoint[] = []
  for (const k of keys) {
    const pnl = byDay.get(k) ?? 0
    cum += pnl
    points.push({ dayISO: k, date: new Date(k), pnl, cumulative: cum })
  }
  return points
}

export function CurveTool({
  trades,
  capitalInitial,
  pending,
  onAdjustDay,
}: {
  trades: TradeRow[]
  capitalInitial: number
  pending: boolean
  onAdjustDay: (args: { dayISO: string; delta: number }) => void
}) {
  const { locale } = useTranslation()
  const points = useMemo(() => buildDailySeries(trades, capitalInitial), [trades, capitalInitial])
  const [hover, setHover] = useState<number | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragY, setDragY] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const width = 760
  const height = 320
  const padX = 44
  const padY = 24

  if (points.length === 0) {
    return (
      <div className="lcard">
        <div className="dim" style={{ textAlign: 'center', padding: 32, fontSize: 13 }}>
          {locale === 'fr'
            ? 'Pas de trades à afficher. Utilise le générateur pour créer une courbe.'
            : 'No trades to display. Use the generator to create a curve.'}
        </div>
      </div>
    )
  }

  const values = points.map((p) => p.cumulative).concat([capitalInitial])
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const span = Math.max(1, maxV - minV)
  const pad = span * 0.1

  const yMin = minV - pad
  const yMax = maxV + pad
  const yRange = Math.max(1, yMax - yMin)

  const xFor = (i: number) => {
    const w = width - padX * 2
    return padX + (points.length > 1 ? (i / (points.length - 1)) * w : w / 2)
  }
  const yFor = (v: number) => {
    const h = height - padY * 2
    return padY + h - ((v - yMin) / yRange) * h
  }
  const valueForY = (y: number) => {
    const h = height - padY * 2
    const t = (padY + h - y) / h
    return yMin + t * yRange
  }

  const path = points
    .map((p, i) => {
      const x = xFor(i)
      const y = dragIdx === i && dragY !== null ? dragY : yFor(p.cumulative)
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')

  const areaPath =
    path +
    ` L ${xFor(points.length - 1).toFixed(1)} ${yFor(yMin).toFixed(1)} L ${xFor(0).toFixed(1)} ${yFor(yMin).toFixed(1)} Z`

  function handleMove(e: React.PointerEvent) {
    if (dragIdx === null || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const scaleY = height / rect.height
    const y = (e.clientY - rect.top) * scaleY
    setDragY(Math.max(padY, Math.min(height - padY, y)))
  }

  function handleUp() {
    if (dragIdx === null || dragY === null) {
      setDragIdx(null)
      setDragY(null)
      return
    }
    const target = points[dragIdx]
    const newCum = valueForY(dragY)
    const delta = newCum - target.cumulative
    if (Math.abs(delta) > 0.5) {
      onAdjustDay({ dayISO: target.dayISO, delta: Number(delta.toFixed(2)) })
    }
    setDragIdx(null)
    setDragY(null)
  }

  const ticks = 4
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => yMin + (i / ticks) * yRange)

  const hoverPt = hover !== null ? points[hover] : null

  return (
    <div className="lcard">
      <div className="lcard-head">
        <div className="lcard-title">
          {locale === 'fr' ? 'Courbe de capital' : 'Equity curve'}
        </div>
        <div className="lcard-sub">
          {locale === 'fr'
            ? 'Glisse un point verticalement pour ajuster le PnL de ce jour'
            : 'Drag a point vertically to adjust that day\u2019s PnL'}
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: '100%',
          touchAction: 'none',
          cursor: dragIdx !== null ? 'grabbing' : 'default',
        }}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
      >
        <defs>
          <linearGradient id="curvearea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8b7ad0" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b7ad0" stopOpacity="0" />
          </linearGradient>
        </defs>

        {tickVals.map((v, i) => {
          const y = yFor(v)
          return (
            <g key={i}>
              <line
                x1={padX}
                x2={width - padX}
                y1={y}
                y2={y}
                stroke="#ece9f3"
                strokeWidth="1"
              />
              <text
                x={padX - 6}
                y={y + 3}
                fontSize="9"
                fill="#5b6472"
                textAnchor="end"
              >
                ${Math.round(v).toLocaleString('en-US')}
              </text>
            </g>
          )
        })}

        <path d={areaPath} fill="url(#curvearea)" />
        <path d={path} fill="none" stroke="#8b7ad0" strokeWidth="1.8" strokeLinejoin="round" />

        {points.map((p, i) => {
          const x = xFor(i)
          const y = dragIdx === i && dragY !== null ? dragY : yFor(p.cumulative)
          const isHover = hover === i || dragIdx === i
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={isHover ? 5.5 : 3.2}
                fill="#8b7ad0"
                stroke="white"
                strokeWidth="1.6"
                style={{ cursor: 'grab' }}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover((h) => (h === i ? null : h))}
                onPointerDown={(e) => {
                  ;(e.target as Element).setPointerCapture?.(e.pointerId)
                  setDragIdx(i)
                  setDragY(y)
                }}
              />
            </g>
          )
        })}

        {hoverPt && hover !== null && (
          <g>
            <text
              x={xFor(hover)}
              y={Math.max(14, yFor(hoverPt.cumulative) - 10)}
              fontSize="10"
              fill="#5b6472"
              textAnchor="middle"
              fontWeight="600"
            >
              ${Math.round(hoverPt.cumulative).toLocaleString('en-US')}
            </text>
          </g>
        )}
      </svg>

      <div className="row gap-sm" style={{ justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-mute)' }}>
        <span>
          {points[0].date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
            day: '2-digit',
            month: 'short',
            timeZone: 'UTC',
          })}
        </span>
        {pending && (
          <span className="row gap-sm" style={{ alignItems: 'center' }}>
            <Loader2 size={12} className="animate-spin" />
            {locale === 'fr' ? 'Ajustement…' : 'Adjusting…'}
          </span>
        )}
        <span>
          {points[points.length - 1].date.toLocaleDateString(
            locale === 'fr' ? 'fr-FR' : 'en-US',
            { day: '2-digit', month: 'short', timeZone: 'UTC' },
          )}
        </span>
      </div>
    </div>
  )
}
