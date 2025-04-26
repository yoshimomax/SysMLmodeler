import {
  Type,
  Feature,
  Classifier,
  MultiplicityRange,
  Specialization,
  Union,
  Intersect,
  Difference,
  FeatureMembership,
  TypeFeaturing,
  FeatureChaining,
  FeatureInverting
} from '../model/kerml';

/**
 * KerML Core メタモデルの制約検証機能を提供する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3 に基づく
 */
export class KermlValidator {
  /**
   * Specializationの循環参照をチェック
   * @param specializations 検証対象のSpecializationリスト
   * @returns 検証結果（エラーメッセージの配列、エラーがない場合は空配列）
   */
  static validateSpecializationCycles(specializations: Specialization[]): string[] {
    const errors: string[] = [];
    
    // 各型の特化関係をマッピング: general -> specific[]
    const specializationMap = new Map<string, string[]>();
    
    // マップの構築
    specializations.forEach(spec => {
      if (!specializationMap.has(spec.general)) {
        specializationMap.set(spec.general, []);
      }
      specializationMap.get(spec.general)!.push(spec.specific);
    });
    
    // 循環検出
    specializations.forEach(spec => {
      const visited = new Set<string>();
      const path: string[] = [];
      
      const detectCycle = (current: string): boolean => {
        if (path.includes(current)) {
          // 循環検出
          const cycleStart = path.indexOf(current);
          const cycle = [...path.slice(cycleStart), current];
          errors.push(`Specialization cycle detected: ${cycle.join(' -> ')}.`);
          return true;
        }
        
        if (visited.has(current) || !specializationMap.has(current)) {
          return false;
        }
        
        visited.add(current);
        path.push(current);
        
        const specifics = specializationMap.get(current) || [];
        for (const specific of specifics) {
          if (detectCycle(specific)) {
            return true;
          }
        }
        
        path.pop();
        return false;
      };
      
      detectCycle(spec.specific);
    });
    
    return errors;
  }
  
  /**
   * MultiplicityRangeの境界値整合性をチェック（lower ≤ upper）
   * @param ranges 検証対象のMultiplicityRangeリスト
   * @returns 検証結果（エラーメッセージの配列、エラーがない場合は空配列）
   */
  static validateMultiplicityRangeBounds(ranges: MultiplicityRange[]): string[] {
    const errors: string[] = [];
    
    ranges.forEach(range => {
      // 上限が-1の場合は無限大を意味するので、任意の下限値が有効
      if (range.upperBound !== -1 && range.lowerBound > range.upperBound) {
        errors.push(`Invalid multiplicity range in '${range.id}': lowerBound (${range.lowerBound}) > upperBound (${range.upperBound}).`);
      }
      
      // 負の下限値は無効（-1は上限でのみ特別な意味を持つ）
      if (range.lowerBound < 0) {
        errors.push(`Invalid multiplicity range in '${range.id}': lowerBound (${range.lowerBound}) cannot be negative.`);
      }
    });
    
    return errors;
  }
  
  /**
   * 型演算子（Union/Intersect/Difference）のオペランド整合性をチェック
   * @param unions Union型のリスト
   * @param intersects Intersect型のリスト
   * @param differences Difference型のリスト
   * @returns 検証結果（エラーメッセージの配列、エラーがない場合は空配列）
   */
  static validateTypeOperators(
    unions: Union[],
    intersects: Intersect[],
    differences: Difference[]
  ): string[] {
    const errors: string[] = [];
    
    // Union検証
    unions.forEach(union => {
      if (!union.operands || union.operands.length === 0) {
        errors.push(`Union '${union.name || union.id}' must have at least one operand.`);
      }
    });
    
    // Intersect検証
    intersects.forEach(intersect => {
      if (!intersect.operands || intersect.operands.length === 0) {
        errors.push(`Intersect '${intersect.name || intersect.id}' must have at least one operand.`);
      }
    });
    
    // Difference検証
    differences.forEach(diff => {
      if (!diff.firstOperand) {
        errors.push(`Difference '${diff.name || diff.id}' is missing first operand.`);
      }
      
      if (!diff.secondOperand) {
        errors.push(`Difference '${diff.name || diff.id}' is missing second operand.`);
      }
    });
    
    return errors;
  }
  
