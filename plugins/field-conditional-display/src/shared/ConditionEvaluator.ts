/**
 * 条件評価エンジン
 * ルールの条件を評価し、真偽値を返す
 */

import type { ConditionGroup, Condition, FieldValue } from '../types';

export class ConditionEvaluator {
  /**
   * 条件グループを評価
   * @param conditionGroup 条件グループ
   * @param record kintoneレコードオブジェクト
   * @returns 評価結果（true/false）
   */
  evaluate(conditionGroup: ConditionGroup, record: Record<string, any>): boolean {
    // Phase 1では単一条件のみ評価
    if (conditionGroup.conditions.length === 0) return false;

    const condition = conditionGroup.conditions[0] as Condition;
    return this.evaluateCondition(condition, record);
  }

  /**
   * 単一条件を評価
   */
  private evaluateCondition(condition: Condition, record: Record<string, any>): boolean {
    const field = record[condition.fieldCode];
    if (!field) {
      // フィールドが存在しない場合
      console.warn(`[Field Conditional Display] フィールドが存在しません: ${condition.fieldCode}`);
      return false;
    }

    const fieldValue = this.getFieldValue(field);

    switch (condition.operator) {
      case 'equals':
        return this.evaluateEquals(fieldValue, condition.value);

      case 'not_equals':
        return !this.evaluateEquals(fieldValue, condition.value);

      case 'is_empty':
        return this.evaluateIsEmpty(fieldValue);

      case 'is_not_empty':
        return !this.evaluateIsEmpty(fieldValue);

      default:
        console.warn(`[Field Conditional Display] 未対応の演算子です: ${condition.operator}`);
        return false;
    }
  }

  /**
   * フィールドから値を取得（フィールドタイプに応じた処理）
   */
  private getFieldValue(field: any): FieldValue {
    // 値が存在しない場合
    if (!field || field.value === undefined || field.value === null) {
      return null;
    }

    // SINGLE_LINE_TEXT, MULTI_LINE_TEXT, NUMBER, DROP_DOWN, RADIO_BUTTON, DATE, DATETIME
    if (typeof field.value === 'string' || typeof field.value === 'number') {
      return String(field.value || '');
    }

    // CHECK_BOX, MULTI_SELECT, USER_SELECT, ORGANIZATION_SELECT, GROUP_SELECT
    if (Array.isArray(field.value)) {
      return field.value.map((v: any) => {
        // USER_SELECT, ORGANIZATION_SELECT, GROUP_SELECTの場合
        if (typeof v === 'object' && v.code) {
          return v.code;
        }
        return String(v);
      });
    }

    return null;
  }

  /**
   * equals演算子の評価
   */
  private evaluateEquals(fieldValue: FieldValue, compareValue: string | string[]): boolean {
    if (fieldValue === null || fieldValue === undefined) {
      return false;
    }

    // フィールド値が配列の場合（CHECK_BOX等）
    if (Array.isArray(fieldValue)) {
      const compareArray = Array.isArray(compareValue) ? compareValue : [compareValue];

      // 配列同士の比較（全ての値が含まれているか）
      return compareArray.every(cv => fieldValue.includes(cv));
    }

    // 文字列の場合
    const compareStr = Array.isArray(compareValue) ? compareValue[0] : compareValue;
    return String(fieldValue) === String(compareStr);
  }

  /**
   * is_empty演算子の評価
   */
  private evaluateIsEmpty(fieldValue: FieldValue): boolean {
    if (fieldValue === null || fieldValue === undefined) {
      return true;
    }

    if (Array.isArray(fieldValue)) {
      return fieldValue.length === 0;
    }

    return String(fieldValue).trim() === '';
  }
}
