# kintone プラグイン開発プロジェクト

kintoneプラグインを複数開発し、最終的には有償販売を目指すプロジェクトです。

**作成者**: Sakaguchi Takaya
**開始日**: 2026年1月4日
**現在のフェーズ**: Phase 8 - テスト準備完了

---

## 📁 プロジェクト構成

```
kintone-plugins/
├── CLAUDE.md                 # プロジェクト要件定義
├── README.md                 # プロジェクト概要（本ファイル）
├── docs/                     # ドキュメント
│   ├── competitive-analysis.md      # 競合分析
│   ├── ribbit-code-analysis.md      # Ribbitコード分析
│   ├── design-review.md             # UI/UX設計レビュー
│   ├── ui-mockup.md                 # UIモックアップ
│   ├── development-progress.md      # 開発進捗
│   ├── testing-guide.md             # テストガイド
│   ├── quick-start.md               # クイックスタートガイド
│   └── tickets/
│       └── 001_tab-view_initial-release.md  # チケット管理
└── plugins/                  # プラグイン本体
    └── tab-view/             # TabViewプラグイン
        ├── src/              # ソースコード
        ├── plugin/           # ビルド後のファイル
        ├── plugin.zip        # パッケージ済みプラグイン (108KB)
        ├── package.json
        ├── tsconfig.json
        ├── webpack.config.js
        └── README.md
```

---

## 🚀 プラグイン一覧

### 1. TabView（タブビュー）

**ステータス**: ✅ Phase 7完了（テスト準備完了）
**説明**: kintoneのレコード詳細画面をタブで整理し、見やすく表示するプラグイン

**主な機能**:
- 水平タブUIで情報を整理
- 最大5タブまで無料で利用可能
- ドラッグ&ドロップ（予定）で直感的に設定
- レスポンシブデザイン対応

**技術スタック**:
- TypeScript
- React 18
- Tailwind CSS
- webpack

**ドキュメント**:
- [プラグインREADME](./plugins/tab-view/README.md)
- [開発進捗](./docs/development-progress.md)
- [テストガイド](./docs/testing-guide.md)
- [クイックスタートガイド](./docs/quick-start.md)

**次のステップ**:
1. kintone開発環境でテスト
2. バグ修正
3. GitHubリポジトリ公開
4. kintone プラグインマーケットへ申請

---

## 📖 ドキュメント

### プロジェクト全体

- [CLAUDE.md](./CLAUDE.md) - プロジェクト要件定義
  - 開発方針・ルール
  - 技術スタック
  - UI/UXデザインガイドライン（Sociomedia HIG準拠）
  - コーディング規約

### TabView プラグイン

- [チケット001](./docs/tickets/001_tab-view_initial-release.md) - 要件定義
- [競合分析](./docs/competitive-analysis.md) - 市場調査
- [Ribbitコード分析](./docs/ribbit-code-analysis.md) - 技術調査
- [UI/UXモックアップ](./docs/ui-mockup.md) - デザイン設計
- [設計レビュー](./docs/design-review.md) - Sociomedia HIG準拠チェック
- [開発進捗](./docs/development-progress.md) - 開発状況
- [テストガイド](./docs/testing-guide.md) - テスト手順（18ケース）
- [クイックスタートガイド](./docs/quick-start.md) - 5分で試せるガイド

---

## 🛠️ 開発環境

### 必要なツール

- Node.js 20.x以上
- npm 9.x以上
- Git
- VSCode（推奨）

### セットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd kintone-plugins

# TabViewプラグインのセットアップ
cd plugins/tab-view
npm install

# 開発モード（ファイル監視）
npm run dev

# ビルド
npm run build

# パッケージング
npm run package

# kintoneにアップロード
npm run upload -- --domain your-domain.cybozu.com
```

---

## 🎯 開発方針

### 基本原則

1. **ユーザーファースト**: 使いやすさを最優先
2. **シンプル設計**: 1プラグイン = 1機能
3. **高品質**: バグのない安定したプラグイン
4. **ドキュメント重視**: READMEやヘルプを充実

### デザインガイドライン

- **Sociomedia HIG 100項目**準拠
- Apple/Google/Microsoft HIG参照
- WCAG AA基準対応

### コーディング規約

- **命名規則**:
  - 変数・関数: camelCase
  - クラス・型: PascalCase
  - 定数: UPPER_SNAKE_CASE
- **インデント**: 2スペース
- **クォート**: シングルクォート
- **型定義**: TypeScriptで必ず型を明示

---

## 📊 開発状況

### TabView プラグイン

| Phase | 内容 | ステータス | 完了率 |
|-------|------|-----------|--------|
| 1 | 環境構築 | ✅ 完了 | 100% |
| 2 | 型定義・ユーティリティ | ✅ 完了 | 100% |
| 3 | 設定画面 | ✅ 完了 | 100% |
| 4 | レコード画面 | ✅ 完了 | 100% |
| 5 | ビルド | ✅ 完了 | 100% |
| 6 | パッケージング | ✅ 完了 | 100% |
| 7 | テストドキュメント | ✅ 完了 | 100% |
| 8 | テスト | ⏳ 準備完了 | 0% |
| 9 | リリース準備 | ⏸️ 未着手 | 0% |

**総開発時間**: 約4時間（2026年1月4日）

---

## 🧪 テスト

### クイックスタート

1. [クイックスタートガイド](./docs/quick-start.md)を参照
2. プラグインをインストール（`plugins/tab-view/plugin.zip`）
3. 5分で動作確認

### 詳細テスト

1. [テストガイド](./docs/testing-guide.md)を参照
2. 18個のテストケースを実施
3. 結果を記録

---

## 📝 今後の予定

### 短期（1-2週間）

- [ ] TabViewプラグインのテスト実施
- [ ] バグ修正
- [ ] GitHubリポジトリ公開

### 中期（1-2ヶ月）

- [ ] TabViewプラグインをkintone プラグインマーケットに申請
- [ ] 2個目のプラグイン企画・開発
- [ ] 3個目のプラグイン企画・開発

### 長期（3-6ヶ月）

- [ ] 無償プラグイン 3-5個リリース
- [ ] ユーザーフィードバック収集
- [ ] 有償プラグインの企画

---

## 🤝 コントリビューション

現在はソロプロジェクトですが、将来的にはオープンソース化を検討しています。

---

## 📄 ライセンス

MIT License

---

## 📞 お問い合わせ

- 作成者: Sakaguchi Takaya
- GitHub: （準備中）
- Email: （準備中）

---

**プロジェクト開始日**: 2026年1月4日
**最終更新日**: 2026年1月4日
