import type { KintoneField } from '@/types';

/**
 * HTMLタグを除去してテキストのみを抽出
 */
const stripHtmlTags = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * アプリ内のスペースフィールド一覧を取得
 */
export const getSpaceFields = async (): Promise<{ id: string; label: string }[]> => {
  try {
    const appId = kintone.app.getId();
    if (!appId) {
      throw new Error('アプリIDを取得できませんでした');
    }

    const layoutResp = await kintone.api(
      kintone.api.url('/k/v1/app/form/layout', true),
      'GET',
      { app: appId }
    );

    const spaceFields: { id: string; label: string }[] = [];

    // レイアウトからスペースフィールドを抽出
    layoutResp.layout?.forEach((layout: any) => {
      if (layout.type === 'ROW') {
        layout.fields?.forEach((field: any) => {
          if (field.type === 'SPACER' && field.elementId) {
            spaceFields.push({
              id: field.elementId,
              label: field.elementId,
            });
          }
        });
      }
    });

    return spaceFields;
  } catch (error) {
    console.error('スペースフィールドの取得に失敗しました:', error);
    throw error;
  }
};

/**
 * アプリのフィールド情報を取得（レイアウト順）
 */
export const getAppFields = async (): Promise<Record<string, KintoneField>> => {
  try {
    const appId = kintone.app.getId();
    if (!appId) {
      throw new Error('アプリIDを取得できませんでした');
    }

    // フィールド情報とレイアウト情報を並列取得
    const [fieldsResp, layoutResp] = await Promise.all([
      kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', { app: appId }),
      kintone.api(kintone.api.url('/k/v1/app/form/layout', true), 'GET', { app: appId }),
    ]);

    // レイアウト順にすべての要素を収集（上から下、左から右）
    // フィールド、グループ、ラベルすべてを同一の順序システムで管理
    const fields: Record<string, KintoneField> = {};
    let orderIndex = 0; // 統一された順序カウンター
    let hrIndex = 0;    // 罫線専用のカウンター

    // ステータス関連とカテゴリのみ除外
    const excludeTypes = ['CATEGORY', 'STATUS', 'STATUS_ASSIGNEE'];

    layoutResp.layout?.forEach((layout: any) => {
      if (layout.type === 'ROW') {
        // 行内のフィールドを左から右の順で追加
        layout.fields?.forEach((field: any) => {
          if (field.type === 'LABEL') {
            // ラベルフィールド
            const labelCode = `__LABEL_${orderIndex}`;
            const labelText = field.label ? stripHtmlTags(field.label) : '（ラベル）';
            fields[labelCode] = {
              code: labelCode,
              label: labelText,
              type: 'LABEL',
              required: false,
              order: orderIndex,
            };
            orderIndex++;
          } else if (field.type === 'HR') {
            // 罫線フィールド
            const hrCode = `__HR_${hrIndex}`;
            fields[hrCode] = {
              code: hrCode,
              label: '（罫線）',
              type: 'HR',
              required: false,
              order: orderIndex,
            };
            orderIndex++;
            hrIndex++;
          } else if (field.code) {
            // 通常のフィールド
            const fieldData = fieldsResp.properties[field.code];
            if (fieldData && !excludeTypes.includes(fieldData.type)) {
              fields[field.code] = {
                code: field.code,
                label: fieldData.label,
                type: fieldData.type,
                required: fieldData.required || false,
                order: orderIndex,
              };
              orderIndex++;
            }
          }
        });
      } else if (layout.type === 'GROUP') {
        // グループフィールド
        const groupCode = `__GROUP_${orderIndex}`;
        fields[groupCode] = {
          code: groupCode,
          label: layout.label || '（グループ）',
          type: 'GROUP',
          required: false,
          order: orderIndex,
        };
        orderIndex++;

        // グループ内のレイアウトを処理
        layout.layout?.forEach((groupLayout: any) => {
          if (groupLayout.type === 'ROW') {
            groupLayout.fields?.forEach((field: any) => {
              if (field.type === 'LABEL') {
                // グループ内のラベルフィールド
                const labelCode = `__LABEL_${orderIndex}`;
                const labelText = field.label ? stripHtmlTags(field.label) : '（ラベル）';
                fields[labelCode] = {
                  code: labelCode,
                  label: labelText,
                  type: 'LABEL',
                  required: false,
                  order: orderIndex,
                };
                orderIndex++;
              } else if (field.type === 'HR') {
                // グループ内の罫線フィールド
                const hrCode = `__HR_${hrIndex}`;
                fields[hrCode] = {
                  code: hrCode,
                  label: '（罫線）',
                  type: 'HR',
                  required: false,
                  order: orderIndex,
                };
                orderIndex++;
                hrIndex++;
              } else if (field.code) {
                // グループ内の通常フィールド
                const fieldData = fieldsResp.properties[field.code];
                if (fieldData && !excludeTypes.includes(fieldData.type)) {
                  fields[field.code] = {
                    code: field.code,
                    label: fieldData.label,
                    type: fieldData.type,
                    required: fieldData.required || false,
                    order: orderIndex,
                  };
                  orderIndex++;
                }
              }
            });
          } else if (groupLayout.type === 'SUBTABLE') {
            // グループ内のサブテーブル
            if (groupLayout.code) {
              const fieldData = fieldsResp.properties[groupLayout.code];
              if (fieldData && !excludeTypes.includes(fieldData.type)) {
                fields[groupLayout.code] = {
                  code: groupLayout.code,
                  label: fieldData.label,
                  type: fieldData.type,
                  required: fieldData.required || false,
                  order: orderIndex,
                };
                orderIndex++;
              }
            }
          }
        });
      } else if (layout.type === 'SUBTABLE') {
        // サブテーブル自体をフィールドとして追加
        if (layout.code) {
          const fieldData = fieldsResp.properties[layout.code];
          if (fieldData && !excludeTypes.includes(fieldData.type)) {
            fields[layout.code] = {
              code: layout.code,
              label: fieldData.label,
              type: fieldData.type,
              required: fieldData.required || false,
              order: orderIndex,
            };
            orderIndex++;
          }
        }
      }
    });

    return fields;
  } catch (error) {
    console.error('フィールド情報の取得に失敗しました:', error);
    throw error;
  }
};

