import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

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

  // 【推奨】スペースフィールド "tabview-space" を最優先で使用
  // ユーザーがkintoneフォーム設定で「スペース」フィールドを追加し、
  // 要素IDに "tabview-space" と設定することで、タブの表示位置を自由に制御できます
  try {
    const spaceElement = kintone.app.record.getSpaceElement('tabview-space');
    if (spaceElement) {
      console.log('TabView: スペースフィールド "tabview-space" を使用');
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
    }
  } catch (error) {
    console.warn('TabView: スペースフィールド "tabview-space" が見つかりませんでした。自動挿入を試行します。', error);
  }

  // スペースフィールドがない場合の自動挿入
  // kintoneのレコード画面の標準構造を利用
  console.log('TabView: スペースフィールドがないため、自動挿入を試行します');

  // レコード詳細・編集・作成画面共通のフィールドグループを探す
  // アプリタイトルより下の位置に挿入するため、.recordlist-gaia 内の最初の要素の前に挿入
  const recordlistSelectors = [
    '.record-gaia .recordlist-gaia',   // レコード詳細・編集・作成画面のフィールドリスト（新UI）
    '.contents-body',                  // 旧UI
  ];

  let recordlist: Element | null = null;
  let selectorUsed = '';

  for (const selector of recordlistSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      recordlist = element;
      selectorUsed = selector;
      console.log(`TabView: フィールドリストを発見: ${selector}`);
      break;
    }
  }

  if (recordlist) {
    // recordlist-gaia の最初の子要素の前に挿入
    const firstChild = recordlist.firstElementChild;
    if (firstChild) {
      console.log(`TabView: フィールドリストの先頭に挿入（使用セレクタ: ${selectorUsed}）`);
      // 最初の子要素の前に挿入（アプリタイトルより下、フィールドより上）
      recordlist.insertBefore(container, firstChild);

      // Reactアプリを描画
      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      console.log('TabView: Reactアプリを描画（自動挿入: recordlist先頭）');
      return;
    } else {
      // 子要素がない場合は、recordlistに直接追加
      console.log(`TabView: フィールドリストに追加（使用セレクタ: ${selectorUsed}）`);
      recordlist.appendChild(container);

      // Reactアプリを描画
      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      console.log('TabView: Reactアプリを描画（自動挿入: recordlist内）');
      return;
    }
  }

  // 上記が全て失敗した場合のデバッグ情報
  console.error('TabView: タブの挿入位置が見つかりませんでした');
  console.error('TabView: スペースフィールド "tabview-space" を設定することを推奨します');
  console.log('TabView: DOM構造を確認中...');

  // DOM構造をデバッグ出力
  const bodyClasses = Array.from(document.body.classList);
  console.log('TabView: body要素のクラス:', bodyClasses.join(', '));

  // フィールドグループ候補を探す
  const possibleFieldGroups = [
    'div[class*="record"]',
    'div[class*="gaia"]',
  ];

  console.log('TabView: 可能性のあるフィールドグループ要素:');
  possibleFieldGroups.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`  ${selector}: ${elements.length}個`);
      elements.forEach((el, index) => {
        if (index < 5) {
          console.log(`    [${index}] ${el.className}`);
        }
      });
    }
  });

  console.error('TabView: プラグインを正常に動作させるには、kintoneアプリのフォーム設定で以下の手順を実施してください:');
  console.error('1. フォーム設定を開く');
  console.error('2. 「スペース」フィールドをフォームに追加');
  console.error('3. スペースフィールドの要素IDに "tabview-space" と入力');
  console.error('4. タブを表示したい位置にスペースフィールドを配置');
  console.error('5. フォーム設定を保存してアプリを更新');
};

// レコード詳細画面の表示イベント
kintone.events.on('app.record.detail.show', (event) => {
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
