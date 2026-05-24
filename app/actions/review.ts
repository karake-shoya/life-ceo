'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/cached'

type UpsertMonthlyReviewInput = {
  goalId: string
  year: number
  month: number
  achievementRate: number
  comment: string
  nextAction: string
}

export async function upsertMonthlyReview(
  input: UpsertMonthlyReviewInput
): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: '認証エラーが発生しました' }

  const supabase = await createClient()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('plan, trial_ends_at')
    .eq('id', user.id)
    .single()
  const profile = profileData as { plan: string; trial_ends_at: string | null } | null
  const isPro =
    profile?.plan === 'pro' ||
    (profile?.trial_ends_at ? new Date(profile.trial_ends_at) > new Date() : false)
  if (!isPro) return { error: '月次レビューは Pro プランの機能です' }

  const { count } = await supabase
    .from('goals')
    .select('id', { count: 'exact', head: true })
    .eq('id', input.goalId)
    .eq('user_id', user.id)
  if (!count) return { error: '権限がありません' }

  const { error } = await supabase.from('monthly_reviews').upsert(
    {
      goal_id: input.goalId,
      year: input.year,
      month: input.month,
      achievement_rate: input.achievementRate,
      comment: input.comment.trim() || null,
      next_action: input.nextAction.trim() || null,
    },
    { onConflict: 'goal_id,year,month' }
  )

  if (error) {
    console.error('[upsertMonthlyReview]', error.message)
    return { error: 'レビューの保存に失敗しました' }
  }

  return {}
}
