import React, { useState, useEffect } from 'react';
import type { Tab, KintoneField } from '@/types';

interface TabEditorProps {
  tab: Tab;
  fields: Record<string, KintoneField>;
  allTabs: Tab[];
  onUpdate: (tab: Tab) => void;
}

const TabEditor: React.FC<TabEditorProps> = ({ tab, fields, allTabs, onUpdate }) => {
  const [selectedFields, setSelectedFields] = useState<string[]>(tab.fields);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSelectedFields(tab.fields);
  }, [tab.id, tab.fields]);

  const handleToggleField = (fieldCode: string) => {
    const newSelectedFields = selectedFields.includes(fieldCode)
      ? selectedFields.filter((f) => f !== fieldCode)
      : [...selectedFields, fieldCode];

    setSelectedFields(newSelectedFields);

    // 即座に親コンポーネントに反映（自動保存）
    const updatedTab: Tab = {
      ...tab,
      fields: newSelectedFields,
    };
    onUpdate(updatedTab);
  };

  // フィールドがどのタブで使用されているかをマッピング
  const fieldToTabsMap = new Map<string, string[]>();
  allTabs.forEach((t) => {
    if (t.id !== tab.id) {
      t.fields.forEach((fieldCode) => {
        if (!fieldToTabsMap.has(fieldCode)) {
          fieldToTabsMap.set(fieldCode, []);
        }
        fieldToTabsMap.get(fieldCode)!.push(t.label);
      });
    }
  });

  // フィールドをフィルタリング（検索条件 + 罫線を除外）
  const filteredFields = Object.values(fields).filter((field) => {
    // 罫線フィールドを除外
    if (field.type === 'HR') return false;

    // 検索条件
    return (
      field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // フィールドをkintoneのレイアウト順に並べる
  const sortedFields = [...filteredFields].sort((a, b) => {
    const orderA = a.order ?? 9999;
    const orderB = b.order ?? 9999;
    return orderA - orderB;
  });

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-blue-900">
          {tab.label}
          <span className="ml-2 text-sm font-normal text-blue-700">
            ({selectedFields.length}個)
          </span>
        </h2>
        {/* 検索ボックス */}
        <div className="w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 フィールドを検索..."
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="p-4">
        {/* フィールドリスト（プレビュー統合） */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-300 flex items-center gap-3">
            <div className="w-10 text-center text-xs font-medium text-gray-600">表示</div>
            <div className="flex-1 text-xs font-medium text-gray-700">フィールド名（コード）</div>
            <div className="w-24 text-xs font-medium text-gray-600 text-center">タイプ</div>
            <div className="w-32 text-xs font-medium text-gray-600 text-center">使用状況</div>
          </div>

          {/* フィールドリスト */}
          <div className="max-h-[500px] overflow-y-auto">
            {sortedFields.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>フィールドが見つかりませんでした</p>
                <p className="text-sm mt-2">検索条件を変更してください</p>
              </div>
            ) : (
              <div>
                {sortedFields.map((field, index) => {
                  const usedInTabs = fieldToTabsMap.get(field.code) || [];
                  const isSelected = selectedFields.includes(field.code);

                  return (
                    <label
                      key={field.code}
                      className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                        isSelected
                          ? 'bg-blue-50 hover:bg-blue-100'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* チェックボックス */}
                      <div className="w-10 flex justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleField(field.code)}
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        />
                      </div>

                      {/* フィールド名とコード（1行に） */}
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({field.code})
                        </span>
                      </div>

                      {/* フィールドタイプ */}
                      <div className="w-24 text-center">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                          {getFieldTypeName(field.type)}
                        </span>
                      </div>

                      {/* 使用状況 */}
                      <div className="w-32 text-center">
                        {usedInTabs.length > 0 ? (
                          <div className="text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded truncate" title={`使用中: ${usedInTabs.join(', ')}`}>
                            {usedInTabs.join(', ')}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* フッター情報 */}
        <div className="mt-3 flex justify-between items-center text-xs text-gray-600">
          <div>
            全{sortedFields.length}フィールド中 {selectedFields.length}個選択
          </div>
          {selectedFields.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedFields([]);
                onUpdate({ ...tab, fields: [] });
              }}
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              すべて解除
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// フィールドタイプ名を取得
const getFieldTypeName = (type: string): string => {
  const typeNames: Record<string, string> = {
    SINGLE_LINE_TEXT: 'テキスト',
    MULTI_LINE_TEXT: '複数行',
    RICH_TEXT: 'リッチ',
    NUMBER: '数値',
    CALC: '計算',
    RADIO_BUTTON: 'ラジオ',
    CHECK_BOX: 'チェック',
    MULTI_SELECT: '複数選択',
    DROP_DOWN: 'ドロップ',
    DATE: '日付',
    TIME: '時刻',
    DATETIME: '日時',
    LINK: 'リンク',
    FILE: 'ファイル',
    USER_SELECT: 'ユーザー',
    ORGANIZATION_SELECT: '組織',
    GROUP_SELECT: 'グループ',
    SUBTABLE: 'テーブル',
    CREATOR: '作成者',
    MODIFIER: '更新者',
    CREATED_TIME: '作成日時',
    UPDATED_TIME: '更新日時',
    RECORD_NUMBER: 'レコード番号',
    GROUP: 'グループ',
    LABEL: 'ラベル',
  };

  return typeNames[type] || type;
};

export default TabEditor;
