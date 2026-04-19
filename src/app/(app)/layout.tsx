import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Shell } from '@/components/app-shell/shell'
import { hasDevAdminCookie } from '@/lib/admin/dev-admin'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  const { data: adminRow } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  const dbAdmin = Boolean((adminRow as { is_admin?: boolean } | null)?.is_admin)
  const devAdmin = await hasDevAdminCookie()

  return (
    <Shell email={user.email ?? 'utilisateur'} isAdmin={dbAdmin || devAdmin}>
      {children}
    </Shell>
  )
}
