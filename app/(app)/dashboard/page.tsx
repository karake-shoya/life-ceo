import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Goal, Kpi, KpiRecord, Profile } from '@/types/database'
import { GoalCard } from '@/components/goal/GoalCard'
import { Button } from '@/components/ui/button'
import { Plus, Bell, Target } from 'lucide-react'

type GoalWithKpis = Goal & { kpis: Kpi[] }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // プロフィール取得
  const { data: profileData } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const profile = profileData as Pick<Profile, 'plan'> | null
  const plan = profile?.plan ?? 'free'

  // 目標（KPI付き）取得
  const { data: goalsData } = await supabase
    .from('goals')
    .select('*, kpis(*)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const goals = (goalsData ?? []) as GoalWithKpis[]

  // 全KPIの最新実績を一括取得
  const kpiIds = goals.flatMap((g) => g.kpis.map((k) => k.id))
  const latestRecordsByKpiId: Record<string, KpiRecord> = {}

  if (kpiIds.length > 0) {
    const { data: records } = await supabase
      .from('kpi_records')
      .select('*')
      .in('kpi_id', kpiIds)
      .order('recorded_at', { ascending: false })

    for (const record of (records ?? []) as KpiRecord[]) {
      if (!latestRecordsByKpiId[record.kpi_id]) {
        latestRecordsByKpiId[record.kpi_id] = record
      }
    }
  }

  // 月末（25日以降）かつ目標あり → レビュー促進バナーを表示
  const today = new Date()
  const showReviewBanner = today.getDate() >= 25 && goals.length > 0

  // 無料プランは目標1件まで
  const canAddGoal = plan === 'pro' || goals.length < 1

  return (
    <div className="px-4 py-8 md:px-8">
      {/* ヘッダー */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">ダッシュボード</h1>
          <p className="mt-0.5 text-sm text-stone-400">
            {today.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        {canAddGoal && (
          <Link href="/goal/new">
            <Button className="rounded-full bg-green-800 text-white hover:bg-green-900 gap-2">
              <Plus className="h-4 w-4" />
              目標を追加
            </Button>
          </Link>
        )}
      </div>

      {/* 月次レビュー促進バナー */}
      {showReviewBanner && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">
              {today.getMonth() + 1}月の月次レビューを記録しましょう
            </p>
            <p className="mt-0.5 text-xs text-green-700">
              今月の達成率を振り返り、来月のアクションを決める時期です。
            </p>
          </div>
          <Link href="/review">
            <Button
              size="sm"
              className="shrink-0 rounded-full bg-green-700 text-white hover:bg-green-800 text-xs"
            >
              レビューを書く
            </Button>
          </Link>
        </div>
      )}

      {/* 目標一覧 */}
      {goals.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-5">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              latestRecordsByKpiId={latestRecordsByKpiId}
            />
          ))}

          {/* 無料プラン制限メッセージ */}
          {!canAddGoal && (
            <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center">
              <p className="text-sm font-medium text-stone-600">
                目標を追加するには Pro プランが必要です
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Pro プランでは目標・KPI を無制限に登録できます
              </p>
              <Link href="/settings">
                <Button
                  size="sm"
                  className="mt-4 rounded-full bg-green-800 text-white hover:bg-green-900"
                >
                  Pro にアップグレード
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-green-100 bg-green-50">
        <Target className="h-7 w-7 text-green-800" />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-stone-900">最初の目標を設定しましょう</h2>
      <p className="mb-6 max-w-xs text-sm leading-relaxed text-stone-400">
        理念・ビジョン・KGIを設定して、
        <br />
        あなたの人生経営を始めましょう。
      </p>
      <Link href="/goal/new">
        <Button className="rounded-full bg-green-800 text-white hover:bg-green-900 gap-2">
          <Plus className="h-4 w-4" />
          目標を設定する
        </Button>
      </Link>
    </div>
  )
}
