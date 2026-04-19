'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from '@/components/locale-provider'

type AssetType = 'forex_usd' | 'forex_jpy' | 'crypto' | 'stocks' | 'indices' | 'metals'

const ASSET_OPTIONS: { value: AssetType; labelFr: string; labelEn: string; hintFr: string; hintEn: string }[] = [
  {
    value: 'forex_usd',
    labelFr: 'Forex (USD)',
    labelEn: 'Forex (USD)',
    hintFr: 'EURUSD, GBPUSD',
    hintEn: 'EURUSD, GBPUSD',
  },
  {
    value: 'forex_jpy',
    labelFr: 'Forex (JPY)',
    labelEn: 'Forex (JPY)',
    hintFr: 'USDJPY, EURJPY',
    hintEn: 'USDJPY, EURJPY',
  },
  {
    value: 'crypto',
    labelFr: 'Crypto',
    labelEn: 'Crypto',
    hintFr: 'BTCUSD, ETHUSD',
    hintEn: 'BTCUSD, ETHUSD',
  },
  {
    value: 'stocks',
    labelFr: 'Actions',
    labelEn: 'Stocks',
    hintFr: 'AAPL, TSLA…',
    hintEn: 'AAPL, TSLA…',
  },
  {
    value: 'indices',
    labelFr: 'Indices',
    labelEn: 'Indices',
    hintFr: 'US30, NAS100',
    hintEn: 'US30, NAS100',
  },
  {
    value: 'metals',
    labelFr: 'Métaux',
    labelEn: 'Metals',
    hintFr: 'XAUUSD, XAGUSD',
    hintEn: 'XAUUSD, XAGUSD',
  },
]

