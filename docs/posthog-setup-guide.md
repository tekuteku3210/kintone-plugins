# Posthog ダッシュボード設定ガイド

TabViewプラグインのアナリティクスをPosthogで確認する方法を説明します。

## 1. リアルタイムイベントストリームを確認する

### 手順
1. Posthogダッシュボードの左サイドバーから **「Activity」** をクリック
2. **「Live events」** タブを選択
3. TabViewプラグインを操作すると、リアルタイムでイベントが表示されます

### 確認できるイベント
- `plugin_loaded`: レコード詳細画面を開いたとき
- `plugin_activated`: アプリで初めてプラグインを起動したとき（1回のみ）
- `tab_switched`: タブを切り替えたとき

### イベントのプロパティ
各イベントには以下の情報が含まれます:
- `plugin_version`: プラグインのバージョン（例: "1.1.0"）
- `app_id`: kintoneアプリID
- `screen_type`: 画面タイプ（"detail", "edit", "create"）※plugin_loadedのみ
- `tab_id`: タブID ※tab_switchedのみ
- `tab_label`: タブ名 ※tab_switchedのみ

---

## 2. DAU/MAUを確認するインサイトを作成

### 手順
1. Posthogダッシュボードの左サイドバーから **「Product analytics」** → **「Insights」** をクリック
2. 右上の **「+ New insight」** ボタンをクリック
3. 以下のように設定:

#### DAU（Daily Active Users）の設定
- **Event**: `plugin_loaded` を選択
- **Aggregation**: `Unique users` を選択
- **Breakdown**: （設定不要）
- **Date range**: `Last 7 days` または `Last 30 days`
- **Interval**: `Day` を選択
- 右上の **「Save」** をクリックして名前を付けて保存（例: "TabView DAU"）

#### MAU（Monthly Active Users）の設定
- **Event**: `plugin_loaded` を選択
- **Aggregation**: `Unique users` を選択
- **Date range**: `Last 3 months` または `Last 6 months`
- **Interval**: `Month` を選択
- 右上の **「Save」** をクリックして名前を付けて保存（例: "TabView MAU"）

---

## 3. アプリごとの利用状況を確認するインサイト

### 手順
1. **「+ New insight」** ボタンをクリック
2. 以下のように設定:
   - **Event**: `plugin_loaded` を選択
   - **Aggregation**: `Total count` を選択
   - **Breakdown**: `app_id` を選択（イベントプロパティから選択）
   - **Date range**: `Last 30 days`
   - **Visualization**: `Bar chart` または `Table` を選択
   - 右上の **「Save」** をクリック（例: "TabView - アプリ別利用状況"）

---

## 4. タブ切り替え回数を確認するインサイト

### 手順
1. **「+ New insight」** ボタンをクリック
2. 以下のように設定:
   - **Event**: `tab_switched` を選択
   - **Aggregation**: `Total count` を選択
   - **Breakdown**: `tab_label` を選択（どのタブがよく使われているか）
   - **Date range**: `Last 30 days`
   - **Visualization**: `Bar chart` または `Pie chart` を選択
   - 右上の **「Save」** をクリック（例: "TabView - タブ別利用回数"）

---

## 5. 新規アクティベーション数を確認するインサイト

### 手順
1. **「+ New insight」** ボタンをクリック
2. 以下のように設定:
   - **Event**: `plugin_activated` を選択
   - **Aggregation**: `Total count` を選択
   - **Date range**: `Last 30 days`
   - **Interval**: `Day` を選択
   - 右上の **「Save」** をクリック（例: "TabView - 新規アクティベーション"）

---

## 6. ダッシュボードを作成する

複数のインサイトをまとめて一つのダッシュボードに表示できます。

### 手順
1. 左サイドバーから **「Product analytics」** → **「Dashboards」** をクリック
2. 右上の **「+ New dashboard」** ボタンをクリック
3. 名前を入力（例: "TabView プラグイン分析"）
4. **「Add insight」** ボタンをクリックして、先ほど作成したインサイトを追加:
   - TabView DAU
   - TabView MAU
   - TabView - アプリ別利用状況
   - TabView - タブ別利用回数
   - TabView - 新規アクティベーション
5. ドラッグ&ドロップでレイアウトを調整
6. 右上の **「Save」** をクリック

---

## トラブルシューティング

### イベントが表示されない場合

1. **ブラウザのネットワークタブを確認**:
   - Posthogへのリクエストが送信されているか確認
   - `https://us.i.posthog.com/e/` へのPOSTリクエストが200を返しているか確認

2. **コンソールログを確認**:
   - "TabView: app.record.detail.show イベント発火" が表示されているか確認
   - エラーメッセージがないか確認

3. **数分待つ**:
   - 初回のイベントは反映に1〜5分かかることがあります

4. **APIキーを確認**:
   - `src/desktop/index.tsx` の `posthog.init()` に正しいAPIキーが設定されているか確認

### イベントは届いているが、インサイトに表示されない場合

1. **イベント名を確認**:
   - Activity → Live events で実際のイベント名を確認
   - インサイトで選択したイベント名と一致しているか確認

2. **日付範囲を確認**:
   - インサイトの Date range を `Last 7 days` または `All time` に変更して確認

3. **Aggregationを確認**:
   - `Unique users` ではなく `Total count` を選択してみる

---

## 参考リンク

- [Posthog 公式ドキュメント](https://posthog.com/docs)
- [Insights の使い方](https://posthog.com/docs/product-analytics/insights)
- [Dashboards の使い方](https://posthog.com/docs/product-analytics/dashboards)
