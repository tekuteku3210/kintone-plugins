import React, { useState, useEffect } from 'react';
import type { Tab, PluginConfig, KintoneField } from '@/types';
import { getConfig, setConfig, generateId } from '@/utils/config';
import { validateTabLabel, validateTabLimit, validateFields } from '@/utils/validation';
import { getAppFields, getSpaceFields } from '@/utils/kintone';
import TabEditor from './components/TabEditor';
import TabList from './components/TabList';

const PLUGIN_ID = kintone.$PLUGIN_ID;
const MAX_FREE_TABS = 5;

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [commonFields, setCommonFields] = useState<string[]>([]);
  const [spaceFieldId, setSpaceFieldId] = useState<string>('');
  const [spaceFields, setSpaceFields] = useState<{ id: string; label: string }[]>([]);
  const [fields, setFields] = useState<Record<string, KintoneField>>({});
  const [editingTab, setEditingTab] = useState<Tab | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 初期化: プラグイン設定とフィールド情報を取得
  useEffect(() => {
    const init = async () => {
      try {
        const config = getConfig(PLUGIN_ID);
        setTabs(config.tabs || []);
        setCommonFields(config.commonFields || []);
        setSpaceFieldId(config.spaceFieldId || '');

        const [appFields, spaces] = await Promise.all([
          getAppFields(),
          getSpaceFields(),
        ]);
        setFields(appFields);
        setSpaceFields(spaces);
      } catch (err) {
        setError('設定の読み込みに失敗しました。ページを再読み込みしてください。');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // タブを追加
  const handleAddTab = () => {
    const limitError = validateTabLimit(tabs.length, MAX_FREE_TABS);
    if (limitError) {
      setError(limitError.message);
      return;
    }

    const newTab: Tab = {
      id: generateId(),
      label: `新しいタブ ${tabs.length + 1}`,
      icon: '',
      fields: [],
    };

    setTabs([...tabs, newTab]);
    setEditingTab(newTab);
    setError(null);
  };

  // タブを更新（自動保存）
  const handleUpdateTab = (updatedTab: Tab) => {
    // ラベルのバリデーション（タブ名変更時のみ）
    const existingTab = tabs.find((t) => t.id === updatedTab.id);
    if (existingTab && existingTab.label !== updatedTab.label) {
      const labelError = validateTabLabel(updatedTab.label, tabs, updatedTab.id);
      if (labelError) {
        setError(labelError.message);
        return;
      }
    }

    // タブを更新
    setTabs(tabs.map((tab) => (tab.id === updatedTab.id ? updatedTab : tab)));
    setError(null);

    // 編集中のタブも更新（タブ名変更時に表示を同期）
    if (editingTab?.id === updatedTab.id) {
      setEditingTab(updatedTab);
    }
  };

  // タブを削除
  const handleDeleteTab = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    if (confirm(`「${tab.label}」タブを削除しますか?`)) {
      setTabs(tabs.filter((t) => t.id !== tabId));
      if (editingTab?.id === tabId) {
        setEditingTab(null);
      }
    }
  };

  // タブの順序を変更
  const handleMoveTab = (tabId: string, direction: 'up' | 'down') => {
    const index = tabs.findIndex((t) => t.id === tabId);
    if (index === -1) return;

    const newTabs = [...tabs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= tabs.length) return;

    [newTabs[index], newTabs[targetIndex]] = [newTabs[targetIndex], newTabs[index]];
    setTabs(newTabs);
  };

  // 設定を保存
  const handleSave = async () => {
    // スペースフィールドが選択されているか確認
    if (!spaceFieldId) {
      setError('タブ表示位置のスペースフィールドを選択してください');
      return;
    }

    // タブが1つもない場合は警告
    if (tabs.length === 0) {
      setError('タブを1つ以上追加してください');
      return;
    }

    // すべてのタブにフィールドが設定されているか確認
    const emptyTabs = tabs.filter((tab) => tab.fields.length === 0);
    if (emptyTabs.length > 0) {
      setError(`「${emptyTabs.map((t) => t.label).join('」「')}」タブにフィールドが設定されていません`);
      return;
    }

    try {
      const config: PluginConfig = { tabs, commonFields, spaceFieldId };
      await setConfig(PLUGIN_ID, config);
      alert('設定を保存しました');
      window.location.href = `/k/admin/app/${kintone.app.getId()}/plugin/`;
    } catch (err) {
      setError('設定の保存に失敗しました。もう一度お試しください。');
      console.error(err);
    }
  };

  // キャンセル
  const handleCancel = () => {
    if (confirm('変更を破棄しますか?')) {
      window.location.href = `/k/admin/app/${kintone.app.getId()}/plugin/`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">タブ表示プラグイン 設定</h1>

      {/* 前提条件の表示 (#32準拠) */}
      <div className="info-box">
        <p className="info-box-text">
          無料プランでは最大{MAX_FREE_TABS}タブまで作成できます（現在: {tabs.length}/{MAX_FREE_TABS}）
        </p>
      </div>

      {/* スペースフィールド設定 */}
      <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          タブ表示位置のスペースフィールド <span className="text-red-500">*</span>
        </label>
        {spaceFields.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800 mb-2">⚠️ スペースフィールドが見つかりません</p>
            <p className="text-xs text-yellow-700">
              kintoneアプリのフォーム設定で「スペース」フィールドを追加し、要素IDを設定してください。
            </p>
          </div>
        ) : (
          <>
            <select
              value={spaceFieldId}
              onChange={(e) => {
                setSpaceFieldId(e.target.value);
                setError(null);
              }}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                !spaceFieldId ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">-- スペースフィールドを選択してください --</option>
              {spaceFields.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              タブを表示したい位置に配置したスペースフィールドを選択してください。
            </p>
          </>
        )}
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <p className="text-red-800 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* タブ一覧（横スクロール） */}
      <TabList
        tabs={tabs}
        activeTabId={editingTab?.id || null}
        onEdit={setEditingTab}
        onUpdate={handleUpdateTab}
        onDelete={handleDeleteTab}
        onMove={handleMoveTab}
        onAdd={handleAddTab}
        maxTabs={MAX_FREE_TABS}
      />

      {/* 選択したタブのフィールド設定 */}
      {editingTab && (
        <div className="mt-6">
          <TabEditor
            tab={editingTab}
            fields={fields}
            allTabs={tabs}
            onUpdate={handleUpdateTab}
          />
        </div>
      )}

      {/* タブが未選択の場合のメッセージ */}
      {!editingTab && tabs.length > 0 && (
        <div className="mt-6 p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600 text-lg">タブを選択して編集してください</p>
          <p className="text-gray-500 text-sm mt-2">上のタブをクリックすると、フィールド設定とプレビューが表示されます</p>
        </div>
      )}

      {/* 保存・キャンセルボタン */}
      <div className="mt-8 flex justify-end gap-4 border-t pt-4">
        <button onClick={handleCancel} className="btn-secondary">
          変更を破棄
        </button>
        <button onClick={handleSave} className="btn-primary">
          設定を保存
        </button>
      </div>
    </div>
  );
};

export default App;
