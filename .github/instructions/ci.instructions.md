---
applyTo: ".github/workflows/**/*.yml,.github/workflows/**/*.yaml"
---

# CI ワークフロー作成ガイド

- 無駄に複雑な matrix は避ける
- install → lint → typecheck → test → build → e2e の順で検証する
- キャッシュは過剰化しない
- 初学者が読んで理解できる記述にする
- Supabase CLI がない環境でも demo モードで最低限の品質確認が通るようにする
