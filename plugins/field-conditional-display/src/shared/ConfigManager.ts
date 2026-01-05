/**
 * 設定管理クラス
 * プラグイン設定の読み書きを管理
 */

import type { PluginConfig } from '../types';

export class ConfigManager {
  private pluginId: string;

  constructor(pluginId: string) {
    this.pluginId = pluginId;
  }

  /**
   * 設定を読み込む
   */
  load(): PluginConfig {
    const config = kintone.plugin.app.getConfig(this.pluginId);

    if (!config || !config.config) {
      // 初期設定
      return {
        rules: [],
        version: '1.0.0'
      };
    }

    try {
      return JSON.parse(config.config) as PluginConfig;
    } catch (e) {
      console.error('[Field Conditional Display] 設定の読み込みに失敗しました', e);
      return {
        rules: [],
        version: '1.0.0'
      };
    }
  }

  /**
   * 設定を保存
   */
  save(config: PluginConfig): Promise<void> {
    return kintone.plugin.app.setConfig({
      config: JSON.stringify(config)
    });
  }

  /**
   * 設定をバリデーション
   */
  validate(config: PluginConfig): boolean {
    if (!config.rules || !Array.isArray(config.rules)) {
      return false;
    }

    // 各ルールのバリデーション
    for (const rule of config.rules) {
      if (!rule.id || !rule.name) {
        return false;
      }

      if (!rule.conditions || !rule.conditions.conditions) {
        return false;
      }

      if (!rule.actions || !Array.isArray(rule.actions)) {
        return false;
      }
    }

    return true;
  }
}
