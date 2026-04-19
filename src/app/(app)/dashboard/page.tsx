import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardView } from './dashboard-view'
import type { TradeRow } from '@/lib/trade-metrics'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  const { data: trades } = await supabase
    .from('trades')
    .select(
      'id, actif, direction, statut, date_entree, prix_entree, prix_sl, prix_tp, pnl_dollars, pnl_pct'
    )
    .eq('user_id', user.id)
    .order('date_entree', { ascending: false })

  return (
    <DashboardView
      capitalActuel={Number(profile.capital_actuel)}
      capitalInitial={Number(profile.taille_compte)}
      trades={(trades as TradeRow[] | null) ?? []}
    />
  )
}
