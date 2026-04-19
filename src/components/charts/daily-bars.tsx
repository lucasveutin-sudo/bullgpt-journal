export function DailyBars({
  data,
  width = 560,
  height = 260,
}: {
  data: number[]
  width?: number
  height?: number
}) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-[var(--text-mute)]"
        style={{ height }}
      >
        Pas de trades encore
      </div>
    )
  }

  const W = width
  const H = height
  const pad = { l: 40, r: 12, t: 14, b: 28 }
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const max = Math.max(...data.map((v) => Math.abs(v))) || 1
  const zeroY = pad.t + ih / 2
  const barW = (iw / data.length) * 0.7
  const gap = (iw / data.length) * 0.3

  const ticks = [-max, -max / 2, 0, max / 2, max]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={pad.l}
            y1={zeroY - (t / max) * (ih / 2)}
            x2={W - pad.r}
            y2={zeroY - (t / max) * (ih / 2)}
            stroke="#eef0f4"
            strokeDasharray={t === 0 ? '0' : '3 3'}
          />
          <text
            x={pad.l - 6}
            y={zeroY - (t / max) * (ih / 2) + 3}
            textAnchor="end"
            fontSize="10"
            fill="#94a0b4"
          >
            {t >= 0 ? `$${Math.round(t)}` : `-$${Math.abs(Math.round(t))}`}
          </text>
        </g>
      ))}
      {data.map((v, i) => {
        const x = pad.l + i * (barW + gap) + gap / 2
        const h = (Math.abs(v) / max) * (ih / 2)
        const y = v >= 0 ? zeroY - h : zeroY
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx="1.5"
            fill={v >= 0 ? '#3ec7a0' : '#e87d8e'}
          />
        )
      })}
    </svg>
  )
}
