# Study Sprint Board - Supabase Sample

チームで学習や制作タスクを管理する Web アプリケーションです。

## カリキュラム見本としての位置づけ

このリポジトリは、4年制専門学校の卒業制作カリキュラムにおける **別パターン見本** です。既存の `study-sprint-board-next-monorepo` が「自作APIを含む標準構成」を示すのに対し、こちらは **Vite + React + Supabase を使う BaaS 構成** を示します。

同じ `Study Sprint Board` を別アーキテクチャで実装することで、次の比較ができるようにしています。

- 自作API 構成では何を自分で実装するのか
- BaaS 構成では何を Supabase に委譲するのか
- OpenAPI が正本になる世界と、migrations / generated types / RLS が正本になる世界の違い
- 無料枠前提で、どこに開発時間を使うべきか

## 採用技術

| カテゴリ | 技術 | 選定理由 |
|---------|------|----------|
| フロントエンド | Vite + React 19 | Next.js 見本と明確に差別化し、SPA の基本を学べる |
| 言語 | TypeScript | 型安全。チーム開発での齟齬を減らす |
| ルーティング | React Router | 学習コストが低く、ルート責務を追いやすい |
| BaaS | Supabase | Auth / PostgreSQL / RLS を一体で学べる |
| UI | Tailwind CSS | シンプルに UI を組み立てやすい |
| バリデーション | Zod | 入力境界を一貫して扱える |
| テスト | Vitest + Testing Library | 高速なユニット / コンポーネントテスト |
| E2E | Playwright | サインインから画面遷移まで検証できる |
| CI | GitHub Actions | install → lint → typecheck → test → build → e2e を自動化 |

## セットアップ

### 必要な環境

- Node.js 20+
- pnpm 10+
- Docker（Supabase CLI を使う場合）

### 手順

```bash
# 1. 環境変数を準備
cp .env.example .env

# 2. 依存関係をインストール
pnpm install

# 3. まずは demo モードで確認
pnpm dev
```

`http://localhost:5173` にアクセスしてください。

### demo モードと supabase モード

初期状態では `VITE_ENABLE_SUPABASE=false` のため、**demo モード** で起動します。demo モードでは localStorage にシードデータを書き込み、教材確認を優先できます。

Supabase を実接続したい場合は以下を実施します。

```bash
# Supabase CLI を別途導入済みである前提
supabase init
supabase start
supabase db reset
supabase gen types typescript --local > src/types/database.types.ts
```

そのうえで `.env` を以下のように設定します。

```dotenv
VITE_ENABLE_SUPABASE=true
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 開発用アカウント

| メールアドレス | パスワード | 権限 |
|---------------|-----------|------|
| admin@example.com | password123 | ADMIN |
| user1@example.com | password123 | USER |
| user2@example.com | password123 | USER |

## 開発コマンド

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | 本番ビルド |
| `pnpm lint` | ESLint 実行 |
| `pnpm typecheck` | TypeScript 型チェック |
| `pnpm test` | Vitest 実行（coverage 100% 目標） |
| `pnpm e2e` | Playwright E2E 実行 |
| `pnpm format` | Prettier 実行 |

## ディレクトリ構成

```text
study-sprint-board-supabase/
├── src/
│   ├── features/core/          # ドメインモデル・App Context
│   ├── features/auth/          # 認証ガード
│   ├── features/tasks/         # タスク作成・編集 UI
│   ├── lib/                    # repository・supabase client・validation
│   ├── routes/                 # 画面ルーティング
│   ├── components/             # 汎用 UI 部品
│   └── types/                  # generated database types
├── supabase/
│   ├── migrations/             # スキーマ / 制約 / RLS の正本
│   └── seed.sql                # seed データ
├── docs/
│   ├── architecture.md         # 構成説明
│   ├── screens.md              # 画面一覧
│   ├── er-diagram.md           # ER 図
│   ├── setup.md                # 詳細セットアップ
│   ├── roadmap.md              # 拡張方針
│   ├── schema/tables.md        # テーブル補足
│   └── rls/policies.md         # RLS の補足資料
└── .github/                    # Copilot / CI / テンプレート
```

## 設計思想

### BaaS 版の責務分離

```text
UI 層 (routes/, features/, components/)
  ↓
Repository 層 (lib/repository.ts)
  ↓
Demo Repository / Supabase Repository
  ↓
Supabase Auth / PostgreSQL / RLS
```

- UI は `repository` インターフェースだけを見て動く
- demo モードでは localStorage を使い、授業中でもすぐ試せる
- supabase モードでは Auth / Postgres / RLS に接続する
- 将来 API を外出ししたくなったら、repository の下を差し替えられる

### なぜこの構成にしたか

自作API の標準見本だけでは、「全部自前でやる」以外の現実的な選択肢が教材として見えません。BaaS 構成の見本を用意することで、学生は以下を比較できます。

- 速度重視のとき、どこまでをサービスに任せるべきか
- Auth / DB / RLS を使うと、アプリ側コードはどこまで薄くできるか
- それでも docs・型・契約管理を怠ると何が破綻するか

### BaaS 構成における仕様の正本

この見本では、**OpenAPI の代わりに次の3つを正本** として扱います。

1. `supabase/migrations/0001_initial.sql`
2. `src/types/database.types.ts`
3. `docs/rls/policies.md`

自作API 見本では OpenAPI が正本でしたが、BaaS では「スキーマ」「型」「認可ルール」が契約の中心になります。

## 標準見本との比較

| 観点 | 標準見本 | この見本 |
|------|----------|----------|
| フレームワーク | Next.js App Router | Vite + React |
| API 層 | Route Handlers | Supabase SDK |
| DB | Prisma + PostgreSQL | Supabase PostgreSQL |
| 認証 | Auth.js | Supabase Auth |
| 正本 | OpenAPI | migrations + generated types + RLS |
| 学習の重心 | API 設計 / サービス層 | BaaS 運用 / 認可 / 契約管理 |

## 今後の拡張

詳細は `docs/roadmap.md` を参照してください。

- Supabase Realtime によるリアルタイム更新
- Storage を使った添付ファイルアップロード
- フィルタ / ソート / ページネーション
- チーム / プロジェクト単位の権限分離
- TanStack Query 導入によるデータ同期強化

## Copilot Instructions / Agents

| ファイル | 役割 |
|---------|------|
| `AGENTS.md` | リポジトリ全体の説明 |
| `.github/copilot-instructions.md` | リポジトリ全体の開発方針 |
| `.github/instructions/web.instructions.md` | フロントエンド / repository 実装ガイド |
| `.github/instructions/docs.instructions.md` | ドキュメント作成ガイド |
| `.github/instructions/ci.instructions.md` | CI 作成ガイド |
| `.github/agents/scaffold-feature.agent.md` | 小機能追加用エージェント |
| `.github/agents/review-sample.agent.md` | 教材品質レビュー用エージェント |

## ドキュメント

- `docs/architecture.md`
- `docs/screens.md`
- `docs/er-diagram.md`
- `docs/setup.md`
- `docs/roadmap.md`
- `docs/schema/tables.md`
- `docs/rls/policies.md`

## ライセンス

教育目的で作成したサンプルリポジトリです。
