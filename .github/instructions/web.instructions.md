---
applyTo: "src/**/*.ts,src/**/*.tsx,src/**/*.css"
---

# Web / BaaS 開発ガイド

## ディレクトリ構成を尊重する

- `routes/` — 画面ルーティング
- `features/` — 機能単位の UI / 状態
- `components/` — 機能横断の部品
- `lib/` — repository・supabase client・validation
- `types/` — generated database types

## UI とデータアクセスの責務分離

- UI から直接 Supabase クライアントを呼ばない
- `lib/repository.ts` を経由して data access を切り替える
- demo モードと supabase モードの双方で説明可能な設計を保つ

## Zod バリデーション

- 入力は `lib/validations.ts` に集約する
- 作成 / 編集 / コメント投稿の境界で必ず検証する
- generated types と矛盾する独自型をむやみに増やさない

## スタイリング

- Tailwind CSS を基本とする
- 既存 UI トークンとレイアウトパターンを再利用する
