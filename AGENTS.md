# AGENTS.md

## このリポジトリについて

このリポジトリは **教育用の見本プロジェクト** です。`study-sprint-board-next-monorepo` と同じ Study Sprint Board を、**Vite + React + Supabase** の BaaS 構成で再実装した比較教材として作成されています。

## 基本方針

- `src/` を中心に変更する
- 複雑さを増やしすぎず、初学者が責務を追える構成を保つ
- 破壊的変更を避ける
- demo モードと supabase モードの差分を明示する
- 過度な抽象化をせず、BaaS では何が契約の正本になるかを見える形にする

## コマンド実行前後に確認すること

- `.env` / `.env.example` の設定差分
- `supabase/migrations/` と `src/types/database.types.ts` の整合
- `docs/` の説明と実装の一致
- demo モードと supabase モードの動作差分

## 基本検証コマンド

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```

## 変更後の検証手順

1. 変更対象のコードと docs を特定する
2. 契約ファイル（`supabase/migrations/`, `src/types/database.types.ts`, `docs/rls/policies.md`）を確認する
3. 実装を更新する
4. `pnpm lint && pnpm typecheck && pnpm test && pnpm build` を実行する
5. UI 導線を変えた場合は `pnpm e2e` も実行する
6. docs を更新し、コードと説明のずれがないことを確認する

## 禁止事項

- `team-dev-curriculum/` は参照専用。ここから勝手に編集しない
- 契約ファイルと実装をずらさない
- demo モードでだけ動く変更を、supabase モードの説明なしに入れない
- 実行確認なしで完了扱いにしない
