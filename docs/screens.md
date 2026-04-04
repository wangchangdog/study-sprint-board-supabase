# 画面一覧

## 画面遷移

```text
/signin → /dashboard
             ├── /tasks
             │     ├── /tasks/new
             │     ├── /tasks/:taskId
             │     └── /tasks/:taskId/edit
             └── /settings (admin のみ)
```

## 各画面の仕様

### /signin

- demo / supabase どちらでも使うサインイン画面
- 開発用アカウント情報を表示
- 契約ファイルの位置もここから確認できる

### /dashboard

- 自分の担当タスク数
- ステータス別件数
- 締切が近いタスク
- 最近更新されたタスク

### /tasks

- タスク一覧
- ステータス / 優先度 / ラベル / 担当者 / 締切を表示
- 詳細 / 編集 / 新規作成への導線を置く

### /tasks/new

- タスク作成フォーム
- title / description / status / priority / dueDate / assignee / labels
- Zod バリデーションを通して repository に保存する

### /tasks/:taskId

- タスク詳細
- コメント一覧
- コメント投稿
- メタデータ表示

### /tasks/:taskId/edit

- タスク編集フォーム
- 作成時と同じ UI を再利用

### /settings

- admin のみ閲覧可能
- ユーザー一覧
- 現在の接続モード
- 契約ファイル一覧
