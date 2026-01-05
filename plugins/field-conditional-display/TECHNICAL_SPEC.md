# フィールド条件表示プラグイン 技術仕様書

**プラグイン名**: フィールド条件表示プラグイン
**英語名**: field-conditional-display
**バージョン**: 1.0.0
**作成日**: 2026年1月5日

---

## 目次

1. [概要](#概要)
2. [システムアーキテクチャ](#システムアーキテクチャ)
3. [プロジェクト構成](#プロジェクト構成)
4. [データ構造](#データ構造)
5. [主要モジュール](#主要モジュール)
6. [kintone API 仕様](#kintone-api-仕様)
7. [実装の詳細](#実装の詳細)
8. [パフォーマンス要件](#パフォーマンス要件)
9. [テスト計画](#テスト計画)

---

## 概要

### プラグインの目的
特定フィールドの値に応じて、他のフィールドやスペースの表示/非表示を動的に制御するプラグイン。

### 対象画面
- レコード詳細画面（`app.record.detail.show`）
- レコード編集画面（`app.record.edit.show`）
- レコード追加画面（`app.record.create.show`）

### Phase 1（MVP）の機能範囲
- 単一条件の設定（equals, not_equals, is_empty, is_not_empty）
- フィールドの表示/非表示制御
- スペースの表示/非表示制御
- 設定画面UI（ルール一覧、ルール編集）
- プレビュー機能（簡易版）

---

## システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                    kintone アプリ                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐        ┌──────────────────────┐  │
│  │  設定画面        │        │  レコード画面         │  │
│  │  (config.js)    │        │  (desktop.js)        │  │
│  │                 │        │                      │  │
│  │  - ルール管理    │        │  - 条件評価          │  │
│  │  - UI編集       │        │  - DOM操作           │  │
│  │  - プレビュー    │        │  - イベント監視       │  │
│  └─────────────────┘        └──────────────────────┘  │
│           │                           │                │
│           └───────────┬───────────────┘                │
│                       │                                │
│              ┌────────▼────────┐                       │
│              │  共通モジュール  │                       │
│              │                 │                       │
│              │ - ConditionEvaluator (条件評価)        │
│              │ - FieldController (フィールド制御)      │
│              │ - ConfigManager (設定管理)             │
│              └─────────────────┘                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## プロジェクト構成

```
plugins/field-conditional-display/
├── src/
│   ├── config/                    # 設定画面
│   │   ├── index.tsx             # React エントリーポイント
│   │   ├── components/           # React コンポーネント
│   │   │   ├── RuleList.tsx     # ルール一覧
│   │   │   ├── RuleEditor.tsx   # ルール編集
│   │   │   ├── ConditionEditor.tsx  # 条件編集
│   │   │   ├── ActionEditor.tsx     # アクション編集
│   │   │   └── PreviewModal.tsx     # プレビュー
│   │   └── styles.css            # Tailwind CSS
│   │
│   ├── desktop/                   # レコード画面
│   │   ├── index.ts              # デスクトップJSエントリーポイント
│   │   ├── FieldController.ts    # フィールド制御
│   │   └── EventHandler.ts       # イベントハンドラー
│   │
│   ├── shared/                    # 共通モジュール
│   │   ├── ConditionEvaluator.ts # 条件評価エンジン
│   │   ├── ConfigManager.ts      # 設定管理
│   │   ├── FieldService.ts       # フィールド情報取得
│   │   └── Analytics.ts          # 利用統計（PostHog）
│   │
│   └── types/                     # 型定義
│       └── index.ts              # 全ての型定義
│
├── plugin/                        # ビルド成果物
│   ├── js/
│   │   ├── config.js
│   │   └── desktop.js
│   ├── css/
│   │   ├── config.css
│   │   └── desktop.css
│   ├── html/
│   │   └── config.html
│   ├── icon.png
│   └── manifest.json
│
├── package.json
├── tsconfig.json
├── webpack.config.js
├── tailwind.config.js
├── README.md
└── TECHNICAL_SPEC.md             # この文書
```

---

## データ構造

### 型定義（`src/types/index.ts`）

```typescript
/**
 * プラグイン設定全体
 */
export interface PluginConfig {
  /** 表示制御ルールの配列 */
  rules: DisplayRule[];
  /** 設定のバージョン（マイグレーション用） */
  version: string;
}

/**
 * 表示制御ルール
 */
export interface DisplayRule {
  /** ルールID（UUID v4） */
  id: string;
  /** ルール名（例: "法人・個人の項目切り替え"） */
  name: string;
  /** 有効/無効フラグ */
  enabled: boolean;
  /** 条件グループ */
  conditions: ConditionGroup;
  /** アクション（表示/非表示） */
  actions: Action[];
  /** 優先度（将来のPhaseで使用） */
  priority: number;
}

/**
 * 条件グループ
 * Phase 1では単一条件のみ（operatorは常に'AND'）
 * Phase 2で複数条件対応時に使用
 */
export interface ConditionGroup {
  /** 論理演算子（Phase 1では未使用） */
  operator: 'AND' | 'OR';
  /** 条件の配列（Phase 1では1つのみ） */
  conditions: Condition[];
}

/**
 * 単一条件
 */
export interface Condition {
  /** トリガーフィールドのフィールドコード */
  fieldCode: string;
  /** 比較演算子 */
  operator: Operator;
  /** 比較値（文字列 or 文字列配列） */
  value: string | string[];
}

/**
 * アクション
 */
export interface Action {
  /** アクションタイプ（Phase 1では show/hide のみ） */
  type: 'show' | 'hide';
  /** ターゲット（フィールド/スペース） */
  targets: Target[];
}

/**
 * ターゲット
 */
export interface Target {
  /** ターゲットタイプ */
  type: 'field' | 'space';
  /** フィールドコード or スペースID */
  elementId: string;
}

/**
 * 演算子（Phase 1）
 */
export type Operator =
  | 'equals'           // 等しい
  | 'not_equals'       // 等しくない
  | 'is_empty'         // 空である
  | 'is_not_empty';    // 空でない

/**
 * フィールド情報（kintone APIから取得）
 */
export interface KintoneField {
  /** フィールドコード */
  code: string;
  /** フィールドラベル */
  label: string;
  /** フィールドタイプ */
  type: string;
  /** 必須フラグ */
  required?: boolean;
}

/**
 * スペース情報
 */
export interface KintoneSpace {
  /** スペースID */
  id: string;
  /** スペース要素ID */
  elementId: string;
}
```

### 設定データの保存形式

kintoneプラグインの設定は、`kintone.plugin.app.setConfig()` でJSON文字列として保存されます。

```json
{
  "config": "{\"rules\":[{\"id\":\"uuid-1\",\"name\":\"法人・個人の項目切り替え\",\"enabled\":true,\"conditions\":{\"operator\":\"AND\",\"conditions\":[{\"fieldCode\":\"customer_type\",\"operator\":\"equals\",\"value\":\"法人\"}]},\"actions\":[{\"type\":\"show\",\"targets\":[{\"type\":\"field\",\"elementId\":\"company_name\"}]},{\"type\":\"hide\",\"targets\":[{\"type\":\"field\",\"elementId\":\"personal_name\"}]}],\"priority\":0}],\"version\":\"1.0.0\"}"
}
```

---

## 主要モジュール

### 1. ConditionEvaluator（条件評価エンジン）

**役割**: 条件式を評価し、真偽値を返す

**ファイル**: `src/shared/ConditionEvaluator.ts`

```typescript
/**
 * 条件評価エンジン
 */
export class ConditionEvaluator {
  /**
   * 条件グループを評価
   * @param conditionGroup 条件グループ
   * @param record kintoneレコードオブジェクト
   * @returns 評価結果（true/false）
   */
  evaluate(conditionGroup: ConditionGroup, record: kintone.types.SavedRecord): boolean {
    // Phase 1では単一条件のみ評価
    if (conditionGroup.conditions.length === 0) return false;

    const condition = conditionGroup.conditions[0] as Condition;
    return this.evaluateCondition(condition, record);
  }

  /**
   * 単一条件を評価
   */
  private evaluateCondition(condition: Condition, record: kintone.types.SavedRecord): boolean {
    const field = record[condition.fieldCode];
    if (!field) return false;

    const fieldValue = this.getFieldValue(field);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;

      case 'not_equals':
        return fieldValue !== condition.value;

      case 'is_empty':
        return fieldValue === '' || fieldValue === null || fieldValue === undefined;

      case 'is_not_empty':
        return fieldValue !== '' && fieldValue !== null && fieldValue !== undefined;

      default:
        return false;
    }
  }

  /**
   * フィールドから値を取得（フィールドタイプに応じた処理）
   */
  private getFieldValue(field: kintone.fieldTypes.OneOf): string | string[] | null {
    // SINGLE_LINE_TEXT, MULTI_LINE_TEXT, NUMBER, etc.
    if ('value' in field) {
      return String(field.value || '');
    }

    // DROP_DOWN, RADIO_BUTTON
    if ('value' in field && typeof field.value === 'string') {
      return field.value;
    }

    // CHECK_BOX, MULTI_SELECT
    if ('value' in field && Array.isArray(field.value)) {
      return field.value;
    }

    return null;
  }
}
```

---

### 2. FieldController（フィールド制御）

**役割**: フィールド/スペースの表示/非表示を制御

**ファイル**: `src/desktop/FieldController.ts`

```typescript
/**
 * フィールド制御クラス
 */
export class FieldController {
  /**
   * ルールに基づいてフィールドの表示/非表示を制御
   */
  applyRule(rule: DisplayRule, shouldApply: boolean): void {
    rule.actions.forEach(action => {
      action.targets.forEach(target => {
        if (target.type === 'field') {
          this.toggleField(target.elementId, action.type, shouldApply);
        } else if (target.type === 'space') {
          this.toggleSpace(target.elementId, action.type, shouldApply);
        }
      });
    });
  }

  /**
   * フィールドの表示/非表示を切り替え
   * @param fieldCode フィールドコード
   * @param actionType 'show' or 'hide'
   * @param shouldApply 条件が満たされているか
   */
  private toggleField(fieldCode: string, actionType: 'show' | 'hide', shouldApply: boolean): void {
    const fieldElement = kintone.app.record.getFieldElement(fieldCode);
    if (!fieldElement) {
      console.warn(`フィールドが見つかりません: ${fieldCode}`);
      return;
    }

    // フィールドの行（tr要素）を取得
    const fieldRow = fieldElement.closest('tr');
    if (!fieldRow) return;

    // 表示制御
    if (actionType === 'hide' && shouldApply) {
      fieldRow.style.display = 'none';
    } else if (actionType === 'show' && shouldApply) {
      fieldRow.style.display = '';
    } else if (actionType === 'hide' && !shouldApply) {
      fieldRow.style.display = '';
    } else if (actionType === 'show' && !shouldApply) {
      fieldRow.style.display = 'none';
    }
  }

  /**
   * スペースの表示/非表示を切り替え
   * @param spaceId スペースのID
   * @param actionType 'show' or 'hide'
   * @param shouldApply 条件が満たされているか
   */
  private toggleSpace(spaceId: string, actionType: 'show' | 'hide', shouldApply: boolean): void {
    const spaceElement = kintone.app.record.getSpaceElement(spaceId);
    if (!spaceElement) {
      console.warn(`スペースが見つかりません: ${spaceId}`);
      return;
    }

    // 表示制御
    if (actionType === 'hide' && shouldApply) {
      spaceElement.style.display = 'none';
    } else if (actionType === 'show' && shouldApply) {
      spaceElement.style.display = '';
    } else if (actionType === 'hide' && !shouldApply) {
      spaceElement.style.display = '';
    } else if (actionType === 'show' && !shouldApply) {
      spaceElement.style.display = 'none';
    }
  }
}
```

---

### 3. ConfigManager（設定管理）

**役割**: プラグイン設定の読み書き

**ファイル**: `src/shared/ConfigManager.ts`

```typescript
/**
 * 設定管理クラス
 */
export class ConfigManager {
  private pluginId: string;

  constructor(pluginId: string) {
    this.pluginId = pluginId;
  }

  /**
   * 設定を読み込む
   */
  load(): PluginConfig {
    const config = kintone.plugin.app.getConfig(this.pluginId);

    if (!config || !config.config) {
      // 初期設定
      return {
        rules: [],
        version: '1.0.0'
      };
    }

    try {
      return JSON.parse(config.config) as PluginConfig;
    } catch (e) {
      console.error('設定の読み込みに失敗しました', e);
      return {
        rules: [],
        version: '1.0.0'
      };
    }
  }

  /**
   * 設定を保存
   */
  save(config: PluginConfig): Promise<void> {
    return kintone.plugin.app.setConfig({
      config: JSON.stringify(config)
    });
  }
}
```

---

### 4. FieldService（フィールド情報取得）

**役割**: kintone APIからフィールド情報を取得

**ファイル**: `src/shared/FieldService.ts`

```typescript
/**
 * フィールド情報取得サービス
 */
export class FieldService {
  /**
   * アプリのフィールド情報を取得
   */
  async getFields(): Promise<KintoneField[]> {
    const appId = kintone.app.getId();
    if (!appId) throw new Error('アプリIDが取得できません');

    const response = await kintone.api(
      kintone.api.url('/k/v1/app/form/fields', true),
      'GET',
      { app: appId }
    );

    const fields: KintoneField[] = [];
    for (const [code, field] of Object.entries(response.properties)) {
      // サポート対象フィールドのみ抽出
      if (this.isSupportedFieldType(field.type)) {
        fields.push({
          code: code,
          label: field.label,
          type: field.type,
          required: field.required
        });
      }
    }

    return fields;
  }

  /**
   * サポート対象フィールドタイプか判定
   */
  private isSupportedFieldType(type: string): boolean {
    const supportedTypes = [
      'SINGLE_LINE_TEXT',
      'MULTI_LINE_TEXT',
      'NUMBER',
      'DROP_DOWN',
      'RADIO_BUTTON',
      'CHECK_BOX',
      'DATE',
      'DATETIME',
      'USER_SELECT',
      'ORGANIZATION_SELECT',
      'GROUP_SELECT'
    ];
    return supportedTypes.includes(type);
  }

  /**
   * スペース情報を取得
   */
  getSpaces(): KintoneSpace[] {
    // kintoneにはスペース情報を取得するAPIがないため、
    // 設定画面でユーザーがスペースIDを手動入力する形式
    // （または、DOM解析で取得）
    return [];
  }
}
```

---

## kintone API 仕様

### 使用するkintone API

#### 1. フィールド情報取得
```javascript
kintone.api(
  kintone.api.url('/k/v1/app/form/fields', true),
  'GET',
  { app: kintone.app.getId() }
);
```

#### 2. プラグイン設定の読み書き
```javascript
// 読み込み
const config = kintone.plugin.app.getConfig(PLUGIN_ID);

// 書き込み
kintone.plugin.app.setConfig({ config: JSON.stringify(data) });
```

#### 3. イベントハンドラー
```javascript
// レコード詳細画面表示時
kintone.events.on('app.record.detail.show', (event) => {
  // 条件評価 & フィールド制御
});

// レコード編集画面表示時
kintone.events.on('app.record.edit.show', (event) => {
  // 条件評価 & フィールド制御
});

// フィールド値変更時（トリガーフィールドの値が変わったら再評価）
kintone.events.on('app.record.edit.change.{fieldCode}', (event) => {
  // 条件再評価 & フィールド制御
});
```

#### 4. DOM操作
```javascript
// フィールド要素取得
const fieldElement = kintone.app.record.getFieldElement(fieldCode);

// スペース要素取得
const spaceElement = kintone.app.record.getSpaceElement(spaceId);
```

---

## 実装の詳細

### デスクトップJS（`src/desktop/index.ts`）

```typescript
import { ConditionEvaluator } from '../shared/ConditionEvaluator';
import { FieldController } from './FieldController';
import { ConfigManager } from '../shared/ConfigManager';
import { Analytics } from '../shared/Analytics';

(function(PLUGIN_ID) {
  'use strict';

  const configManager = new ConfigManager(PLUGIN_ID);
  const evaluator = new ConditionEvaluator();
  const fieldController = new FieldController();
  const analytics = new Analytics(PLUGIN_ID);

  // 設定を読み込み
  const config = configManager.load();

  // 有効なルールのみ抽出
  const enabledRules = config.rules.filter(rule => rule.enabled);

  /**
   * ルールを適用
   */
  function applyRules(record: kintone.types.SavedRecord): void {
    enabledRules.forEach(rule => {
      const shouldApply = evaluator.evaluate(rule.conditions, record);
      fieldController.applyRule(rule, shouldApply);
    });
  }

  // レコード詳細画面表示時
  kintone.events.on('app.record.detail.show', (event) => {
    applyRules(event.record);
    analytics.track('plugin_activated', { screen: 'detail' });
    return event;
  });

  // レコード編集画面表示時
  kintone.events.on(['app.record.edit.show', 'app.record.create.show'], (event) => {
    applyRules(event.record);
    analytics.track('plugin_activated', { screen: 'edit' });
    return event;
  });

  // フィールド値変更時（全てのトリガーフィールドを監視）
  const triggerFields = Array.from(new Set(
    enabledRules.map(rule => rule.conditions.conditions[0].fieldCode)
  ));

  triggerFields.forEach(fieldCode => {
    kintone.events.on(`app.record.edit.change.${fieldCode}`, (event) => {
      applyRules(event.record);
      return event;
    });

    kintone.events.on(`app.record.create.change.${fieldCode}`, (event) => {
      applyRules(event.record);
      return event;
    });
  });

})(kintone.$PLUGIN_ID);
```

---

### 設定画面（`src/config/index.tsx`）

```typescript
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { RuleList } from './components/RuleList';
import { RuleEditor } from './components/RuleEditor';
import { ConfigManager } from '../shared/ConfigManager';
import { FieldService } from '../shared/FieldService';
import type { PluginConfig, DisplayRule, KintoneField } from '../types';

const App: React.FC = () => {
  const [config, setConfig] = useState<PluginConfig>({ rules: [], version: '1.0.0' });
  const [fields, setFields] = useState<KintoneField[]>([]);
  const [editingRule, setEditingRule] = useState<DisplayRule | null>(null);

  const configManager = new ConfigManager(kintone.$PLUGIN_ID);
  const fieldService = new FieldService();

  // 初期化
  useEffect(() => {
    const loadData = async () => {
      const loadedConfig = configManager.load();
      setConfig(loadedConfig);

      const loadedFields = await fieldService.getFields();
      setFields(loadedFields);
    };
    loadData();
  }, []);

  // 保存
  const handleSave = async () => {
    await configManager.save(config);
    alert('設定を保存しました');
    window.location.href = '/k/admin/app/flow?app=' + kintone.app.getId();
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">フィールド条件表示プラグイン</h1>

      {editingRule ? (
        <RuleEditor
          rule={editingRule}
          fields={fields}
          onSave={(rule) => {
            // ルールを保存
            const index = config.rules.findIndex(r => r.id === rule.id);
            if (index >= 0) {
              config.rules[index] = rule;
            } else {
              config.rules.push(rule);
            }
            setConfig({ ...config });
            setEditingRule(null);
          }}
          onCancel={() => setEditingRule(null)}
        />
      ) : (
        <RuleList
          rules={config.rules}
          onEdit={setEditingRule}
          onDelete={(ruleId) => {
            config.rules = config.rules.filter(r => r.id !== ruleId);
            setConfig({ ...config });
          }}
          onAdd={() => {
            // 新規ルール作成
            const newRule: DisplayRule = {
              id: crypto.randomUUID(),
              name: '新しいルール',
              enabled: true,
              conditions: { operator: 'AND', conditions: [] },
              actions: [],
              priority: 0
            };
            setEditingRule(newRule);
          }}
        />
      )}

      <div className="mt-6 flex justify-end gap-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() => window.history.back()}
        >
          キャンセル
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleSave}
        >
          保存
        </button>
      </div>
    </div>
  );
};

// レンダリング
const container = document.getElementById('root');
if (container) {
  ReactDOM.render(<App />, container);
}
```

---

## パフォーマンス要件

### 1. 初回表示
- **目標**: 500ms以内
- **計測ポイント**: `app.record.detail.show` イベント発火から全てのルール適用完了まで

### 2. 条件評価
- **目標**: 100ms以内
- **計測ポイント**: `ConditionEvaluator.evaluate()` の実行時間

### 3. フィールド表示/非表示切り替え
- **目標**: 即座（アニメーションなし）
- **計測ポイント**: `FieldController.toggleField()` の実行時間

### パフォーマンス最適化の方針
1. **不要な再評価を避ける**: トリガーフィールドの変更時のみ再評価
2. **DOM操作を最小化**: 表示状態が変わる場合のみDOM操作
3. **設定のキャッシュ**: 設定は起動時に一度だけ読み込み

---

## テスト計画

### 単体テスト
- `ConditionEvaluator.evaluate()` の各演算子テスト
- `FieldController.toggleField()` のDOM操作テスト
- `ConfigManager.load()` / `save()` のシリアライズテスト

### 結合テスト
- ルール設定 → 保存 → レコード画面での動作確認
- 複数ルールが設定された場合の動作確認
- トリガーフィールド変更時の再評価確認

### E2Eテスト（手動）
- レコード詳細画面でのフィールド表示/非表示
- レコード編集画面でのフィールド表示/非表示
- トリガーフィールドの値変更による動的制御

### テストケース例

#### ケース1: 等しい条件
- **設定**: 顧客区分 = "法人" の時、法人名を表示
- **期待動作**:
  - 顧客区分が"法人"の場合 → 法人名が表示される
  - 顧客区分が"個人"の場合 → 法人名が非表示

#### ケース2: 空である条件
- **設定**: 備考が空の時、「備考なし」メッセージを表示
- **期待動作**:
  - 備考が空 → メッセージ表示
  - 備考に値がある → メッセージ非表示

---

## 今後の拡張（Phase 2以降）

### Phase 2
- 複数条件（AND/OR）のサポート
- 高度な演算子（contains, greater_than など）
- プレビュー機能の強化

### Phase 3
- 必須/任意の動的制御
- 条件のネスト（2階層）
- テーブル内フィールドの制御
- インポート/エクスポート機能

---

## 参考資料

- [kintone プラグイン開発](https://cybozu.dev/ja/kintone/docs/overview/plugin/)
- [kintone JavaScript API](https://cybozu.dev/ja/kintone/docs/js-api/)
- [React 18 ドキュメント](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
