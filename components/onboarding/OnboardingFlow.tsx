'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { createGoalWithKpis } from '@/app/actions/goal'

type Category = {
  id: string
  emoji: string
  label: string
  description: string
  titleTemplate: string
  valuePlaceholder: string
  unitPlaceholder: string
}

const CATEGORIES: Category[] = [
  {
    id: 'career',
    emoji: '💼',
    label: 'キャリア・昇進',
    description: '昇給・スキルアップ・転職',
    titleTemplate: '年収を目標額にする',
    valuePlaceholder: '600',
    unitPlaceholder: '万円',
  },
  {
    id: 'side',
    emoji: '🚀',
    label: '副業・起業',
    description: '副業収入・フリーランス',
    titleTemplate: '副業で月収を目標額にする',
    valuePlaceholder: '30',
    unitPlaceholder: '万円/月',
  },
  {
    id: 'habit',
    emoji: '💪',
    label: '習慣・健康',
    description: '運動・ダイエット・学習習慣',
    titleTemplate: '習慣を身につける',
    valuePlaceholder: '10',
    unitPlaceholder: 'kg減',
  },
  {
    id: 'other',
    emoji: '⭐',
    label: 'その他',
    description: '自分だけの目標を設定',
    titleTemplate: '',
    valuePlaceholder: '',
    unitPlaceholder: '',
  },
]

export function OnboardingFlow() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [step, setStep] = useState<1 | 2>(1)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [title, setTitle] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [targetUnit, setTargetUnit] = useState('')
  const [deadline, setDeadline] = useState('')
  const [error, setError] = useState('')

  function handleCategorySelect(cat: Category) {
    setSelectedCategory(cat)
    setTitle(cat.titleTemplate)
    setTargetValue(cat.valuePlaceholder)
    setTargetUnit(cat.unitPlaceholder)
    setError('')
  }

  function handleNext() {
    if (!selectedCategory) return
    setStep(2)
  }

  function handleSubmit() {
    if (!title.trim()) {
      setError('目標タイトルを入力してください')
      return
    }
    setError('')
    startTransition(async () => {
      const result = await createGoalWithKpis({
        philosophy: '',
        vision: '',
        title,
        targetValue,
        targetUnit,
        deadline,
        kpis: [],
      })
      if ('error' in result) {
        setError(result.error)
        return
      }
      router.push('/dashboard')
    })
  }

  function handleSkip() {
    router.push('/dashboard')
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12">
      {/* ロゴ */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-800">
          <span className="text-xl font-bold text-white">L</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900">LifeCEO へようこそ</h1>
        <p className="mt-1 text-sm text-stone-400">
          最初の目標を設定して、人生経営を始めましょう。
        </p>
      </div>

      {/* ステップインジケーター */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full transition-colors ${
                n <= step ? 'bg-green-800' : 'bg-stone-200'
              }`}
            />
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 className="mb-5 text-center text-base font-semibold text-stone-700">
            どのカテゴリの目標を設定しますか？
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`rounded-2xl border-2 p-5 text-left transition-all ${
                    isSelected
                      ? 'border-green-700 bg-green-50'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="mb-2 text-2xl">{cat.emoji}</div>
                  <div className={`text-sm font-semibold ${isSelected ? 'text-green-800' : 'text-stone-800'}`}>
                    {cat.label}
                  </div>
                  <div className="mt-0.5 text-xs text-stone-400">{cat.description}</div>
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-stone-400 transition-colors hover:text-stone-600"
            >
              あとで設定する
            </button>
            <Button
              onClick={handleNext}
              disabled={!selectedCategory}
              className="gap-1.5 rounded-full bg-green-800 text-white hover:bg-green-900 disabled:opacity-40"
            >
              次へ
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="mb-1 text-center text-base font-semibold text-stone-700">
            最初の目標（KGI）を設定しましょう
          </h2>
          <p className="mb-6 text-center text-sm text-stone-400">
            詳細な設定はあとから変更できます。
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ob-title">
                目標タイトル <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ob-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：副業で月収30万円を達成する"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ob-value">目標数値</Label>
                <Input
                  id="ob-value"
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="例：500000"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ob-unit">単位</Label>
                <Input
                  id="ob-unit"
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                  placeholder="例：円 / kg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>達成期限（任意）</Label>
              <DatePicker
                value={deadline}
                onChange={setDeadline}
                placeholder="期限を選択（任意）"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-stone-400 transition-colors hover:text-stone-600"
            >
              戻る
            </button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="min-w-36 rounded-full bg-green-800 text-white hover:bg-green-900"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  設定中...
                </>
              ) : (
                'LifeCEO を始める'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
