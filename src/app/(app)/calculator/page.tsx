import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CalculatorForm from './calculator-form'

export default async function CalculatorPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('capital_actuel, risque_default_pct')
    .eq('id', user.id)
    .single()

  return (
    <CalculatorForm
      defaultCapital={Number(profile?.capital_actuel ?? 0)}
      defaultRisque={Number(profile?.risque_default_pct ?? 1)}
    />
  )
}
