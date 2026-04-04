# ER 図

```text
profiles
  id (uuid, PK)
  email
  full_name
  role
  created_at

labels
  id (uuid, PK)
  name
  color

tasks
  id (uuid, PK)
  title
  description
  status
  priority
  due_date
  assignee_id (FK -> profiles.id)
  created_by_id (FK -> profiles.id)
  created_at
  updated_at

comments
  id (uuid, PK)
  task_id (FK -> tasks.id)
  author_id (FK -> profiles.id)
  content
  created_at

task_labels
  task_id (FK -> tasks.id)
  label_id (FK -> labels.id)
  PRIMARY KEY (task_id, label_id)
```

## 補足

- `profiles` は Auth ユーザーに対応する公開プロフィール
- `tasks` は assignee と created_by の2本のユーザー参照を持つ
- `task_labels` は多対多の中間テーブル
- `comments` は task と profile の履歴を残す
