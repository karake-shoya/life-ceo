import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getProfile } from '@/lib/supabase/cached'
import { Goal, Kpi, KpiRecord, MonthlyReview } from '@/types/database'
import { ReviewView } from '@/components/review/ReviewView'
import { Button } from '@/components/ui/button'

type GoalWithKpis = Goal & { kpis: Kpi[] }

function getJstYearMonth(): { year: number; month: number } {
  const now = new Date()
  const jstStr = now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
  const jstDate = new Date(jstStr)
  return { year: jstDate.getFullYear(), month: jstDate.getMonth() + 1 }
}

export default async function ReviewPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  const plan = profile?.plan ?? 'free'
  const isTrial = profile?.trial_ends_at
    ? new Date(profile.trial_ends_at) > new Date()
    : false
  const isPro = plan === 'pro' || isTrial

  if (!isPro) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-green-100 bg-green-50">
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-stone-900">月次レビューは Pro プランの機能です</h2>
        <p className="mb-6 max-w-xs text-sm leading-relaxed text-stone-500">
          月次レビューで振り返りの習慣をつくり、
          <br />
          目標達成率を高めましょう。
        </p>
        <Link href="/settings">
          <Button className="rounded-full bg-green-800 text-white hover:bg-green-900">
            Pro にアップグレード
          </Button>
        </Link>
      </div>
    )
  }

  const { year, month } = getJstYearMonth()
  const supabase = await createClient()

  const { data: goalsData } = await supabase
    .from('goals')
    .select('*, kpis(*)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const goals = (goalsData ?? []) as GoalWithKpis[]
  const goalIds = goals.map((g) => g.id)
  const kpiIds = goals.flatMap((g) => (g.kpis ?? []).map((k) => k.id))

  // 今月のレビューを取得
  const reviewsByGoalId: Record<string, MonthlyReview> = {}
  if (goalIds.length > 0) {
    const { data: reviews } = await supabase
      .from('monthly_reviews')
      .select('*')
      .in('goal_id', goalIds)
      .eq('year', year)
      .eq('month', month)
    for (const review of (reviews ?? []) as MonthlyReview[]) {
      reviewsByGoalId[review.goal_id] = review
    }
  }

  // 今月の KPI 実績（最新値）を取得
  const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const startOfNextMonth = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

  const latestMonthRecordsByKpiId: Record<string, KpiRecord> = {}
  if (kpiIds.length > 0) {
    const { data: records } = await supabase
      .from('kpi_records')
      .select('*')
      .in('kpi_id', kpiIds)
      .gte('recorded_at', startOfMonth)
      .lt('recorded_at', startOfNextMonth)
      .order('recorded_at', { ascending: false })
      .order('created_at', { ascending: false })
    for (const record of (records ?? []) as KpiRecord[]) {
      if (!latestMonthRecordsByKpiId[record.kpi_id]) {
        latestMonthRecordsByKpiId[record.kpi_id] = record
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
      <ReviewView
        goals={goals}
        reviewsByGoalId={reviewsByGoalId}
        latestMonthRecordsByKpiId={latestMonthRecordsByKpiId}
        year={year}
        month={month}
      />
    </div>
  )
}
