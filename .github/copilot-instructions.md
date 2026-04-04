# Copilot Instructions

## このリポジトリの設計思想

このリポジトリは、BaaS 構成を学ぶための教育用見本です。`study-sprint-board-next-monorepo` と同じ題材を使い、構成の違いを比較できるようにしています。

「動くコード」だけでなく、「何を Supabase に委譲し、何をアプリ側に残すか」を説明できることを重視します。

## リポジトリ運用方針

- アプリ本体は `src/` に配置する
- 契約の正本は `supabase/migrations/`, `src/types/database.types.ts`, `docs/rls/policies.md`
- demo モードと supabase モードの差分を README / docs に残す
- 小さな差分で進める

## コーディング方針

### 型安全を優先する

- TypeScript strict mode を維持する
- `any` を避ける
- フォーム入力は Zod で検証する
- generated types を優先し、手書き型を重複させない

### UI とデータアクセスの分離

- 画面コンポーネントから直接 Supabase を呼ばない
- `lib/repository.ts` を境界にし、UI は repository に依存する
- demo と supabase の両実装を壊さない

### RLS を前提に考える

- 「画面で見せない」だけで安全になったと思わない
- 権限制御は docs と migration の両方を更新する
- 設定画面や admin 導線では、UI ガードと RLS の違いを説明可能に保つ

## ドキュメント方針

- docs と実装を同時に更新する
- BaaS 構成の正本がどこにあるかを README / architecture / setup に明記する
- 標準見本との比較を壊さない

## 変更後の確認

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- 画面導線を変えたら `pnpm e2e`
