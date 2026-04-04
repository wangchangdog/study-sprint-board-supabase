# セットアップ

## 1. demo モードで始める

まずは demo モードで起動し、UI と責務分離を確認してください。

```bash
cp .env.example .env
pnpm install
pnpm dev
```

## 2. Supabase モードに切り替える

Supabase CLI を利用できる場合は、以下の流れでローカル環境を立ち上げます。

```bash
supabase init
supabase start
supabase db reset
supabase gen types typescript --local > src/types/database.types.ts
```

### 環境変数

```dotenv
VITE_ENABLE_SUPABASE=true
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. 契約ファイルを確認する

Supabase モードを有効にする前に、以下の3つを必ず確認してください。

- `supabase/migrations/0001_initial.sql`
- `src/types/database.types.ts`
- `docs/rls/policies.md`

## 4. 検証コマンド

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```
