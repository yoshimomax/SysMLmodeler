import { Classifier } from '../Classifier';

/**
 * KerMLのClassifier要素に対するバリデーションを実行
 * 
 * @param classifier バリデーション対象のClassifier
 * @throws Error 制約違反があった場合
 */
export function validateKerMLClassifier(classifier: Classifier): void {
  // 必須フィールドの検証
  if (!classifier.id) {
    throw new Error('KerML Classifierにはidが必須です');
  }
  
  // 継承の循環参照検証
  // 注: 実際の実装では、継承階層の検索が必要
  // ここでは簡易的な検証のみ実装
  if (classifier.specializationIds && classifier.specializationIds.includes(classifier.id)) {
    throw new Error(`Classifier(id=${classifier.id})が自身を特化(specialization)しています`);
  }
  
  // 多重度の検証
  if (classifier.multiplicity) {
    validateMultiplicity(classifier.multiplicity);
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