/**
 * フィールド要素を取得
 * 標準フィールド(レコード番号、作成者など)、グループ、ラベル、罫線はDOM直接取得
 */
export const getFieldElement = (fieldCode: string): HTMLElement | null => {
  try {
    // 標準フィールド一覧
    const systemFields: Record<string, string> = {
      RECORD_NUMBER: 'レコード番号',
      CREATOR: '作成者',
      MODIFIER: '更新者',
      CREATED_TIME: '作成日時',
      UPDATED_TIME: '更新日時',
    };

    // 標準フィールドの場合はDOM直接取得
    if (Object.keys(systemFields).includes(fieldCode)) {
      const labelText = systemFields[fieldCode];

      // レコード詳細画面のフィールドラベルを検索
      const labels = Array.from(document.querySelectorAll<HTMLElement>('.record-gaia .field-gaia .label-gaia, .record-body .field .label'));

      for (const label of labels) {
        if (label.textContent?.trim() === labelText) {
          // ラベルの次の要素（値を含む要素）を返す
          const valueElement = label.nextElementSibling as HTMLElement;
          if (valueElement) {
            return valueElement;
          }
        }
      }

      console.warn(`標準フィールド "${fieldCode}" (${labelText}) の要素が見つかりませんでした`);
      return null;
    }

    // グループ、ラベル、罫線の場合は常にnullを返す（getFieldRowで処理）
    if (fieldCode.startsWith('__GROUP_') || fieldCode.startsWith('__LABEL_') || fieldCode.startsWith('__HR_')) {
      return null;
    }

    // 通常のフィールド: kintone APIで取得を試みる
    let element: HTMLElement | null = null;

    try {
      element = kintone.app.record.getFieldElement(fieldCode);
      if (element) {
        console.log(`kintone APIで取得成功: ${fieldCode}`);
      } else {
        console.log(`kintone APIで取得失敗（null）: ${fieldCode}`);
      }
    } catch (apiError) {
      // kintone APIで取得できない場合（編集/作成画面など）
      console.log(`kintone APIで例外発生: ${fieldCode}`, apiError);
    }

    // kintone APIで取得できなかった場合、またはnullの場合はDOM直接検索
    if (!element) {
      console.log(`DOM直接検索開始: ${fieldCode}`);

      // 編集/作成画面用の検索戦略
      // 戦略1: input/select/textarea要素のname属性で検索（編集画面では name="value-{フィールドコード}" が使われることが多い）
      const nameBasedSelectors = [
        `input[name="value-${fieldCode}"]`,
        `select[name="value-${fieldCode}"]`,
        `textarea[name="value-${fieldCode}"]`,
        `input[name="${fieldCode}"]`,
        `select[name="${fieldCode}"]`,
        `textarea[name="${fieldCode}"]`,
      ];

      for (const selector of nameBasedSelectors) {
        const inputElement = document.querySelector<HTMLElement>(selector);
        console.log(`  name属性セレクタ試行: "${selector}" → ${inputElement ? '発見' : 'なし'}`);
        if (inputElement) {
          // 入力要素が見つかったら、その親要素（.control-gaia など）を返す
          const controlElement = inputElement.closest('.control-gaia, .control-value-gaia, .input-gaia, .field') as HTMLElement;
          if (controlElement) {
            console.log(`DOM検索で発見（name属性経由）: セレクタ="${selector}", フィールド="${fieldCode}"`, controlElement);
            element = controlElement;
            break;
          }
        }
      }

      // 戦略2: data属性で検索
      if (!element) {
        const dataBasedSelectors = [
          `[data-field-code="${fieldCode}"]`,
          `[data-field="${fieldCode}"]`,
        ];

        for (const selector of dataBasedSelectors) {
          const dataElement = document.querySelector<HTMLElement>(selector);
          console.log(`  data属性セレクタ試行: "${selector}" → ${dataElement ? '発見' : 'なし'}`);
          if (dataElement) {
            console.log(`DOM検索で発見（data属性経由）: セレクタ="${selector}", フィールド="${fieldCode}"`, dataElement);
            element = dataElement;
            break;
          }
        }
      }

      // 戦略3: クラス名で検索（従来の方法）
      if (!element) {
        const classBasedSelectors = [
          `.control-gaia[class*="field-"][class*="${fieldCode}"]`, // 新UI
          `.field[class*="${fieldCode}"]`,                          // 旧UI
        ];

        for (const selector of classBasedSelectors) {
          const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
          console.log(`  クラスセレクタ試行: "${selector}" → ${elements.length}個発見`);
          if (elements.length > 0) {
            console.log(`DOM検索で発見（クラス経由）: セレクタ="${selector}", フィールド="${fieldCode}"`, elements[0]);
            element = elements[0];
            break;
          }
        }
      }

      if (!element) {
        console.warn(`DOM検索でも発見できず（全戦略失敗）: ${fieldCode}`);
      }
    }

    return element;
  } catch (error) {
    console.error(`フィールド要素の取得に失敗しました (${fieldCode}):`, error);
    return null;
  }
};

