import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Compass, Target, BarChart3, RefreshCw, ArrowRight } from 'lucide-react'
import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  weight: ['300', '400'],
})

const PAIN_POINTS = [
  {
    number: '01',
    title: '目標を立てても\n三日坊主になる',
    description: '年初の決意も気づけば忘れ、また同じ失敗のパターンを繰り返している。',
  },
  {
    number: '02',
    title: '今週何をすれば\n前進できるかわからない',
    description: '漠然とした大きな夢はあっても、具体的な行動に落とし込めていない。',
  },
  {
    number: '03',
    title: '振り返りをせず\n改善できていない',
    description: 'がんばっている気はするが、正しい方向に進んでいるか確かめられない。',
  },
]

const FRAMEWORK = [
  {
    icon: Compass,
    step: '理念・ビジョン',
    description: '「なぜやるか」「どう在りたいか」から設計する',
  },
  {
    icon: Target,
    step: 'KGI',
    description: '数値・期限つきの最重要目標を1本定める',
  },
  {
    icon: BarChart3,
    step: 'KPI',
    description: '週次・月次の先行指標で行動を管理する',
  },
  {
    icon: RefreshCw,
    step: '月次レビュー',
    description: '毎月振り返り、戦略をすばやく修正する',
  },
]

const HOW_IT_WORKS = [
  {
    num: '01',
    title: '目標を設計する',
    desc: '理念・ビジョンから逆算してKGIとKPIを設定。自分だけの戦略マップが完成する。',
  },
  {
    num: '02',
    title: '毎週・毎月記録する',
    desc: 'KPIの実績を入力するだけ。進捗が数値で可視化され、次の打ち手が浮かび上がる。',
  },
  {
    num: '03',
    title: '振り返り、修正する',
    desc: '月次レビューで達成率を分析。うまくいっていることを伸ばし、課題に集中する。',
  },
]

const FREE_FEATURES = ['目標（KGI）1件', 'KPI 3件/目標', 'KPI実績入力']
const PRO_FEATURES = ['目標（KGI）無制限', 'KPI 無制限', 'KPI実績入力', '月次レビュー', 'データエクスポート']

const MOCK_KPIS = [
  { label: '副業収入', value: '+¥120K' },
  { label: '学習時間', value: '42h' },
  { label: '達成率', value: '78%' },
]

