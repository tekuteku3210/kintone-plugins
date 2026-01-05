# 開発履歴

## お知らせ機能の改修（2026年1月5日）

### 変更内容

お知らせ機能のデータソースをシンプル化しました。

**変更前**:
- GitHub Releases（自動取得）
- 手動お知らせJSON（`docs/data/announcements.json`）

**変更後**:
- GitHub Releasesのみ（自動取得）

### 変更理由

1. **情報の一元化**: すべてのお知らせをGitHub Releasesで管理することで、情報が分散しない
2. **管理の簡素化**: JSONファイルの手動編集が不要になり、GitHub UIから直接リリースを作成するだけ
3. **将来の拡張性**: 必要に応じてGitHub Discussionsを追加で統合可能

### お知らせの追加方法

#### 1. プラグインリリース時

通常のリリースフローでGitHub Releasesを作成するだけで、自動的にお知らせに表示されます。

```bash
# 例: タブ表示プラグイン v1.2.0 をリリース
gh release create tab-view-v1.2.0 \
  --title "タブ表示プラグイン v1.2.0" \
  --notes "
## 新機能
- ✨ タブのドラッグ&ドロップ並び替えに対応

## 改善
- 🐛 レコード編集画面でのレイアウト崩れを修正

## その他
- 📝 ドキュメントを更新
" \
  tab-view-v1.2.0.zip
```

#### 2. プラグイン以外のお知らせ（将来対応予定）

GitHub Discussionsを有効化した後、以下の手順で投稿:

1. GitHubリポジトリの「Discussions」タブを開く
2. 「Announcements」カテゴリで新規投稿
3. お知らせ内容を記載して投稿

### 実装詳細

**変更ファイル**:
- [docs/js/main.js](../js/main.js): `loadAnnouncements()` 関数をシンプル化
- `docs/data/announcements.json`: 削除（不要になったため）
- `docs/data/`: ディレクトリごと削除

**APIエンドポイント**:
- GitHub Releases API: `https://api.github.com/repos/tekuteku3210/kintone-plugins/releases`
- (将来) GitHub Discussions API: GraphQL経由で取得

**データ形式**:
```javascript
{
  id: `release-${release.tag_name}`,  // 例: "release-tab-view-v1.1.0"
  type: 'release',                     // カテゴリ
  title: release.name,                 // 例: "タブ表示プラグイン v1.1.0"
  description: release.body,           // リリースノートの最初の5行
  date: release.published_at,          // 公開日（YYYY-MM-DD形式）
  url: release.html_url                // GitHubリリースページのURL
}
```

### 今後の拡張予定

#### GitHub Discussions統合（優先度: 中）

**メリット**:
- ユーザーとの双方向コミュニケーション（コメント・リアクション）
- プラグインリリース以外のお知らせ（メンテナンス情報、Tips、FAQ更新など）を投稿可能
- 検索性・可視性の向上

**実装方針**:
1. GitHubリポジトリでDiscussionsを有効化
2. "Announcements"カテゴリを作成
3. GraphQL APIで取得し、既存のReleases情報と統合
4. `docs/js/main.js` に `fetchGitHubDiscussions()` 関数を追加

**実装イメージ**:
```javascript
async function loadAnnouncements() {
  // 複数のデータソースを並行取得
  const [releaseAnnouncements, discussionAnnouncements] = await Promise.all([
    fetchGitHubReleases(),
    fetchGitHubDiscussions()
  ]);

  // 統合してソート
  const allAnnouncements = [...releaseAnnouncements, ...discussionAnnouncements];
  allAnnouncements.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 表示
  renderAnnouncements(allAnnouncements);
  updateBadge(allAnnouncements);
}
```

---

## タブ表示プラグイン開発履歴

### v1.1.0（2026年1月4日）
- ✅ 利用統計収集機能（PostHog統合）
- ✅ プライバシーポリシーページ追加

### v1.0.0（2026年1月4日）
- ✅ 初回リリース
- ✅ タブ設定UI（最大5タブ）
- ✅ スペースフィールド対応
- ✅ 標準フィールド表示制御
- ✅ プレビュー機能
