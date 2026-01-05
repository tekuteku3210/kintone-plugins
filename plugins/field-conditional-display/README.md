# フィールド条件表示プラグイン

**バージョン**: 1.0.0
**ライセンス**: MIT License（無償・商用利用可）

kintoneのレコード画面で、条件に応じてフィールドやスペースの表示/非表示を動的に制御するプラグインです。

---

## 主な機能

- ✅ 単一条件による表示制御（equals, not_equals, is_empty, is_not_empty）
- ✅ フィールドの表示/非表示
- ✅ スペースの表示/非表示
- ✅ レコード詳細・編集・追加画面に対応
- ✅ 直感的な設定画面UI
- ✅ 複数ルールの管理
- ✅ ルールの有効/無効切り替え

---

## 使い方

### 1. インストール

1. プラグインファイル（`field-conditional-display-v1.0.0.zip`）をダウンロード
2. kintoneの「設定」→「プラグイン」→「読み込む」からZIPファイルをアップロード
3. 対象アプリの「設定」→「プラグイン」→「追加」からプラグインを選択

### 2. ルールの設定

1. プラグインの設定画面を開く
2. 「+ 新しいルールを追加」をクリック
3. ルール名、条件、アクションを設定
4. 「保存」をクリック

### 3. 使用例

#### 例1: 顧客区分による項目切り替え

**条件**:
- トリガーフィールド: `customer_type`（顧客区分）
- 演算子: 等しい
- 値: `法人`

**アクション**:
- 表示: `company_name`（法人名）、`department`（部署）
- 非表示: `personal_name`（個人名）

#### 例2: 商品カテゴリによる項目表示

**条件**:
- トリガーフィールド: `product_category`（商品カテゴリ）
- 演算子: 等しい
- 値: `電化製品`

**アクション**:
- 表示: `model_number`（型番）、`warranty_period`（保証期間）

---

## 対応フィールドタイプ

### トリガーフィールド（条件判定に使用）

- 文字列（1行）
- 文字列（複数行）
- 数値
- ドロップダウン
- ラジオボタン
- チェックボックス
- 日付
- 日時
- ユーザー選択
- 組織選択
- グループ選択

### ターゲット（表示制御対象）

- 全ての標準フィールド
- スペース

---

## 対応演算子（Phase 1）

| 演算子 | 説明 | 例 |
|--------|------|-----|
| equals | 等しい | `customer_type = "法人"` |
| not_equals | 等しくない | `status ≠ "完了"` |
| is_empty | 空である | `備考が空` |
| is_not_empty | 空でない | `備考が空でない` |

---

## 開発者向け情報

### プロジェクト構成

```
field-conditional-display/
├── src/
│   ├── config/                # 設定画面（React）
│   ├── desktop/               # レコード画面（条件評価・フィールド制御）
│   ├── shared/                # 共通モジュール
│   └── types/                 # TypeScript型定義
├── plugin/                    # ビルド成果物
└── package.json
```

### ビルド方法

```bash
# セットアップ
cd plugins/field-conditional-display
npm install

# ビルド
npm run build

# パッケージング
npm run package
```

### 技術スタック

- TypeScript
- React 18
- Tailwind CSS
- webpack
- PostHog（利用統計）

---

## 今後の予定

### Phase 2: 拡張機能
- 複数条件（AND/OR）
- 高度な演算子（contains, greater_than, in_list など）
- プレビュー機能の強化

### Phase 3: 高度な機能
- 必須/任意の動的制御
- 条件のネスト（2階層）
- テーブル内フィールドの制御
- インポート/エクスポート

---

## プライバシーについて

このプラグインは、サービス改善のために匿名化された利用統計情報を収集します。

### 収集する情報
- プラグイン起動回数（DAU/MAU測定用）
- ルール数
- アプリID（環境識別用）

### 収集しない情報
- ❌ 個人情報（ユーザー名、メールアドレス、IPアドレス）
- ❌ レコードデータ（フィールドの値、レコードの内容）
- ❌ 設定情報（ルール名、フィールド名、条件の値）

### オプトアウト
利用統計の送信を停止したい場合は、ブラウザの開発者ツールで以下を実行してください:

```javascript
posthog.opt_out_capturing();
```

詳細は[プライバシーポリシー](https://tekuteku3210.github.io/kintone-plugins/privacy-policy.html)をご覧ください。

---

## ライセンス

MIT License - 無償・商用利用可

---

## サポート

バグ報告や機能リクエストは、[GitHub Issues](https://github.com/tekuteku3210/kintone-plugins/issues)にてお願いします。

---

## リンク

- **公式サイト**: https://tekuteku3210.github.io/kintone-plugins/
- **GitHub**: https://github.com/tekuteku3210/kintone-plugins
- **技術仕様書**: [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md)
