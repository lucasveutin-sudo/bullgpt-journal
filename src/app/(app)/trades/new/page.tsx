import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewTradeForm from './new-trade-form'

export default async function NewTradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('actifs_trades')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">
          Nouveau trade
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Enregistre ta position et ton raisonnement.
        </p>
      </header>

      <NewTradeForm actifsFavoris={profile?.actifs_trades ?? []} />
    </div>
  )
}
