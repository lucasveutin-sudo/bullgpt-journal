export function CumulativeArea({
  data,
  width = 560,
  height = 260,
}: {
  data: number[]
  width?: number
  height?: number
}) {
  if (data.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-xs text-[var(--text-mute)]"
        style={{ height }}
      >
        Pas assez de données
      </div>
    )
  }

  const W = width
  const H = height
  const pad = { l: 46, r: 16, t: 16, b: 28 }
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const min = Math.min(0, ...data)
  const max = Math.max(0, ...data)
  const range = max - min || 1
  const zeroY = pad.t + (max / range) * ih
  const xAt = (i: number) => pad.l + (i / (data.length - 1)) * iw
  const yAt = (v: number) => pad.t + ((max - v) / range) * ih

  const points = data.map((v, i) => [xAt(i), yAt(v)] as const)
  const linePath = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join('')
  const areaPath = `${linePath} L${xAt(data.length - 1)},${zeroY} L${xAt(0)},${zeroY} Z`

  const niceStep = Math.max(1, Math.ceil(range / 5 / 500) * 500)
  const ticks: number[] = []
  for (
    let t = Math.floor(min / niceStep) * niceStep;
    t <= Math.ceil(max / niceStep) * niceStep;
    t += niceStep
  ) {
    ticks.push(t)
  }

  const xLabelIdx = [
    0,
    Math.floor(data.length / 4),
    Math.floor(data.length / 2),
    Math.floor((3 * data.length) / 4),
    data.length - 1,
  ]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <defs>
        <linearGradient id="cumGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ec7a0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#3ec7a0" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="cumRed" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#e87d8e" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e87d8e" stopOpacity="0.05" />
        </linearGradient>
        <clipPath id="clipGreen">
          <rect x="0" y="0" width={W} height={zeroY} />
        </clipPath>
        <clipPath id="clipRed">
          <rect x="0" y={zeroY} width={W} height={H - zeroY} />
        </clipPath>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={pad.l}
            y1={yAt(t)}
            x2={W - pad.r}
            y2={yAt(t)}
            stroke="#eef0f4"
            strokeWidth="1"
            strokeDasharray={t === 0 ? '0' : '3 3'}
          />
          <text
            x={pad.l - 8}
            y={yAt(t) + 3}
            textAnchor="end"
            fontSize="10"
            fill="#94a0b4"
          >
            {t >= 0 ? `$${t.toLocaleString()}` : `-$${Math.abs(t).toLocaleString()}`}
          </text>
        </g>
      ))}
      <path d={areaPath} fill="url(#cumGreen)" clipPath="url(#clipGreen)" />
      <path d={areaPath} fill="url(#cumRed)" clipPath="url(#clipRed)" />
      <path
        d={linePath}
        fill="none"
        stroke="#3ec7a0"
        strokeWidth="2"
        clipPath="url(#clipGreen)"
      />
      <path
        d={linePath}
        fill="none"
        stroke="#e87d8e"
        strokeWidth="2"
        clipPath="url(#clipRed)"
      />
      {xLabelIdx.map((i) => (
        <text
          key={i}
          x={xAt(i)}
          y={H - 10}
          textAnchor="middle"
          fontSize="10"
          fill="#94a0b4"
        >
          {`J ${i + 1}`}
        </text>
      ))}
    </svg>
  )
}
