'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Target, Calendar, BookOpen, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Goal, Kpi, KpiRecord } from '@/types/database'
import { KpiCard } from '@/components/kpi/KpiCard'
import { addKpi } from '@/app/actions/kpi'

function formatDateJP(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${y}年${m}月${d}日`
}

type Props = {
  goal: Goal
  kpis: Kpi[]
  latestRecordsByKpiId: Record<string, KpiRecord>
  recentRecordsByKpiId: Record<string, KpiRecord[]>
  isPro: boolean
}

export function GoalDetailView({
  goal,
  kpis,
  latestRecordsByKpiId,
  recentRecordsByKpiId,
  isPro,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [showAddKpi, setShowAddKpi] = useState(false)
  const [kpiTitle, setKpiTitle] = useState('')
  const [kpiTargetValue, setKpiTargetValue] = useState('')
  const [kpiUnit, setKpiUnit] = useState('')
  const [kpiFrequency, setKpiFrequency] = useState<'weekly' | 'monthly'>('weekly')
  const [addKpiError, setAddKpiError] = useState('')

  const maxKpis = isPro ? Infinity : 3
  const canAddKpi = kpis.length < maxKpis

  function handleAddKpi() {
    if (!kpiTitle.trim()) {
      setAddKpiError('KPI名を入力してください')
      return
    }
    const numValue = Number(kpiTargetValue)
    if (!kpiTargetValue || isNaN(numValue) || numValue <= 0) {
      setAddKpiError('目標値を入力してください')
      return
    }
    setAddKpiError('')
    startTransition(async () => {
      const result = await addKpi({
        goalId: goal.id,
        title: kpiTitle,
        targetValue: numValue,
        unit: kpiUnit,
        frequency: kpiFrequency,
      })
      if (result.error) {
        setAddKpiError(result.error)
        return
      }
      setShowAddKpi(false)
      setKpiTitle('')
      setKpiTargetValue('')
      setKpiUnit('')
      setKpiFrequency('weekly')
      router.refresh()
    })
  }

  const deadline = goal.deadline ? formatDateJP(goal.deadline) : null

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone-400 transition-colors hover:text-stone-700"
        >
          <ArrowLeft className="h-4 w-4" />
          ダッシュボード
        </Link>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-800">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-stone-900">{goal.title}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              {deadline && (
                <span className="flex items-center gap-1 text-xs text-stone-400">
                  <Calendar className="h-3 w-3" />
                  {deadline} まで
                </span>
              )}
              {goal.target_value != null && (
                <span className="text-xs text-stone-400">
                  KGI: {goal.target_value.toLocaleString()}
                  {goal.target_unit ?? ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 理念・ビジョン */}
      {(goal.philosophy || goal.vision) && (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-stone-600">
            <BookOpen className="h-4 w-4" />
            理念・ビジョン
          </div>
          {goal.philosophy && (
            <div className="mb-3">
              <div className="mb-1 text-xs font-medium text-stone-400">理念</div>
              <p className="text-sm leading-relaxed text-stone-700">{goal.philosophy}</p>
            </div>
          )}
          {goal.vision && (
            <div>
              <div className="mb-1 text-xs font-medium text-stone-400">ビジョン</div>
              <p className="text-sm leading-relaxed text-stone-700">{goal.vision}</p>
            </div>
          )}
        </div>
      )}

      {/* KPI セクション */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">KPI</h2>
          {!isPro && (
            <span className="text-xs text-stone-400">{kpis.length} / 3</span>
          )}
        </div>

        {kpis.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 py-10 text-center">
            <p className="text-sm text-stone-400">KPI がまだ設定されていません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {kpis.map((kpi) => (
              <KpiCard
                key={kpi.id}
                kpi={kpi}
                latestRecord={latestRecordsByKpiId[kpi.id]}
                recentRecords={recentRecordsByKpiId[kpi.id] ?? []}
              />
            ))}
          </div>
        )}

        {/* KPI 追加フォーム */}
        {canAddKpi && (
          <div className="mt-3">
            {showAddKpi ? (
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <h3 className="mb-4 text-sm font-medium text-stone-700">KPIを追加</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="add-kpi-title" className="text-xs">
                      KPI名 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="add-kpi-title"
                      value={kpiTitle}
                      onChange={(e) => setKpiTitle(e.target.value)}
                      placeholder="例：新規クライアント獲得数"
                      className="h-9 text-sm"
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="add-kpi-value" className="text-xs">
                        目標値 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="add-kpi-value"
                        type="number"
                        value={kpiTargetValue}
                        onChange={(e) => setKpiTargetValue(e.target.value)}
                        placeholder="0"
                        min="0"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="add-kpi-unit" className="text-xs">単位</Label>
                      <Input
                        id="add-kpi-unit"
                        value={kpiUnit}
                        onChange={(e) => setKpiUnit(e.target.value)}
                        placeholder="件 / 円"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">計測頻度</Label>
                    <div className="flex overflow-hidden rounded-lg border border-stone-200">
                      <button
                        type="button"
                        onClick={() => setKpiFrequency('weekly')}
                        className={`flex-1 py-1.5 text-sm transition-colors ${
                          kpiFrequency === 'weekly'
                            ? 'bg-green-800 text-white'
                            : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        週次
                      </button>
                      <button
                        type="button"
                        onClick={() => setKpiFrequency('monthly')}
                        className={`flex-1 py-1.5 text-sm transition-colors ${
                          kpiFrequency === 'monthly'
                            ? 'bg-green-800 text-white'
                            : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        月次
                      </button>
                    </div>
                  </div>
                  {addKpiError && (
                    <p className="text-xs text-red-600">{addKpiError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddKpi}
                      disabled={isPending}
                      className="rounded-full bg-green-800 text-white hover:bg-green-900"
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        '追加'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddKpi(false)
                        setAddKpiError('')
                      }}
                      disabled={isPending}
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddKpi(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 py-3 text-sm text-stone-500 transition-colors hover:border-green-700 hover:text-green-700"
              >
                <Plus className="h-4 w-4" />
                KPIを追加する
              </button>
            )}
          </div>
        )}

        {/* 無料プラン上限メッセージ */}
        {!canAddKpi && !isPro && (
          <div className="mt-3 rounded-xl border border-dashed border-stone-200 p-4 text-center">
            <p className="text-xs text-stone-500">
              無料プランは KPI を3件まで登録できます
            </p>
            <Link href="/settings">
              <Button
                size="sm"
                className="mt-2 rounded-full bg-green-800 text-white hover:bg-green-900 text-xs"
              >
                Pro にアップグレード
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
