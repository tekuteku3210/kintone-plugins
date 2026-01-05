/**
 * フィールド制御クラス
 * フィールド/スペースの表示/非表示を制御
 */

import type { DisplayRule, KintoneField } from '../types';

export class FieldController {
  private fieldsMap: Map<string, KintoneField>;

  constructor(fieldsMap: Map<string, KintoneField>) {
    this.fieldsMap = fieldsMap;
  }

  /**
   * ルールに基づいてフィールドの表示/非表示を制御
   * @param rule 表示制御ルール
   * @param shouldApply 条件が満たされているか
   */
  applyRule(rule: DisplayRule, shouldApply: boolean): void {
    rule.actions.forEach(action => {
      action.targets.forEach(target => {
        if (target.type === 'field') {
          this.toggleField(target.elementId, action.type, shouldApply);
        } else if (target.type === 'space') {
          this.toggleSpace(target.elementId, action.type, shouldApply);
        }
      });
    });
  }

  /**
   * フィールドの表示/非表示を切り替え
   * @param fieldCode フィールドコード
   * @param actionType 'show' or 'hide'
   * @param shouldApply 条件が満たされているか
   */
  private toggleField(fieldCode: string, actionType: 'show' | 'hide', shouldApply: boolean): void {
    // まずkintone APIでフィールド要素を取得
    let fieldElement = kintone.app.record.getFieldElement(fieldCode);

    // フォールバック: APIで取得できない場合はDOMから直接検索
    if (!fieldElement) {
      console.log(`[Field Conditional Display] APIで取得失敗、DOM検索を試行: ${fieldCode}`);
      fieldElement = this.findFieldElementByDOM(fieldCode);
    }

    if (!fieldElement) {
      console.warn(`[Field Conditional Display] フィールドが見つかりません: ${fieldCode}`);
      return;
    }

    // control-gaiaを探す（フィールド本体のコンテナ）
    const controlGaia = fieldElement.closest('.control-gaia') as HTMLElement;
    if (!controlGaia) {
      console.warn(`[Field Conditional Display] control-gaiaが見つかりません: ${fieldCode}`);
      return;
    }

    // 表示制御
    const shouldShow = (actionType === 'show' && shouldApply) || (actionType === 'hide' && !shouldApply);
    const shouldHide = (actionType === 'hide' && shouldApply) || (actionType === 'show' && !shouldApply);

    if (shouldHide) {
      controlGaia.style.display = 'none';
      console.log(`[Field Conditional Display] フィールドを非表示: ${fieldCode}`);
    } else if (shouldShow) {
      controlGaia.style.display = '';
      console.log(`[Field Conditional Display] フィールドを表示: ${fieldCode}`);
    }
  }

  /**
   * DOMから直接フィールド要素を検索（フォールバック）
   * @param fieldCode フィールドコード
   * @returns フィールド要素 or null
   */
  private findFieldElementByDOM(fieldCode: string): HTMLElement | null {
    // パターン1: ラベルテキストから検索（最も確実）
    const fieldInfo = this.fieldsMap.get(fieldCode);
    if (fieldInfo && fieldInfo.label) {
      console.log(`[Field Conditional Display] ラベル "${fieldInfo.label}" から検索: ${fieldCode}`);
      const element = this.findFieldByLabel(fieldInfo.label);
      if (element) {
        console.log(`[Field Conditional Display] ラベルから発見: ${fieldCode}`);
        return element;
      }
    }

    // パターン2: クラス名に field-{数字} パターンを探す
    // kintoneは内部的に field-{数字} という形式でクラスを付与
    const allControls = Array.from(document.querySelectorAll('.control-gaia[class*="field-"]'));
    for (const control of allControls) {
      const classList = control.classList.toString();
      // フィールドのクラス名パターン: field-5118329 のような数字ID
      const match = classList.match(/field-(\d+)/);
      if (match) {
        // このcontrol-gaiaがフィールドコードに対応するか確認
        // 注: フィールドコードと数字IDの直接的な対応関係は取得できないため、
        // ラベル検索が成功しなかった場合は特定が困難
        console.log(`[Field Conditional Display] field-IDを発見: ${match[0]}`);
      }
    }

    return null;
  }

  /**
   * ラベルテキストからフィールド要素を検索
   * @param labelText ラベルテキスト
   * @returns フィールドの親要素（control-gaia） or null
   */
  private findFieldByLabel(labelText: string): HTMLElement | null {
    // すべてのラベル要素を取得
    const allLabels = Array.from(document.querySelectorAll('.control-label-gaia'));

    for (const label of allLabels) {
      // ラベルのテキストが一致するか確認
      if (label.textContent?.trim() === labelText) {
        console.log(`[Field Conditional Display] ラベル "${labelText}" を発見`);

        // ラベルの親要素（control-gaia）を取得
        const control = label.closest('.control-gaia');
        if (control) {
          return control as HTMLElement;
        }

        // 別パターン: ラベルの次の兄弟要素がcontrol-value-gaiaの場合
        const parent = label.parentElement;
        if (parent) {
          const valueElement = parent.querySelector('.control-value-gaia');
          if (valueElement) {
            return parent as HTMLElement;
          }
        }
      }
    }

    return null;
  }

  /**
   * フィールド要素から行要素（row-gaia）を取得
   * @param fieldElement フィールド要素
   * @returns 行要素 or null
   */
  private findFieldRow(fieldElement: HTMLElement): HTMLElement | null {
    // kintoneの標準レイアウト: row-gaia > control-gaia > control-value-gaia
    let current: HTMLElement | null = fieldElement;
    let depth = 0;
    const maxDepth = 10;

    while (current && depth < maxDepth) {
      if (current.classList.contains('row-gaia')) {
        return current;
      }
      current = current.parentElement;
      depth++;
    }

    // フォールバック: closest()で探す
    const row = fieldElement.closest('.row-gaia') as HTMLElement;
    if (row) {
      return row;
    }

    // さらにフォールバック: subtable-row-gaia（テーブル内フィールド）
    const subtableRow = fieldElement.closest('.subtable-row-gaia') as HTMLElement;
    if (subtableRow) {
      return subtableRow;
    }

    return null;
  }

  /**
   * スペースの表示/非表示を切り替え
   * @param spaceId スペースのID
   * @param actionType 'show' or 'hide'
   * @param shouldApply 条件が満たされているか
   */
  private toggleSpace(spaceId: string, actionType: 'show' | 'hide', shouldApply: boolean): void {
    const spaceElement = kintone.app.record.getSpaceElement(spaceId);
    if (!spaceElement) {
      console.warn(`[Field Conditional Display] スペースが見つかりません: ${spaceId}`);
      return;
    }

    // 表示制御
    const shouldShow = (actionType === 'show' && shouldApply) || (actionType === 'hide' && !shouldApply);
    const shouldHide = (actionType === 'hide' && shouldApply) || (actionType === 'show' && !shouldApply);

    if (shouldHide) {
      spaceElement.style.display = 'none';
    } else if (shouldShow) {
      spaceElement.style.display = '';
    }
  }
}
