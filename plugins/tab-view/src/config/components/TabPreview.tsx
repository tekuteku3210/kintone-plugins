import React from 'react';
import type { Tab, KintoneField } from '@/types';

interface TabPreviewProps {
  tabs: Tab[];
  fields: Record<string, KintoneField>;
}

const TabPreview: React.FC<TabPreviewProps> = ({ tabs, fields }) => {
  const [activeTabId, setActiveTabId] = React.useState<string>(tabs[0]?.id || '');

  // アクティブなタブを取得
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  // タブに割り当てられているフィールドを取得
  const getTabFields = (tab: Tab): KintoneField[] => {
    return tab.fields
      .map((fieldCode) => fields[fieldCode])
      .filter(Boolean)
      .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  };

  // フィールドタイプに応じたプレースホルダーを取得
  const getFieldPlaceholder = (type: string): string => {
    const placeholders: Record<string, string> = {
      SINGLE_LINE_TEXT: 'テキストを入力',
      MULTI_LINE_TEXT: 'テキストを入力...',
      NUMBER: '0',
      DATE: 'YYYY-MM-DD',
      TIME: 'HH:MM',
      DATETIME: 'YYYY-MM-DD HH:MM',
      DROP_DOWN: '選択してください',
      RADIO_BUTTON: '○ 選択肢1 ○ 選択肢2',
      CHECK_BOX: '☐ 選択肢1 ☐ 選択肢2',
    };
    return placeholders[type] || '';
  };

  if (tabs.length === 0) {
    return (
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-gray-500">タブがまだ設定されていません</p>
        <p className="text-sm text-gray-400 mt-2">「タブを追加」ボタンからタブを作成してください</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">プレビュー</h2>
      <p className="text-sm text-gray-600 mb-4">
        レコード詳細画面での表示イメージを確認できます
      </p>

      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        {/* タブヘッダー */}
        <div className="flex border-b border-gray-300 bg-gray-50">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const textColor = isActive
              ? getContrastColor(tab.color)
              : '#374151';
            const bgColor = isActive ? tab.color || '#3b82f6' : 'transparent';

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className="px-6 py-3 text-sm font-medium transition-all border-r border-gray-300 last:border-r-0"
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                  borderBottom: isActive ? 'none' : '1px solid #d1d5db',
                }}
              >
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
                <span className="ml-2 text-xs opacity-75">
                  ({tab.fields.length})
                </span>
              </button>
            );
          })}
        </div>

        {/* タブコンテンツ */}
        <div className="p-6">
          {activeTab ? (
            <div className="space-y-4">
              {getTabFields(activeTab).map((field) => (
                <div key={field.code} className="flex items-start gap-4">
                  <label className="w-1/3 text-sm font-medium text-gray-700 pt-2">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <div className="flex-1">
                    <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm text-gray-500">
                      {getFieldPlaceholder(field.type)}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {getFieldTypeName(field.type)}
                    </p>
                  </div>
                </div>
              ))}

              {activeTab.fields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>このタブにはフィールドが設定されていません</p>
                  <p className="text-sm mt-2">
                    タブ編集画面でフィールドを選択してください
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              タブを選択してください
            </div>
          )}
        </div>
      </div>

      {/* 注意事項 */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>💡 ヒント:</strong>
          タブを表示する位置を指定するには、kintoneアプリのフォーム設定で「スペース」フィールドを追加し、
          要素IDに <code className="bg-blue-100 px-1 rounded">tabview-space</code> と設定してください。
          スペースフィールドがない場合は、フィールドグループの上部に自動で表示されます。
        </p>
      </div>
    </div>
  );
};

// WCAG準拠のテキストカラーを計算
const getContrastColor = (hexColor?: string): string => {
  if (!hexColor) return '#000000';

  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 相対輝度を計算
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // 輝度が0.5以上なら黒文字、それ以外は白文字
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// フィールドタイプ名を取得
const getFieldTypeName = (type: string): string => {
  const typeNames: Record<string, string> = {
    SINGLE_LINE_TEXT: 'テキスト（1行）',
    MULTI_LINE_TEXT: 'テキスト（複数行）',
    RICH_TEXT: 'リッチテキスト',
    NUMBER: '数値',
    CALC: '計算',
    RADIO_BUTTON: 'ラジオボタン',
    CHECK_BOX: 'チェックボックス',
    MULTI_SELECT: 'ドロップダウン（複数選択）',
    DROP_DOWN: 'ドロップダウン',
    DATE: '日付',
    TIME: '時刻',
    DATETIME: '日時',
    LINK: 'リンク',
    FILE: 'ファイル',
    USER_SELECT: 'ユーザー選択',
    ORGANIZATION_SELECT: '組織選択',
    GROUP_SELECT: 'グループ選択',
    SUBTABLE: 'テーブル',
    CREATOR: '作成者',
    MODIFIER: '更新者',
    CREATED_TIME: '作成日時',
    UPDATED_TIME: '更新日時',
    RECORD_NUMBER: 'レコード番号',
  };

  return typeNames[type] || type;
};

export default TabPreview;
