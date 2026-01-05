/**
 * デスクトップJS - メインエントリーポイント
 * レコード画面でのフィールド表示制御
 */

import { ConditionEvaluator } from '../shared/ConditionEvaluator';
import { FieldController } from './FieldController';
import { ConfigManager } from '../shared/ConfigManager';
import { Analytics } from '../shared/Analytics';
import { FieldService } from '../shared/FieldService';

(function (PLUGIN_ID) {
  'use strict';

  const configManager = new ConfigManager(PLUGIN_ID);
  const evaluator = new ConditionEvaluator();
  const analytics = new Analytics(PLUGIN_ID);
  const fieldService = new FieldService();

  // 設定を読み込み
  const config = configManager.load();

  // 有効なルールのみ抽出
  const enabledRules = config.rules.filter(rule => rule.enabled);

  if (enabledRules.length === 0) {
    console.log('[Field Conditional Display] 有効なルールがありません');
    return;
  }

  // フィールド情報を非同期で取得し、FieldControllerを初期化
  let fieldController: FieldController;
  let fieldsMapReady = false;

  (async () => {
    try {
      const fields = await fieldService.getFields();
      const fieldsMap = new Map(fields.map(f => [f.code, f]));
      fieldController = new FieldController(fieldsMap);
      fieldsMapReady = true;
      console.log('[Field Conditional Display] フィールド情報を取得しました');
    } catch (error) {
      console.error('[Field Conditional Display] フィールド情報の取得に失敗しました', error);
      // フォールバック: フィールド情報なしで初期化
      fieldController = new FieldController(new Map());
      fieldsMapReady = true;
    }
  })();

  /**
   * ルールを適用
   */
  function applyRules(record: Record<string, any>): void {
    // デバッグ: レコード内の全フィールドコードを出力
    console.log('[Field Conditional Display] レコード内のフィールド一覧:', Object.keys(record));

    enabledRules.forEach(rule => {
      try {
        console.log(`[Field Conditional Display] ルール "${rule.name}" を評価中...`);
        console.log('[Field Conditional Display] 条件:', rule.conditions);

        const shouldApply = evaluator.evaluate(rule.conditions, record);
        console.log(`[Field Conditional Display] 条件評価結果: ${shouldApply}`);
        console.log('[Field Conditional Display] アクション:', rule.actions);

        fieldController.applyRule(rule, shouldApply);
      } catch (error) {
        console.error(`[Field Conditional Display] ルールの適用に失敗しました (${rule.name})`, error);
      }
    });
  }

  /**
   * トリガーフィールドのリストを取得
   */
  function getTriggerFields(): string[] {
    const triggerFields = new Set<string>();

    enabledRules.forEach(rule => {
      rule.conditions.conditions.forEach(condition => {
        triggerFields.add(condition.fieldCode);
      });
    });

    return Array.from(triggerFields);
  }

  const triggerFields = getTriggerFields();

  // レコード詳細画面表示時
  kintone.events.on('app.record.detail.show', (event) => {
    applyRules(event.record);

    // プラグイン起動イベント送信
    analytics.track('plugin_loaded', {
      screen_type: 'detail',
      rule_count: enabledRules.length
    });

    // 初回アクティベーション記録（アプリごとに1回のみ）
    const activationKey = `field_conditional_display_activated_${kintone.app.getId()}`;
    if (!localStorage.getItem(activationKey)) {
      analytics.track('plugin_activated', {
        screen_type: 'detail',
        rule_count: enabledRules.length
      });
      localStorage.setItem(activationKey, 'true');
    }

    return event;
  });

  // レコード編集画面表示時
  kintone.events.on(['app.record.edit.show', 'app.record.create.show'], (event) => {
    applyRules(event.record);

    const screenType = event.type === 'app.record.create.show' ? 'create' : 'edit';

    // プラグイン起動イベント送信
    analytics.track('plugin_loaded', {
      screen_type: screenType,
      rule_count: enabledRules.length
    });

    // 初回アクティベーション記録（アプリごとに1回のみ）
    const activationKey = `field_conditional_display_activated_${kintone.app.getId()}`;
    if (!localStorage.getItem(activationKey)) {
      analytics.track('plugin_activated', {
        screen_type: screenType,
        rule_count: enabledRules.length
      });
      localStorage.setItem(activationKey, 'true');
    }

    return event;
  });

  // フィールド値変更時（全てのトリガーフィールドを監視）
  triggerFields.forEach(fieldCode => {
    // 編集画面
    kintone.events.on(`app.record.edit.change.${fieldCode}`, (event) => {
      applyRules(event.record);
      return event;
    });

    // 新規作成画面
    kintone.events.on(`app.record.create.change.${fieldCode}`, (event) => {
      applyRules(event.record);
      return event;
    });
  });

  console.log(`[Field Conditional Display] プラグインが初期化されました (${enabledRules.length}件のルール)`);

})(kintone.$PLUGIN_ID);
