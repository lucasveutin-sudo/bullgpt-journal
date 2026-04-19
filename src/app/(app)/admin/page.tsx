import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { TradeRow } from '@/lib/trade-metrics'
import { hasDevAdminCookie } from '@/lib/admin/dev-admin'
import AdminPanel from './admin-panel'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('capital_actuel, taille_compte, risque_default_pct')
    .eq('id', user.id)
    .single()

  const { data: adminRow } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()
  const dbAdmin = Boolean((adminRow as { is_admin?: boolean } | null)?.is_admin)
  const devAdmin = await hasDevAdminCookie()
  if (!dbAdmin && !devAdmin) redirect('/dashboard')

  const { data: trades } = await supabase
    .from('trades')
    .select('id, actif, direction, statut, date_entree, prix_entree, prix_sl, prix_tp, pnl_dollars, pnl_pct')
    .eq('user_id', user.id)
    .order('date_entree', { ascending: true })

  return (
    <AdminPanel
      capitalActuel={Number(profile?.capital_actuel ?? 0)}
      capitalInitial={Number(profile?.taille_compte ?? 0)}
      riskDefault={Number(profile?.risque_default_pct ?? 1)}
      trades={(trades ?? []) as TradeRow[]}
    />
  )
}
