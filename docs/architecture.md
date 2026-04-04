# アーキテクチャ

## 概要

この見本は **Vite + React + Supabase** を使う BaaS 構成です。既存の標準見本が「Next.js に API と DB アクセスを同居させる」方針だったのに対し、この見本は **認証・DB・認可を Supabase に委譲** します。

## 構成図

```text
ブラウザ
  │
  ▼
React SPA (Vite)
  ├── routes/        画面遷移
  ├── features/      機能単位 UI
  ├── lib/repository UI が依存する境界
  └── lib/supabase   Supabase クライアント
        │
        ▼
Supabase
  ├── Auth
  ├── PostgreSQL
  └── RLS
```

## レイヤー構成

| レイヤー | 責務 | 配置 |
|----------|------|------|
| UI 層 | 画面表示・操作 | `routes/`, `features/`, `components/` |
| アプリ境界 | UI とデータ取得の接着 | `lib/repository.ts`, `features/core/app-context.tsx` |
| 実装切替 | demo / supabase の切替 | `lib/demo-repository.ts`, `lib/supabase-repository.ts` |
| データ契約 | schema / generated types / RLS | `supabase/`, `src/types/`, `docs/rls/` |

## 設計原則

### UI は repository に依存する

UI は直接 Supabase SDK を呼ばず、`BoardRepository` インターフェースを通して操作します。これにより demo モードと supabase モードで同じ画面を再利用できます。

### demo モードを先に用意する

授業中に Supabase のセットアップで詰まると、UI や設計の学習が止まってしまいます。そのため、まずは demo モードで画面遷移と責務分離を学べるようにしています。

### 契約の正本をコード近くに置く

BaaS 構成では REST API の OpenAPI より、次の3つが契約の中心になります。

1. `supabase/migrations/0001_initial.sql`
2. `src/types/database.types.ts`
3. `docs/rls/policies.md`

### なぜ機械可読な契約が必要か

BaaS では「API がないから仕様書も不要」と誤解されがちですが、実際には逆です。認証・DB・RLS を外部サービスに委譲するぶん、**どのテーブルに誰がアクセスできるか** をより厳密に管理しないと事故になります。

- 実装差分を検出できる
- 権限漏れをレビューで発見しやすい
- 型生成やクエリ補完に使える
- 引き継ぎ時の理解コストを下げられる
- 自作API 構成へ移るときの比較材料になる

## 標準見本との比較

| 観点 | 標準見本 | BaaS 見本 |
|------|----------|-----------|
| UI | Next.js Server / Client Components | React SPA |
| API | Route Handlers | Supabase SDK |
| 認証 | Auth.js | Supabase Auth |
| DB アクセス制御 | サービス層 + API 入口 | RLS + 最小限の UI ガード |
| 仕様の正本 | OpenAPI | migrations / generated types / RLS |

## 将来の拡張

- TanStack Query 追加
- Supabase Realtime 連携
- Storage 連携
- 組織 / チーム単位の権限設計
- repository の下を API 経由実装へ差し替える比較教材
