import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getProfile } from '@/lib/supabase/cached'
import { GoalCreateForm } from '@/components/goal/GoalCreateForm'

export default async function GoalNewPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  const plan = profile?.plan ?? 'free'
  const isTrial = profile?.trial_ends_at
    ? new Date(profile.trial_ends_at) > new Date()
    : false
  const isPro = plan === 'pro' || isTrial

  // 無料プランで目標が1件以上ある場合はダッシュボードへ
  if (!isPro) {
    const supabase = await createClient()
    const { count } = await supabase
      .from('goals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true)

    if ((count ?? 0) >= 1) {
      redirect('/dashboard')
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-8">
      <GoalCreateForm isPro={isPro} />
    </div>
  )
}
