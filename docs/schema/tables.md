# テーブル補足

## profiles

Auth のユーザーと1対1で対応する公開プロフィールです。アプリ側では email / full_name / role を使って UI を描画します。

## tasks

タスク本体です。`created_by_id` と `assignee_id` を分けることで、作成責任と作業責任を分離しています。

## comments

レビュー履歴や相談内容を残します。BaaS 構成でも、会話履歴はドメインの一部としてスキーマに残します。

## labels / task_labels

タグ付け用です。学習上は多対多の基本例としても使えます。
