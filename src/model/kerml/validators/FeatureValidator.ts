import { Feature } from '../Feature';

/**
 * KerMLのFeature要素に対するバリデーションを実行
 * 
 * @param feature バリデーション対象のFeature
 * @throws Error 制約違反があった場合
 */
export function validateKerMLFeature(feature: Feature): void {
  // 必須フィールドの検証
  if (!feature.id) {
    throw new Error('KerML Featureにはidが必須です');
  }
  
  // 継承の循環参照検証
  if (feature.specializationIds && feature.specializationIds.includes(feature.id)) {
    throw new Error(`Feature(id=${feature.id})が自身を特化(specialization)しています`);
  }
  
  // 多重度の検証
  if (feature.multiplicity) {
    validateMultiplicity(feature.multiplicity);
  }
  
  // タイプチェック
  if (feature.redefinitionIds && feature.redefinitionIds.length > 0 && !feature.typeId) {
    console.warn(`警告: Feature(id=${feature.id})は再定義(redefinition)を持ちますが、型が指定されていません`);
  }
}

/**
 * 多重度表現の検証
 * 
 * @param multiplicity 多重度文字列 (例: "1", "0..1", "1..*")
 * @throws Error 制約違反があった場合
 */
function validateMultiplicity(multiplicity: string): void {
  // 基本形式の検証
  const multiPattern = /^(\d+|\*)$|^(\d+)\.\.(\d+|\*)$/;
  if (!multiPattern.test(multiplicity)) {
    throw new Error(`無効な多重度表現です: ${multiplicity}`);
  }
  
  // 範囲の検証
  if (multiplicity.includes('..')) {
    const [min, max] = multiplicity.split('..');
    const minVal = parseInt(min);
    
    if (max !== '*' && parseInt(max) < minVal) {
      throw new Error(`多重度の最小値(${min})が最大値(${max})を超えています`);
    }
  }
}