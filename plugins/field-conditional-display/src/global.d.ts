/**
 * kintoneグローバル型定義
 */

declare const kintone: {
  $PLUGIN_ID: string;
  app: {
    getId(): number | null;
    record: {
      getFieldElement(fieldCode: string): HTMLElement | null;
      getSpaceElement(spaceId: string): HTMLElement | null;
    };
  };
  api: {
    (url: string, method: string, params: any): Promise<any>;
    url(path: string, detectGuestSpace?: boolean): string;
  };
  plugin: {
    app: {
      getConfig(pluginId: string): { [key: string]: string };
      setConfig(config: { [key: string]: string }): Promise<void>;
    };
  };
  events: {
    on(
      eventType: string | string[],
      handler: (event: any) => any
    ): void;
  };
};

declare module 'posthog-js' {
  export interface PostHogConfig {
    api_host?: string;
    autocapture?: boolean;
    capture_pageview?: boolean;
    session_recording?: {
      [key: string]: any;
    };
    person_profiles?: string;
    ip?: boolean;
  }

  export interface PostHog {
    init(apiKey: string, config?: PostHogConfig): void;
    capture(eventName: string, properties?: Record<string, any>): void;
    has_opted_out_capturing(): boolean;
    opt_out_capturing(): void;
  }

  const posthog: PostHog;
  export default posthog;
}
