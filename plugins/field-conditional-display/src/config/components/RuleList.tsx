/**
 * ルール一覧コンポーネント
 */

import React from 'react';
import type { DisplayRule } from '../../types';

interface RuleListProps {
  rules: DisplayRule[];
  onEdit: (rule: DisplayRule) => void;
  onDelete: (ruleId: string) => void;
  onAdd: () => void;
  onToggleEnabled: (ruleId: string) => void;
}

export const RuleList: React.FC<RuleListProps> = ({
  rules,
  onEdit,
  onDelete,
  onAdd,
  onToggleEnabled
}) => {
  /**
   * ルールの概要テキストを生成
   */
  const getRuleSummary = (rule: DisplayRule): string => {
    if (rule.conditions.conditions.length === 0) {
      return '条件が設定されていません';
    }

    const condition = rule.conditions.conditions[0];
    const targetCount = rule.actions.reduce((sum, action) => sum + action.targets.length, 0);

    return `${condition.fieldCode} ${getOperatorLabel(condition.operator)} "${condition.value}" → ${targetCount}個のフィールドを制御`;
  };

  /**
   * 演算子のラベルを取得
   */
  const getOperatorLabel = (operator: string): string => {
    const labels: Record<string, string> = {
      equals: '=',
      not_equals: '≠',
      is_empty: 'が空',
      is_not_empty: 'が空でない'
    };
    return labels[operator] || operator;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">ルール一覧</h2>
        <button
          className="btn-primary"
          onClick={onAdd}
        >
          + 新しいルールを追加
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">まだルールが作成されていません</p>
          <button
            className="btn-primary"
            onClick={onAdd}
          >
            最初のルールを作成
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`card ${rule.enabled ? 'border-l-4 border-blue-500' : 'opacity-60'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => onToggleEnabled(rule.id)}
                      className="mr-3 w-5 h-5"
                    />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {rule.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-8">
                    {getRuleSummary(rule)}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                    onClick={() => onEdit(rule)}
                  >
                    編集
                  </button>
                  <button
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                    onClick={() => {
                      if (confirm(`ルール「${rule.name}」を削除しますか？`)) {
                        onDelete(rule.id);
                      }
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