/**
 * フィールドの行要素を取得（ラベルと値を含む）
 * ラベルは競合プラグインの実装を参考に、kintone公式のDOM構造を使用
 */
const getFieldRow = (fieldCode: string, fieldLabel?: string): HTMLElement | null => {
  // グループの場合
  if (fieldCode.startsWith('__GROUP_')) {
    const index = parseInt(fieldCode.replace('__GROUP_', ''), 10);
    const groups = Array.from(document.querySelectorAll<HTMLElement>('.subtable-group-gaia, .subtable-group'));
    console.log(`グループ要素検索: インデックス=${index}, 見つかった要素数=${groups.length}`);
    return groups[index] || null;
  }

  // ラベルの場合：競合プラグインの実装を採用
  // kintone公式のDOM構造を使用してテキスト内容で検索
  if (fieldCode.startsWith('__LABEL_')) {
    if (!fieldLabel) {
      console.warn(`ラベルフィールド "${fieldCode}" のラベルテキストが指定されていません`);
      return null;
    }

    // kintone公式のラベルフィールドDOM構造（競合プラグインと同じ）
    const labelElements = [
      ...document.querySelectorAll<HTMLDivElement>('.control-label-field-gaia'),
      ...document.querySelectorAll<HTMLSpanElement>('.control-value-label-gaia'),
    ];

    for (const element of labelElements) {
      // textContentを使用（HTMLタグを除去したテキスト内容で比較）
      const elementText = (element.textContent || '').trim();
      if (elementText === fieldLabel) {
        // 親要素を返す（競合プラグインの実装に準拠）
        console.log(`ラベル要素発見: ラベル="${fieldLabel}", テキスト="${elementText}", 親要素=`, element.parentElement);
        return element.parentElement;
      }
    }

    console.warn(`ラベル要素が見つかりませんでした: ラベル="${fieldLabel}"`);
    return null;
  }

  // 罫線の場合：DOMから直接検索
  if (fieldCode.startsWith('__HR_')) {
    const index = parseInt(fieldCode.replace('__HR_', ''), 10);

    // kintone罫線のDOM構造を探索（複数のセレクタを試行）
    const hrSelectors = [
      '.hr-cybozu',              // 旧UI
      '.control-hr-gaia',        // 新UI候補1
      '.control-value-hr-gaia',  // 新UI候補2
      'hr',                      // 標準HTML要素
    ];

    console.log(`罫線要素検索: インデックス=${index}`);

    for (const selector of hrSelectors) {
      const hrs = Array.from(document.querySelectorAll<HTMLElement>(selector));
      console.log(`  ${selector}: ${hrs.length}個発見`);

      if (hrs[index]) {
        const hrElement = hrs[index];
        console.log(`罫線要素発見: セレクタ="${selector}", インデックス=${index}`, hrElement);
        console.log(`罫線の親要素:`, hrElement.parentElement);
        console.log(`罫線の親要素のクラス:`, hrElement.parentElement?.className);

        // 罫線の親要素（行全体）を返す
        return hrElement.parentElement;
      }
    }

    console.warn(`罫線要素が見つかりませんでした: インデックス=${index}`);
    return null;
  }

  // 標準フィールドの場合は、ラベル要素から行を特定
  const systemFields: Record<string, string> = {
    RECORD_NUMBER: 'レコード番号',
    CREATOR: '作成者',
    MODIFIER: '更新者',
    CREATED_TIME: '作成日時',
    UPDATED_TIME: '更新日時',
  };

  if (Object.keys(systemFields).includes(fieldCode)) {
    const labelText = systemFields[fieldCode];
    const labels = Array.from(document.querySelectorAll<HTMLElement>('.record-gaia .field-gaia .label-gaia, .record-body .field .label'));

    for (const label of labels) {
      if (label.textContent?.trim() === labelText) {
        // ラベルの親要素（field-gaia または row-gaia）を探す
        const fieldRow = label.closest('.field-gaia, .row-gaia, .field') as HTMLElement;
        if (fieldRow) {
          return fieldRow;
        }
      }
    }

    console.warn(`標準フィールド "${fieldCode}" (${labelText}) の行要素が見つかりませんでした`);
    return null;
  }

  // 通常のフィールドの処理
  let element = getFieldElement(fieldCode);

  // フィールド要素が見つからなかった場合、ラベルテキストから探す（編集/作成画面用）
  if (!element && fieldLabel) {
    console.log(`フィールド "${fieldCode}" が見つからないため、ラベルテキスト "${fieldLabel}" から検索します`);

    // ラベルテキストに一致する要素を探す
    const allLabels = document.querySelectorAll<HTMLElement>(
      '.control-label-gaia, .control-label-field-gaia, .field-label-gaia, label'
    );

    for (const labelElement of Array.from(allLabels)) {
      const labelText = (labelElement.textContent || '').trim();
      // 必須マーク「*」を除去して比較
      const cleanLabelText = labelText.replace(/\s*\*\s*$/, '').trim();

      if (cleanLabelText === fieldLabel) {
        console.log(`ラベルテキスト "${fieldLabel}" に一致するラベル要素を発見:`, labelElement);

        // ラベルの次の兄弟要素または親要素からフィールドを探す
        // パターン1: ラベルと同じ行にフィールドがある
        let fieldContainer = labelElement.nextElementSibling as HTMLElement;
        if (fieldContainer && (
          fieldContainer.classList.contains('control-value-gaia') ||
          fieldContainer.classList.contains('control-gaia') ||
          fieldContainer.querySelector('input, select, textarea')
        )) {
          console.log(`ラベルの次の兄弟要素をフィールドとして使用:`, fieldContainer);
          element = fieldContainer;
          break;
        }

        // パターン2: ラベルの親要素の次の兄弟要素にフィールドがある
        const labelParent = labelElement.parentElement;
        if (labelParent) {
          fieldContainer = labelParent.nextElementSibling as HTMLElement;
          if (fieldContainer && (
            fieldContainer.classList.contains('control-value-gaia') ||
            fieldContainer.classList.contains('control-gaia') ||
            fieldContainer.querySelector('input, select, textarea')
          )) {
            console.log(`ラベルの親要素の次の兄弟要素をフィールドとして使用:`, fieldContainer);
            element = fieldContainer;
            break;
          }
        }

        // パターン3: ラベルと同じ行要素内でフィールドを探す
        const row = labelElement.closest('.row-gaia, .field-gaia, .control-field-gaia');
        if (row) {
          const fieldInRow = row.querySelector<HTMLElement>('.control-value-gaia, input, select, textarea');
          if (fieldInRow) {
            console.log(`同じ行内でフィールドを発見:`, fieldInRow);
            element = fieldInRow.closest('.control-value-gaia, .control-gaia') as HTMLElement || fieldInRow;
            break;
          }
        }
      }
    }

    if (!element) {
      console.warn(`ラベルテキスト "${fieldLabel}" からもフィールド "${fieldCode}" の要素が見つかりませんでした`);
    }
  }

  if (!element) {
    console.warn(`フィールド "${fieldCode}" の要素が取得できませんでした`);
    return null;
  }

  console.log(`フィールド "${fieldCode}" の要素を取得:`, element);
  console.log(`フィールド "${fieldCode}" の親要素のクラス:`, element.parentElement?.className);

  // kintoneのフィールド構造を探索
  // 1. サブテーブル内のフィールド
  let row = element.closest('.subtable-row-gaia') as HTMLElement;
  if (row) {
    console.log(`フィールド "${fieldCode}" の行要素を取得（サブテーブル）:`, row);
    return row;
  }

  // 2. 通常のフィールド - レコード詳細画面の行全体
  // フィールドグループの行要素を探す（ラベル+値を含む要素）
  row = element.closest('.recordlist-gaia > .row-gaia') as HTMLElement;
  if (row) {
    console.log(`フィールド "${fieldCode}" の行要素を取得（recordlist > row）:`, row);
    return row;
  }

  // 3. フィールド個別の要素（レコード作成・編集画面でよく使われる）
  row = element.closest('.field-gaia') as HTMLElement;
  if (row) {
    console.log(`フィールド "${fieldCode}" の行要素を取得（field-gaia）:`, row);
    return row;
  }

  // 4. 旧UIの場合
  row = element.closest('.field') as HTMLElement;
  if (row) {
    console.log(`フィールド "${fieldCode}" の行要素を取得（旧UI field）:`, row);
    return row;
  }

  // 5. より上位のレコードグループを探す
  let current: HTMLElement | null = element;
  let maxDepth = 10; // 無限ループ防止
  while (current && maxDepth > 0) {
    current = current.parentElement;
    if (!current) break;

    console.log(`フィールド "${fieldCode}" 親要素探索（深さ${10 - maxDepth}）:`, current.className);

    // row-gaiaクラスを持つ要素を探す
    if (current.classList.contains('row-gaia')) {
      console.log(`フィールド "${fieldCode}" の行要素を取得（row-gaia）:`, current);
      return current;
    }

    // recordlist-gaia直下のdivを探す
    if (current.parentElement?.classList.contains('recordlist-gaia')) {
      console.log(`フィールド "${fieldCode}" の行要素を取得（recordlist直下）:`, current);
      return current;
    }

    maxDepth--;
  }

  // 最終フォールバック: 親要素を直接返す
  console.warn(`フィールド "${fieldCode}" の行要素が見つかりませんでした（フォールバック: 親要素を使用）`);
  console.log(`フィールド "${fieldCode}" フォールバック要素:`, element.parentElement);
  return element.parentElement as HTMLElement;
};

/**
 * フィールドを表示
 */
export const showField = (fieldCode: string, fieldLabel?: string): void => {
  const row = getFieldRow(fieldCode, fieldLabel);
  if (row) {
    row.style.display = '';
    console.log(`フィールド "${fieldCode}" を表示しました`);
  }
};

/**
 * フィールドを非表示
 */
export const hideField = (fieldCode: string, fieldLabel?: string): void => {
  const row = getFieldRow(fieldCode, fieldLabel);
  if (row) {
    row.style.display = 'none';
    console.log(`フィールド "${fieldCode}" を非表示にしました`);
  }
};
