'use client'

import { useState } from 'react'

type Point = { date: string | null; value: number }

export default function CapitalChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null)

  if (data.length < 2) {
    return <p className="text-zinc-500 text-sm">Pas encore assez de données.</p>
  }

  const width = 800
  const height = 280
  const padding = { top: 20, right: 16, bottom: 32, left: 60 }
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const yMin = min - range * 0.05
  const yMax = max + range * 0.05
  const yRange = yMax - yMin

  const scaleX = (i: number) => padding.left + (i / (data.length - 1)) * innerW
  const scaleY = (v: number) => padding.top + innerH - ((v - yMin) / yRange) * innerH

  const path = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.value)}`)
    .join(' ')

  const initial = data[0].value
  const final = data[data.length - 1].value
  const isPositive = final >= initial
  const color = isPositive ? '#10b981' : '#ef4444'

  const areaPath =
    path +
    ` L ${scaleX(data.length - 1)} ${padding.top + innerH} L ${scaleX(0)} ${padding.top + innerH} Z`

  const yTicks = 4
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => yMin + (yRange * i) / yTicks)

  const fmt = (v: number) =>
    v.toLocaleString('fr-FR', { maximumFractionDigits: 0 })

  const fmtDate = (d: string | null, i: number) => {
    if (!d) return 'Départ'
    const date = new Date(d)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  const hoveredPoint = hover !== null ? data[hover] : null

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((tick, i) => {
          const y = scaleY(tick)
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#18181b"
                strokeWidth="1"
                strokeDasharray={i === 0 || i === ticks.length - 1 ? '0' : '2 4'}
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                fill="#52525b"
                fontSize="10"
                textAnchor="end"
                className="font-mono"
              >
                ${fmt(tick)}
              </text>
            </g>
          )
        })}

        <path d={areaPath} fill="url(#capitalGradient)" />
        <path
          d={path}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={scaleX(i)}
              cy={scaleY(d.value)}
              r={hover === i ? 5 : 3}
              fill={color}
              stroke="#000"
              strokeWidth="1.5"
              className="transition-all"
            />
            <rect
              x={scaleX(i) - 20}
              y={padding.top}
              width={40}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'crosshair' }}
            />
          </g>
        ))}

        {hover !== null && (
          <line
            x1={scaleX(hover)}
            x2={scaleX(hover)}
            y1={padding.top}
            y2={padding.top + innerH}
            stroke={color}
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.5"
            pointerEvents="none"
          />
        )}

        {data.map((d, i) => {
          if (data.length > 10 && i % Math.ceil(data.length / 6) !== 0 && i !== data.length - 1)
            return null
          return (
            <text
              key={`label-${i}`}
              x={scaleX(i)}
              y={height - padding.bottom + 18}
              fill="#52525b"
              fontSize="10"
              textAnchor="middle"
              className="font-mono"
            >
              {fmtDate(d.date, i)}
            </text>
          )
        })}
      </svg>

      {hoveredPoint && hover !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-zinc-800 bg-zinc-950/95 backdrop-blur px-3 py-2 shadow-xl"
          style={{
            left: `${(scaleX(hover) / width) * 100}%`,
            top: `${(scaleY(hoveredPoint.value) / height) * 100}%`,
            marginTop: -8,
          }}
        >
          <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-0.5">
            {fmtDate(hoveredPoint.date, hover)}
          </p>
          <p className="font-nums font-bold text-sm text-zinc-100">
            ${fmt(hoveredPoint.value)}
          </p>
        </div>
      )}
    </div>
  )
}
