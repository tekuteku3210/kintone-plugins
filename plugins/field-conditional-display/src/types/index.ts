/**
 * フィールド条件表示プラグイン - 型定義
 */

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

/**
 * kintoneフィールド値の型
 */
export type FieldValue = string | string[] | number | null | undefined;

/**
 * バリデーションエラー
 */
export interface ValidationError {
  /** エラーの種類 */
  type: 'required' | 'invalid' | 'duplicate';
  /** エラーメッセージ */
  message: string;
  /** エラーが発生したフィールド */
  field?: string;
}
