'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Layers,
  ScrollText,
  Heart,
  Save,
  Loader2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
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

export default function NewTradeForm({ actifsFavoris }: { actifsFavoris: string[] }) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [actif, setActif] = useState('')
  const [direction, setDirection] = useState<'long' | 'short'>('long')
  const [dateEntree, setDateEntree] = useState(new Date().toISOString().slice(0, 16))
  const [prixEntree, setPrixEntree] = useState('')
  const [prixSl, setPrixSl] = useState('')
  const [prixTp, setPrixTp] = useState('')
  const [lotSize, setLotSize] = useState('')

  const [rationnel, setRationnel] = useState('')
  const [emotionAvant, setEmotionAvant] = useState('')
  const [emotionPendant, setEmotionPendant] = useState('')
  const [emotionApres, setEmotionApres] = useState('')
  const [postMortem, setPostMortem] = useState('')
  const [tags, setTags] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('Non connecté')
      setLoading(false)
      return
    }

    const entree = parseFloat(prixEntree)
    const sl = parseFloat(prixSl)
    const tp = prixTp ? parseFloat(prixTp) : null
    const rrPrevu = tp ? Math.abs(tp - entree) / Math.abs(entree - sl) : null

    const { error: insertError } = await supabase.from('trades').insert({
      user_id: user.id,
      actif,
      direction,
      date_entree: new Date(dateEntree).toISOString(),
      prix_entree: entree,
      prix_sl: sl,
      prix_tp: tp,
      lot_size: lotSize ? parseFloat(lotSize) : null,
      rationnel,
      emotion_avant: emotionAvant || null,
      emotion_pendant: emotionPendant || null,
      emotion_apres: emotionApres || null,
      post_mortem: postMortem || null,
      rr_prevu: rrPrevu,
      tags: tags
        ? tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : null,
      statut: 'ouvert',
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/journal')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader title="Setup" icon={<Layers size={14} />} />
        <CardBody className="space-y-5">
          <Field label="Actif">
            <Input
              type="text"
              required
              placeholder="ex: EURUSD, BTCUSD, NAS100..."
              value={actif}
              onChange={(e) => setActif(e.target.value.toUpperCase())}
            />
            {actifsFavoris.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {actifsFavoris.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setActif(a)}
                    className="px-2 py-1 text-xs font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
          </Field>

          <Field label="Direction">
            <div className="grid grid-cols-2 gap-3">
              <Chip
                active={direction === 'long'}
                onClick={() => setDirection('long')}
                tone="brand"
                className="h-12 justify-center"
              >
                <TrendingUp size={16} />
                Long
              </Chip>
              <Chip
                active={direction === 'short'}
                onClick={() => setDirection('short')}
                tone="danger"
                className="h-12 justify-center"
              >
                <TrendingDown size={16} />
                Short
              </Chip>
            </div>
          </Field>

          <Field label="Date & heure d'entrée">
            <Input
              type="datetime-local"
              required
              value={dateEntree}
              onChange={(e) => setDateEntree(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Entrée">
              <Input
                type="number"
                step="any"
                required
                placeholder="1.0850"
                value={prixEntree}
                onChange={(e) => setPrixEntree(e.target.value)}
              />
            </Field>
            <Field label="Stop Loss">
              <Input
                type="number"
                step="any"
                required
                placeholder="1.0820"
                value={prixSl}
                onChange={(e) => setPrixSl(e.target.value)}
              />
            </Field>
            <Field label="Take Profit" hint="Optionnel">
              <Input
                type="number"
                step="any"
                placeholder="1.0910"
                value={prixTp}
                onChange={(e) => setPrixTp(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Taille de position" hint="Optionnel — lots, shares, contrats...">
            <Input
              type="number"
              step="any"
              placeholder="ex: 0.5"
              value={lotSize}
              onChange={(e) => setLotSize(e.target.value)}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Rationnel" icon={<ScrollText size={14} />} />
        <CardBody className="space-y-5">
          <Field>
            <Textarea
              placeholder="Pourquoi tu prends ce trade ? Setup, contexte, confluences..."
              rows={4}
              value={rationnel}
              onChange={(e) => setRationnel(e.target.value)}
            />
          </Field>
          <Field label="Tags" hint="Séparés par virgule">
            <Input
              type="text"
              placeholder="breakout, news, range, trend"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="État émotionnel" icon={<Heart size={14} />} />
        <CardBody className="space-y-5">
          <EmotionPicker
            label="Avant le trade"
            value={emotionAvant}
            onChange={setEmotionAvant}
          />
          <EmotionPicker
            label="Pendant le trade"
            value={emotionPendant}
            onChange={setEmotionPendant}
          />
          <EmotionPicker
            label="Après le trade"
            value={emotionApres}
            onChange={setEmotionApres}
          />
          <Field label="Post-mortem" hint="Qu'aurais-tu pu faire mieux ? (optionnel)">
            <Textarea
              placeholder="Leçon à retenir..."
              rows={3}
              value={postMortem}
              onChange={(e) => setPostMortem(e.target.value)}
            />
          </Field>
        </CardBody>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        icon={loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        fullWidth
        size="lg"
      >
        {loading ? 'Enregistrement...' : 'Enregistrer le trade'}
      </Button>
    </form>
  )
}

function EmotionPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-2">
        {EMOTIONS.map((e) => (
          <Chip
            key={e}
            active={value === e}
            onClick={() => onChange(value === e ? '' : e)}
          >
            {e}
          </Chip>
        ))}
      </div>
    </Field>
  )
}
