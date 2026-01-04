/**
 * タブの定義
 */
export interface Tab {
  /** タブの一意ID */
  id: string;
  /** タブ名（最大20文字） */
  label: string;
  /** アイコン名（Font Awesome、絵文字など） */
  icon?: string;
  /** 表示するフィールドコードの配列 */
  fields: string[];
  /** タブの背景色（HEX形式、例: #3b82f6） */
  color?: string;
}

/**
 * プラグイン設定データ
 */
export interface PluginConfig {
  /** タブの配列 */
  tabs: Tab[];
  /** すべてのタブで表示するフィールド */
  commonFields?: string[];
}

/**
 * kintoneフィールド情報
 */
export interface KintoneField {
  /** フィールドコード */
  code: string;
  /** フィールド名 */
  label: string;
  /** フィールドタイプ */
  type: string;
  /** 必須フィールドかどうか */
  required?: boolean;
  /** レイアウト順序（小さいほど上） */
  order?: number;
}

/**
 * kintoneアプリ情報
 */
export interface KintoneApp {
  /** アプリID */
  appId: string;
  /** アプリ名 */
  name: string;
  /** フィールド一覧 */
  fields: Record<string, KintoneField>;
}

/**
 * エラーメッセージの型
 */
export interface ValidationError {
  /** エラーの種類 */
  type: 'required' | 'maxLength' | 'duplicate' | 'network' | 'permission';
  /** エラーメッセージ */
  message: string;
  /** エラーが発生したフィールド */
  field?: string;
}
