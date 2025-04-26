import { Type } from '../model/kerml/Type';
import { Feature } from '../model/kerml/Feature';
import { Classifier } from '../model/kerml/Classifier';
import { MultiplicityRange } from '../model/kerml/MultiplicityRange';
import { Specialization } from '../model/kerml/Specialization';
import { Conjugation } from '../model/kerml/Conjugation';
import { Union } from '../model/kerml/Union';
import { Intersect } from '../model/kerml/Intersect';
import { Difference } from '../model/kerml/Difference';
import { FeatureMembership } from '../model/kerml/FeatureMembership';
import { TypeFeaturing } from '../model/kerml/TypeFeaturing';
import { FeatureChaining } from '../model/kerml/FeatureChaining';
import { FeatureInverting } from '../model/kerml/FeatureInverting';

/**
 * バリデーションエラーの型定義
 */
export interface ValidationError {
  elementId: string;
  elementType: string;
  errorCode: string;
  message: string;
}

/**
 * KerML モデルの制約条件を検証するバリデータ
 */
export class KerMLValidator {
  /**
   * MultiplicityRange の制約をチェック
   * @param range 検証する多重度範囲
   * @returns バリデーションエラーの配列（エラーがない場合は空配列）
   */
  validateMultiplicityRange(range: MultiplicityRange): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // 下限値は 0 以上でなければならない
    if (range.lowerBound < 0) {
      errors.push({
        elementId: range.id,
        elementType: 'MultiplicityRange',
        errorCode: 'INVALID_LOWER_BOUND',
        message: `下限値 ${range.lowerBound} は 0 以上でなければなりません`
      });
    }
    
    // 上限値は下限値以上か、-1（無限大）でなければならない
    if (range.upperBound !== -1 && range.upperBound < range.lowerBound) {
      errors.push({
        elementId: range.id,
        elementType: 'MultiplicityRange',
        errorCode: 'INVALID_UPPER_BOUND',
        message: `上限値 ${range.upperBound} は下限値 ${range.lowerBound} 以上でなければなりません`
      });
    }
    