export default function LandingPage() {
  return (
    <div className={fraunces.variable}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeInUp 0.9s ease-out forwards; opacity: 0; }
        .d1 { animation-delay: 0.1s; }
        .d2 { animation-delay: 0.25s; }
        .d3 { animation-delay: 0.4s; }
        .d4 { animation-delay: 0.6s; }

        @keyframes spinRing { to { transform: rotate(360deg); } }
        .ring-spin { animation: spinRing 28s linear infinite; }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }

        .hero-bg {
          background:
            radial-gradient(ellipse 90% 55% at 50% 0%, rgba(22,101,52,0.5) 0%, transparent 68%),
            #09180b;
        }
        .hero-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.033) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.033) 1px, transparent 1px);
          background-size: 72px 72px;
        }
        .serif { font-family: var(--font-fraunces), Georgia, serif; }
        .progress-bar {
          background: linear-gradient(90deg, #15803d, #4ade80);
        }
      `}</style>

      {/* ナビゲーション */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-green-800">
              <span className="text-[11px] font-bold text-white">LC</span>
            </div>
            <span className="font-semibold tracking-tight text-stone-900">LifeCEO</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-stone-600 hover:text-stone-900">
                ログイン
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="sm"
                className="rounded-full bg-green-800 px-5 text-white hover:bg-green-900 gap-1.5"
              >
                無料で始める
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ヒーロー */}
        <section className="hero-bg relative overflow-hidden pb-32 pt-24 sm:pt-32">
          <div className="hero-grid absolute inset-0" />

          {/* 装飾リング */}
          <div className="pointer-events-none absolute right-[-10%] top-[-12%] h-[560px] w-[560px] opacity-[0.07]">
            <div className="ring-spin h-full w-full rounded-full border border-green-400" />
            <div className="absolute inset-14 rounded-full border border-green-300" />
            <div className="absolute inset-28 rounded-full border border-green-200" />
          </div>

          <div className="relative mx-auto max-w-5xl px-6 text-center">
            {/* バッジ */}
            <div className="fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-green-800/60 bg-green-950/50 px-4 py-1.5 text-xs font-medium text-green-400">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-green-400" />
              先行登録受付中 · 先行価格は永久に適用されます
            </div>

            {/* ヘッドライン */}
            <h1 className="fade-up d1 serif mb-6 text-6xl font-light leading-[1.08] text-white sm:text-7xl md:text-8xl">
              人生を、<br />
              <span className="text-green-400">経営する</span>。
            </h1>

            {/* サブコピー */}
            <p className="fade-up d2 mx-auto mb-10 max-w-md text-base leading-relaxed text-stone-400 sm:text-lg">
              理念から始め、数値で管理し、毎月振り返る。<br />
              企業経営のフレームワークが、<br className="hidden sm:block" />
              あなたの目標達成を根底から変える。
            </p>

            {/* CTA */}
            <div className="fade-up d3 flex flex-col items-center gap-3">
              <Link href="/login">
                <Button
                  size="lg"
                  className="rounded-full bg-green-600 px-10 py-6 text-base font-semibold text-white hover:bg-green-500 gap-2"
                >
                  無料で始める
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-stone-500">クレジットカード不要 · 14日間 Pro トライアル付き</p>
            </div>

            {/* ダッシュボードモック */}
            <div className="fade-up d4 mx-auto mt-20 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-green-400">
                  年間目標 進捗
                </span>
                <span className="text-xs text-stone-500">2026年</span>
              </div>
              <div className="mb-5">
                <p className="serif mb-1 text-3xl font-light text-white">
                  ¥2,400,000{' '}
                  <span className="text-lg text-stone-500">/ ¥6,000,000</span>
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="progress-bar h-full w-[40%] rounded-full" />
                </div>
                <p className="mt-1 text-right text-xs text-green-400">40% 達成</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {MOCK_KPIS.map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-white/5 px-3 py-2.5">
                    <p className="text-[11px] text-stone-400">{label}</p>
                    <p className="text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 課題提起 */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-16 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-green-700">
                The Problem
              </p>
              <h2 className="serif text-4xl font-light text-stone-900 sm:text-5xl">
                こんな悩み、<br />ありませんか？
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {PAIN_POINTS.map(({ number, title, description }) => (
                <div
                  key={number}
                  className="group rounded-2xl border border-stone-100 bg-stone-50/80 p-8 transition-all hover:border-green-200 hover:bg-green-50/40"
                >
                  <div className="serif mb-5 text-5xl font-light text-stone-200 transition-colors group-hover:text-green-100">
                    {number}
                  </div>
                  <h3 className="mb-3 whitespace-pre-line text-lg font-semibold leading-snug text-stone-900">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-500">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* フレームワーク */}
        <section className="bg-[#f6f8f6] py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-16 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-green-700">
                Framework
              </p>
              <h2 className="serif text-4xl font-light text-stone-900 sm:text-5xl">
                LifeCEO の<br />フレームワーク
              </h2>
              <p className="mt-4 text-stone-500">
                経営者が使う4つの思考ツールを、個人の目標管理に適用する
              </p>
            </div>

            {/* デスクトップ表示 */}
            <div className="hidden overflow-hidden rounded-2xl border border-stone-200 sm:grid sm:grid-cols-4 sm:divide-x sm:divide-stone-200">
              {FRAMEWORK.map(({ icon: Icon, step, description }) => (
                <div
                  key={step}
                  className="flex flex-col items-center bg-white px-6 py-10 text-center transition-colors hover:bg-green-50/50"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-green-100 bg-green-50">
                    <Icon className="h-6 w-6 text-green-800" />
                  </div>
                  <div className="mb-2 text-sm font-bold text-green-800">{step}</div>
                  <p className="text-xs leading-relaxed text-stone-500">{description}</p>
                </div>
              ))}
            </div>

            {/* モバイル表示 */}
            <div className="flex flex-col gap-3 sm:hidden">
              {FRAMEWORK.map(({ icon: Icon, step, description }, i) => (
                <div key={step}>
                  <div className="flex items-start gap-4 rounded-xl border border-stone-100 bg-white p-5 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-800">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="mb-1 text-sm font-bold text-green-800">{step}</div>
                      <p className="text-sm leading-relaxed text-stone-500">{description}</p>
                    </div>
                  </div>
                  {i < FRAMEWORK.length - 1 && (
                    <div className="flex justify-center py-2">
                      <div className="h-5 w-px bg-stone-200" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-3xl px-6">
            <div className="mb-16 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-green-700">
                How it works
              </p>
              <h2 className="serif text-4xl font-light text-stone-900 sm:text-5xl">
                3ステップで<br />始められる
              </h2>
            </div>
            <div>
              {HOW_IT_WORKS.map(({ num, title, desc }) => (
                <div
                  key={num}
                  className="flex gap-8 border-b border-stone-100 py-10 last:border-0"
                >
                  <div className="serif shrink-0 text-6xl font-light leading-none text-stone-100 sm:text-7xl">
                    {num}
                  </div>
                  <div className="pt-1">
                    <h3 className="mb-2 text-xl font-semibold text-stone-900">{title}</h3>
                    <p className="leading-relaxed text-stone-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="rounded-full bg-green-800 px-10 py-6 text-base font-semibold text-white hover:bg-green-900 gap-2"
                >
                  無料で始める
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="mt-3 text-sm text-stone-400">クレジットカード不要 · 14日間 Pro トライアル付き</p>
            </div>
          </div>
        </section>

        {/* 料金 */}
        <section className="bg-[#f6f8f6] py-24">
          <div className="mx-auto max-w-3xl px-6">
            <div className="mb-16 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-green-700">
                Pricing
              </p>
              <h2 className="serif text-4xl font-light text-stone-900 sm:text-5xl">シンプルな料金</h2>
              <p className="mt-4 text-stone-500">先行登録者は永久に先行価格が適用されます</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* 無料プラン */}
              <div className="flex flex-col rounded-2xl border border-stone-200 bg-white p-8">
                <p className="mb-1 text-sm font-medium text-stone-400">無料プラン</p>
                <div className="mb-1 flex items-end gap-1">
                  <span className="serif text-5xl font-light text-stone-900">¥0</span>
                  <span className="mb-1.5 text-sm text-stone-400">/月</span>
                </div>
                <p className="mb-6 text-sm text-stone-400">まずは無料で体験する</p>
                <ul className="mb-8 flex-1 space-y-3">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-stone-600">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-stone-300" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-stone-300 text-stone-700 hover:bg-stone-50"
                  >
                    無料で始める
                  </Button>
                </Link>
              </div>

              {/* Pro プラン */}
              <div className="relative flex flex-col rounded-2xl border-2 border-green-800 bg-white p-8 shadow-lg shadow-green-900/10">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="rounded-full bg-green-800 px-4 py-1 text-xs font-semibold text-white">
                    先行価格 · 永久適用
                  </span>
                </div>
                <p className="mb-1 text-sm font-medium text-stone-600">Pro プラン</p>
                <div className="mb-1 flex items-end gap-1">
                  <span className="serif text-5xl font-light text-stone-900">¥480</span>
                  <span className="mb-1.5 text-sm text-stone-500">/月</span>
                </div>
                <p className="text-xs text-stone-400">年払い ¥3,800/年（月換算 ¥317）</p>
                <p className="mb-6 text-xs text-stone-400">通常価格 ¥980/月（3ヶ月後）</p>
                <ul className="mb-8 flex-1 space-y-3">
                  {PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-stone-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-700" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <Button className="w-full rounded-full bg-green-800 py-6 font-semibold text-white hover:bg-green-900">
                    14日間無料で試す
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 最終CTA */}
        <section className="hero-bg relative overflow-hidden py-28 text-center">
          <div className="hero-grid absolute inset-0" />
          <div className="relative mx-auto max-w-2xl px-6">
            <h2 className="serif mb-6 text-4xl font-light text-white sm:text-5xl md:text-6xl">
              今日から、<br />人生の CEO に。
            </h2>
            <p className="mx-auto mb-10 max-w-sm leading-relaxed text-stone-400">
              思考するだけでなく、行動し、数値で証明する。<br />
              LifeCEO が、あなたの人生経営をサポートします。
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="rounded-full bg-green-600 px-12 py-7 text-lg font-semibold text-white hover:bg-green-500 gap-2"
              >
                無料で始める
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-stone-500">クレジットカード不要 · 14日間 Pro トライアル付き</p>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="border-t border-white/10 bg-[#09180b] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-green-800">
              <span className="text-[10px] font-bold text-white">LC</span>
            </div>
            <span className="text-sm font-semibold text-stone-300">LifeCEO</span>
          </div>
          <p className="text-xs text-stone-500">
            © 2026 LifeCEO ·{' '}
            <a href="/terms" className="transition-colors hover:text-stone-300">利用規約</a>
            {' '}·{' '}
            <a href="/privacy" className="transition-colors hover:text-stone-300">プライバシーポリシー</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
