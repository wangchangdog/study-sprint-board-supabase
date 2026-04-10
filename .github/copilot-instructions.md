# Copilot Instructions

## この repo の前提

この repo は `Study Sprint Board` の **Supabase 委譲見本** です。自作 API を中心にした repo ではありません。UI は repository 境界越しに demo 実装または Supabase 実装へ接続します。

## 実行コマンド

| 目的 | コマンド |
| --- | --- |
| lint | `pnpm lint` |
| typecheck | `pnpm typecheck` |
| テスト一式 | `pnpm test` |
| 単体テスト 1 ファイル | `pnpm test -- src/lib/repository.test.ts` |
| build | `pnpm build` |
| E2E 一式 | `pnpm e2e` |
| E2E 1 ファイル | `pnpm e2e -- tests/e2e/app.spec.ts` |

## 高レベルアーキテクチャ

- `src/lib/repository.ts` が `env.enableSupabase` を見て demo / Supabase 実装を切り替えます。
- UI は `routes/`, `features/`, `components/` にあり、Supabase SDK を直接叩かず repository 境界越しにデータへ触れます。
- 契約の中心は OpenAPI ではなく、`supabase/migrations/0001_initial.sql`、`src/types/database.types.ts`、`docs/rls/policies.md` です。
- `docs/rls/policies.md` は SQL の補足であり、RLS の意図や UI ガードとの責務差を説明するためにあります。

## 重要な規約

- UI から直接 Supabase クライアントを呼ばないでください。
- demo モードと supabase モードの両方で成立する設計を保ち、どちらか一方だけを壊す変更を避けます。
- 権限やテーブル構造を変えるときは、migration SQL と generated types と RLS docs を同時に更新します。
- generated types を優先し、同じ概念の手書き型を増やしすぎないでください。
- OpenAPI 前提の説明を持ち込まず、BaaS 構成の正本を明示してください。
