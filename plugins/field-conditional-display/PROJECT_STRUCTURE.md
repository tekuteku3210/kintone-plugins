# プロジェクト構造

フィールド条件表示プラグインのディレクトリ構造とファイル一覧

## ディレクトリツリー

```
field-conditional-display/
├── src/                           # ソースコード
│   ├── config/                    # 設定画面
│   │   ├── index.tsx             # Reactエントリーポイント
│   │   ├── components/           # Reactコンポーネント
│   │   │   ├── RuleList.tsx     # ルール一覧画面
│   │   │   ├── RuleEditor.tsx   # ルール編集画面
│   │   │   ├── ConditionEditor.tsx  # 条件編集コンポーネント
│   │   │   ├── ActionEditor.tsx     # アクション編集コンポーネント
│   │   │   └── PreviewModal.tsx     # プレビューモーダル
│   │   └── styles.css            # Tailwind CSSスタイル
│   │
│   ├── desktop/                   # レコード画面（デスクトップJS）
│   │   ├── index.ts              # デスクトップJSエントリーポイント
│   │   ├── FieldController.ts    # フィールド表示制御
│   │   └── EventHandler.ts       # イベントハンドラー
│   │
│   ├── shared/                    # 共通モジュール
│   │   ├── ConditionEvaluator.ts # 条件評価エンジン
│   │   ├── ConfigManager.ts      # 設定管理
│   │   ├── FieldService.ts       # フィールド情報取得
│   │   └── Analytics.ts          # 利用統計（PostHog）
│   │
│   └── types/                     # TypeScript型定義
│       └── index.ts              # 全ての型定義
│
├── plugin/                        # ビルド成果物（kintoneプラグインファイル）
│   ├── js/
│   │   ├── config.js             # 設定画面JS（ビルド後）
│   │   └── desktop.js            # デスクトップJS（ビルド後）
│   ├── css/
│   │   ├── config.css            # 設定画面CSS（ビルド後）
│   │   └── desktop.css           # デスクトップCSS（ビルド後）
│   ├── html/
│   │   └── config.html           # 設定画面HTML
│   ├── icon.png                  # プラグインアイコン
│   └── manifest.json             # プラグインマニフェスト
│
├── tests/                         # テストファイル（将来追加）
│   ├── unit/
│   └── integration/
│
├── .gitignore                     # Git除外設定
├── package.json                   # npm設定
├── tsconfig.json                  # TypeScript設定
├── webpack.config.js              # webpack設定
├── tailwind.config.js             # Tailwind CSS設定
├── README.md                      # プラグイン説明
├── PROJECT_STRUCTURE.md           # このファイル
└── TECHNICAL_SPEC.md              # 技術仕様書
```

## ファイル詳細

### 設定ファイル

#### `package.json`
- npm依存関係の管理
- ビルドスクリプトの定義
- TabViewプラグインをベースに作成

#### `tsconfig.json`
- TypeScriptコンパイラの設定
- React JSXのサポート
- ES2020ターゲット

#### `webpack.config.js`
- バンドル設定（config.js, desktop.js）
- Tailwind CSSの処理
- 本番ビルドとdev watchモードの設定

#### `tailwind.config.js`
- Tailwind CSSのカスタマイズ
- カラーパレット、フォント等

### ソースコード

#### `src/types/index.ts`
- プラグイン全体で使用する型定義
- PluginConfig, DisplayRule, Condition, Action等

#### `src/shared/ConditionEvaluator.ts`
- 条件評価ロジック
- equals, not_equals, is_empty, is_not_empty の実装

#### `src/shared/ConfigManager.ts`
- kintoneプラグイン設定の読み書き
- JSON形式でのシリアライズ/デシリアライズ

#### `src/shared/FieldService.ts`
- kintone APIを使ったフィールド情報取得
- サポート対象フィールドのフィルタリング

#### `src/desktop/FieldController.ts`
- フィールドとスペースの表示/非表示制御
- DOM操作

#### `src/desktop/index.ts`
- デスクトップJS（レコード画面）のメインロジック
- イベントハンドラーの登録

#### `src/config/index.tsx`
- 設定画面のReactアプリケーション
- ルール一覧、編集、保存機能

#### `src/config/components/RuleList.tsx`
- ルール一覧表示コンポーネント
- 編集・削除ボタン

#### `src/config/components/RuleEditor.tsx`
- ルール編集画面コンポーネント
- 条件とアクションの編集

### プラグインファイル

#### `plugin/manifest.json`
- プラグインのメタデータ
- 読み込むJS/CSSファイルの指定

#### `plugin/html/config.html`
- 設定画面のHTMLテンプレート
- React DOMのマウントポイント

#### `plugin/icon.png`
- プラグインアイコン（48x48px）

### ドキュメント

#### `README.md`
- プラグインの使い方
- インストール手順
- 機能一覧

#### `TECHNICAL_SPEC.md`
- 技術仕様書
- アーキテクチャ、API仕様

#### `PROJECT_STRUCTURE.md`
- このファイル
- ディレクトリ構造の説明

## 次のステップ

1. ディレクトリ構造の作成
2. package.jsonのセットアップ
3. TypeScript/webpack/Tailwind設定
4. 型定義ファイルの作成
5. 共通モジュールの実装
6. デスクトップJSの実装
7. 設定画面の実装
