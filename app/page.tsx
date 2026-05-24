import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Target, TrendingUp, BarChart3, CheckCircle2 } from 'lucide-react'

const FEATURES = [
  {
    icon: Target,
    title: '理念・ビジョンから設計',
    description: '「なぜやるのか」から始める目標設定。価値観・ビジョン・KGIを一貫させて人生の方向性を明確にします。',
  },
  {
    icon: TrendingUp,
    title: 'KPIで進捗を数値管理',
    description: '目標を週次・月次のKPIに分解。数値で進捗を追うことで、今週やるべきことが一目でわかります。',
  },
  {
    icon: BarChart3,
    title: '月次レビューで軌道修正',
    description: '毎月の振り返りで達成率を確認し、次のアクションを決める。PDCAを回し続ける仕組みを提供します。',
  },
]

const PLAN_FEATURES = {
  free: ['目標（KGI）1件', 'KPI 3件/目標', 'KPI実績入力'],
  pro: ['目標（KGI）無制限', 'KPI 無制限', 'KPI実績入力', '月次レビュー', 'データエクスポート'],
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ナビゲーション */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-lg font-bold tracking-tight">LifeCEO</span>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">ログイン</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">無料で始める</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ヒーロー */}
        <section className="mx-auto max-w-5xl px-4 py-24 text-center">
          <Badge variant="secondary" className="mb-6">先行登録受付中 — 永久に先行価格を適用</Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            経営思考で、<br className="sm:hidden" />
            <span className="text-zinc-500">自分の人生を設計する</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-zinc-500">
            理念・ビジョン・KGI・KPI・月次レビュー。
            企業経営のフレームワークを個人に適用し、
            目標達成の確度を高めます。
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto px-8">
                無料で始める
              </Button>
            </Link>
            <p className="text-sm text-zinc-400">クレジットカード不要 · 14日間Proトライアル付き</p>
          </div>
        </section>

        <Separator />

        {/* 機能紹介 */}
        <section className="mx-auto max-w-5xl px-4 py-20">
          <h2 className="mb-12 text-center text-2xl font-bold">LifeCEO でできること</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-zinc-100">
                <CardHeader className="pb-3">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                    <Icon className="h-5 w-5 text-zinc-700" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-500">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* 料金 */}
        <section className="mx-auto max-w-5xl px-4 py-20">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold">シンプルな料金プラン</h2>
            <p className="mt-2 text-sm text-zinc-500">先行登録者は永久に先行価格が適用されます</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
            {/* 無料プラン */}
            <Card className="border-zinc-200">
              <CardHeader>
                <CardTitle className="text-base font-medium text-zinc-500">無料プラン</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">¥0</span>
                  <span className="text-sm text-zinc-400"> /月</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <ul className="space-y-2">
                  {PLAN_FEATURES.free.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-zinc-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <Button variant="outline" className="w-full">無料で始める</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Proプラン */}
            <Card className="border-zinc-900 ring-1 ring-zinc-900">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Pro プラン</CardTitle>
                  <Badge>先行価格</Badge>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">¥480</span>
                  <span className="text-sm text-zinc-400"> /月</span>
                </div>
                <p className="text-xs text-zinc-400">年払い ¥3,800/年（月換算 ¥317）</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <ul className="space-y-2">
                  {PLAN_FEATURES.pro.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-zinc-900" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <Button className="w-full">14日間無料で試す</Button>
                </Link>
                <p className="text-center text-xs text-zinc-400">通常価格 ¥980/月（3ヶ月後）</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-zinc-400">
          © 2026 LifeCEO · <a href="/terms" className="hover:text-zinc-600">利用規約</a> · <a href="/privacy" className="hover:text-zinc-600">プライバシーポリシー</a>
        </div>
      </footer>
    </div>
  )
}
