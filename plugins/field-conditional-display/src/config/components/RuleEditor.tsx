/**
 * ルール編集コンポーネント
 */

import React, { useState } from 'react';
import type { DisplayRule, KintoneField, Condition, Action, Target } from '../../types';

interface RuleEditorProps {
  rule: DisplayRule;
  fields: KintoneField[];
  onSave: (rule: DisplayRule) => void;
  onCancel: () => void;
}

export const RuleEditor: React.FC<RuleEditorProps> = ({
  rule: initialRule,
  fields,
  onSave,
  onCancel
}) => {
  const [rule, setRule] = useState<DisplayRule>(initialRule);
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * ルール名の変更
   */
  const handleNameChange = (name: string) => {
    setRule({ ...rule, name });
  };

  /**
   * 条件の変更
   */
  const handleConditionChange = (condition: Partial<Condition>) => {
    const updatedCondition = {
      ...(rule.conditions.conditions[0] || { fieldCode: '', operator: 'equals' as const, value: '' }),
      ...condition
    };

    setRule({
      ...rule,
      conditions: {
        operator: 'AND',
        conditions: [updatedCondition]
      }
    });
  };

  /**
   * アクションの追加
   */
  const handleAddAction = (type: 'show' | 'hide') => {
    setRule({
      ...rule,
      actions: [
        ...rule.actions,
        {
          type,
          targets: []
        }
      ]
    });
  };

  /**
   * ターゲットの追加
   */
  const handleAddTarget = (actionIndex: number, target: Target) => {
    const updatedActions = [...rule.actions];
    updatedActions[actionIndex].targets.push(target);
    setRule({ ...rule, actions: updatedActions });
  };

  /**
   * ターゲットの削除
   */
  const handleRemoveTarget = (actionIndex: number, targetIndex: number) => {
    const updatedActions = [...rule.actions];
    updatedActions[actionIndex].targets.splice(targetIndex, 1);
    setRule({ ...rule, actions: updatedActions });
  };

  /**
   * バリデーション
   */
  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!rule.name.trim()) {
      newErrors.push('ルール名を入力してください');
    }

    if (rule.conditions.conditions.length === 0 || !rule.conditions.conditions[0].fieldCode) {
      newErrors.push('トリガーフィールドを選択してください');
    }

    if (rule.actions.length === 0) {
      newErrors.push('少なくとも1つのアクションを設定してください');
    }

    const hasTargets = rule.actions.some(action => action.targets.length > 0);
    if (!hasTargets) {
      newErrors.push('少なくとも1つのターゲットを設定してください');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  /**
   * 保存
   */
  const handleSave = () => {
    if (validate()) {
      onSave(rule);
    }
  };

  const condition = rule.conditions.conditions[0] || { fieldCode: '', operator: 'equals' as const, value: '' };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">ルール編集</h2>
        <button
          className="text-gray-600 hover:text-gray-800"
          onClick={onCancel}
        >
          ← 一覧に戻る
        </button>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <ul className="list-disc list-inside text-red-700">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card space-y-6">
        {/* ルール名 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ルール名
          </label>
          <input
            type="text"
            className="input-field"
            value={rule.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="例: 法人・個人の項目切り替え"
          />
        </div>

        {/* 有効/無効 */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rule.enabled}
              onChange={(e) => setRule({ ...rule, enabled: e.target.checked })}
              className="mr-2 w-5 h-5"
            />
            <span className="text-sm font-semibold text-gray-700">このルールを有効にする</span>
          </label>
        </div>

        {/* 条件設定 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📌 条件設定</h3>
          <div className="space-y-4 pl-4 border-l-2 border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                トリガーフィールド
              </label>
              <select
                className="select-field"
                value={condition.fieldCode}
                onChange={(e) => handleConditionChange({ fieldCode: e.target.value })}
              >
                <option value="">-- フィールドを選択 --</option>
                {fields.map((field) => (
                  <option key={field.code} value={field.code}>
                    {field.label} ({field.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                演算子
              </label>
              <select
                className="select-field"
                value={condition.operator}
                onChange={(e) => handleConditionChange({ operator: e.target.value as any })}
              >
                <option value="equals">等しい</option>
                <option value="not_equals">等しくない</option>
                <option value="is_empty">空である</option>
                <option value="is_not_empty">空でない</option>
              </select>
            </div>

            {condition.operator !== 'is_empty' && condition.operator !== 'is_not_empty' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  値
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={condition.value as string}
                  onChange={(e) => handleConditionChange({ value: e.target.value })}
                  placeholder="比較する値を入力"
                />
              </div>
            )}
          </div>
        </div>

        {/* アクション設定 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 アクション設定</h3>
          <div className="space-y-4">
            {rule.actions.map((action, actionIndex) => (
              <div key={actionIndex} className="p-4 bg-gray-50 rounded">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-gray-700">
                    {action.type === 'show' ? '表示' : '非表示'}するフィールド
                  </span>
                  <button
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => {
                      const updatedActions = rule.actions.filter((_, i) => i !== actionIndex);
                      setRule({ ...rule, actions: updatedActions });
                    }}
                  >
                    削除
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  {action.targets.map((target, targetIndex) => (
                    <div key={targetIndex} className="flex items-center justify-between bg-white p-2 rounded">
                      <span className="text-sm">
                        {target.type === 'field' ? 'フィールド' : 'スペース'}: {target.elementId}
                      </span>
                      <button
                        className="text-red-600 hover:underline text-sm"
                        onClick={() => handleRemoveTarget(actionIndex, targetIndex)}
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <select
                    className="select-field"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddTarget(actionIndex, {
                          type: 'field',
                          elementId: e.target.value
                        });
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">-- フィールドを追加 --</option>
                    {fields.map((field) => (
                      <option key={field.code} value={field.code}>
                        {field.label} ({field.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <button
                className="btn-secondary"
                onClick={() => handleAddAction('show')}
              >
                + 表示アクションを追加
              </button>
              <button
                className="btn-secondary"
                onClick={() => handleAddAction('hide')}
              >
                + 非表示アクションを追加
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 保存・キャンセルボタン */}
      <div className="flex justify-end gap-4">
        <button
          className="btn-secondary"
          onClick={onCancel}
        >
          キャンセル
        </button>
        <button
          className="btn-primary"
          onClick={handleSave}
        >
          保存
        </button>
      </div>
    </div>
  );
};
