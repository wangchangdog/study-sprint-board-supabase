# AGENTS.md

## このリポジトリについて

このリポジトリは `Study Sprint Board` の **Vite + React + Supabase 見本** です。標準見本のように自作 API を中心にするのではなく、**認証・DB・認可を Supabase に委譲する** ことが主題です。

- 主な変更対象は `src/` と `supabase/`
- demo モードと supabase モードの両方を説明できる構造を保ちます
- OpenAPI ではなく、migration SQL・generated types・RLS docs が契約の中心です

## まず確認するファイル

| 目的 | ファイル |
| --- | --- |
| 全体像 | `README.md`, `docs/architecture.md` |
| セットアップ | `docs/setup.md` |
| repository 境界 | `src/lib/repository.ts`, `.github/instructions/web.instructions.md` |
| 認可と契約 | `supabase/migrations/0001_initial.sql`, `src/types/database.types.ts`, `docs/rls/policies.md` |
| 領域別の詳細ルール | `.github/instructions/docs.instructions.md`, `.github/instructions/ci.instructions.md` |

## 実行コマンド

| 目的 | コマンド |
| --- | --- |
| 開発サーバー | `pnpm dev` |
| lint | `pnpm lint` |
| typecheck | `pnpm typecheck` |
| テスト一式 | `pnpm test` |
| 単体テスト 1 ファイル | `pnpm test -- src/lib/repository.test.ts` |
| build | `pnpm build` |
| E2E 一式 | `pnpm e2e` |
| E2E 1 ファイル | `pnpm e2e -- tests/e2e/app.spec.ts` |

## 高レベルアーキテクチャ

- UI は `routes/`, `features/`, `components/` に分かれ、データ取得や状態同期は `src/lib/repository.ts` を起点にします。
- `src/lib/repository.ts` は `env.enableSupabase` を見て demo 実装と Supabase 実装を切り替えます。UI は `BoardRepository` にだけ依存します。
- Supabase 実装では Auth / PostgreSQL / RLS を使い、demo 実装では localStorage を使います。画面側に mode ごとの実装詳細を漏らしません。

| 正本 | 役割 |
| --- | --- |
| `supabase/migrations/0001_initial.sql` | スキーマと認可条件の機械可読な正本 |
| `src/types/database.types.ts` | 生成済み DB 型の正本 |
| `docs/rls/policies.md` | RLS 意図の人間向け補足 |

## この repo で重要な約束

- UI から直接 Supabase クライアントを呼ばず、`src/lib/repository.ts` 配下にデータアクセスを閉じ込めます。
- demo モードでだけ成立する変更を入れず、supabase モードとの差分を README / docs に残します。
- UI ガードは導線制御、RLS はデータベース保護という別責務です。権限を変えたら SQL と `docs/rls/policies.md` を同時に更新します。
- migration を変更したら generated types も更新します。例: `supabase gen types typescript --local > src/types/database.types.ts`
- Vitest は 100% coverage 閾値を前提にしているため、demo / supabase の両実装を跨ぐ境界テストを削らないでください。
