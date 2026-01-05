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
    // プレースホルダーキーの場合は初期化をスキップ（開発中）
    const apiKey = 'YOUR_POSTHOG_PROJECT_KEY';
    if (apiKey === 'YOUR_POSTHOG_PROJECT_KEY') {
      console.log('[Field Conditional Display] Analytics無効（開発モード）');
      return;
    }

    try {
      // PostHogの初期化（プロジェクトキーは後で設定）
      posthog.init(apiKey, {
        api_host: 'https://app.posthog.com',
        autocapture: false,  // 自動キャプチャOFF
        capture_pageview: false,  // ページビュー自動取得OFF
        session_recording: {
          enabled: false  // セッション録画OFF
        },
        person_profiles: 'identified_only',  // 匿名化
        ip: false  // IPアドレス収集OFF
      });

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
        plugin_version: '1.0.0',
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
