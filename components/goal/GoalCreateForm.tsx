'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { createGoalWithKpis } from '@/app/actions/goal'

type KpiField = {
  id: string
  title: string
  targetValue: string
  unit: string
  frequency: 'weekly' | 'monthly'
}

const STEPS = ['理念・ビジョン', 'KGI（目標）', 'KPI設定'] as const

function generateId() {
  return Math.random().toString(36).slice(2)
}

function makeEmptyKpi(): KpiField {
  return { id: generateId(), title: '', targetValue: '', unit: '', frequency: 'weekly' }
}

type Props = {
  isPro: boolean
}

export function GoalCreateForm({ isPro }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [step, setStep] = useState(1)
  const [philosophy, setPhilosophy] = useState('')
  const [vision, setVision] = useState('')
  const [title, setTitle] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [targetUnit, setTargetUnit] = useState('')
  const [deadline, setDeadline] = useState('')
  const [kpis, setKpis] = useState<KpiField[]>([makeEmptyKpi()])
  const [error, setError] = useState('')

  const maxKpis = isPro ? 20 : 3

  function addKpi() {
    if (kpis.length >= maxKpis) return
    setKpis((prev) => [...prev, makeEmptyKpi()])
  }

  function removeKpi(id: string) {
    setKpis((prev) => prev.filter((k) => k.id !== id))
  }

  function updateKpi(id: string, field: keyof Omit<KpiField, 'id'>, value: string) {
    setKpis((prev) => prev.map((k) => (k.id === id ? { ...k, [field]: value } : k)))
  }

  function handleNext() {
    if (step === 2 && !title.trim()) {
      setError('目標タイトルを入力してください')
      return
    }
    setError('')
    setStep((s) => s + 1)
  }

  function handleBack() {
    setError('')
    setStep((s) => s - 1)
  }

  function handleSubmit() {
    setError('')
    startTransition(async () => {
      const result = await createGoalWithKpis({
        philosophy,
        vision,
        title,
        targetValue,
        targetUnit,
        deadline,
        kpis: kpis.map(({ title, targetValue, unit, frequency }) => ({
          title,
          targetValue,
          unit,
          frequency,
        })),
      })
      if ('error' in result) {
        setError(result.error)
        return
      }
      router.push('/dashboard')
    })
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">目標を設定する</h1>
        <p className="mt-1 text-sm text-stone-400">
          理念からKPIまで、3ステップで人生の目標を経営する。
        </p>
      </div>

      {/* ステップインジケーター */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1
          const active = n === step
          const done = n < step
          return (
            <div key={n} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    done
                      ? 'bg-green-800 text-white'
                      : active
                        ? 'bg-green-800 text-white'
                        : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {done ? '✓' : n}
                </div>
                <span
                  className={`text-sm ${active ? 'font-medium text-stone-900' : 'text-stone-400'}`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-6 ${done ? 'bg-green-800' : 'bg-stone-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* ステップコンテンツ */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 font-semibold text-stone-900">理念・ビジョン（任意）</h2>
              <p className="mb-5 text-sm leading-relaxed text-stone-500">
                「なぜその目標を目指すのか」を言語化することで、行動の根拠が明確になります。
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="philosophy">
                理念
                <span className="ml-1 text-xs font-normal text-stone-400">— 大切にする価値観</span>
              </Label>
              <Textarea
                id="philosophy"
                value={philosophy}
                onChange={(e) => setPhilosophy(e.target.value)}
                placeholder="例：家族との時間を大切にしながら、自分らしいキャリアを築く"
                className="min-h-24 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vision">
                ビジョン
                <span className="ml-1 text-xs font-normal text-stone-400">— 3〜5年後の姿</span>
              </Label>
              <Textarea
                id="vision"
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="例：副業収入が月30万円を超え、本業と並行して自分のブランドを持っている"
                className="min-h-24 resize-none"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="mb-1 font-semibold text-stone-900">KGI（重要目標指標）</h2>
              <p className="text-sm text-stone-500">達成したい具体的な目標を数値で設定します。</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-title">
                目標タイトル <span className="text-red-500">*</span>
              </Label>
              <Input
                id="goal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：副業収入で年収を1.5倍にする"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="target-value">目標数値</Label>
                <Input
                  id="target-value"
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="例：500000"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-unit">単位</Label>
                <Input
                  id="target-unit"
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                  placeholder="例：円 / kg / 件"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>達成期限</Label>
              <DatePicker
                value={deadline}
                onChange={setDeadline}
                placeholder="期限を選択（任意）"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="mb-1 font-semibold text-stone-900">KPI設定</h2>
                <p className="text-sm text-stone-500">
                  KGIを達成するための先行指標を設定します。
                  {!isPro && (
                    <span className="ml-1 text-stone-400">（無料プランは最大3件）</span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {kpis.map((kpi, index) => (
                <div key={kpi.id} className="rounded-xl border border-stone-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-stone-500">KPI {index + 1}</span>
                    {kpis.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKpi(kpi.id)}
                        className="text-stone-400 transition-colors hover:text-red-500"
                        aria-label="KPIを削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor={`kpi-title-${kpi.id}`} className="text-xs">
                        KPI名
                      </Label>
                      <Input
                        id={`kpi-title-${kpi.id}`}
                        value={kpi.title}
                        onChange={(e) => updateKpi(kpi.id, 'title', e.target.value)}
                        placeholder="例：新規クライアント獲得数"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`kpi-value-${kpi.id}`} className="text-xs">
                          目標値
                        </Label>
                        <Input
                          id={`kpi-value-${kpi.id}`}
                          type="number"
                          value={kpi.targetValue}
                          onChange={(e) => updateKpi(kpi.id, 'targetValue', e.target.value)}
                          placeholder="0"
                          min="0"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`kpi-unit-${kpi.id}`} className="text-xs">
                          単位
                        </Label>
                        <Input
                          id={`kpi-unit-${kpi.id}`}
                          value={kpi.unit}
                          onChange={(e) => updateKpi(kpi.id, 'unit', e.target.value)}
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
                          onClick={() => updateKpi(kpi.id, 'frequency', 'weekly')}
                          className={`flex-1 py-1.5 text-sm transition-colors ${
                            kpi.frequency === 'weekly'
                              ? 'bg-green-800 text-white'
                              : 'text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          週次
                        </button>
                        <button
                          type="button"
                          onClick={() => updateKpi(kpi.id, 'frequency', 'monthly')}
                          className={`flex-1 py-1.5 text-sm transition-colors ${
                            kpi.frequency === 'monthly'
                              ? 'bg-green-800 text-white'
                              : 'text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          月次
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {kpis.length < maxKpis && (
              <button
                type="button"
                onClick={addKpi}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 py-3 text-sm text-stone-500 transition-colors hover:border-green-700 hover:text-green-700"
              >
                <Plus className="h-4 w-4" />
                KPIを追加する
              </button>
            )}
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* ナビゲーションボタン */}
      <div className="mt-5 flex justify-between">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isPending}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            戻る
          </Button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <Button
            onClick={handleNext}
            className="gap-1.5 rounded-full bg-green-800 text-white hover:bg-green-900"
          >
            次へ
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
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
            ) : (
              '目標を作成する'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
