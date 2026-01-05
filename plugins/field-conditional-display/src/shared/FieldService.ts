/**
 * フィールド情報取得サービス
 * kintone APIからフィールド情報を取得
 */

import type { KintoneField, KintoneSpace } from '../types';

export class FieldService {
  /**
   * アプリのフィールド情報を取得
   */
  async getFields(): Promise<KintoneField[]> {
    const appId = kintone.app.getId();
    if (!appId) throw new Error('アプリIDが取得できません');

    try {
      const response = await kintone.api(
        kintone.api.url('/k/v1/app/form/fields', true),
        'GET',
        { app: appId }
      );

      const fields: KintoneField[] = [];

      for (const [code, field] of Object.entries(response.properties as Record<string, any>)) {
        // サポート対象フィールドのみ抽出
        if (this.isSupportedFieldType(field.type)) {
          fields.push({
            code: code,
            label: field.label,
            type: field.type,
            required: field.required
          });
        }
      }

      return fields;
    } catch (error) {
      console.error('[Field Conditional Display] フィールド情報の取得に失敗しました', error);
      throw error;
    }
  }

  /**
   * サポート対象フィールドタイプか判定
   */
  private isSupportedFieldType(type: string): boolean {
    const supportedTypes = [
      'SINGLE_LINE_TEXT',
      'MULTI_LINE_TEXT',
      'NUMBER',
      'DROP_DOWN',
      'RADIO_BUTTON',
      'CHECK_BOX',
      'DATE',
      'DATETIME',
      'USER_SELECT',
      'ORGANIZATION_SELECT',
      'GROUP_SELECT'
    ];
    return supportedTypes.includes(type);
  }

  /**
   * スペース情報を取得
   * Phase 1では手動入力のため空配列を返す
   */
  getSpaces(): KintoneSpace[] {
    // kintoneにはスペース情報を取得するAPIがないため、
    // 設定画面でユーザーがスペースIDを手動入力する形式
    return [];
  }
}
