'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/cached'

type AddKpiRecordInput = {
  kpiId: string
  value: number
  memo: string
  recordedAt: string
}

type AddKpiInput = {
  goalId: string
  title: string
  targetValue: number
  unit: string
  frequency: 'weekly' | 'monthly'
}

async function verifyKpiOwnership(kpiId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: kpi } = await supabase
    .from('kpis')
    .select('goal_id')
    .eq('id', kpiId)
    .single()

  const kpiRow = kpi as { goal_id: string } | null
  if (!kpiRow) return false

  const { count } = await supabase
    .from('goals')
    .select('id', { count: 'exact', head: true })
    .eq('id', kpiRow.goal_id)
    .eq('user_id', userId)

  return (count ?? 0) > 0
}

async function verifyGoalOwnership(goalId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('goals')
    .select('id', { count: 'exact', head: true })
    .eq('id', goalId)
    .eq('user_id', userId)
  return (count ?? 0) > 0
}

export async function addKpiRecord(
  input: AddKpiRecordInput
): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: '認証エラーが発生しました' }

  const isOwner = await verifyKpiOwnership(input.kpiId, user.id)
  if (!isOwner) return { error: '権限がありません' }

  const supabase = await createClient()
  const { error } = await supabase.from('kpi_records').insert({
    kpi_id: input.kpiId,
    value: input.value,
    memo: input.memo.trim() || null,
    recorded_at: input.recordedAt,
  })

  if (error) {
    console.error('[addKpiRecord]', error.message)
    return { error: '実績の保存に失敗しました' }
  }

  return {}
}

export async function addKpi(input: AddKpiInput): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: '認証エラーが発生しました' }

  const isOwner = await verifyGoalOwnership(input.goalId, user.id)
  if (!isOwner) return { error: '権限がありません' }

  const supabase = await createClient()

  // 無料プランは目標あたり KPI 3件まで
  const profile = await supabase
    .from('profiles')
    .select('plan, trial_ends_at')
    .eq('id', user.id)
    .single()
  const profileRow = profile.data as { plan: string; trial_ends_at: string | null } | null
  const isPro =
    profileRow?.plan === 'pro' ||
    (profileRow?.trial_ends_at ? new Date(profileRow.trial_ends_at) > new Date() : false)

  if (!isPro) {
    const { count } = await supabase
      .from('kpis')
      .select('id', { count: 'exact', head: true })
      .eq('goal_id', input.goalId)
    if ((count ?? 0) >= 3) {
      return { error: '無料プランは KPI を3件まで登録できます' }
    }
  }

  const { error } = await supabase.from('kpis').insert({
    goal_id: input.goalId,
    title: input.title.trim(),
    target_value: input.targetValue,
    unit: input.unit.trim() || null,
    frequency: input.frequency,
  })

  if (error) {
    console.error('[addKpi]', error.message)
    return { error: 'KPI の追加に失敗しました' }
  }

  return {}
}

export async function deleteKpi(kpiId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: '認証エラーが発生しました' }

  const isOwner = await verifyKpiOwnership(kpiId, user.id)
  if (!isOwner) return { error: '権限がありません' }

  const supabase = await createClient()
  const { error } = await supabase.from('kpis').delete().eq('id', kpiId)

  if (error) {
    console.error('[deleteKpi]', error.message)
    return { error: 'KPI の削除に失敗しました' }
  }

  return {}
}
