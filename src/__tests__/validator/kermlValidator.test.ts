import { KerMLValidator } from '../../validator/kermlValidator';
import { MultiplicityRange } from '../../model/kerml/MultiplicityRange';
import { Specialization } from '../../model/kerml/Specialization';
import { Union } from '../../model/kerml/Union';
import { Intersect } from '../../model/kerml/Intersect';
import { Difference } from '../../model/kerml/Difference';
import { FeatureMembership } from '../../model/kerml/FeatureMembership';
import { TypeFeaturing } from '../../model/kerml/TypeFeaturing';
import { FeatureChaining } from '../../model/kerml/FeatureChaining';
import { FeatureInverting } from '../../model/kerml/FeatureInverting';
import { Feature } from '../../model/kerml/Feature';

describe('KerMLValidator', () => {
  let validator: KerMLValidator;
  
  beforeEach(() => {
    validator = new KerMLValidator();
  });
  
  describe('validateMultiplicityRange', () => {
    test('should pass for valid multiplicity ranges', () => {
      // 有効な範囲: 0..1
      const range1 = new MultiplicityRange({
        lowerBound: 0,
        upperBound: 1
      });
      expect(validator.validateMultiplicityRange(range1)).toHaveLength(0);
      
      // 有効な範囲: 1..1 (単一値)
      const range2 = new MultiplicityRange({
        lowerBound: 1,
        upperBound: 1
      });
      expect(validator.validateMultiplicityRange(range2)).toHaveLength(0);
      
      // 有効な範囲: 0..* (無制限)
      const range3 = new MultiplicityRange({
        lowerBound: 0,
        upperBound: -1
      });
      expect(validator.validateMultiplicityRange(range3)).toHaveLength(0);
      
      // 有効な範囲: 2..5
      const range4 = new MultiplicityRange({
        lowerBound: 2,
        upperBound: 5
      });
      expect(validator.validateMultiplicityRange(range4)).toHaveLength(0);
    });
    
    test('should fail for invalid lower bound', () => {
      const range = new MultiplicityRange();
      range.updateRange(-1, 1);
      
      const errors = validator.validateMultiplicityRange(range);
      expect(errors).toHaveLength(1);
      expect(errors[0].errorCode).toBe('INVALID_LOWER_BOUND');
    });
    
    test('should fail for invalid upper bound', () => {
      const range = new MultiplicityRange();
      range.updateRange(3, 2);
      
      const errors = validator.validateMultiplicityRange(range);
      expect(errors).toHaveLength(1);
      expect(errors[0].errorCode).toBe('INVALID_UPPER_BOUND');
    });
  });
  
  describe('validateSpecializationCycles', () => {
    test('should pass for valid specialization hierarchy', () => {
      // A -> B -> C の有効な階層
      const specializations = [
        new Specialization({
          specific: 'A',
          general: 'B'
        }),
        new Specialization({
          specific: 'B',
          general: 'C'
        })
      ];
      
      const errors = validator.validateSpecializationCycles(specializations);
      expect(errors).toHaveLength(0);
    });
    
    test('should detect direct specialization cycle', () => {
      // A -> B -> A の直接的な循環
      const specializations = [
        new Specialization({
          specific: 'A',
          general: 'B'
        }),
        new Specialization({
          specific: 'B',
          general: 'A'
        })
      ];
      
      const errors = validator.validateSpecializationCycles(specializations);
      expect(errors).toHaveLength(1);
      expect(errors[0].errorCode).toBe('SPECIALIZATION_CYCLE');
    });
    
    test('should detect indirect specialization cycle', () => {
      // A -> B -> C -> A の間接的な循環
      const specializations = [
        new Specialization({
          specific: 'A',
          general: 'B'
        }),
        new Specialization({
          specific: 'B',
          general: 'C'
        }),
        new Specialization({
          specific: 'C',
          general: 'A'
        })
      ];
      
      const errors = validator.validateSpecializationCycles(specializations);
      expect(errors).toHaveLength(1);
      expect(errors[0].errorCode).toBe('SPECIALIZATION_CYCLE');
    });
  });
  
  describe('validateTypeOperators', () => {
    test('should pass for valid Union, Intersect, and Difference', () => {
      const unions = [
        new Union({
          operands: ['A', 'B', 'C']
        })
      ];
      
      const intersects = [
        new Intersect({
          operands: ['A', 'B']
        })
      ];
      
      const differences = [
        new Difference({
          firstOperand: 'A',
          secondOperand: 'B'
        })
      ];
      
      const errors = validator.validateTypeOperators(unions, intersects, differences);
      expect(errors).toHaveLength(0);
    });
    
    test('should fail for Union with insufficient operands', () => {
      const unions = [
        new Union({
          operands: ['A'] // 1つの演算子のみ
        })
      ];
      
      const errors = validator.validateTypeOperators(unions, [], []);
      expect(errors).toHaveLength(1);
      expect(errors[0].errorCode).toBe('INSUFFICIENT_OPERANDS');
    });
    
    test('should fail for Intersect with insufficient operands', () => {
      const intersects = [
        new Intersect({
          operands: [] // 演算子なし
        })
      ];
      
      const errors = validator.validateTypeOperators([], intersects, []);
      expect(errors).toHaveLength(1);
      expect(errors[0].errorCode).toBe('INSUFFICIENT_OPERANDS');
    });
    
    test('should fail for Difference with missing operands', () => {
      // 実際のDifferenceではコンストラクタに両方のオペランドが必要なので、
      // 検証のためにオブジェクトを直接操作
      const difference = new Difference({
        firstOperand: 'A',
        secondOperand: 'B'
      });
      
      // @ts-ignore - 検証のためにプロパティを直接操作
      difference.firstOperand = '';
      
      const errors = validator.validateTypeOperators([], [], [difference]);
      expect(errors).toHaveLength(1);
      expect(errors[0].errorCode).toBe('MISSING_FIRST_OPERAND');
    });
  });
  
  describe('validateRelationships', () => {
    test('should pass for valid relationships', () => {
      const featureMemberships = [
        new FeatureMembership({
          owningType: 'Type1',
          memberFeature: 'Feature1'
        })
      ];
      
      const typeFeaturing = [
        new TypeFeaturing({
          featuringType: 'Type1',
          featuredType: 'Type2'
        })
      ];
      
      const featureChainings = [
        new FeatureChaining({
          chainingFeature: 'Feature1',
          featuredBy: 'Feature2'
        })
      ];
      
      const featureInvertings = [
        new FeatureInverting({
          featureInverted: 'Feature1',
          invertingFeature: 'Feature2'
        })
      ];
      
      const errors = validator.validateRelationships(
        featureMemberships,
        typeFeaturing,
        featureChainings,
        featureInvertings
      );
      
      expect(errors).toHaveLength(0);
    });
    
    test('should fail for invalid relationships with missing properties', () => {
      // プロパティを欠落させた関係を作成
      const featureMembership = new FeatureMembership({
        owningType: 'Type1',
        memberFeature: 'Feature1'
      });
      // @ts-ignore - 検証のためにプロパティを直接操作
      featureMembership.owningType = '';
      
      const typeFeaturing = new TypeFeaturing({
        featuringType: 'Type1',
        featuredType: 'Type2'
      });
      // @ts-ignore - 検証のためにプロパティを直接操作
      typeFeaturing.featuredType = '';
      
      const featureChaining = new FeatureChaining({
        chainingFeature: 'Feature1',
        featuredBy: 'Feature2'
      });
      // @ts-ignore - 検証のためにプロパティを直接操作
      featureChaining.chainingFeature = '';
      
      const featureInverting = new FeatureInverting({
        featureInverted: 'Feature1',
        invertingFeature: 'Feature2'
      });
      // @ts-ignore - 検証のためにプロパティを直接操作
      featureInverting.invertingFeature = '';
      
      const errors = validator.validateRelationships(
        [featureMembership],
        [typeFeaturing],
        [featureChaining],
        [featureInverting]
      );
      
      expect(errors).toHaveLength(4);
      expect(errors[0].errorCode).toBe('MISSING_OWNING_TYPE');
      expect(errors[1].errorCode).toBe('MISSING_FEATURED_TYPE');
      expect(errors[2].errorCode).toBe('MISSING_CHAINING_FEATURE');
      expect(errors[3].errorCode).toBe('MISSING_INVERTING_FEATURE');
    });
  });
  
  describe('validateFeatures', () => {
    test('should pass for valid features', () => {
      const features = [
        new Feature({
          name: 'Feature1',
          isComposite: true
        }),
        new Feature({
          name: 'Feature2',
          isPortion: true
        }),
        new Feature({
          name: 'Feature3',
          isEnd: true,
          typeId: 'Type1'
        })
      ];
      
      const errors = validator.validateFeatures(features);
      expect(errors).toHaveLength(0);
    });
    
    test('should fail for features with incompatible flags', () => {
      const feature = new Feature({
        name: 'InvalidFeature',
        isComposite: true,
        isPortion: true // コンポジションとポーションは両立できない
      });
      
      const errors = validator.validateFeatures([feature]);
      expect(errors).toHaveLength(1);
      expect(errors[0].errorCode).toBe('INCOMPATIBLE_FLAGS');
    });
    
    test('should fail for end features without type reference', () => {
      const feature = new Feature({
        name: 'InvalidEndFeature',
        isEnd: true
        // typeId が欠落
      });
      
      const errors = validator.validateFeatures([feature]);
      expect(errors).toHaveLength(1);
      expect(errors[0].errorCode).toBe('MISSING_TYPE_REFERENCE');
    });
  });
});