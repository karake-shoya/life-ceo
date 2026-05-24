import Link from 'next/link'
import { Goal, Kpi, KpiRecord } from '@/types/database'
import { Target, Calendar, ChevronRight } from 'lucide-react'

type Props = {
  goal: Goal & { kpis: Kpi[] | null }
  latestRecordsByKpiId: Record<string, KpiRecord>
}

// "YYYY-MM-DD" をタイムゾーン問題なく日本語表記に変換する
// new Date("YYYY-MM-DD") はUTC midnight として解釈されるためJSTで1日ずれる可能性があり使わない
function formatDateJP(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${y}年${m}月${d}日`
}

export function GoalCard({ goal, latestRecordsByKpiId }: Props) {
  const deadline = goal.deadline ? formatDateJP(goal.deadline) : null
  const kpis = goal.kpis ?? []

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      {/* 目標ヘッダー */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-800">
            <Target className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-stone-900">{goal.title}</h2>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              {deadline && (
                <span className="flex items-center gap-1 text-xs text-stone-400">
                  <Calendar className="h-3 w-3" />
                  {deadline} まで
                </span>
              )}
              {goal.target_value != null && (
                <span className="text-xs text-stone-400">
                  目標: {goal.target_value.toLocaleString()}
                  {goal.target_unit ?? ''}
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          href={`/goal/${goal.id}`}
          className="flex shrink-0 items-center gap-1 text-xs text-stone-400 transition-colors hover:text-green-700"
        >
          詳細
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* KPI一覧 */}
      {kpis.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-200 py-5 text-center text-sm text-stone-400">
          KPI がまだ設定されていません
        </div>
      ) : (
        <div className="space-y-3">
          {kpis.map((kpi) => {
            const latestRecord = latestRecordsByKpiId[kpi.id]
            const progressPct =
              latestRecord && kpi.target_value > 0
                ? Math.min((latestRecord.value / kpi.target_value) * 100, 100)
                : 0

            return (
              <div key={kpi.id} className="rounded-xl bg-stone-50 p-4">
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-stone-700">{kpi.title}</span>
                  {latestRecord ? (
                    <span className="text-sm font-semibold text-stone-900">
                      {latestRecord.value.toLocaleString()}
                      {kpi.unit ?? ''}
                      <span className="ml-1 text-xs font-normal text-stone-400">
                        / {kpi.target_value.toLocaleString()}
                        {kpi.unit ?? ''}
                      </span>
                    </span>
                  ) : (
                    <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] text-stone-500">
                      未記録
                    </span>
                  )}
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-green-600 transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] text-stone-400">
                  <span>{kpi.frequency === 'weekly' ? '週次' : '月次'}</span>
                  <span>{Math.round(progressPct)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
