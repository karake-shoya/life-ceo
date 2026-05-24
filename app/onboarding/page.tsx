import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/cached'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'

export default async function OnboardingPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // 既に目標がある場合はダッシュボードへ（再アクセス防止）
  const supabase = await createClient()
  const { count } = await supabase
    .from('goals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)

  if ((count ?? 0) > 0) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <OnboardingFlow />
    </div>
  )
}