  /**
   * FeatureMembership、TypeFeaturing などの関係性制約をチェック
   * @param featureMemberships FeatureMembershipリスト
   * @param typeFeaturing TypeFeaturingリスト
   * @param featureChainings FeatureChainingリスト
   * @param featureInvertings FeatureInvertingリスト
   * @returns 検証結果（エラーメッセージの配列、エラーがない場合は空配列）
   */
  static validateRelationships(
    featureMemberships: FeatureMembership[],
    typeFeaturing: TypeFeaturing[],
    featureChainings: FeatureChaining[],
    featureInvertings: FeatureInverting[]
  ): string[] {
    const errors: string[] = [];
    
    // FeatureMembership検証
    featureMemberships.forEach(membership => {
      if (!membership.owningType) {
        errors.push(`FeatureMembership '${membership.id}' missing owningType.`);
      }
      
      if (!membership.memberFeature) {
        errors.push(`FeatureMembership '${membership.id}' missing memberFeature.`);
      }
    });
    
    // TypeFeaturing検証
    typeFeaturing.forEach(featuring => {
      if (!featuring.featuringType) {
        errors.push(`TypeFeaturing '${featuring.id}' missing featuringType.`);
      }
      
      if (!featuring.featuredType) {
        errors.push(`TypeFeaturing '${featuring.id}' missing featuredType.`);
      }
    });
    
    // FeatureChaining検証
    featureChainings.forEach(chaining => {
      if (!chaining.chainingFeature) {
        errors.push(`FeatureChaining '${chaining.id}' missing chainingFeature.`);
      }
      
      if (!chaining.featuredBy) {
        errors.push(`FeatureChaining '${chaining.id}' missing featuredBy.`);
      }
    });
    
    // FeatureInverting検証
    featureInvertings.forEach(inverting => {
      if (!inverting.featureInverted) {
        errors.push(`FeatureInverting '${inverting.id}' missing featureInverted.`);
      }
      
      if (!inverting.invertingFeature) {
        errors.push(`FeatureInverting '${inverting.id}' missing invertingFeature.`);
      }
    });
    
    return errors;
  }
  
  /**
   * Type-Feature 関係の整合性をチェック
   * @param types 型リスト
   * @param features 特性リスト
   * @returns 検証結果（エラーメッセージの配列、エラーがない場合は空配列）
   */
  static validateTypeFeatureConsistency(types: Type[], features: Feature[]): string[] {
    const errors: string[] = [];
    
    // 特性の型参照が有効かチェック
    features.forEach(feature => {
      if (feature.typeId) {
        const typeExists = types.some(type => type.id === feature.typeId);
        if (!typeExists) {
          errors.push(`Feature '${feature.name || feature.id}' references non-existent type '${feature.typeId}'.`);
        }
      }
    });
    
    // 型が参照する特性が有効かチェック
    types.forEach(type => {
      type.features.forEach(feature => {
        // feature が id のみの場合
        if (typeof feature === 'string') {
          const featureExists = features.some(f => f.id === feature);
          if (!featureExists) {
            errors.push(`Type '${type.name || type.id}' references non-existent feature '${feature}'.`);
          }
        } 
        // feature がオブジェクトの場合
        else {
          if (!feature.id) {
            errors.push(`Type '${type.name || type.id}' contains a feature without an ID.`);
          }
        }
      });
    });
    
    return errors;
  }
  
  /**
   * 複数の制約チェックを実行
   * @param elements 検証対象要素（KerML要素のリスト）
   * @returns 検証結果（エラーメッセージの配列、エラーがない場合は空配列）
   */
  static validateAll(elements: {
    types: Type[],
    features: Feature[],
    multiplicityRanges: MultiplicityRange[],
    specializations: Specialization[],
    unions: Union[],
    intersects: Intersect[],
    differences: Difference[],
    featureMemberships: FeatureMembership[],
    typeFeaturing: TypeFeaturing[],
    featureChainings: FeatureChaining[],
    featureInvertings: FeatureInverting[]
  }): string[] {
    const errors: string[] = [];
    
    // 各制約チェックを実行して結果を集約
    errors.push(...this.validateSpecializationCycles(elements.specializations));
    errors.push(...this.validateMultiplicityRangeBounds(elements.multiplicityRanges));
    errors.push(...this.validateTypeOperators(
      elements.unions,
      elements.intersects,
      elements.differences
    ));
    errors.push(...this.validateRelationships(
      elements.featureMemberships,
      elements.typeFeaturing,
      elements.featureChainings,
      elements.featureInvertings
    ));
    errors.push(...this.validateTypeFeatureConsistency(
      elements.types,
      elements.features
    ));
    
    return errors;
  }
}