import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getProfile } from '@/lib/supabase/cached'
import { Goal, Kpi, KpiRecord } from '@/types/database'
import { GoalCard } from '@/components/goal/GoalCard'
import { Button } from '@/components/ui/button'
import { Plus, Bell, Target } from 'lucide-react'

type GoalWithKpis = Goal & { kpis: Kpi[] }

// JST のその日の日 (1-31) を返す
function getJstDate(): { day: number; dateStr: string } {
  const now = new Date()
  // UTC に +9h 加算して UTC 関数で JST の日付を取得
  const jstMs = now.getTime() + 9 * 60 * 60 * 1000
  const day = new Date(jstMs).getUTCDate()
  const dateStr = now.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tokyo',
  })
  return { day, dateStr }
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // キャッシュ済みプロフィール（layout との二重クエリを排除）
  const profile = await getProfile(user.id)
  const plan = profile?.plan ?? 'free'

  // トライアル期間中は Pro 扱い
  const isTrial = profile?.trial_ends_at
    ? new Date(profile.trial_ends_at) > new Date()
    : false
  const isPro = plan === 'pro' || isTrial

  const supabase = await createClient()

  // 目標（KPI付き）取得
  const { data: goalsData, error: goalsError } = await supabase
    .from('goals')
    .select('*, kpis(*)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (goalsError) {
    console.error('[dashboard] goals fetch error:', goalsError.message)
  }

  const goals = (goalsData ?? []) as GoalWithKpis[]

  // 全KPIの最新実績を一括取得（kpis が null の場合も安全に処理）
  const kpiIds = goals.flatMap((g) => (g.kpis ?? []).map((k) => k.id))
  const latestRecordsByKpiId: Record<string, KpiRecord> = {}

  if (kpiIds.length > 0) {
    const { data: records, error: recordsError } = await supabase
      .from('kpi_records')
      .select('*')
      .in('kpi_id', kpiIds)
      .order('recorded_at', { ascending: false })
      .order('created_at', { ascending: false }) // 同日複数レコード時の決定的ソート

    if (recordsError) {
      console.error('[dashboard] kpi_records fetch error:', recordsError.message)
    }

    for (const record of (records ?? []) as KpiRecord[]) {
      if (!latestRecordsByKpiId[record.kpi_id]) {
        latestRecordsByKpiId[record.kpi_id] = record
      }
    }
  }

  // JST で月末バナー判定（UTC のまま getDate() すると最大9時間ずれる）
  const { day: jstDay, dateStr } = getJstDate()
  const showReviewBanner = jstDay >= 25 && goals.length > 0

  // 無料プランは目標1件まで
  const canAddGoal = isPro || goals.length < 1

  return (
    <div className="px-4 py-8 md:px-8">
      {/* ヘッダー */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">ダッシュボード</h1>
          <p className="mt-0.5 text-sm text-stone-400">{dateStr}</p>
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
              {new Date().toLocaleDateString('ja-JP', { month: 'long', timeZone: 'Asia/Tokyo' })}の月次レビューを記録しましょう
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
