import type { Tab, ValidationError } from '@/types';

/**
 * タブ名のバリデーション
 */
export const validateTabLabel = (label: string, existingTabs: Tab[], currentTabId?: string): ValidationError | null => {
  // 必須チェック
  if (!label || label.trim() === '') {
    return {
      type: 'required',
      message: 'タブ名を入力してください',
      field: 'label',
    };
  }

  // 文字数チェック
  if (label.length > 20) {
    return {
      type: 'maxLength',
      message: 'タブ名は20文字以内で入力してください',
      field: 'label',
    };
  }

  // 重複チェック
  const isDuplicate = existingTabs.some(
    (tab) => tab.label === label && tab.id !== currentTabId
  );

  if (isDuplicate) {
    return {
      type: 'duplicate',
      message: 'このタブ名は既に使用されています。別の名前を入力してください。',
      field: 'label',
    };
  }

  return null;
};

/**
 * タブの最大数チェック
 */
export const validateTabLimit = (currentTabCount: number, maxTabs: number = 5): ValidationError | null => {
  if (currentTabCount >= maxTabs) {
    return {
      type: 'maxLength',
      message: `タブの上限（${maxTabs}個）に達しています。Proプランにアップグレードすると無制限に設定できます。`,
    };
  }

  return null;
};

/**
 * フィールド選択のバリデーション
 */
export const validateFields = (fields: string[]): ValidationError | null => {
  if (fields.length === 0) {
    return {
      type: 'required',
      message: '少なくとも1つのフィールドを選択してください',
      field: 'fields',
    };
  }

  return null;
};
