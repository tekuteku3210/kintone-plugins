import React, { useState, useEffect } from 'react';
import type { Tab, KintoneField } from '@/types';

interface TabEditorProps {
  tab: Tab;
  fields: Record<string, KintoneField>;
  allTabs: Tab[];
  onSave: (tab: Tab) => void;
  onCancel: () => void;
}

const TabEditor: React.FC<TabEditorProps> = ({ tab, fields, allTabs, onSave, onCancel }) => {
  const [label, setLabel] = useState(tab.label);
  const [icon, setIcon] = useState(tab.icon || '');
  const [color, setColor] = useState(tab.color || '#3b82f6');
  const [selectedFields, setSelectedFields] = useState<string[]>(tab.fields);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLabel(tab.label);
    setIcon(tab.icon || '');
    setColor(tab.color || '#3b82f6');
    setSelectedFields(tab.fields);
  }, [tab]);

  const handleToggleField = (fieldCode: string) => {
    if (selectedFields.includes(fieldCode)) {
      setSelectedFields(selectedFields.filter((f) => f !== fieldCode));
    } else {
      setSelectedFields([...selectedFields, fieldCode]);
    }
  };

  const handleSave = () => {
    const updatedTab: Tab = {
      ...tab,
      label: label.trim(),
      icon,
      color,
      fields: selectedFields,
    };
    onSave(updatedTab);
  };

  // 他のタブで使用されているフィールドを取得
  const fieldsUsedInOtherTabs = new Set<string>();
  allTabs.forEach((t) => {
    if (t.id !== tab.id) {
      t.fields.forEach((f) => fieldsUsedInOtherTabs.add(f));
    }
  });

  // フィールドをフィルタリング（検索条件）
  const filteredFields = Object.values(fields).filter((field) =>
    field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    field.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // フィールドをkintoneのレイアウト順に並べる
  const sortedFields = [...filteredFields].sort((a, b) => {
    const orderA = a.order ?? 9999;
    const orderB = b.order ?? 9999;
    return orderA - orderB;
  });

  return (
    <div className="mt-8 border-t pt-6">
      <h2 className="text-lg font-semibold mb-4">タブ編集: {tab.label}</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* タブ名 */}
        <div>
          <label htmlFor="tab-label" className="block text-sm font-medium text-gray-700 mb-2">
            タブ名 <span className="text-red-500">*</span>
          </label>
          <input
            id="tab-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={20}
            placeholder="タブ名を入力（最大20文字）"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">{label.length} / 20 文字</p>
        </div>

        {/* アイコン */}
        <div>
          <label htmlFor="tab-icon" className="block text-sm font-medium text-gray-700 mb-2">
            アイコン（オプション）
          </label>
          <input
            id="tab-icon"
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="絵文字またはアイコン名（例: 👤, user）"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* タブの色 */}
        <div>
          <label htmlFor="tab-color" className="block text-sm font-medium text-gray-700 mb-2">
            タブの色（オプション）
          </label>
          <div className="flex items-center gap-4">
            <input
              id="tab-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#3b82f6"
              maxLength={7}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setColor('#3b82f6')}
              className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
            >
              リセット
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">タブの背景色を設定できます</p>
        </div>

        {/* フィールド選択 - 全幅で表示 */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            表示するフィールド <span className="text-red-500">*</span>
          </label>

          {/* 検索ボックス */}
          <div className="mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 フィールドを検索..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* フィールドリスト */}
          <div className="field-list max-h-96 overflow-y-auto border border-gray-200 rounded-md p-3">
            {sortedFields.length === 0 ? (
              <p className="text-gray-500 text-center py-4">フィールドが見つかりませんでした</p>
            ) : (
              <div className="space-y-1">
                {sortedFields.map((field) => {
                  const isUsedInOtherTab = fieldsUsedInOtherTabs.has(field.code);
                  const isSelected = selectedFields.includes(field.code);

                  return (
                    <label
                      key={field.code}
                      className={`flex items-center px-3 py-2 rounded cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 hover:bg-blue-100'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleField(field.code)}
                        className="mr-3 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="flex-1 text-sm">
                        {field.label}
                        <span className="text-gray-500 ml-2">({field.code})</span>
                      </span>
                      {isUsedInOtherTab && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded ml-2">
                          他タブで使用中
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              選択中: {selectedFields.length} フィールド
            </p>
            <button
              type="button"
              onClick={() => setSelectedFields([])}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              すべて選択解除
            </button>
          </div>
        </div>

        {/* 保存・キャンセルボタン - 全幅で表示 */}
        <div className="col-span-2 flex justify-end gap-4 pt-4 border-t mt-4">
          <button onClick={onCancel} className="btn-secondary">
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={!label.trim() || selectedFields.length === 0}
            className={`${
              !label.trim() || selectedFields.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed px-6 py-3 rounded-md'
                : 'btn-primary'
            }`}
          >
            タブを保存
          </button>
        </div>
      </div>
    </div>
  );
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
    GROUP: 'グループ',
    LABEL: 'ラベル',
    HR: '罫線',
  };

  return typeNames[type] || type;
};

export default TabEditor;
