# 今後のタスク

## 1. プラグイン詳細ページの共通化
現在、各プラグインごとに個別のHTMLファイルで詳細ページを作成しているため、メンテナンスコストが高い。テンプレート化して管理しやすくする。

**関連ファイル:**
- `docs/plugins/tabview.html`
- `docs/plugins/field-conditional-display.html`

**期待される効果:**
- 新規プラグイン追加時の手間削減
- デザイン・レイアウトの一貫性向上
- メンテナンス性の向上

---

## 2. PostHogでのデータ収集確認
PostHogダッシュボードで以下を確認する:
- イベントが正常に送信されているか
- `plugin_name`プロパティでのBreakdown機能が動作するか
- プラグインごとの利用統計が取得できているか

**確認項目:**
- `plugin_loaded` イベントの受信
- `plugin_activated` イベントの受信
- `plugin_name`、`plugin_version`、`app_id` などのプロパティが正しく記録されているか

---

## 3. GitHub Pagesの独自ドメイン化
可能な限り費用をかけずにカスタムドメインを設定する。

**検討事項:**
- 無料ドメインサービスの調査（Freenom等）
- サブドメイン運用の検討
- GitHub Pagesのカスタムドメイン設定手順

**参考:**
- [GitHub Docs - カスタムドメインの設定](https://docs.github.com/ja/pages/configuring-a-custom-domain-for-your-github-pages-site)

---

## 4. 新しいプラグインの開発
新しいkintoneプラグインのアイデア検討と開発。

**アイデア候補:**
- （ユーザーと相談して決定）

**開発時の留意点:**
- PostHog統計を最初から組み込む
- GitHub Pagesへの自動掲載を考慮した構成
- プラグイン詳細ページのテンプレート活用（タスク1完了後）
