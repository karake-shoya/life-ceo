'use client'

import { useState, useTransition } from 'react'
import { Loader2, CheckCircle2, Crown, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Plan = 'free' | 'pro'

type Props = {
  plan: Plan
  trialEndsAt: string | null
  hasStripeCustomer: boolean
  monthlyPriceId: string
  yearlyPriceId: string
}

async function startCheckout(priceId: string): Promise<void> {
  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId }),
  })
  const data = await res.json() as { url?: string; error?: string }
  if (data.url) window.location.href = data.url
}

async function openPortal(): Promise<void> {
  const res = await fetch('/api/stripe/portal', { method: 'POST' })
  const data = await res.json() as { url?: string; error?: string }
  if (data.url) window.location.href = data.url
}

export function PlanSection({ plan, trialEndsAt, hasStripeCustomer, monthlyPriceId, yearlyPriceId }: Props) {
  const [isPendingMonthly, startMonthly] = useTransition()
  const [isPendingYearly, startYearly] = useTransition()
  const [isPendingPortal, startPortal] = useTransition()

  const isTrial = trialEndsAt ? new Date(trialEndsAt) > new Date() : false
  const isPro = plan === 'pro' || isTrial

  // トライアル残日数
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0

  if (isPro) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-5">
          <Crown className="h-6 w-6 shrink-0 text-green-700" />
          <div className="flex-1">
            {isTrial ? (
              <>
                <p className="font-semibold text-green-900">Pro トライアル中</p>
                <p className="mt-0.5 text-sm text-green-700">
                  残り {trialDaysLeft} 日（トライアル終了後に課金開始）
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-green-900">Pro プラン</p>
                <p className="mt-0.5 text-sm text-green-700">すべての機能が利用できます</p>
              </>
            )}
          </div>
        </div>

        {hasStripeCustomer && (
          <Button
            variant="outline"
            onClick={() => startPortal(() => openPortal())}
            disabled={isPendingPortal}
            className="w-full"
          >
            {isPendingPortal ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'プランを管理する（Stripe ポータル）'
            )}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4">
        <p className="text-sm font-medium text-stone-600">現在のプラン: <span className="text-stone-900">無料</span></p>
        <p className="mt-1 text-xs text-stone-400">目標1件・KPI 3件まで利用できます</p>
      </div>

      <p className="text-sm font-semibold text-stone-700">Pro にアップグレード</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* 月払い */}
        <div className="rounded-2xl border-2 border-stone-200 p-5">
          <div className="mb-3">
            <p className="text-xs font-medium text-stone-400">月払い（先行価格）</p>
            <p className="mt-1 text-2xl font-bold text-stone-900">
              ¥480<span className="text-sm font-normal text-stone-400">/月</span>
            </p>
            <p className="mt-0.5 text-xs text-stone-400 line-through">通常 ¥980/月</p>
          </div>
          <Button
            onClick={() => startMonthly(() => startCheckout(monthlyPriceId))}
            disabled={isPendingMonthly || isPendingYearly}
            className="w-full rounded-full bg-green-800 text-white hover:bg-green-900 text-sm"
          >
            {isPendingMonthly ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              '14日間無料で試す'
            )}
          </Button>
        </div>

        {/* 年払い */}
        <div className="relative rounded-2xl border-2 border-green-700 p-5">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-green-700 px-3 py-0.5 text-[11px] font-semibold text-white">
              おすすめ
            </span>
          </div>
          <div className="mb-3">
            <p className="text-xs font-medium text-stone-400">年払い（先行価格）</p>
            <p className="mt-1 text-2xl font-bold text-stone-900">
              ¥3,800<span className="text-sm font-normal text-stone-400">/年</span>
            </p>
            <p className="mt-0.5 text-xs text-green-700 font-medium">月換算 ¥317（34%オフ）</p>
          </div>
          <Button
            onClick={() => startYearly(() => startCheckout(yearlyPriceId))}
            disabled={isPendingMonthly || isPendingYearly}
            className="w-full rounded-full bg-green-800 text-white hover:bg-green-900 text-sm"
          >
            {isPendingYearly ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              '14日間無料で試す'
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400">
        {['クレジットカード登録必要', 'トライアル中はいつでもキャンセル可', '先行価格は永久適用'].map((t) => (
          <span key={t} className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
