import React from 'react';
import type { Tab } from '@/types';

interface TabListProps {
  tabs: Tab[];
  onEdit: (tab: Tab) => void;
  onDelete: (tabId: string) => void;
  onMove: (tabId: string, direction: 'up' | 'down') => void;
  onAdd: () => void;
  maxTabs: number;
}

/**
 * 背景色の明度を計算し、適切な文字色（白または黒）を返す
 */
const getContrastColor = (hexColor?: string): string => {
  if (!hexColor) return '#000000';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

const TabList: React.FC<TabListProps> = ({ tabs, onEdit, onDelete, onMove, onAdd, maxTabs }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">タブ一覧</h2>

      {/* 横並びタブリスト (#80準拠: 左→右) */}
      <div className="flex gap-3 overflow-x-auto pb-2 items-end">
        {tabs.map((tab, index) => {
          const textColor = getContrastColor(tab.color);

          return (
            <div
              key={tab.id}
              className="flex-shrink-0 border-2 rounded-lg p-3 hover:shadow-md transition-all"
              style={{
                backgroundColor: tab.color || '#f3f4f6',
                borderColor: tab.color || '#d1d5db',
                color: textColor,
                minWidth: '200px',
              }}
            >
              {/* タブ番号とラベル */}
              <div className="flex items-center gap-2 mb-2">
                {tab.icon && <span className="text-base">{tab.icon}</span>}
                <h3 className="font-semibold text-sm truncate flex-1" title={tab.label}>
                  {index + 1}. {tab.label}
                </h3>
              </div>

              {/* フィールド数 */}
              <p className="text-xs mb-2" style={{ opacity: 0.8 }}>
                {tab.fields.length > 0 ? `${tab.fields.length}個のフィールド` : '未設定'}
              </p>

              {/* 操作ボタン - 1行に収める */}
              <div className="flex gap-1">
                {/* 左右移動ボタン */}
                <button
                  onClick={() => onMove(tab.id, 'up')}
                  disabled={index === 0}
                  className={`px-2 py-1 text-xs rounded ${
                    index === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-white bg-opacity-30 hover:bg-opacity-50'
                  }`}
                  title="左に移動"
                >
                  ←
                </button>
                <button
                  onClick={() => onMove(tab.id, 'down')}
                  disabled={index === tabs.length - 1}
                  className={`px-2 py-1 text-xs rounded ${
                    index === tabs.length - 1
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-white bg-opacity-30 hover:bg-opacity-50'
                  }`}
                  title="右に移動"
                >
                  →
                </button>

                {/* 編集ボタン */}
                <button
                  onClick={() => onEdit(tab)}
                  className="flex-1 px-3 py-1 text-xs bg-white bg-opacity-30 hover:bg-opacity-50 rounded"
                  title="編集"
                >
                  編集
                </button>

                {/* 削除ボタン */}
                <button
                  onClick={() => onDelete(tab.id)}
                  className="px-2 py-1 text-xs bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white rounded"
                  title="削除"
                >
                  ✕
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
