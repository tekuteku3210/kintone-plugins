/**
 * 利用統計収集（PostHog）
 */

import posthog from 'posthog-js';

export class Analytics {
  private pluginId: string;
  private initialized: boolean = false;

  constructor(pluginId: string) {
    this.pluginId = pluginId;
    this.init();
  }

  /**
   * PostHogを初期化
   */
  private init(): void {
    try {
      // TabViewと同じAPIキーを使用
      posthog.init('phc_napdqTHY8WAh0sM8IEH7XLj17z0B3qPoZKizMw7sEhy', {
        api_host: 'https://us.i.posthog.com',
        autocapture: false,  // 自動キャプチャOFF
        persistence: 'localStorage',
        loaded: (ph: any) => {
          ph.set_config({ ip: false });  // IPアドレス匿名化
        },
      } as any);

      this.initialized = true;
    } catch (error) {
      console.error('[Field Conditional Display] Analyticsの初期化に失敗しました', error);
    }
  }

  /**
   * イベントを送信
   */
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.initialized) return;

    try {
      const appId = kintone.app.getId();

      posthog.capture(eventName, {
        plugin_id: this.pluginId,
        plugin_name: 'field-conditional-display',
        plugin_version: '1.0.1',
        app_id: appId,
        ...properties
      });
    } catch (error) {
      console.error('[Field Conditional Display] イベントの送信に失敗しました', error);
    }
  }

  /**
   * ユーザーがオプトアウトしているか確認
   */
  isOptedOut(): boolean {
    if (!this.initialized) return true;
    return posthog.has_opted_out_capturing();
  }

  /**
   * オプトアウト
   */
  optOut(): void {
    if (!this.initialized) return;
    posthog.opt_out_capturing();
  }
}
