'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Kpi, KpiRecord } from '@/types/database'
import { addKpiRecord, deleteKpi } from '@/app/actions/kpi'

// JST の今日を YYYY-MM-DD 形式で返す
function getTodayJst(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' })
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${y}/${m}/${d}`
}

type Props = {
  kpi: Kpi
  latestRecord: KpiRecord | undefined
  recentRecords: KpiRecord[]
}

export function KpiCard({ kpi, latestRecord, recentRecords }: Props) {
  const router = useRouter()
  const [isPendingRecord, startRecordTransition] = useTransition()
  const [isPendingDelete, startDeleteTransition] = useTransition()

  const [isRecording, setIsRecording] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [recordValue, setRecordValue] = useState('')
  const [recordMemo, setRecordMemo] = useState('')
  const [recordDate, setRecordDate] = useState(getTodayJst)
  const [recordError, setRecordError] = useState('')

  const progressPct =
    latestRecord && kpi.target_value > 0
      ? Math.min((latestRecord.value / kpi.target_value) * 100, 100)
      : 0

  function handleRecordSubmit() {
    const numValue = Number(recordValue)
    if (!recordValue || isNaN(numValue)) {
      setRecordError('数値を入力してください')
      return
    }
    setRecordError('')
    startRecordTransition(async () => {
      const result = await addKpiRecord({
        kpiId: kpi.id,
        value: numValue,
        memo: recordMemo,
        recordedAt: recordDate,
      })
      if (result.error) {
        setRecordError(result.error)
        return
      }
      setIsRecording(false)
      setRecordValue('')
      setRecordMemo('')
      setRecordDate(getTodayJst())
      router.refresh()
    })
  }

  function handleDelete() {
    if (!confirm(`「${kpi.title}」を削除しますか？\n実績データもすべて削除されます。`)) return
    startDeleteTransition(async () => {
      const result = await deleteKpi(kpi.id)
      if (result.error) {
        alert(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white">
      {/* KPI ヘッダー */}
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-stone-800">{kpi.title}</span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-500">
                {kpi.frequency === 'weekly' ? '週次' : '月次'}
              </span>
            </div>
            <div className="mt-0.5 text-xs text-stone-400">
              目標: {kpi.target_value.toLocaleString()}{kpi.unit ?? ''}
            </div>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPendingDelete}
            className="shrink-0 p-1 text-stone-300 transition-colors hover:text-red-400"
            aria-label="KPIを削除"
          >
            {isPendingDelete ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* 進捗バー */}
        <div className="mb-1 flex items-end justify-between gap-2">
          <span className="text-xl font-bold text-stone-900">
            {latestRecord
              ? `${latestRecord.value.toLocaleString()}${kpi.unit ?? ''}`
              : '—'}
          </span>
          <span className="text-sm font-medium text-green-700">{Math.round(progressPct)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-green-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {latestRecord && (
          <div className="mt-1 text-[11px] text-stone-400">
            最終記録: {formatDate(latestRecord.recorded_at)}
          </div>
        )}
      </div>

      {/* 実績入力フォーム */}
      {isRecording ? (
        <div className="border-t border-stone-100 bg-stone-50 p-4">
          <h4 className="mb-3 text-sm font-medium text-stone-700">実績を入力</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`record-value-${kpi.id}`} className="text-xs">
                  値 <span className="text-red-500">*</span>
                  {kpi.unit && <span className="ml-1 text-stone-400">({kpi.unit})</span>}
                </Label>
                <Input
                  id={`record-value-${kpi.id}`}
                  type="number"
                  value={recordValue}
                  onChange={(e) => setRecordValue(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="h-9 text-sm"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`record-date-${kpi.id}`} className="text-xs">
                  日付
                </Label>
                <Input
                  id={`record-date-${kpi.id}`}
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`record-memo-${kpi.id}`} className="text-xs">
                メモ（任意）
              </Label>
              <Textarea
                id={`record-memo-${kpi.id}`}
                value={recordMemo}
                onChange={(e) => setRecordMemo(e.target.value)}
                placeholder="気づきや状況をメモ..."
                className="min-h-16 resize-none text-sm"
              />
            </div>
            {recordError && (
              <p className="text-xs text-red-600">{recordError}</p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleRecordSubmit}
                disabled={isPendingRecord}
                className="rounded-full bg-green-800 text-white hover:bg-green-900"
              >
                {isPendingRecord ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  '保存'
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsRecording(false)
                  setRecordError('')
                }}
                disabled={isPendingRecord}
              >
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex border-t border-stone-100">
          <button
            type="button"
            onClick={() => setIsRecording(true)}
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm text-stone-500 transition-colors hover:bg-stone-50 hover:text-green-700"
          >
            <Plus className="h-3.5 w-3.5" />
            実績を入力
          </button>
          {recentRecords.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center gap-1 border-l border-stone-100 px-3 py-2.5 text-xs text-stone-400 transition-colors hover:bg-stone-50 hover:text-stone-600"
            >
              履歴
              {showHistory ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      )}

      {/* 履歴 */}
      {showHistory && recentRecords.length > 0 && (
        <div className="border-t border-stone-100 px-4 py-3">
          <div className="space-y-1.5">
            {recentRecords.map((rec) => (
              <div
                key={rec.id}
                className="flex items-baseline justify-between text-sm"
              >
                <span className="text-stone-400 text-xs">{formatDate(rec.recorded_at)}</span>
                <span className="font-medium text-stone-700">
                  {rec.value.toLocaleString()}{kpi.unit ?? ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
