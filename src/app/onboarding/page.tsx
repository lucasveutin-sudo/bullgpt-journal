'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button, Field, Input, Textarea, Chip } from '@/components/ui'

const ACTIFS = ['Forex', 'Crypto', 'Actions', 'Indices', 'Matières premières']
const NIVEAUX = ['débutant', 'intermédiaire', 'avancé', 'expert'] as const
const TOTAL_STEPS = 5

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [broker, setBroker] = useState('')
  const [actifs, setActifs] = useState<string[]>([])
  const [niveau, setNiveau] = useState<string>('')
  const [objectif, setObjectif] = useState('')
  const [tailleCompte, setTailleCompte] = useState('')
  const [risquePct, setRisquePct] = useState('1')

  function toggleActif(a: string) {
    setActifs((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('Utilisateur non connecté')
      setLoading(false)
      return
    }

    const taille = parseFloat(tailleCompte)
    const risque = parseFloat(risquePct)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        broker_ou_propfirm: broker,
        actifs_trades: actifs,
        niveau,
        objectif,
        taille_compte: taille,
        capital_actuel: taille,
        risque_default_pct: risque,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    await supabase.from('capital_snapshots').insert({
      user_id: user.id,
      solde: taille,
    })

    router.push('/dashboard')
    router.refresh()
  }

  const canNext = () => {
    if (step === 1) return broker.trim().length > 0
    if (step === 2) return actifs.length > 0
    if (step === 3) return niveau !== ''
    if (step === 4) return objectif.trim().length > 0
    if (step === 5) return parseFloat(tailleCompte) > 0 && parseFloat(risquePct) > 0
    return false
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-10">
          <div className="flex gap-1.5 mb-3">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i < step
                    ? 'bg-emerald-500'
                    : i === step
                      ? 'bg-emerald-500 shadow-glow-brand'
                      : 'bg-zinc-900'
                }`}
              />
            ))}
          </div>
          <p className="label-tiny">
            Étape {step} / {TOTAL_STEPS}
          </p>
        </div>

        <div className="animate-fade-in-up" key={step}>
          {step === 1 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100 mb-2">
                Ton broker ou propfirm ?
              </h2>
              <p className="text-sm text-zinc-500 mb-6">Avec qui tu trades actuellement.</p>
              <Field>
                <Input
                  autoFocus
                  type="text"
                  placeholder="ex: FTMO, IC Markets, MyForexFunds..."
                  value={broker}
                  onChange={(e) => setBroker(e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100 mb-2">
                Quels actifs tu trades ?
              </h2>
              <p className="text-sm text-zinc-500 mb-6">Sélectionnes-en au moins un.</p>
              <div className="flex flex-wrap gap-2">
                {ACTIFS.map((a) => (
                  <Chip key={a} active={actifs.includes(a)} onClick={() => toggleActif(a)}>
                    {actifs.includes(a) && <Check size={14} />}
                    {a}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100 mb-2">
                Ton niveau ?
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                Sois honnête, ça nous aide à t&apos;accompagner.
              </p>
              <div className="space-y-2">
                {NIVEAUX.map((n) => {
                  const active = niveau === n
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNiveau(n)}
                      className={`w-full px-4 h-12 rounded-lg border text-left capitalize flex items-center justify-between transition-all ${
                        active
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                          : 'bg-zinc-950/60 border-zinc-900 hover:border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <span className="font-medium">{n}</span>
                      {active && <Check size={16} className="text-emerald-400" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100 mb-2">
                Ton objectif ?
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                Qu&apos;est-ce que tu cherches à accomplir ?
              </p>
              <Field>
                <Textarea
                  autoFocus
                  placeholder="ex: Devenir rentable, passer un challenge propfirm, gérer 10k$ en live..."
                  value={objectif}
                  onChange={(e) => setObjectif(e.target.value)}
                  rows={5}
                />
              </Field>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100 mb-2">
                Ton compte de trading
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                On initialise ton journal avec ces infos.
              </p>
              <div className="space-y-5">
                <Field label="Taille du compte ($)">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="10000"
                    value={tailleCompte}
                    onChange={(e) => setTailleCompte(e.target.value)}
                  />
                </Field>
                <Field label="Risque par défaut par trade (%)" hint="Typiquement 0.5 à 2%">
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    placeholder="1"
                    value={risquePct}
                    onChange={(e) => setRisquePct(e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button
              variant="secondary"
              onClick={() => setStep(step - 1)}
              icon={<ArrowLeft size={16} />}
            >
              Retour
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              iconRight={<ArrowRight size={16} />}
              fullWidth
            >
              Continuer
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canNext() || loading}
              icon={loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              fullWidth
            >
              {loading ? 'Enregistrement...' : 'Terminer'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
