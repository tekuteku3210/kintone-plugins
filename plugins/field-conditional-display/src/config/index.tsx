/**
 * 設定画面 - メインエントリーポイント
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { RuleList } from './components/RuleList';
import { RuleEditor } from './components/RuleEditor';
import { ConfigManager } from '../shared/ConfigManager';
import { FieldService } from '../shared/FieldService';
import type { PluginConfig, DisplayRule, KintoneField } from '../types';
import './styles.css';

const App: React.FC = () => {
  const [config, setConfig] = useState<PluginConfig>({ rules: [], version: '1.0.0' });
  const [fields, setFields] = useState<KintoneField[]>([]);
  const [editingRule, setEditingRule] = useState<DisplayRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const PLUGIN_ID = kintone.$PLUGIN_ID;
  const configManager = new ConfigManager(PLUGIN_ID);
  const fieldService = new FieldService();

  // 初期化
  useEffect(() => {
    const loadData = async () => {
      try {
        // 設定を読み込み
        const loadedConfig = configManager.load();
        setConfig(loadedConfig);

        // フィールド情報を取得
        const loadedFields = await fieldService.getFields();
        setFields(loadedFields);
      } catch (error) {
        console.error('[Field Conditional Display] 初期化に失敗しました', error);
        alert('データの読み込みに失敗しました。ページを再読み込みしてください。');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * 保存
   */
  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      await configManager.save(config);
      alert('設定を保存しました');

      // アプリ設定画面に戻る
      const appId = kintone.app.getId();
      if (appId) {
        window.location.href = `/k/admin/app/flow?app=${appId}`;
      }
    } catch (error) {
      console.error('[Field Conditional Display] 保存に失敗しました', error);
      alert('設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  /**
   * キャンセル
   */
  const handleCancel = () => {
    if (confirm('設定を破棄して戻りますか？')) {
      const appId = kintone.app.getId();
      if (appId) {
        window.location.href = `/k/admin/app/flow?app=${appId}`;
      }
    }
  };

  /**
   * ルールの追加/編集
   */
  const handleSaveRule = (rule: DisplayRule) => {
    const existingIndex = config.rules.findIndex(r => r.id === rule.id);

    if (existingIndex >= 0) {
      // 更新
      const updatedRules = [...config.rules];
      updatedRules[existingIndex] = rule;
      setConfig({ ...config, rules: updatedRules });
    } else {
      // 新規追加
      setConfig({ ...config, rules: [...config.rules, rule] });
    }

    setEditingRule(null);
  };

  /**
   * ルールの削除
   */
  const handleDeleteRule = (ruleId: string) => {
    const updatedRules = config.rules.filter(r => r.id !== ruleId);
    setConfig({ ...config, rules: updatedRules });
  };

  /**
   * ルールの有効/無効切り替え
   */
  const handleToggleEnabled = (ruleId: string) => {
    const updatedRules = config.rules.map(r =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    );
    setConfig({ ...config, rules: updatedRules });
  };

  /**
   * 新規ルール作成
   */
  const handleAddRule = () => {
    const newRule: DisplayRule = {
      id: crypto.randomUUID(),
      name: '新しいルール',
      enabled: true,
      conditions: {
        operator: 'AND',
        conditions: []
      },
      actions: [],
      priority: 0
    };
    setEditingRule(newRule);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            フィールド条件表示プラグイン
          </h1>
          <p className="text-gray-600">
            条件に応じてフィールドやスペースの表示/非表示を制御します
          </p>
        </header>

        {editingRule ? (
          <RuleEditor
            rule={editingRule}
            fields={fields}
            onSave={handleSaveRule}
            onCancel={() => setEditingRule(null)}
          />
        ) : (
          <RuleList
            rules={config.rules}
            onEdit={setEditingRule}
            onDelete={handleDeleteRule}
            onAdd={handleAddRule}
            onToggleEnabled={handleToggleEnabled}
          />
        )}

        {!editingRule && (
          <div className="mt-8 flex justify-end gap-4 sticky bottom-0 bg-gray-50 py-4">
            <button
              className="btn-secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              キャンセル
            </button>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '保存中...' : '設定を保存'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// レンダリング
const container = document.getElementById('root');
if (container) {
  ReactDOM.render(<App />, container);
}
