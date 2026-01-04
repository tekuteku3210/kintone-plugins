import type { PluginConfig } from '@/types';

/**
 * プラグイン設定を取得
 */
export const getConfig = (pluginId: string): PluginConfig => {
  const config = kintone.plugin.app.getConfig(pluginId);

  if (!config || !config.tabs) {
    return { tabs: [], commonFields: [], spaceFieldId: '' };
  }

  try {
    return {
      tabs: JSON.parse(config.tabs || '[]'),
      commonFields: JSON.parse(config.commonFields || '[]'),
      spaceFieldId: config.spaceFieldId || '',
    };
  } catch (error) {
    console.error('設定の読み込みに失敗しました:', error);
    return { tabs: [], commonFields: [], spaceFieldId: '' };
  }
};

/**
 * プラグイン設定を保存
 */
export const setConfig = (pluginId: string, config: PluginConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const configData = {
        tabs: JSON.stringify(config.tabs),
        commonFields: JSON.stringify(config.commonFields || []),
        spaceFieldId: config.spaceFieldId || '',
      };

      kintone.plugin.app.setConfig(configData, () => {
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 一意なIDを生成
 */
export const generateId = (): string => {
  return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
