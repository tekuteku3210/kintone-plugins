import React from 'react';
import type { Tab } from '@/types';

interface TabListProps {
  tabs: Tab[];
  activeTabId: string | null;
  onEdit: (tab: Tab) => void;
  onUpdate: (tab: Tab) => void;
  onDelete: (tabId: string) => void;
  onMove: (tabId: string, direction: 'up' | 'down') => void;
  onAdd: () => void;
  maxTabs: number;
}

const TabList: React.FC<TabListProps> = ({ tabs, activeTabId, onEdit, onUpdate, onDelete, onMove, onAdd, maxTabs }) => {
  const [editingTabId, setEditingTabId] = React.useState<string | null>(null);
  const [editingLabel, setEditingLabel] = React.useState('');

  const handleStartEdit = (tab: Tab, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTabId(tab.id);
    setEditingLabel(tab.label);
  };

  const handleSaveLabel = (tab: Tab) => {
    if (editingLabel.trim() && editingLabel !== tab.label) {
      // タブ名を更新（親コンポーネントで処理）
      const updatedTab = { ...tab, label: editingLabel.trim() };
      onUpdate(updatedTab);
    }
    setEditingTabId(null);
  };

  const handleKeyDown = (tab: Tab, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveLabel(tab);
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">タブ一覧</h2>

      {/* 横並びタブリスト (#80準拠: 左→右) */}
      <div className="flex gap-3 overflow-x-auto pb-2 items-stretch">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTabId;
          const isEditing = editingTabId === tab.id;

          return (
            <div
              key={tab.id}
              className={`flex-shrink-0 border-2 rounded-lg p-4 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-50 border-blue-500 shadow-md'
                  : 'bg-white border-gray-300 hover:border-blue-300 hover:shadow-sm'
              }`}
              style={{ minWidth: '200px' }}
              onClick={() => !isEditing && onEdit(tab)}
            >
              {/* タブ番号とラベル */}
              <div className="flex items-center gap-2 mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onBlur={() => handleSaveLabel(tab)}
                    onKeyDown={(e) => handleKeyDown(tab, e)}
                    maxLength={20}
                    autoFocus
                    className="flex-1 px-2 py-1 text-sm font-semibold border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <h3 className={`font-semibold text-base truncate flex-1 ${isActive ? 'text-blue-700' : 'text-gray-800'}`} title={tab.label}>
                      {index + 1}. {tab.label}
                    </h3>
                    <button
                      onClick={(e) => handleStartEdit(tab, e)}
                      className="text-gray-400 hover:text-gray-600 text-xs"
                      title="タブ名を編集"
                    >
                      ✏️
                    </button>
                  </>
                )}
              </div>

              {/* フィールド数 */}
              <p className="text-sm text-gray-600 mb-3">
                {tab.fields.length > 0 ? `${tab.fields.length}個のフィールド` : '未設定'}
              </p>

              {/* 操作ボタン - 1行に収める */}
              <div className="flex gap-1">
                {/* 左右移動ボタン */}
                <button
                  onClick={(e) => { e.stopPropagation(); onMove(tab.id, 'up'); }}
                  disabled={index === 0}
                  className={`px-2 py-1 text-xs rounded ${
                    index === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  title="左に移動"
                >
                  ←
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMove(tab.id, 'down'); }}
                  disabled={index === tabs.length - 1}
                  className={`px-2 py-1 text-xs rounded ${
                    index === tabs.length - 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  title="右に移動"
                >
                  →
                </button>

                {/* 削除ボタン */}
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(tab.id); }}
                  className="ml-auto px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
                  title="削除"
                >
                  削除
                </button>
              </div>
            </div>
          );
        })}

        {/* タブを追加ボタン - タブの並びに表示 */}
        <div className="flex-shrink-0" style={{ minWidth: '140px' }}>
          <button
            onClick={onAdd}
            className={`w-full h-full min-h-[120px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
              tabs.length >= maxTabs
                ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'border-gray-400 bg-gray-50 hover:bg-gray-100 hover:border-blue-400 text-gray-600'
            }`}
            disabled={tabs.length >= maxTabs}
          >
            <span className="text-2xl">+</span>
            <span className="text-sm font-medium">タブを追加</span>
            {tabs.length >= maxTabs && (
              <span className="text-xs text-red-500">(上限)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabList;
