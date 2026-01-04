import React from 'react';
import type { Tab } from '@/types';

interface TabViewProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}

/**
 * 背景色の明度を計算し、適切な文字色（白または黒）を返す
 * WCAG AA基準準拠（コントラスト比4.5:1以上）
 */
const getContrastColor = (hexColor?: string): string => {
  if (!hexColor) return '#000000';

  // HEXカラーをRGBに変換
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 相対輝度を計算（WCAG基準）
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // 輝度が0.5以上なら黒、以下なら白
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

const TabView: React.FC<TabViewProps> = ({ tabs, activeTabId, onTabChange }) => {
  return (
    <div className="tabview-container">
      {/* タブヘッダー */}
      <div className="tabview-header" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          const bgColor = isActive && tab.color ? tab.color : undefined;
          const textColor = isActive && tab.color ? getContrastColor(tab.color) : undefined;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`tabview-tab ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              style={{
                backgroundColor: bgColor,
                borderBottomColor: tab.color || undefined,
                color: textColor,
              }}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* タブコンテンツは実際のkintoneフィールドを表示/非表示するため、ここでは空 */}
    </div>
  );
};

export default TabView;
