# kintone Plugins WEBサイト

このディレクトリには、kintoneプラグインを公開するためのWEBサイトが含まれています。

## 🚀 デプロイ方法（GitHub Pages）

### 1. GitHubリポジトリの作成

1. GitHubで新しいリポジトリを作成（例: `kintone-plugins`）
2. リポジトリをクローン

```bash
git clone https://github.com/yourusername/kintone-plugins.git
cd kintone-plugins
```

### 2. WEBサイトをリポジトリにコミット

```bash
# websiteディレクトリをリポジトリのルートまたは専用ブランチに配置
# 方法A: docsディレクトリを使う（推奨）
cp -r website/ docs/

# または

# 方法B: gh-pagesブランチを使う
git checkout -b gh-pages
cp -r website/* .
```

### 3. GitHubにプッシュ

```bash
git add .
git commit -m "WEBサイトを追加"
git push origin main  # または gh-pages
```

### 4. GitHub Pagesを有効化

1. GitHubリポジトリの「Settings」→「Pages」を開く
2. **Source**セクションで以下を設定:
   - **Branch**: `main`（または`gh-pages`）
   - **Folder**: `/docs`（または`/ (root)`）
3. 「Save」をクリック

### 5. 公開URLを確認

数分後、以下のURLでWEBサイトが公開されます:

```
https://yourusername.github.io/kintone-plugins/
```

---

## 📦 プラグインのリリース手順

新しいプラグインをリリースする際の手順です。

### 1. プラグインをビルド

```bash
cd plugins/tab-view  # 例: TabViewプラグイン
npm run build
npx @kintone/plugin-packer plugin/
```

これにより、`plugin.zip`が生成されます。

### 2. GitHub Releaseを作成

1. GitHubリポジトリの「Releases」→「Create a new release」をクリック
2. 以下を入力:
   - **Tag version**: `tabview-v1.0.0`（プラグイン名-vバージョン）
   - **Release title**: `TabView v1.0.0`
   - **Description**: リリースノートを記載
3. `plugin.zip`をアップロード（ファイル名を`tabview.zip`にリネーム）
4. 「Publish release」をクリック

### 3. WEBサイトのダウンロードリンクを更新

[index.html](index.html)と[plugins/tabview.html](plugins/tabview.html)の以下の部分を更新:

```html
<a href="https://github.com/yourusername/kintone-plugins/releases/download/tabview-v1.0.0/tabview.zip"
   download>
    <i class="fas fa-download mr-1"></i> ZIP
</a>
```

- `yourusername`を自分のGitHubユーザー名に変更
- `tabview-v1.0.0`を実際のタグ名に変更
- `tabview.zip`を実際のZIPファイル名に変更

### 4. 変更をコミット&プッシュ

```bash
git add .
git commit -m "TabView v1.0.0をリリース"
git push origin main
```

数分後、GitHub PagesのWEBサイトが自動更新されます。

---

## 📝 新しいプラグインページの追加方法

1. `website/plugins/`に新しいHTMLファイルを作成（例: `fieldcalculator.html`）
2. [plugins/tabview.html](plugins/tabview.html)をテンプレートとしてコピー
3. 内容を新しいプラグインに合わせて編集
4. [index.html](index.html)のプラグイン一覧セクションにカードを追加:

```html
<div class="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6">
    <div class="flex items-start justify-between mb-4">
        <div class="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
            <i class="fas fa-calculator text-purple-600 text-xl"></i>
        </div>
        <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">無償</span>
    </div>
    <h4 class="text-xl font-bold mb-2">Field Calculator</h4>
    <p class="text-gray-600 mb-4 text-sm">フィールド間の自動計算を設定。数式を入力するだけで複雑な計算を自動化します。</p>
    <div class="flex items-center text-sm text-gray-500 mb-4">
        <i class="fas fa-download mr-2"></i>
        <span>v1.0.0</span>
        <span class="mx-2">•</span>
        <span>2026年2月</span>
    </div>
    <div class="flex space-x-2">
        <a href="plugins/fieldcalculator.html" class="flex-1 text-center bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition font-medium">
            詳細を見る
        </a>
        <a href="https://github.com/yourusername/kintone-plugins/releases/download/fieldcalculator-v1.0.0/fieldcalculator.zip"
           class="flex-1 text-center border border-primary-500 text-primary-500 px-4 py-2 rounded-md hover:bg-primary-50 transition font-medium"
           download>
            <i class="fas fa-download mr-1"></i> ZIP
        </a>
    </div>
</div>
```

