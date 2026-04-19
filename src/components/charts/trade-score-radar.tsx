export type TradeScoreDim = { k: string; v: number }

export function TradeScoreRadar({
  data,
  score,
  size = 260,
  label,
}: {
  data: TradeScoreDim[]
  score: number
  size?: number
  label: string
}) {
  const cx = size / 2
  const cy = size / 2 + 4
  const r = size * 0.36
  const n = data.length || 1
  const ang = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2
  const pt = (i: number, v: number) => {
    const a = ang(i)
    const rr = r * (v / 100)
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)] as const
  }
  const polygon = data.map((d, i) => pt(i, d.v).join(',')).join(' ')
  const rings = [0.25, 0.5, 0.75, 1].map((f) => {
    const pts = data
      .map((_, i) => {
        const a = ang(i)
        return `${cx + r * f * Math.cos(a)},${cy + r * f * Math.sin(a)}`
      })
      .join(' ')
    return <polygon key={f} points={pts} fill="none" stroke="#e6e2f0" strokeWidth="1" />
  })

  return (
    <div className="zella-wrap">
      <svg
        viewBox={`0 0 ${size} ${size + 30}`}
        style={{ width: '100%', maxWidth: size + 40 }}
      >
        {rings}
        {data.map((_, i) => {
          const [x, y] = pt(i, 100)
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="#ece9f3"
              strokeWidth="1"
            />
          )
        })}
        <polygon
          points={polygon}
          fill="rgba(139,122,208,0.28)"
          stroke="#8b7ad0"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
          const [x, y] = pt(i, d.v)
          return (
            <circle key={i} cx={x} cy={y} r="3.2" fill="#8b7ad0" stroke="white" strokeWidth="1.2" />
          )
        })}
        {data.map((d, i) => {
          const a = ang(i)
          const lx = cx + (r + 22) * Math.cos(a)
          const ly = cy + (r + 22) * Math.sin(a)
          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="#5b6472"
              fontWeight="500"
            >
              {d.k}
            </text>
          )
        })}
      </svg>
      <div className="zella-score-bar">
        <div className="zs-label">{label}</div>
        <div className="zs-value">{score}</div>
        <div className="zs-track">
          <div
            className="zs-marker"
            style={{ left: `${Math.max(0, Math.min(100, score))}%` }}
          />
        </div>
      </div>
    </div>
  )
}
