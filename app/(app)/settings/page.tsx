import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getProfile } from '@/lib/supabase/cached'
import { ProfileSection } from '@/components/settings/ProfileSection'
import { PlanSection } from '@/components/settings/PlanSection'
import { PlanType } from '@/types/database'

type Props = {
  searchParams: Promise<{ checkout?: string }>
}

export default async function SettingsPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)

  const supabase = await createClient()
  const { data: fullProfileData } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()
  const fullProfile = fullProfileData as { stripe_customer_id: string | null } | null

  const { checkout } = await searchParams

  return (
    <div className="mx-auto max-w-xl px-4 py-8 md:px-8">
      <h1 className="mb-8 text-2xl font-bold text-stone-900">設定</h1>

      {/* Checkout 成功バナー */}
      {checkout === 'success' && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
          🎉 Pro プランへのアップグレードが完了しました！
        </div>
      )}

      {/* プロフィール */}
      <section className="mb-8">
        <h2 className="mb-4 text-base font-semibold text-stone-900">プロフィール</h2>
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <ProfileSection
            displayName={profile?.display_name ?? null}
            email={user.email ?? ''}
          />
        </div>
      </section>

      {/* プラン */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-stone-900">プラン</h2>
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <PlanSection
            plan={(profile?.plan ?? 'free') as PlanType}
            trialEndsAt={profile?.trial_ends_at ?? null}
            hasStripeCustomer={Boolean(fullProfile?.stripe_customer_id)}
            monthlyPriceId={process.env.STRIPE_MONTHLY_PRICE_ID ?? ''}
            yearlyPriceId={process.env.STRIPE_YEARLY_PRICE_ID ?? ''}
          />
        </div>
      </section>
    </div>
  )
}
