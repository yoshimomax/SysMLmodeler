/**
 * KerML バリデータ関数群
 * KerML要素の制約をチェックする関数を提供します
 */

import { Type } from './Type';
import { Feature } from './Feature';
import { Classifier } from './Classifier';
import { MultiplicityRange } from './MultiplicityRange';

/**
 * KerML Type要素の基本的な制約をチェック
 * @param type 検証するType要素
 * @throws Error 制約違反がある場合
 */
export function validateKerMLType(type: Type): void {
  if (!type.id) {
    throw new Error('KerML Type: IDは必須です');
  }
  
  if (!type.name) {
    throw new Error(`KerML Type (${type.id}): 名前は必須です`);
  }
  
  // 型の特殊な制約をチェック
  if (type.isConjugated) {
    // 共役型の制約をチェック
    // 例: 共役型は特定のコンテキストでのみ有効、など
  }
}

/**
 * KerML Feature要素の基本的な制約をチェック
 * @param feature 検証するFeature要素
 * @throws Error 制約違反がある場合
 */
export function validateKerMLFeature(feature: Feature): void {
  // まず基底クラス（Type）の制約をチェック
  validateKerMLType(feature);
  
  // Feature固有の制約をチェック
  if (feature.isPortion && !feature.isComposite) {
    throw new Error(`KerML Feature (${feature.id}): portionはcompositeでなければなりません`);
  }
  
  // 方向性の制約チェック
  if (feature.direction) {
    if (!['in', 'out', 'inout'].includes(feature.direction)) {
      throw new Error(`KerML Feature (${feature.id}): 無効な方向指定です: ${feature.direction}`);
    }
  }
  
  // 型参照がある場合、存在するIDであることを検証
  // 注意: 実際のモデルストアアクセスは実装依存
}

/**
 * KerML Classifier要素の基本的な制約をチェック
 * @param classifier 検証するClassifier要素
 * @throws Error 制約違反がある場合
 */
export function validateKerMLClassifier(classifier: Classifier): void {
  // まず基底クラス（Type）の制約をチェック
  validateKerMLType(classifier);
  
  // Classifier固有の制約をチェック
  if (classifier.isAbstract && classifier.isFinal) {
    throw new Error(`KerML Classifier (${classifier.id}): abstractとfinalを同時に設定することはできません`);
  }
}

/**
 * KerML MultiplicityRange要素の基本的な制約をチェック
 * @param range 検証するMultiplicityRange要素
 * @throws Error 制約違反がある場合
 */
export function validateMultiplicityRange(range: MultiplicityRange): void {
  if (range.lowerBound < 0) {
    throw new Error(`MultiplicityRange (${range.id}): 下限は0以上である必要があります`);
  }
  
  if (range.upperBound !== -1 && range.upperBound < range.lowerBound) {
    throw new Error(`MultiplicityRange (${range.id}): 上限は下限以上か、無制限(-1)である必要があります`);
  }
}

/**
 * KerML要素間の関係性が整合しているかチェック
 * @param relationName 関係性の名前（エラーメッセージ用）
 * @param sourceId 関係の元要素ID
 * @param targetId 関係の対象要素ID
 * @throws Error IDが同一の場合にエラー
 */
export function validateRelationshipIds(relationName: string, sourceId: string, targetId: string): void {
  if (!sourceId || !targetId) {
    throw new Error(`${relationName}: 関係の両端のIDが必要です`);
  }
  
  if (sourceId === targetId) {
    throw new Error(`${relationName}: 自己参照する関係は定義できません (${sourceId})`);
  }
}