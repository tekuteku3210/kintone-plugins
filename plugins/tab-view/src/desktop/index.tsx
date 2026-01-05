import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { getConfig } from '@/utils/config';
import posthog from 'posthog-js';

const PLUGIN_ID = kintone.$PLUGIN_ID;

// Posthog初期化
posthog.init('phc_napdqTHY8WAh0sM8IEH7XLj17z0B3qPoZKizMw7sEhy', {
  api_host: 'https://us.i.posthog.com',
  autocapture: false, // 自動キャプチャOFF
  disable_session_recording: true, // セッション録画OFF
  persistence: 'localStorage',
  loaded: (ph) => {
    ph.set_config({ ip: false }); // IPアドレス匿名化
  },
});

// デバッグ: ファイルが読み込まれたことを確認
console.log('TabView: desktop.js ファイルが読み込まれました');

// タブUIを挿入する共通関数
const insertTabView = (eventType: string) => {
  console.log(`TabView: ${eventType} イベント発火`);

  // 既存のコンテナがあれば削除（重複防止）
  const existingContainer = document.getElementById('tabview-root');
  if (existingContainer) {
    console.log('TabView: 既存のコンテナを削除');
    existingContainer.remove();
  }

  // タブUIを挿入する要素を作成
  const container = document.createElement('div');
  container.id = 'tabview-root';

  // プラグイン設定を読み込み
  const config = getConfig(PLUGIN_ID);
  const configuredSpaceFieldId = config.spaceFieldId;

  // スペースフィールドIDが設定されていない場合はエラー
  if (!configuredSpaceFieldId) {
    console.error('TabView: スペースフィールドIDが設定されていません');
    console.error('TabView: プラグイン設定画面でスペースフィールドを選択してください');
    return;
  }

  // スペースフィールドを使用してタブUIを挿入
  try {
    const spaceElement = kintone.app.record.getSpaceElement(configuredSpaceFieldId);
    if (spaceElement) {
      console.log(`TabView: スペースフィールド "${configuredSpaceFieldId}" を使用`);
      spaceElement.appendChild(container);

      // Reactアプリを描画
      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      console.log('TabView: Reactアプリを描画（スペースフィールド使用）');
      return;
    } else {
      console.error(`TabView: スペースフィールド "${configuredSpaceFieldId}" が見つかりませんでした`);
      console.error('TabView: フォーム設定で以下を確認してください:');
      console.error(`1. 要素ID "${configuredSpaceFieldId}" のスペースフィールドが存在するか`);
      console.error('2. スペースフィールドが削除されていないか');
      console.error('3. プラグイン設定画面で正しいスペースフィールドを選択しているか');
    }
  } catch (error) {
    console.error(`TabView: スペースフィールド "${configuredSpaceFieldId}" の取得中にエラーが発生しました:`, error);
    console.error('TabView: フォーム設定でスペースフィールドの設定を確認してください');
  }
};

// レコード詳細画面の表示イベント
kintone.events.on('app.record.detail.show', (event) => {
  // アプリごとに1回のみ送信（plugin_loaded）
  const loadedKey = `tabview_loaded_${kintone.app.getId()}`;
  if (!localStorage.getItem(loadedKey)) {
    posthog.capture('plugin_loaded', {
      plugin_id: PLUGIN_ID,
      plugin_name: 'tab-view',
      plugin_version: '1.1.1',
      screen_type: 'detail',
      app_id: kintone.app.getId(),
    });
    localStorage.setItem(loadedKey, 'true');
  }

  // 初回起動時のみ送信（plugin_activated）
  const activationKey = `tabview_activated_${kintone.app.getId()}`;
  if (!localStorage.getItem(activationKey)) {
    posthog.capture('plugin_activated', {
      plugin_id: PLUGIN_ID,
      plugin_name: 'tab-view',
      plugin_version: '1.1.1',
      app_id: kintone.app.getId(),
    });
    localStorage.setItem(activationKey, 'true');
  }

  insertTabView('app.record.detail.show');
  return event;
});

// レコード追加画面の表示イベント
kintone.events.on('app.record.create.show', (event) => {
  insertTabView('app.record.create.show');
  return event;
});

// レコード編集画面の表示イベント
kintone.events.on('app.record.edit.show', (event) => {
  insertTabView('app.record.edit.show');
  return event;
});
