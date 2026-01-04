# Ribbit's works タブ表示プラグイン コード分析

**調査日**: 2026年1月4日
**GitHubリポジトリ**: https://github.com/local-bias/kintone-plugin-tab
**ライセンス**: MIT License

---

## 目次

1. [概要](#概要)
2. [技術スタック](#技術スタック)
3. [プロジェクト構成](#プロジェクト構成)
4. [参考にできる点](#参考にできる点)
5. [TabViewでの採用判断](#tabviewでの採用判断)

---

## 概要

### リポジトリ情報
- **プロジェクト名**: kintone-plugin-tab
- **開発者**: local-bias
- **コミット数**: 816回
- **リリース数**: 9回（最新: v2.7.0）
- **言語構成**:
  - TypeScript: 93.8%
  - JavaScript: 4.3%
  - HTML: 1.8%
  - CSS: 0.1%

### 機能
「スクロールに追従する垂直方向のタブを追加する」kintoneプラグイン

---

## 技術スタック

### 言語・フレームワーク
- **TypeScript**: メイン開発言語（93.8%）
- **型安全性**: tsconfig.jsonで厳格な型チェック

### スタイリング
- **Tailwind CSS**: ユーティリティファーストCSS
- **複数設定**: 環境別に3種類のTailwind設定
  - `tailwind.config.common.mjs`
  - `tailwind.config.config.mjs`
  - `tailwind.config.desktop.mjs`

### ビルドツール
- **パッケージマネージャー**: pnpm
- **Linter**: ESLint（.eslintrc.yml）
- **エディタ統一**: .editorconfig

### テンプレート
- **ベーステンプレート**: local-bias/kintone-plugin-template
  - この開発者が提供するkintoneプラグイン用のボイラープレート

---

## プロジェクト構成

### ディレクトリ構造

```
kintone-plugin-tab/
├── src/
│   ├── config/          # 設定画面
│   ├── contents/        # レコード画面のコンテンツ実装
│   ├── desktop/         # デスクトップ環境向けコンポーネント
│   ├── lib/             # 共通ユーティリティ・ライブラリ
│   ├── styles/          # スタイルシート
│   └── types/           # TypeScript型定義
├── cdn/                 # CDN関連ファイル
├── plugin.config.mjs    # プラグイン設定
├── package.json
├── tsconfig.json
├── .eslintrc.yml
├── tailwind.config.*.mjs  # Tailwind CSS設定（3種類）
├── .editorconfig
└── LICENSE (MIT)
```

### 設計思想

#### 環境別の分離
- **config**: 設定画面の実装
- **desktop**: レコード詳細・一覧画面の実装
- **contents**: 実際のタブコンテンツロジック
- **lib**: 共通関数・ユーティリティ
- **types**: 型定義を集約

#### Tailwind設定の分離理由
kintoneプラグインでは、設定画面とレコード画面が異なるコンテキストで動作するため、以下の理由で分離：
1. **スタイルの衝突回避**: kintone標準UIとの競合を防ぐ
2. **バンドルサイズ最適化**: 各画面で必要なスタイルのみ含める
3. **カスタマイズ性**: 画面ごとに異なるデザインシステムを適用可能

---

## 参考にできる点

### ✅ 良い点

#### 1. **TypeScript + Tailwind CSSの組み合わせ**
- 型安全性とモダンなUIを両立
- TabViewでも同じスタックを採用予定

#### 2. **環境別の設定分離**
- config（設定画面）とdesktop（レコード画面）を明確に分離
- この設計パターンは非常に参考になる

#### 3. **pnpm使用**
- npmより高速で、ディスク容量も節約
- TabViewでも採用検討

#### 4. **テンプレート活用**
- local-bias/kintone-plugin-templateを使用
- 車輪の再発明を避けている

#### 5. **MIT License**
- 商用利用可能で、コードを参考にできる
- TabViewもMITライセンスで公開予定

### ⚠️ 注意点・改善の余地

#### 1. **垂直タブ（縦タブ）**
- 一般的な水平タブ（横タブ）ではない
- **TabViewは水平タブで差別化**

#### 2. **ドキュメント不足**
- READMEがシンプルすぎる
- 使い方やスクリーンショットが少ない
- **TabViewは詳細なドキュメントを提供**

#### 3. **設定の複雑さ**
- 公式サイトでも「設定が少し面倒」と記載
- **TabViewはUI/UXを重視し、簡単に設定できるようにする**

---

## TabViewでの採用判断

### 採用する技術

| 技術 | 採用 | 理由 |
|------|------|------|
| **TypeScript** | ✅ | 型安全性、保守性向上 |
| **Tailwind CSS** | ✅ | モダンなUI、開発効率向上 |
| **環境別設定分離** | ✅ | config/desktopの分離パターンを参考 |
| **pnpm** | 🤔 | 検討（npmでも可） |
| **テンプレート** | ❌ | 学習のため、ゼロから構築 |

### 採用しない技術・パターン

| 項目 | 理由 |
|------|------|
| **垂直タブ** | 一般的な水平タブで差別化 |
| **複雑な設定** | シンプルで直感的なUIを目指す |

### TabView独自の強化ポイント

#### 1. **React導入**
- Ribbit's worksはReact不使用（素のTypeScript）
- TabViewはReactで動的なUIを構築
- 状態管理が簡単、コンポーネント再利用性向上

#### 2. **設定画面のUI/UX改善**
- ドラッグ&ドロップでタブの順序変更
- リアルタイムプレビュー
- フィールド検索機能

#### 3. **充実したドキュメント**
- 詳細なREADME
- スクリーンショット・GIF動画
- 動画チュートリアル（YouTubeなど）
- FAQセクション

#### 4. **水平タブ**
- 一般的なUIパターンで直感的
- Bootstrap、Material-UIなどの標準デザインに準拠

---

## 実装時の参考ポイント

### 1. プロジェクト構成

#### 参考にする構造
```
src/
├── config/              # 設定画面（Ribbit参考）
│   ├── index.tsx        # エントリーポイント
│   ├── App.tsx          # メインコンポーネント
│   └── components/      # 設定画面用コンポーネント
├── desktop/             # レコード画面（Ribbit参考）
│   ├── index.tsx
│   ├── App.tsx
│   └── components/      # タブUIコンポーネント
├── lib/                 # 共通ユーティリティ（Ribbit参考）
│   ├── kintone.ts       # kintone API wrapper
│   └── utils.ts         # 汎用関数
├── types/               # 型定義（Ribbit参考）
│   ├── plugin.ts        # プラグイン設定の型
│   └── kintone.ts       # kintone API の型
└── styles/              # Tailwind設定（Ribbit参考）
```

### 2. Tailwind設定の分離

#### config用（設定画面）
```javascript
// tailwind.config.config.mjs
export default {
  content: ['./src/config/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // 設定画面用のカスタムテーマ
    }
  }
}
```

#### desktop用（レコード画面）
```javascript
// tailwind.config.desktop.mjs
export default {
  content: ['./src/desktop/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // レコード画面用のカスタムテーマ
    }
  }
}
```

### 3. webpack設定

#### 参考にすべき設定
- エントリーポイントを分離（config.tsx, desktop.tsx）
- 環境別にバンドルを生成
- Tailwind CSSのビルド最適化

---

## 学んだこと

### 開発効率化
1. **テンプレート活用**: ボイラープレートで初期設定を省略
2. **型定義の集約**: types/ディレクトリで一元管理
3. **環境別設定**: Tailwind設定を分けることでスタイル衝突を回避

### kintoneプラグイン特有の課題
1. **設定画面とレコード画面の分離**: 異なるコンテキストで動作
2. **kintone標準UIとの共存**: スタイル競合に注意
3. **プラグイン設定の保存**: kintone.plugin.app.setConfig()の活用

---

## 次のステップ

### TabView開発で実施すること

1. **プロジェクト構成を決定**
   - Ribbit's worksの構成を参考に、React対応に拡張
   - config/desktop/lib/typesの分離パターンを採用

2. **技術スタック確定**
   - TypeScript ✅
   - React ✅（Ribbitにはない）
   - Tailwind CSS ✅
   - webpack ✅
   - pnpm or npm 🤔（要検討）

3. **差別化ポイントの実装**
   - 水平タブ（横タブ）
   - 簡単な設定画面（ドラッグ&ドロップ、プレビュー）
   - 充実したドキュメント

---

## 参考リンク

- [GitHub: kintone-plugin-tab](https://github.com/local-bias/kintone-plugin-tab)
- [Ribbit's works - タブ表示プラグイン](https://ribbit.konomi.app/kintone-plugin/tab/)
- [local-bias/kintone-plugin-template](https://github.com/local-bias/kintone-plugin-template)（推定）

---

**ドキュメント終わり**
