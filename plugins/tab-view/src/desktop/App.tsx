import React, { useState, useEffect } from 'react';
import type { Tab, PluginConfig, KintoneField } from '@/types';
import { getConfig } from '@/utils/config';
import { showField, hideField, getAppFields } from '@/utils/kintone';
import TabView from './components/TabView';
import posthog from 'posthog-js';

const PLUGIN_ID = kintone.$PLUGIN_ID;

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, KintoneField>>({});

  useEffect(() => {
    const init = async () => {
      try {
        const config: PluginConfig = getConfig(PLUGIN_ID);

        if (!config.tabs || config.tabs.length === 0) {
          // タブが設定されていない場合は何も表示しない（デフォルト表示）
          return;
        }

        // フィールド情報を取得（ラベルテキスト取得のため）
        const appFields = await getAppFields();
        setFields(appFields);

        setTabs(config.tabs);
        setActiveTabId(config.tabs[0].id);
      } catch (err) {
        setError('プラグイン設定の読み込みに失敗しました');
        console.error(err);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (tabs.length === 0 || !activeTabId || Object.keys(fields).length === 0) return;

    console.log('TabView: タブ切り替え', { activeTabId, tabs });

    // すべての罫線を常に非表示
    Object.keys(fields).forEach((fieldCode) => {
      if (fieldCode.startsWith('__HR_')) {
        hideField(fieldCode);
      }
    });

    // すべてのフィールドを非表示
    const allFields = new Set<string>();
    tabs.forEach((tab) => {
      tab.fields.forEach((field) => allFields.add(field));
    });

    console.log('TabView: すべてのフィールド', Array.from(allFields));

    allFields.forEach((field) => {
      // 罫線は既に非表示にしたのでスキップ
      if (field.startsWith('__HR_')) return;

      const fieldInfo = fields[field];
      hideField(field, fieldInfo?.label);
    });

    // 選択中のタブのフィールドを表示
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (activeTab) {
      console.log('TabView: アクティブタブのフィールド', activeTab.fields);
      activeTab.fields.forEach((field) => {
        // 罫線はスキップ
        if (field.startsWith('__HR_')) return;

        const fieldInfo = fields[field];
        showField(field, fieldInfo?.label);
      });
    }
  }, [activeTabId, tabs, fields]);

  const handleTabChange = (tabId: string) => {
    // タブ切り替えイベント送信
    posthog.capture('tab_switched', {
      tab_id: tabId,
      tab_label: tabs.find((tab) => tab.id === tabId)?.label || '',
      app_id: kintone.app.getId(),
    });

    setActiveTabId(tabId);
  };

  if (error) {
    return (
      <div className="tabview-error">
        <p className="tabview-error-text">⚠️ {error}</p>
      </div>
    );
  }

  if (tabs.length === 0) {
    // タブが設定されていない場合は何も表示しない
    return null;
  }

  // タブが1個の場合は、タブUIを表示しない (#83準拠)
  // ただし、useEffectでフィールドの表示/非表示処理は実行される
  if (tabs.length === 1) {
    return null;
  }

  return (
    <TabView
      tabs={tabs}
      activeTabId={activeTabId || tabs[0].id}
      onTabChange={handleTabChange}
    />
  );
};

export default App;
