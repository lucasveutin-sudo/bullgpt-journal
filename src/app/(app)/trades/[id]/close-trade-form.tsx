'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardBody, Field, Input, Textarea, Button, Chip } from '@/components/ui'

const EMOTIONS = [
  'Confiant',
  'Calme',
  'Focus',
  'Hésitant',
  'Stressé',
  'FOMO',
  'Revenge trading',
  'Fatigué',
  'Euphorique',
  'Frustré',
]

export default function CloseTradeForm({
  tradeId,
  prixEntree,
  prixSl,
  direction,
  capitalActuel,
}: {
  tradeId: string
  prixEntree: number
  prixSl: number
  direction: 'long' | 'short'
  capitalActuel: number
}) {
  const router = useRouter()
  const supabase = createClient()

  const [prixSortie, setPrixSortie] = useState('')
  const [pnlDollars, setPnlDollars] = useState('')
  const [emotionApres, setEmotionApres] = useState('')
  const [postMortem, setPostMortem] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClose(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const sortie = parseFloat(prixSortie)
    const pnl = parseFloat(pnlDollars)

    if (isNaN(sortie) || isNaN(pnl)) {
      setError('Prix de sortie et PnL sont obligatoires.')
      setLoading(false)
      return
    }

    const pnlPct = capitalActuel > 0 ? (pnl / capitalActuel) * 100 : null

    const distanceSl = Math.abs(prixEntree - prixSl)
    let rrReel: number | null = null
    if (distanceSl > 0) {
      const pnlPrix = direction === 'long' ? sortie - prixEntree : prixEntree - sortie
      rrReel = pnlPrix / distanceSl
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('Non connecté')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('trades')
      .update({
        statut: 'fermé',
        prix_sortie: sortie,
        pnl_dollars: pnl,
        pnl_pct: pnlPct,
        rr_reel: rrReel,
        emotion_apres: emotionApres || null,
        post_mortem: postMortem || null,
      })
      .eq('id', tradeId)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    const nouveauCapital = capitalActuel + pnl
    await supabase
      .from('profiles')
      .update({ capital_actuel: nouveauCapital })
      .eq('id', user.id)

    await supabase.from('capital_snapshots').insert({
      user_id: user.id,
      solde: nouveauCapital,
      trade_id: tradeId,
    })

    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleClose}>
      <Card>
        <CardHeader title="Clôturer le trade" icon={<CheckCircle2 size={14} />} />
        <CardBody className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Prix de sortie">
              <Input
                type="number"
                step="any"
                required
                value={prixSortie}
                onChange={(e) => setPrixSortie(e.target.value)}
              />
            </Field>
            <Field label="PnL net ($)" hint="Selon ton broker">
              <Input
                type="number"
                step="any"
                required
                placeholder="150 ou -80"
                value={pnlDollars}
                onChange={(e) => setPnlDollars(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Émotion après le trade">
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map((e) => (
                <Chip
                  key={e}
                  active={emotionApres === e}
                  onClick={() => setEmotionApres(emotionApres === e ? '' : e)}
                >
                  {e}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Post-mortem" hint="Qu'aurais-tu pu faire mieux ?">
            <Textarea
              rows={3}
              value={postMortem}
              onChange={(e) => setPostMortem(e.target.value)}
            />
          </Field>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            icon={
              loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )
            }
            fullWidth
            size="lg"
          >
            {loading ? 'Clôture...' : 'Clôturer le trade'}
          </Button>
        </CardBody>
      </Card>
    </form>
  )
}