---

## 🎨 カスタマイズ

### カラーテーマの変更

[index.html](index.html)と各ページの`<script>`タグ内で、Tailwind CSSの色設定を変更できます:

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    500: '#3b82f6',  // メインカラー
                    600: '#2563eb',
                }
            }
        }
    }
}
```

### カスタムドメインの設定

独自ドメイン（例: `kintone-plugins.example.com`）を使う場合:

1. [CNAME](CNAME)ファイルにドメイン名を記載:

```
kintone-plugins.example.com
```

2. DNSプロバイダーでCNAMEレコードを追加:

```
kintone-plugins  CNAME  yourusername.github.io
```

3. GitHub Pages設定で「Custom domain」にドメインを入力

---

## 📂 ディレクトリ構成

```
website/
├── index.html          # トップページ
├── css/
│   └── style.css       # カスタムCSS
├── js/
│   └── main.js         # JavaScript（タブ切り替え、アニメーション）
├── plugins/
│   └── tabview.html    # プラグイン詳細ページ
├── images/             # 画像ファイル（スクリーンショットなど）
├── .nojekyll           # Jekyll無効化ファイル
├── CNAME               # カスタムドメイン設定（任意）
└── README.md           # このファイル
```

---

## 🛠️ ローカルでの確認

ローカルでWEBサイトを確認する場合:

### 方法1: VSCode Live Server

1. VSCode拡張機能「Live Server」をインストール
2. `index.html`を右クリック→「Open with Live Server」

### 方法2: Python HTTPサーバー

```bash
cd website
python -m http.server 8000
```

ブラウザで`http://localhost:8000`を開く

### 方法3: Node.jsのhttp-server

```bash
npm install -g http-server
cd website
http-server -p 8000
```

---

## 📊 アクセス解析・ダウンロード統計

### 導入済みツール

| ツール | 用途 | リンク |
|--------|------|--------|
| Google Analytics 4 | ページビュー・ユーザー分析 | 測定ID: `G-3EN96PCL52` |
| Looker Studio | ダッシュボード可視化 | [ダッシュボード](https://lookerstudio.google.com/u/0/reporting/9c801b41-d794-4670-b5c1-80144f1e2444/page/PErkF/edit) |
| Google スプレッドシート | ダウンロード数データ保存 | [スプレッドシート](https://docs.google.com/spreadsheets/d/1QKHe6joOn3Tj7SQ5V_K6enAVJEnRTJp4E1K0-2nc3Ok/edit?gid=0#gid=0) |
| Google Apps Script | 毎日自動データ更新 | [スクリプト](https://script.google.com/u/0/home/projects/1E5vuFLqLqP5vzXDwgioACKnaWb6_2E-YtcA14wPz_erog1xuLtTDhe_q/edit) |

### GA4トラッキングコード

全HTMLページ（index.html, privacy-policy.html, plugins/*.html）に導入済み:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-3EN96PCL52"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-3EN96PCL52');
</script>
```

### ダウンロード数取得スクリプト

`scripts/`フォルダに以下のスクリプトがあります:

- `get-download-stats.sh` - ターミナルで統計確認
- `export-download-stats-csv.sh` - CSV形式で出力

### 自動更新

Google Apps Scriptで毎日3〜4時に自動更新されます。
ダウンロード数がスプレッドシートに追記され、Looker Studioに反映されます

---

## 📄 ライセンス

このWEBサイトテンプレートはMITライセンスで提供されています。自由に改変・再配布が可能です。

---

## 🆘 トラブルシューティング

### GitHub Pagesが表示されない

- リポジトリが公開（Public）になっているか確認
- Settings → Pagesで正しいブランチ・フォルダが選択されているか確認
- 最大15分程度かかる場合があるので、しばらく待つ

### CSSやJSが読み込まれない

- `.nojekyll`ファイルが存在するか確認
- HTMLファイル内のパス（`css/style.css`, `js/main.js`）が正しいか確認

### ダウンロードリンクが404エラー

- GitHub Releasesにファイルが正しくアップロードされているか確認
- URLのユーザー名、タグ名、ファイル名が正しいか確認

---

## 📞 お問い合わせ

質問や不具合報告は、GitHubのIssuesページまでお願いします。

**作成者**: Sakaguchi Takaya
**更新日**: 2026年1月4日
