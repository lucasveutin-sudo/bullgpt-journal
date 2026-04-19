import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Calendar,
  TrendingUp,
  Shield,
  Target,
  Layers,
  ScrollText,
  Heart,
  Trophy,
  Scale,
} from 'lucide-react'
import { Card, CardHeader, CardBody, Badge } from '@/components/ui'
import CloseTradeForm from './close-trade-form'
import DeleteTradeButton from './delete-trade-button'

export default async function TradeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: trade } = await supabase
    .from('trades')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!trade) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('capital_actuel')
    .eq('id', user.id)
    .single()

  const pnl = trade.pnl_dollars !== null ? Number(trade.pnl_dollars) : null
  const pnlPct = trade.pnl_pct !== null ? Number(trade.pnl_pct) : null
  const rrReel = trade.rr_reel !== null ? Number(trade.rr_reel) : null
  const isWin = pnl !== null && pnl >= 0

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8 flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge tone={trade.direction === 'long' ? 'success' : 'danger'}>
            {trade.direction}
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">
            {trade.actif}
          </h1>
          <Badge tone={trade.statut === 'ouvert' ? 'info' : 'neutral'}>{trade.statut}</Badge>
        </div>
        <DeleteTradeButton tradeId={trade.id} />
      </header>

      <Card className="mb-6">
        <CardHeader title="Setup" icon={<Layers size={14} />} />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Metric
              label="Date"
              icon={<Calendar size={12} />}
              value={new Date(trade.date_entree).toLocaleString('fr-FR', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            />
            <Metric
              label="Entrée"
              icon={<TrendingUp size={12} />}
              value={trade.prix_entree}
            />
            <Metric
              label="Stop Loss"
              icon={<Shield size={12} />}
              value={trade.prix_sl}
              tone="danger"
            />
            <Metric
              label="Take Profit"
              icon={<Target size={12} />}
              value={trade.prix_tp ?? '—'}
              tone="success"
            />
            <Metric label="Taille" value={trade.lot_size ?? '—'} />
            {trade.rr_prevu && (
              <Metric
                label="R:R prévu"
                icon={<Scale size={12} />}
                value={`1:${Number(trade.rr_prevu).toFixed(2)}`}
              />
            )}
          </div>
        </CardBody>
      </Card>

      {trade.rationnel && (
        <Card className="mb-6">
          <CardHeader title="Rationnel" icon={<ScrollText size={14} />} />
          <CardBody>
            <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {trade.rationnel}
            </p>
            {trade.tags && trade.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {trade.tags.map((t: string) => (
                  <Badge key={t} tone="neutral">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {(trade.emotion_avant || trade.emotion_pendant || trade.emotion_apres) && (
        <Card className="mb-6">
          <CardHeader title="État émotionnel" icon={<Heart size={14} />} />
          <CardBody>
            <div className="grid grid-cols-3 gap-4">
              <Metric label="Avant" value={trade.emotion_avant ?? '—'} />
              <Metric label="Pendant" value={trade.emotion_pendant ?? '—'} />
              <Metric label="Après" value={trade.emotion_apres ?? '—'} />
            </div>
          </CardBody>
        </Card>
      )}

      {trade.statut === 'fermé' && pnl !== null && (
        <Card
          className={`mb-6 ${
            isWin
              ? 'border-emerald-500/30 bg-emerald-500/[0.03]'
              : 'border-red-500/30 bg-red-500/[0.03]'
          }`}
        >
          <CardHeader title="Résultat" icon={<Trophy size={14} />} />
          <CardBody>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
              <div>
                <p className="label-tiny mb-2">PnL</p>
                <p
                  className={`font-nums font-bold text-3xl md:text-4xl leading-none ${
                    isWin ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {isWin ? '+' : ''}${pnl.toFixed(2)}
                </p>
                {pnlPct !== null && (
                  <p
                    className={`font-nums text-sm font-semibold mt-2 ${
                      isWin ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {pnlPct >= 0 ? '+' : ''}
                    {pnlPct.toFixed(2)}%
                  </p>
                )}
              </div>
              {rrReel !== null && (
                <div className="text-right">
                  <p className="label-tiny mb-2">R:R réel</p>
                  <p
                    className={`font-nums font-bold text-2xl ${
                      rrReel >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {rrReel >= 0 ? '+' : ''}
                    {rrReel.toFixed(2)}R
                  </p>
                </div>
              )}
            </div>
            <div className="pt-5 border-t border-zinc-900 grid grid-cols-2 gap-4">
              <Metric label="Sortie" value={trade.prix_sortie} />
              <Metric
                label="Direction"
                value={trade.direction}
                tone={trade.direction === 'long' ? 'success' : 'danger'}
              />
            </div>
          </CardBody>
        </Card>
      )}

      {trade.post_mortem && (
        <Card className="mb-6">
          <CardHeader title="Post-mortem" icon={<ScrollText size={14} />} />
          <CardBody>
            <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {trade.post_mortem}
            </p>
          </CardBody>
        </Card>
      )}

      {trade.statut === 'ouvert' && (
        <CloseTradeForm
          tradeId={trade.id}
          prixEntree={Number(trade.prix_entree)}
          prixSl={Number(trade.prix_sl)}
          direction={trade.direction}
          capitalActuel={Number(profile?.capital_actuel ?? 0)}
        />
      )}
    </div>
  )
}

function Metric({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: string | number | null
  icon?: React.ReactNode
  tone?: 'danger' | 'success'
}) {
  const color =
    tone === 'danger'
      ? 'text-red-400'
      : tone === 'success'
        ? 'text-green-400'
        : 'text-zinc-100'
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon && <span className="text-zinc-600">{icon}</span>}
        <span className="label-tiny">{label}</span>
      </div>
      <p className={`font-nums font-semibold ${color}`}>{value}</p>
    </div>
  )
}
