'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateTradesForTarget, generateSingleDayTrades, SyntheticTrade } from '@/lib/admin/generator'
import { hasDevAdminCookie } from '@/lib/admin/dev-admin'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase
    .from('profiles')
    .select('taille_compte, risque_default_pct')
    .eq('id', user.id)
    .single()
  const { data: adminRow } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()
  const dbAdmin = Boolean((adminRow as { is_admin?: boolean } | null)?.is_admin)
  const devAdmin = await hasDevAdminCookie()
  if (!dbAdmin && !devAdmin) throw new Error('Not admin')
  if (!profile) throw new Error('Profile not found')
  return { supabase, user, profile }
}

export async function recomputeCapital() {
  const { supabase, user, profile } = await requireAdmin()
  const { data: trades } = await supabase
    .from('trades')
    .select('pnl_dollars, statut')
    .eq('user_id', user.id)
    .eq('statut', 'fermé')

  const totalPnl = (trades ?? []).reduce((sum, t) => {
    const v = Number(t.pnl_dollars ?? 0)
    return sum + (Number.isFinite(v) ? v : 0)
  }, 0)
  const capitalInitial = Number(profile.taille_compte ?? 0)
  const next = capitalInitial + totalPnl

  await supabase.from('profiles').update({ capital_actuel: next }).eq('id', user.id)
  revalidatePath('/dashboard')
  revalidatePath('/journal')
  revalidatePath('/analytics')
  revalidatePath('/admin')
  return { capitalActuel: next, totalPnl }
}

async function insertTrades(userId: string, trades: SyntheticTrade[]) {
  if (trades.length === 0) return
  const supabase = await createClient()
  const rows = trades.map((t) => ({ ...t, user_id: userId }))
  const { error } = await supabase.from('trades').insert(rows)
  if (error) throw new Error(error.message)
}

export async function generateTargetPnl(args: {
  totalPnl: number
  fromISO: string
  toISO: string
  winRate?: number
  tradesPerDayMin?: number
  tradesPerDayMax?: number
  tradeDaysRatio?: number
}) {
  const { supabase, user, profile } = await requireAdmin()
  const capital = Number(profile.taille_compte ?? 10000) || 10000
  const riskPct = Number(profile.risque_default_pct ?? 1) || 1

  const trades = generateTradesForTarget({
    userId: user.id,
    totalPnl: args.totalPnl,
    capital,
    riskPct,
    from: new Date(args.fromISO),
    to: new Date(args.toISO),
    winRate: args.winRate,
    tradesPerDay:
      args.tradesPerDayMin && args.tradesPerDayMax
        ? [args.tradesPerDayMin, args.tradesPerDayMax]
        : undefined,
    tradeDaysRatio: args.tradeDaysRatio,
  })

  await insertTrades(user.id, trades)
  const result = await recomputeCapital()
  return { inserted: trades.length, ...result }
}

export async function setDayPnl(args: {
  dayISO: string
  targetPnl: number
  count?: number
  replace?: boolean
}) {
  const { supabase, user, profile } = await requireAdmin()
  const capital = Number(profile.taille_compte ?? 10000) || 10000
  const riskPct = Number(profile.risque_default_pct ?? 1) || 1

  const day = new Date(args.dayISO)
  day.setUTCHours(0, 0, 0, 0)
  const next = new Date(day)
  next.setUTCDate(next.getUTCDate() + 1)

  if (args.replace ?? true) {
    await supabase
      .from('trades')
      .delete()
      .eq('user_id', user.id)
      .gte('date_entree', day.toISOString())
      .lt('date_entree', next.toISOString())
  }

  const trades = generateSingleDayTrades({
    userId: user.id,
    day,
    targetPnl: args.targetPnl,
    capital,
    riskPct,
    count: args.count,
  })
  await insertTrades(user.id, trades)
  const result = await recomputeCapital()
  return { inserted: trades.length, ...result }
}

export async function clearDay(dayISO: string) {
  const { supabase, user } = await requireAdmin()
  const day = new Date(dayISO)
  day.setUTCHours(0, 0, 0, 0)
  const next = new Date(day)
  next.setUTCDate(next.getUTCDate() + 1)
  await supabase
    .from('trades')
    .delete()
    .eq('user_id', user.id)
    .gte('date_entree', day.toISOString())
    .lt('date_entree', next.toISOString())
  const result = await recomputeCapital()
  return result
}

export async function adjustDayPnlDelta(args: { dayISO: string; delta: number }) {
  const { supabase, user, profile } = await requireAdmin()
  const capital = Number(profile.taille_compte ?? 10000) || 10000
  const riskPct = Number(profile.risque_default_pct ?? 1) || 1
  const day = new Date(args.dayISO)
  day.setUTCHours(0, 0, 0, 0)

  const trades = generateSingleDayTrades({
    userId: user.id,
    day,
    targetPnl: args.delta,
    capital,
    riskPct,
    count: 1,
  })
  await insertTrades(user.id, trades)
  const result = await recomputeCapital()
  return { inserted: trades.length, ...result }
}

export async function resetAllTrades() {
  const { supabase, user } = await requireAdmin()
  const { error, count } = await supabase
    .from('trades')
    .delete({ count: 'exact' })
    .eq('user_id', user.id)
  if (error) {
    console.error('[resetAllTrades] delete error:', error)
    throw new Error(`Reset failed: ${error.message}`)
  }
  console.log(`[resetAllTrades] deleted ${count ?? 0} trades for user ${user.id}`)
  const result = await recomputeCapital()
  return { ...result, deleted: count ?? 0 }
}
