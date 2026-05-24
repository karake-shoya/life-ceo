# LifeCEO

「経営思考で自分の人生を設計・実行・振り返る」SaaS。企業経営の KGI/KPI フレームワークを個人の目標管理に適用する。

**ターゲット**: 自己啓発・副業志望の 20〜35 歳の社会人  
**収益モデル**: サブスク（先行価格 ¥480/月、通常 ¥980/月）

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | Next.js 16.2（App Router） |
| 言語 | TypeScript（`any` 禁止） |
| スタイリング | Tailwind CSS v4 + shadcn/ui v4 |
| バックエンド | Supabase（PostgreSQL + Auth + RLS） |
| デプロイ | Vercel |
| 決済 | Stripe（サブスク・トライアル） |
| フォント | Fraunces（LP） / Geist（アプリ） |

---

## ローカル起動

```bash
npm install
npm run dev
```

`.env.local` に以下の環境変数を設定してください。

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_MONTHLY_PRICE_ID=
STRIPE_YEARLY_PRICE_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 実装済み画面・機能

### 公開ページ
| パス | 内容 |
|---|---|
| `/` | LP（Fraunces フォント、ダークグリーンヒーロー、料金・機能紹介・CTA） |
| `/login` | Google OAuth ログイン |

### 認証後アプリ（`/` 配下）

| パス | 内容 |
|---|---|
| `/onboarding` | 初回ログイン時のみ表示。カテゴリ選択→KGI 簡易設定の 2 ステップ |
| `/dashboard` | 目標一覧・KPI 進捗・月末レビュー促進バナー |
| `/goal/new` | 3 ステップ目標作成（理念/ビジョン → KGI → KPI） |
| `/goal/[id]` | 目標詳細・KPI 実績入力・履歴・KPI 追加/削除 |
| `/review` | 月次レビュー（Pro 限定）。KPI サマリー・達成率スライダー・振り返り入力 |
| `/settings` | 実装予定（Stripe プラン管理・プロフィール編集） |

### API・サーバーアクション

| ファイル | 内容 |
|---|---|
| `app/api/stripe/webhook/route.ts` | Stripe Webhook 処理（checkout 完了・解約・決済失敗） |
| `app/actions/goal.ts` | `createGoalWithKpis` — 目標と KPI の一括作成 |
| `app/actions/kpi.ts` | `addKpiRecord` / `addKpi` / `deleteKpi` |
| `app/actions/review.ts` | `upsertMonthlyReview` — 月次レビューの登録・更新 |

### 認証フロー

- Google OAuth（Supabase Auth）
- `auth/callback` でゴール件数を確認し、0 件なら `/onboarding` へリダイレクト
- middleware で `/dashboard`, `/goal`, `/review`, `/settings`, `/onboarding` を保護

---

## プラン・機能制限

| 機能 | 無料 | Pro |
|---|---|---|
| 目標（KGI）登録数 | 1 件 | 無制限 |
| KPI 登録数 | 3 件/目標 | 無制限 |
| 月次レビュー | ❌ | ✅ |
| KPI 実績入力 | ✅ | ✅ |

トライアル: 14 日間（クレジットカード登録必要）。トライアル中は Pro 扱い。

---

## ディレクトリ構成（主要部分）

```
app/
├── page.tsx                  ← LP
├── (auth)/login/             ← ログイン
├── auth/callback/            ← OAuth コールバック
├── onboarding/               ← 初回フロー
├── (app)/
│   ├── layout.tsx            ← サイドバー・モバイルナビ
│   ├── dashboard/
│   ├── goal/new/
│   ├── goal/[id]/
│   ├── review/
│   └── settings/
└── api/stripe/webhook/

components/
├── goal/
│   ├── GoalCard.tsx          ← ダッシュボード用カード
│   ├── GoalCreateForm.tsx    ← 3ステップ作成フォーム
│   └── GoalDetailView.tsx    ← 目標詳細・KPI管理
├── kpi/
│   └── KpiCard.tsx           ← KPI カード・実績入力
├── review/
│   └── ReviewView.tsx        ← 月次レビューフォーム
├── onboarding/
│   └── OnboardingFlow.tsx    ← オンボーディング UI
└── layout/
    ├── SidebarNav.tsx
    └── MobileBottomNav.tsx

lib/supabase/
├── server.ts                 ← SSR クライアント
├── client.ts                 ← ブラウザクライアント
└── cached.ts                 ← React cache() によるリクエスト内重複排除
```

---

## 未実装（MVP 残タスク）

- `/settings` — プロフィール編集・Stripe カスタマーポータル連携
- Stripe Checkout エンドポイント（`/api/stripe/checkout`）
- Stripe Customer Portal エンドポイント（`/api/stripe/portal`）

## スコープ外（`FUTURE.md` 参照）

達成率グラフ、リマインダー通知、SNS シェア、AI 提案、チーム機能、PWA、データエクスポート