    return errors;
  }
  
  /**
   * Specialization の循環参照をチェック
   * @param specializations 検証する特殊化関係の配列
   * @returns バリデーションエラーの配列（エラーがない場合は空配列）
   */
  validateSpecializationCycles(specializations: Specialization[]): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Specialized 型から General 型へのマッピングを構築
    const specializationMap = new Map<string, string[]>();
    
    specializations.forEach(spec => {
      if (!specializationMap.has(spec.specific)) {
        specializationMap.set(spec.specific, []);
      }
      specializationMap.get(spec.specific)!.push(spec.general);
    });
    
    // 各特殊化関係について循環参照をチェック
    specializations.forEach(spec => {
      const visited = new Set<string>();
      const path: string[] = [spec.specific];
      
      if (this.hasSpecializationCycle(spec.specific, spec.general, specializationMap, visited, path)) {
        errors.push({
          elementId: spec.id,
          elementType: 'Specialization',
          errorCode: 'SPECIALIZATION_CYCLE',
          message: `特殊化関係に循環参照があります: ${path.join(' -> ')}`
        });
      }
    });
    
    return errors;
  }
  
  /**
   * 特殊化関係の循環参照を検出する再帰関数
   * @param current 現在の型ID
   * @param target 到達を試みる型ID
   * @param specializationMap 特殊化マップ
   * @param visited 訪問済みの型IDのセット
   * @param path 現在の探索パス
   * @returns 循環参照がある場合はtrue、ない場合はfalse
   */
  private hasSpecializationCycle(
    current: string,
    target: string,
    specializationMap: Map<string, string[]>,
    visited: Set<string>,
    path: string[]
  ): boolean {
    // 現在の型が既に訪問済みの場合は循環参照
    if (visited.has(current)) {
      return false;
    }
    
    // 現在の型がターゲットと一致した場合は循環参照
    if (current === target) {
      path.push(current);
      return true;
    }
    
    // 訪問済みとしてマーク
    visited.add(current);
    
    // 現在の型の一般型をすべて探索
    const generals = specializationMap.get(current) || [];
    for (const general of generals) {
      path.push(general);
      if (this.hasSpecializationCycle(general, target, specializationMap, visited, path)) {
        return true;
      }
      path.pop();
    }
    
    // 訪問済みマークを解除（バックトラッキング）
    visited.delete(current);
    
    return false;
  }
  
  /**
   * Union/Intersect/Difference の制約をチェック
   * @param types 型の配列
   * @returns バリデーションエラーの配列（エラーがない場合は空配列）
   */
  validateTypeOperators(
    unions: Union[],
    intersects: Intersect[],
    differences: Difference[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Union と Intersect は少なくとも2つのオペランドが必要
    unions.forEach(union => {
      if (union.operands.length < 2) {
        errors.push({
          elementId: union.id,
          elementType: 'Union',
          errorCode: 'INSUFFICIENT_OPERANDS',
          message: `Union型には少なくとも2つのオペランドが必要です（現在: ${union.operands.length}）`
        });
      }
    });
    
    intersects.forEach(intersect => {
      if (intersect.operands.length < 2) {
        errors.push({
          elementId: intersect.id,
          elementType: 'Intersect',
          errorCode: 'INSUFFICIENT_OPERANDS',
          message: `Intersect型には少なくとも2つのオペランドが必要です（現在: ${intersect.operands.length}）`
        });
      }
    });
    
    // Difference は両方のオペランドが必要
    differences.forEach(difference => {
      if (!difference.firstOperand) {
        errors.push({
          elementId: difference.id,
          elementType: 'Difference',
          errorCode: 'MISSING_FIRST_OPERAND',
          message: 'Difference型の第1オペランドが欠落しています'
        });
      }
      
      if (!difference.secondOperand) {
        errors.push({
          elementId: difference.id,
          elementType: 'Difference',
          errorCode: 'MISSING_SECOND_OPERAND',
          message: 'Difference型の第2オペランドが欠落しています'
        });
      }
    });
    
    return errors;
  }
  
  /**
   * FeatureMembership、TypeFeaturing などの関係の制約をチェック
   * @param featureMemberships 特性メンバーシップの配列
   * @param typeFeaturing 型特性関係の配列
   * @param featureChainings 特性チェーン関係の配列
   * @param featureInvertings 特性反転関係の配列
   * @returns バリデーションエラーの配列（エラーがない場合は空配列）
   */
  validateRelationships(
    featureMemberships: FeatureMembership[],
    typeFeaturing: TypeFeaturing[],
    featureChainings: FeatureChaining[],
    featureInvertings: FeatureInverting[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // FeatureMembershipの検証
    featureMemberships.forEach(fm => {
      if (!fm.owningType) {
        errors.push({
          elementId: fm.id,
          elementType: 'FeatureMembership',
          errorCode: 'MISSING_OWNING_TYPE',
          message: 'FeatureMembershipの所有型が欠落しています'
        });
      }
      
      if (!fm.memberFeature) {
        errors.push({
          elementId: fm.id,
          elementType: 'FeatureMembership',
          errorCode: 'MISSING_MEMBER_FEATURE',
          message: 'FeatureMembershipのメンバー特性が欠落しています'
        });
      }
    });
    
    // TypeFeaturingの検証
    typeFeaturing.forEach(tf => {
      if (!tf.featuringType) {
        errors.push({
          elementId: tf.id,
          elementType: 'TypeFeaturing',
          errorCode: 'MISSING_FEATURING_TYPE',
          message: 'TypeFeaturingの特性を持つ型が欠落しています'
        });
      }
      
      if (!tf.featuredType) {
        errors.push({
          elementId: tf.id,
          elementType: 'TypeFeaturing',
          errorCode: 'MISSING_FEATURED_TYPE',
          message: 'TypeFeaturingの特性として使われる型が欠落しています'
        });
      }
    });
    
    // FeatureChainingの検証
    featureChainings.forEach(fc => {
      if (!fc.chainingFeature) {
        errors.push({
          elementId: fc.id,
          elementType: 'FeatureChaining',
          errorCode: 'MISSING_CHAINING_FEATURE',
          message: 'FeatureChainingのチェーン特性が欠落しています'
        });
      }
      
      if (!fc.featuredBy) {
        errors.push({
          elementId: fc.id,
          elementType: 'FeatureChaining',
          errorCode: 'MISSING_FEATURED_BY',
          message: 'FeatureChainingの特性を持つ要素が欠落しています'
        });
      }
    });
    
    // FeatureInvertingの検証
    featureInvertings.forEach(fi => {
      if (!fi.featureInverted) {
        errors.push({
          elementId: fi.id,
          elementType: 'FeatureInverting',
          errorCode: 'MISSING_FEATURE_INVERTED',
          message: 'FeatureInvertingの反転される特性が欠落しています'
        });
      }
      
      if (!fi.invertingFeature) {
        errors.push({
          elementId: fi.id,
          elementType: 'FeatureInverting',
          errorCode: 'MISSING_INVERTING_FEATURE',
          message: 'FeatureInvertingの反転する特性が欠落しています'
        });
      }
    });
    
    return errors;
  }
  
  /**
   * Feature の制約をチェック
   * @param features 特性の配列
   * @returns バリデーションエラーの配列（エラーがない場合は空配列）
   */
  validateFeatures(features: Feature[]): ValidationError[] {
    const errors: ValidationError[] = [];
    
    features.forEach(feature => {
      // コンポジションとポーションが両方trueの場合はエラー
      if (feature.isComposite && feature.isPortion) {
        errors.push({
          elementId: feature.id,
          elementType: 'Feature',
          errorCode: 'INCOMPATIBLE_FLAGS',
          message: '特性は同時にコンポジションとポーションにはなれません'
        });
      }
      
      // 終端特性には型参照が必要
      if (feature.isEnd && !feature.typeId) {
        errors.push({
          elementId: feature.id,
          elementType: 'Feature',
          errorCode: 'MISSING_TYPE_REFERENCE',
          message: '終端特性には型参照が必要です'
        });
      }
    });
    
    return errors;
  }
  
  /**
   * すべての検証を実行
   * @param model KerMLモデル要素の集合
   * @returns すべてのバリデーションエラーの配列
   */
  validateAll(model: {
    types: Type[];
    features: Feature[];
    classifiers: Classifier[];
    multiplicityRanges: MultiplicityRange[];
    specializations: Specialization[];
    conjugations: Conjugation[];
    unions: Union[];
    intersects: Intersect[];
    differences: Difference[];
    featureMemberships: FeatureMembership[];
    typeFeaturing: TypeFeaturing[];
    featureChainings: FeatureChaining[];
    featureInvertings: FeatureInverting[];
  }): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // 各モデル要素の検証結果を集約
    for (const range of model.multiplicityRanges) {
      errors.push(...this.validateMultiplicityRange(range));
    }
    
    errors.push(...this.validateSpecializationCycles(model.specializations));
    
    errors.push(...this.validateTypeOperators(
      model.unions,
      model.intersects,
      model.differences
    ));
    
    errors.push(...this.validateRelationships(
      model.featureMemberships,
      model.typeFeaturing,
      model.featureChainings,
      model.featureInvertings
    ));
    
    errors.push(...this.validateFeatures(model.features));
    
    return errors;
  }
}