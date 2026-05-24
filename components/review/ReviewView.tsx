'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Goal, Kpi, KpiRecord, MonthlyReview } from '@/types/database'
import { upsertMonthlyReview } from '@/app/actions/review'

type GoalWithKpis = Goal & { kpis: Kpi[] }

type Props = {
  goals: GoalWithKpis[]
  reviewsByGoalId: Record<string, MonthlyReview>
  latestMonthRecordsByKpiId: Record<string, KpiRecord>
  year: number
  month: number
}

function rateColor(rate: number): string {
  if (rate >= 80) return 'text-green-700'
  if (rate >= 50) return 'text-amber-600'
  return 'text-red-500'
}

export function ReviewView({
  goals,
  reviewsByGoalId,
  latestMonthRecordsByKpiId,
  year,
  month,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const firstGoalId = goals[0]?.id ?? ''
  const firstReview = reviewsByGoalId[firstGoalId]

  const [selectedGoalId, setSelectedGoalId] = useState(firstGoalId)
  const [achievementRate, setAchievementRate] = useState(firstReview?.achievement_rate ?? 0)
  const [comment, setComment] = useState(firstReview?.comment ?? '')
  const [nextAction, setNextAction] = useState(firstReview?.next_action ?? '')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function handleGoalChange(goalId: string) {
    const review = reviewsByGoalId[goalId]
    setSelectedGoalId(goalId)
    setAchievementRate(review?.achievement_rate ?? 0)
    setComment(review?.comment ?? '')
    setNextAction(review?.next_action ?? '')
    setError('')
    setSaved(false)
  }

  function handleSubmit() {
    if (!selectedGoalId) return
    setError('')
    setSaved(false)
    startTransition(async () => {
      const result = await upsertMonthlyReview({
        goalId: selectedGoalId,
        year,
        month,
        achievementRate,
        comment,
        nextAction,
      })
      if (result.error) {
        setError(result.error)
        return
      }
      setSaved(true)
      router.refresh()
    })
  }

  const selectedGoal = goals.find((g) => g.id === selectedGoalId)
  const kpis = selectedGoal?.kpis ?? []

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="mb-2 text-stone-600">レビューする目標がありません</p>
        <p className="mb-6 text-sm text-stone-400">まず目標を設定してください</p>
        <Link href="/goal/new">
          <Button className="rounded-full bg-green-800 text-white hover:bg-green-900">
            目標を設定する
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          {year}年{month}月のレビュー
        </h1>
        <p className="mt-1 text-sm text-stone-400">
          今月の達成率を振り返り、来月のアクションを決めましょう。
        </p>
      </div>

      {/* 目標セレクター（複数ある場合） */}
      {goals.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {goals.map((g) => {
            const isSelected = g.id === selectedGoalId
            const isDone = Boolean(reviewsByGoalId[g.id])
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => handleGoalChange(g.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-colors ${
                  isSelected
                    ? 'bg-green-800 text-white'
                    : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {isDone && (
                  <CheckCircle2 className={`h-3.5 w-3.5 ${isSelected ? 'text-green-300' : 'text-green-600'}`} />
                )}
                {g.title}
              </button>
            )
          })}
        </div>
      )}

      {/* KPI サマリー */}
      {kpis.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
          <h2 className="mb-3 text-sm font-medium text-stone-600">今月の KPI 実績</h2>
          <div className="space-y-3">
            {kpis.map((kpi) => {
              const record = latestMonthRecordsByKpiId[kpi.id]
              const pct =
                record && kpi.target_value > 0
                  ? Math.min((record.value / kpi.target_value) * 100, 100)
                  : 0
              return (
                <div key={kpi.id}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-sm text-stone-700">{kpi.title}</span>
                    {record ? (
                      <span className="text-sm font-semibold text-stone-800">
                        {record.value.toLocaleString()}{kpi.unit ?? ''}
                        <span className="ml-1 text-xs font-normal text-stone-400">
                          / {kpi.target_value.toLocaleString()}{kpi.unit ?? ''}
                        </span>
                      </span>
                    ) : (
                      <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] text-stone-500">
                        今月未記録
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-green-600 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* レビューフォーム */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        {/* 達成率 */}
        <div className="mb-6">
          <Label className="mb-4 block text-sm font-medium text-stone-700">
            今月の達成率
          </Label>
          <div className="flex items-center gap-4">
            <div className={`w-24 shrink-0 text-center text-5xl font-bold tabular-nums ${rateColor(achievementRate)}`}>
              {achievementRate}
              <span className="text-2xl">%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={achievementRate}
              onChange={(e) => {
                setAchievementRate(Number(e.target.value))
                setSaved(false)
              }}
              className="flex-1 accent-green-700"
            />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-stone-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* 振り返りコメント */}
          <div className="space-y-2">
            <Label htmlFor="review-comment">
              振り返り
              <span className="ml-1 font-normal text-stone-400 text-xs">— 今月うまくいったこと・課題</span>
            </Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value)
                setSaved(false)
              }}
              placeholder="例：週2回の学習は維持できたが、アウトプットが少なかった。..."
              className="min-h-28 resize-none"
            />
          </div>

          {/* 来月のアクション */}
          <div className="space-y-2">
            <Label htmlFor="review-action">
              来月のアクション
              <span className="ml-1 font-normal text-stone-400 text-xs">— 具体的に何をするか</span>
            </Label>
            <Textarea
              id="review-action"
              value={nextAction}
              onChange={(e) => {
                setNextAction(e.target.value)
                setSaved(false)
              }}
              placeholder="例：毎週日曜にブログ記事を1本投稿する。クライアントへの提案書を3件作成する。"
              className="min-h-28 resize-none"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="min-w-28 rounded-full bg-green-800 text-white hover:bg-green-900"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : reviewsByGoalId[selectedGoalId] ? (
              '更新する'
            ) : (
              'レビューを記録'
            )}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              保存しました
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
