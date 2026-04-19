import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { JournalView } from './journal-view'
import type { TradeRow } from '@/lib/trade-metrics'

export default async function JournalPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: trades } = await supabase
    .from('trades')
    .select(
      'id, actif, direction, statut, date_entree, prix_entree, prix_sl, prix_tp, pnl_dollars, pnl_pct'
    )
    .eq('user_id', user.id)
    .order('date_entree', { ascending: false })

  return <JournalView trades={(trades as TradeRow[] | null) ?? []} />
}
