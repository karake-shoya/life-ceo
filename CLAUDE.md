# LifeCEO - CLAUDE.md

## プロジェクト概要

**LifeCEO** は「経営思考で自分の人生を設計・実行・振り返る」Webアプリ。
ターゲットは自己啓発・副業志望の社会人。サブスク型（月980円/年8,800円）で収益化を目指す。

---

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 14（App Router） |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS + shadcn/ui |
| バックエンド | Supabase（PostgreSQL + Auth + RLS） |
| デプロイ | Vercel |
| 決済 | Stripe（サブスク・トライアル） |
| パッケージ管理 | npm |

---

## ディレクトリ構成

```
lifeceo/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── goal/
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   ├── review/
│   │   └── settings/
│   ├── onboarding/
│   ├── api/
│   │   └── stripe/
│   │       └── webhook/
│   └── page.tsx          ← LP（未ログイン時）
├── components/
│   ├── ui/               ← shadcn/uiコンポーネント
│   ├── goal/
│   ├── kpi/
│   └── review/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── stripe/
│   │   └── client.ts
│   └── utils.ts
├── types/
│   └── database.ts       ← Supabase型定義
├── .claude/
│   └── rules/            ← Claude Code追加ルール
└── CLAUDE.md             ← このファイル
```

---

## DB設計（Supabase）

```sql
-- プランの型
create type plan_type as enum ('free', 'pro');

-- ユーザー拡張情報（Supabase Authと1対1）
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  plan         plan_type default 'free',
  trial_ends_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at   timestamptz default now()
);

-- 目標（KGI）
create table goals (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade,
  title        text not null,           -- 目標タイトル
  philosophy   text,                    -- 理念・大切にする価値観
  vision       text,                    -- ビジョン（3〜5年後の姿）
  target_value numeric,                 -- KGI数値
  target_unit  text,                    -- 単位（円・kg・件など）
  deadline     date,                    -- 達成期限
  is_active    boolean default true,
  created_at   timestamptz default now()
);

-- KPI
create table kpis (
  id           uuid primary key default gen_random_uuid(),
  goal_id      uuid references goals(id) on delete cascade,
  title        text not null,
  target_value numeric not null,
  unit         text,
  frequency    text default 'weekly',   -- 'weekly' | 'monthly'
  created_at   timestamptz default now()
);

-- KPI実績
create table kpi_records (
  id           uuid primary key default gen_random_uuid(),
  kpi_id       uuid references kpis(id) on delete cascade,
  value        numeric not null,
  recorded_at  date not null,
  memo         text,
  created_at   timestamptz default now()
);

-- 月次レビュー
create table monthly_reviews (
  id                uuid primary key default gen_random_uuid(),
  goal_id           uuid references goals(id) on delete cascade,
  year              int not null,
  month             int not null,
  achievement_rate  int,               -- 達成率（0〜100）
  comment           text,
  next_action       text,
  created_at        timestamptz default now(),
  unique(goal_id, year, month)
);
```

### RLSポリシー（全テーブル共通方針）

```sql
-- 例：goals テーブル
alter table goals enable row level security;

create policy "自分のgoalのみ参照可"
  on goals for select using (auth.uid() = user_id);

create policy "自分のgoalのみ作成可"
  on goals for insert with check (auth.uid() = user_id);

create policy "自分のgoalのみ更新可"
  on goals for update using (auth.uid() = user_id);

create policy "自分のgoalのみ削除可"
  on goals for delete using (auth.uid() = user_id);
```

---

## プラン・機能制限

| 機能 | 無料プラン | Proプラン |
|------|-----------|---------|
| 目標（KGI）登録数 | 1件 | 無制限 |
| KPI登録数 | 3件/目標 | 無制限 |
| 月次レビュー | ❌ | ✅ |
| KPI実績入力 | ✅ | ✅ |
| データエクスポート | ❌ | ✅ |

---

## Stripe設計

```
商品：LifeCEO Pro

【先行価格（ローンチ〜3ヶ月限定）】
├── 月払い：480円/月
└── 年払い：3,800円/年（月換算317円）

【通常価格（3ヶ月以降）】
├── 月払い：980円/月
└── 年払い：7,800円/年（月換算650円）

※先行登録者は永久に先行価格を適用

トライアル：14日間（クレジットカード登録必要）

Webhook処理が必要なイベント：
├── checkout.session.completed     → プロアップグレード
├── customer.subscription.deleted  → 解約処理
└── invoice.payment_failed         → 決済失敗処理
```

---

## 画面一覧・主要仕様

### `/`（LP）
- 未ログインユーザー向けランディングページ
- CTAは「無料で始める」ボタン → `/register`

### `/onboarding`
- 初回ログイン後に1回だけ表示
- 目標カテゴリ選択（キャリア / 習慣改善 / 副業収入 / その他）
- 最初のKGIを簡単設定

### `/dashboard`
- 登録済み目標一覧
- 各KPIの直近達成状況
- 月次レビューの促進バナー（月末に表示）

### `/goal/new`
- 理念・ビジョン・KGI・KPI をステップ形式で入力

### `/goal/[id]`
- 目標詳細・KPI管理・実績入力

### `/review`
- 月次レビュー入力（達成率・コメント・次のアクション）

### `/settings`
- プロフィール編集
- プラン管理（Stripeカスタマーポータルへ遷移）

---

## 開発ルール

### 絶対に守ること
- MVPスコープ外の機能は実装しない（`FUTURE.md`に記録する）
- `any`型は使用禁止、TypeScriptの型を必ず定義する
- Supabaseへのアクセスはサーバーコンポーネントから行う
- 環境変数は`.env.local`に記載し、コードにハードコードしない

### コンポーネント方針
- UIはshadcn/uiを優先使用
- カスタムコンポーネントは`components/`配下に配置
- ページコンポーネントは`app/`配下のみ

### 命名規則
- コンポーネント：PascalCase（例：`GoalCard.tsx`）
- 関数・変数：camelCase
- 定数：UPPER_SNAKE_CASE
- Supabaseテーブル：snake_case

### Claudeへの指示パターン
- 機能実装時は「どのテーブルを使うか」「どの画面か」を明示する
- スコープ外の提案をされたら`FUTURE.md`に追記してスキップする

---

## MVPスコープ（厳守）

### ✅ 実装する
- Googleログイン認証
- 目標（KGI）CRUD
- KPI CRUD
- KPI実績入力
- Stripe サブスク（月払い・年払い・14日トライアル）
- 無料プランの機能制限
- LP

### ❌ 実装しない（FUTURE.md行き）
- 達成率グラフ・ダッシュボード可視化
- リマインダー通知
- SNSシェア機能
- AI提案機能
- チーム・複数人機能
- モバイルアプリ（PWA）
- データエクスポート（Proプランに含めるが後回し）

---

## 環境変数

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

## 参考・関連ファイル

- `FUTURE.md`：MVPスコープ外の機能アイデアを記録
- `.claude/rules/`：追加の開発ルール
- `types/database.ts`：Supabase自動生成の型定義