export default function CalculatorForm({
  defaultCapital,
  defaultRisque,
}: {
  defaultCapital: number
  defaultRisque: number
}) {
  const { locale } = useTranslation()
  const [assetType, setAssetType] = useState<AssetType>('forex_usd')
  const [capital, setCapital] = useState(defaultCapital.toString())
  const [riskPct, setRiskPct] = useState(defaultRisque.toString())
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG')
  const [entry, setEntry] = useState('1.0834')
  const [sl, setSl] = useState('1.0820')
  const [tp, setTp] = useState('1.0872')

  const result = useMemo(() => {
    const cap = parseFloat(capital)
    const risk = parseFloat(riskPct)
    const e = parseFloat(entry)
    const s = parseFloat(sl)
    const t = parseFloat(tp)
    if (!cap || !risk || !e || !s) return null
    if (e === s) return null

    const riskAmount = (cap * risk) / 100
    const distance = Math.abs(e - s)
    let lotSize = 0
    let unit = 'lots'
    let pipsDistance = 0
    let tpPips = 0
    let pipMul = 1

    if (assetType === 'forex_usd') {
      pipsDistance = distance / 0.0001
      tpPips = t ? Math.abs(t - e) / 0.0001 : 0
      pipMul = 10
      lotSize = riskAmount / (pipsDistance * pipMul)
      unit = 'lots'
    } else if (assetType === 'forex_jpy') {
      pipsDistance = distance / 0.01
      tpPips = t ? Math.abs(t - e) / 0.01 : 0
      pipMul = 1000 / e
      lotSize = riskAmount / (pipsDistance * pipMul)
      unit = 'lots'
    } else if (assetType === 'metals') {
      pipsDistance = distance / 0.01
      tpPips = t ? Math.abs(t - e) / 0.01 : 0
      pipMul = 1
      lotSize = riskAmount / pipsDistance
      unit = 'lots'
    } else if (assetType === 'indices') {
      pipsDistance = distance
      tpPips = t ? Math.abs(t - e) : 0
      lotSize = riskAmount / distance
      unit = locale === 'fr' ? 'contrats' : 'contracts'
    } else {
      pipsDistance = distance
      tpPips = t ? Math.abs(t - e) : 0
      lotSize = riskAmount / distance
      unit = assetType === 'crypto' ? (locale === 'fr' ? 'unités' : 'units') : 'shares'
    }

    const reward = tpPips > 0 ? tpPips * pipMul * lotSize : 0
    const rr = distance > 0 && tpPips > 0 ? tpPips / pipsDistance : 0
    const returnOnCapital = cap > 0 && reward > 0 ? (reward / cap) * 100 : 0

    return {
      riskAmount,
      lotSize,
      unit,
      pipsDistance,
      tpPips,
      reward,
      rr,
      returnOnCapital,
    }
  }, [capital, riskPct, entry, sl, tp, assetType, locale])

  const fmt = (n: number, d = 2) =>
    n.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    })

  return (
    <div className="col gap-md">
      <div className="dash-greet">
        <h1 className="page-title">
          {locale === 'fr' ? 'Calculateur de lot' : 'Lot Calculator'}
        </h1>
      </div>

      <div className="grid-2-eq">
        <div className="lcard">
          <div className="lcard-head">
            <div className="lcard-title">{locale === 'fr' ? 'Paramètres' : 'Inputs'}</div>
            <div className="lcard-sub">Setup</div>
          </div>
          <div className="col gap-md">
            <div className="grid-2">
              <div className="lfield">
                <label>{locale === 'fr' ? 'Capital ($)' : 'Capital ($)'}</label>
                <input
                  type="number"
                  className="linput mono"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                />
              </div>
              <div className="lfield">
                <label>{locale === 'fr' ? 'Risque (%)' : 'Risk (%)'}</label>
                <input
                  type="number"
                  step="0.1"
                  className="linput mono"
                  value={riskPct}
                  onChange={(e) => setRiskPct(e.target.value)}
                />
              </div>
            </div>

            <div className="lfield">
              <label>{locale === 'fr' ? "Type d'actif" : 'Asset type'}</label>
              <select
                className="lselect"
                value={assetType}
                onChange={(e) => setAssetType(e.target.value as AssetType)}
              >
                {ASSET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {locale === 'fr' ? o.labelFr : o.labelEn} ·{' '}
                    {locale === 'fr' ? o.hintFr : o.hintEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="lfield">
              <label>Direction</label>
              <div className="lseg">
                {(['LONG', 'SHORT'] as const).map((d) => (
                  <button
                    key={d}
                    className={
                      direction === d
                        ? `active ${d.toLowerCase()}`
                        : ''
                    }
                    onClick={() => setDirection(d)}
                    type="button"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-3">
              <div className="lfield">
                <label>{locale === 'fr' ? 'Entrée' : 'Entry'}</label>
                <input
                  type="number"
                  step="any"
                  className="linput mono"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                />
              </div>
              <div className="lfield">
                <label>SL</label>
                <input
                  type="number"
                  step="any"
                  className="linput mono"
                  value={sl}
                  onChange={(e) => setSl(e.target.value)}
                />
              </div>
              <div className="lfield">
                <label>TP</label>
                <input
                  type="number"
                  step="any"
                  className="linput mono"
                  value={tp}
                  onChange={(e) => setTp(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lcard">
          <div className="lcard-head">
            <div className="lcard-title">{locale === 'fr' ? 'Résultat' : 'Result'}</div>
            <div className="lcard-sub">
              {locale === 'fr' ? 'Position recommandée' : 'Recommended position'}
            </div>
          </div>

          {result ? (
            <>
              <div
                className="col"
                style={{ textAlign: 'center', padding: '8px 0 14px', gap: 6 }}
              >
                <span className="calc-sub">
                  {locale === 'fr' ? 'Taille recommandée' : 'Recommended lot size'}
                </span>
                <div className="calc-big">
                  {result.lotSize.toFixed(result.unit === 'lots' ? 2 : 4)}
                </div>
                <span className="calc-sub mono">{result.unit}</span>
              </div>

              <div className="col">
                <div className="lkv">
                  <span>{locale === 'fr' ? 'Risque' : 'Risk amount'}</span>
                  <span style={{ color: 'var(--loss)' }}>
                    -${fmt(result.riskAmount)}
                  </span>
                </div>
                {result.reward > 0 && (
                  <div className="lkv">
                    <span>{locale === 'fr' ? 'Gain potentiel' : 'Potential reward'}</span>
                    <span style={{ color: 'var(--win)' }}>
                      +${fmt(result.reward)}
                    </span>
                  </div>
                )}
                {result.rr > 0 && (
                  <div className="lkv">
                    <span>{locale === 'fr' ? 'Ratio R/R' : 'R:R ratio'}</span>
                    <span>1 : {result.rr.toFixed(2)}</span>
                  </div>
                )}
                <div className="lkv">
                  <span>{locale === 'fr' ? 'Distance SL' : 'SL distance'}</span>
                  <span>{result.pipsDistance.toFixed(1)} pips</span>
                </div>
                {result.tpPips > 0 && (
                  <div className="lkv">
                    <span>{locale === 'fr' ? 'Distance TP' : 'TP distance'}</span>
                    <span>{result.tpPips.toFixed(1)} pips</span>
                  </div>
                )}
                {result.returnOnCapital > 0 && (
                  <div className="lkv">
                    <span>{locale === 'fr' ? 'Retour sur capital' : 'Return on capital'}</span>
                    <span style={{ color: 'var(--win)' }}>
                      +{result.returnOnCapital.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>

              {result.reward > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div className="rrbar">
                    <div
                      className="rr-loss"
                      style={{
                        width: `${(result.riskAmount / (result.riskAmount + result.reward)) * 100}%`,
                      }}
                    />
                    <div
                      className="rr-win"
                      style={{
                        width: `${(result.reward / (result.riskAmount + result.reward)) * 100}%`,
                      }}
                    />
                  </div>
                  <div
                    className="row"
                    style={{
                      justifyContent: 'space-between',
                      marginTop: 6,
                      fontSize: 11,
                      color: 'var(--text-mute)',
                    }}
                  >
                    <span>
                      {locale === 'fr' ? 'Risque' : 'Risk'} -$
                      {result.riskAmount.toFixed(0)}
                    </span>
                    <span>
                      {locale === 'fr' ? 'Reward' : 'Reward'} +$
                      {result.reward.toFixed(0)}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              className="dim"
              style={{ textAlign: 'center', padding: 32, fontSize: 13 }}
            >
              {locale === 'fr'
                ? 'Remplis les paramètres pour voir le résultat'
                : 'Fill in the inputs to see the result'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
