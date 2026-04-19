export function HalfGauge({
  value,
  min = 0,
  max = 3,
  thresholds = [1, 2],
  size = 88,
}: {
  value: number
  min?: number
  max?: number
  thresholds?: [number, number]
  size?: number
}) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const cx = size / 2
  const cy = size * 0.62
  const r = size * 0.42
  const tip = Math.PI - pct * Math.PI

  const arcPath = (a0: number, a1: number) => {
    const x0 = cx + r * Math.cos(a0)
    const y0 = cy + r * Math.sin(-a0)
    const x1 = cx + r * Math.cos(a1)
    const y1 = cy + r * Math.sin(-a1)
    const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0
    const sweep = a1 > a0 ? 0 : 1
    return `M${x0},${y0} A${r},${r} 0 ${large} ${sweep} ${x1},${y1}`
  }

  const t1 = Math.PI - ((thresholds[0] - min) / (max - min)) * Math.PI
  const t2 = Math.PI - ((thresholds[1] - min) / (max - min)) * Math.PI

  return (
    <svg
      viewBox={`0 0 ${size} ${size * 0.75}`}
      style={{ width: '100%', maxWidth: size, display: 'block' }}
    >
      <path
        d={arcPath(Math.PI, t1)}
        stroke="#f5b7bf"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={arcPath(t1, t2)}
        stroke="#f0d9a5"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={arcPath(t2, 0)}
        stroke="#8bddba"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      <circle
        cx={cx + r * Math.cos(tip)}
        cy={cy + r * Math.sin(-tip)}
        r="5"
        fill="#334155"
      />
    </svg>
  )
}

export function WinDonut({ win, loss, size = 72 }: { win: number; loss: number; size?: number }) {
  const total = win + loss
  const p = total > 0 ? win / total : 0
  const c = 2 * Math.PI * 42
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size, display: 'block' }}>
      <circle cx="50" cy="50" r="42" stroke="#f5b7bf" strokeWidth="12" fill="none" />
      <circle
        cx="50"
        cy="50"
        r="42"
        stroke="#3ec7a0"
        strokeWidth="12"
        fill="none"
        strokeDasharray={`${c * p} ${c}`}
        transform="rotate(-90 50 50)"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function DualBar({ win, loss }: { win: number; loss: number }) {
  const max = Math.max(Math.abs(win), Math.abs(loss)) || 1
  const wPct = (Math.abs(win) / max) * 100
  const lPct = (Math.abs(loss) / max) * 100
  return (
    <div className="col" style={{ gap: 6, width: '100%' }}>
      <div className="dbar-row">
        <div className="dbar win" style={{ width: `${wPct}%` }} />
        <span className="dbar-v win">${Math.abs(win).toFixed(2)}</span>
      </div>
      <div className="dbar-row">
        <div className="dbar loss" style={{ width: `${lPct}%` }} />
        <span className="dbar-v loss">-${Math.abs(loss).toFixed(2)}</span>
      </div>
    </div>
  )
}
