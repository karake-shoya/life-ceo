'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/cached'

type KpiInput = {
  title: string
  targetValue: string
  unit: string
  frequency: 'weekly' | 'monthly'
}

type GoalInput = {
  philosophy: string
  vision: string
  title: string
  targetValue: string
  targetUnit: string
  deadline: string
  kpis: KpiInput[]
}

type Result = { goalId: string } | { error: string }

export async function createGoalWithKpis(input: GoalInput): Promise<Result> {
  const user = await getCurrentUser()
  if (!user) return { error: '認証エラーが発生しました' }

  const supabase = await createClient()

  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      philosophy: input.philosophy.trim() || null,
      vision: input.vision.trim() || null,
      target_value: input.targetValue ? Number(input.targetValue) : null,
      target_unit: input.targetUnit.trim() || null,
      deadline: input.deadline || null,
      is_active: true,
    })
    .select('id')
    .single()

  if (goalError) {
    console.error('[createGoalWithKpis] goal error:', goalError.message)
    return { error: '目標の作成に失敗しました' }
  }

  // タイトルと目標値が揃っているKPIのみ登録
  const validKpis = input.kpis.filter((k) => k.title.trim() && k.targetValue)
  if (validKpis.length > 0) {
    const { error: kpiError } = await supabase.from('kpis').insert(
      validKpis.map((kpi) => ({
        goal_id: goal.id,
        title: kpi.title.trim(),
        target_value: Number(kpi.targetValue),
        unit: kpi.unit.trim() || null,
        frequency: kpi.frequency,
      }))
    )
    if (kpiError) {
      console.error('[createGoalWithKpis] kpi error:', kpiError.message)
    }
  }

  return { goalId: goal.id }
}
