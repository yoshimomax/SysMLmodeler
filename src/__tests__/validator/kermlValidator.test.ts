import { KermlValidator } from '../../validator/kermlValidator';
import {
  Type,
  Feature,
  MultiplicityRange,
  Specialization,
  Union,
  Intersect, 
  Difference,
  FeatureMembership,
  TypeFeaturing,
  FeatureChaining,
  FeatureInverting
} from '../../model/kerml';

describe('KermlValidator', () => {
  describe('validateSpecializationCycles', () => {
    test('should detect direct specialization cycle', () => {
      // Arrange
      const specializations = [
        new Specialization({
          id: 'spec1',
          general: 'typeB',
          specific: 'typeA'
        }),
        new Specialization({
          id: 'spec2',
          general: 'typeA',
          specific: 'typeB'
        })
      ];
      
      // Act
      const errors = KermlValidator.validateSpecializationCycles(specializations);
      
      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('cycle');
      expect(errors[0]).toContain('typeA');
      expect(errors[0]).toContain('typeB');
    });
    
    test('should detect indirect specialization cycle', () => {
      // Arrange
      const specializations = [
        new Specialization({
          id: 'spec1',
          general: 'typeB',
          specific: 'typeA'
        }),
        new Specialization({
          id: 'spec2',
          general: 'typeC',
          specific: 'typeB'
        }),
        new Specialization({
          id: 'spec3',
          general: 'typeA',
          specific: 'typeC'
        })
      ];
      
      // Act
      const errors = KermlValidator.validateSpecializationCycles(specializations);
      
      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('cycle');
      expect(errors[0]).toContain('typeA');
      expect(errors[0]).toContain('typeB');
      expect(errors[0]).toContain('typeC');
    });
    
    test('should pass for valid specialization hierarchy', () => {
      // Arrange
      const specializations = [
        new Specialization({
          id: 'spec1',
          general: 'typeBase',
          specific: 'typeA'
        }),
        new Specialization({
          id: 'spec2',
          general: 'typeBase',
          specific: 'typeB'
        }),
        new Specialization({
          id: 'spec3',
          general: 'typeA',
          specific: 'typeC'
        })
      ];
      
      // Act
      const errors = KermlValidator.validateSpecializationCycles(specializations);
      
      // Assert
      expect(errors.length).toBe(0);
    });
  });
  
  describe('validateMultiplicityRangeBounds', () => {
    test('should detect invalid multiplicityRange with lowerBound > upperBound', () => {
      // Arrange
      const ranges = [
        new MultiplicityRange({
          id: 'range1',
          lowerBound: 5,
          upperBound: 3
        })
      ];
      
      // Act
      const errors = KermlValidator.validateMultiplicityRangeBounds(ranges);
      
      // Assert
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('range1');
      expect(errors[0]).toContain('lowerBound (5) > upperBound (3)');
    });
    
    test('should detect invalid multiplicityRange with negative lowerBound', () => {
      // Arrange
      const ranges = [
        new MultiplicityRange({
          id: 'range1',
          lowerBound: -2,
          upperBound: 5
        })
      ];
      
      // Act
      const errors = KermlValidator.validateMultiplicityRangeBounds(ranges);
      
      // Assert
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('range1');
      expect(errors[0]).toContain('lowerBound (-2) cannot be negative');
    });
    
    test('should pass for valid multiplicityRange with lowerBound <= upperBound', () => {
      // Arrange
      const ranges = [
        new MultiplicityRange({
          id: 'range1',
          lowerBound: 0,
          upperBound: 5
        }),
        new MultiplicityRange({
          id: 'range2',
          lowerBound: 3,
          upperBound: 3
        }),
        new MultiplicityRange({
          id: 'range3',
          lowerBound: 0,
          upperBound: -1 // -1 means unlimited
        })
      ];
      
      // Act
      const errors = KermlValidator.validateMultiplicityRangeBounds(ranges);
      
      // Assert
      expect(errors.length).toBe(0);
    });
  });
  
  describe('validateTypeOperators', () => {
    test('should detect union with no operands', () => {
      // Arrange
      const unions = [
        new Union({
          id: 'union1',
          name: 'EmptyUnion',
          operands: []
        })
      ];
      
      // Act
      const errors = KermlValidator.validateTypeOperators(unions, [], []);
      
      // Assert
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('EmptyUnion');
      expect(errors[0]).toContain('at least one operand');
    });
    
    test('should detect intersect with no operands', () => {
      // Arrange
      const intersects = [
        new Intersect({
          id: 'intersect1',
          name: 'EmptyIntersect',
          operands: []
        })
      ];
      
      // Act
      const errors = KermlValidator.validateTypeOperators([], intersects, []);
      
      // Assert
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('EmptyIntersect');
      expect(errors[0]).toContain('at least one operand');
    });
    
    test('should detect difference with missing operands', () => {
      // Arrange
      const differences = [
        new Difference({
          id: 'diff1',
          name: 'InvalidDiff',
          firstOperand: '',
          secondOperand: 'typeB'
        }),
        new Difference({
          id: 'diff2',
          name: 'AnotherInvalidDiff',
          firstOperand: 'typeA',
          secondOperand: ''
        })
      ];
      
      // Act
      const errors = KermlValidator.validateTypeOperators([], [], differences);
      
      // Assert
      expect(errors.length).toBe(2);
      expect(errors[0]).toContain('InvalidDiff');
      expect(errors[0]).toContain('first operand');
      expect(errors[1]).toContain('AnotherInvalidDiff');
      expect(errors[1]).toContain('second operand');
    });
    
    test('should pass for valid type operators', () => {
      // Arrange
      const unions = [
        new Union({
          id: 'union1',
          name: 'ValidUnion',
          operands: ['typeA', 'typeB']
        })
      ];
      
      const intersects = [
        new Intersect({
          id: 'intersect1',
          name: 'ValidIntersect',
          operands: ['typeA', 'typeB', 'typeC']
        })
      ];
      
      const differences = [
        new Difference({
          id: 'diff1',
          name: 'ValidDiff',
          firstOperand: 'typeA',
          secondOperand: 'typeB'
        })
      ];
      
      // Act
      const errors = KermlValidator.validateTypeOperators(unions, intersects, differences);
      
      // Assert
      expect(errors.length).toBe(0);
    });
  });
  
  describe('validateRelationships', () => {
    test('should detect invalid featureMembership', () => {
      // Arrange
      const featureMemberships = [
        new FeatureMembership({
          id: 'fm1',
          owningType: '',
          memberFeature: 'feature1'
        }),
        new FeatureMembership({
          id: 'fm2',
          owningType: 'type1',
          memberFeature: ''
        })
      ];
      
      // Act
      const errors = KermlValidator.validateRelationships(featureMemberships, [], [], []);
      
      // Assert
      expect(errors.length).toBe(2);
      expect(errors[0]).toContain('fm1');
      expect(errors[0]).toContain('owningType');
      expect(errors[1]).toContain('fm2');
      expect(errors[1]).toContain('memberFeature');
    });
    
    test('should detect invalid typeFeaturing', () => {
      // Arrange
      const typeFeaturing = [
        new TypeFeaturing({
          id: 'tf1',
          featuringType: '',
          featuredType: 'type1'
        })
      ];
      
      // Act
      const errors = KermlValidator.validateRelationships([], typeFeaturing, [], []);
      
      // Assert
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('tf1');
      expect(errors[0]).toContain('featuringType');
    });
    
    test('should detect invalid featureChaining', () => {
      // Arrange
      const featureChainings = [
        new FeatureChaining({
          id: 'fc1',
          chainingFeature: 'feature1',
          featuredBy: ''
        })
      ];
      
      // Act
      const errors = KermlValidator.validateRelationships([], [], featureChainings, []);
      
      // Assert
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('fc1');
      expect(errors[0]).toContain('featuredBy');
    });
    
    test('should detect invalid featureInverting', () => {
      // Arrange
      const featureInvertings = [
        new FeatureInverting({
          id: 'fi1',
          featureInverted: '',
          invertingFeature: 'feature1'
        })
      ];
      
      // Act
      const errors = KermlValidator.validateRelationships([], [], [], featureInvertings);
      
      // Assert
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('fi1');
      expect(errors[0]).toContain('featureInverted');
    });
    
    test('should pass for valid relationships', () => {
      // Arrange
      const featureMemberships = [
        new FeatureMembership({
          id: 'fm1',
          owningType: 'type1',
          memberFeature: 'feature1'
        })
      ];
      
      const typeFeaturing = [
        new TypeFeaturing({
          id: 'tf1',
          featuringType: 'type1',
          featuredType: 'type2'
        })
      ];
      
      // Act
      const errors = KermlValidator.validateRelationships(featureMemberships, typeFeaturing, [], []);
      
      // Assert
      expect(errors.length).toBe(0);
    });
  });
  
  describe('validateTypeFeatureConsistency', () => {
    test('should detect feature with non-existent type reference', () => {
      // Arrange
      const types = [
        new Type({ id: 'type1', name: 'Type1' })
      ];
      
      const features = [
        new Feature({
          id: 'feature1',
          name: 'Feature1',
          typeId: 'nonexistent'
        })
      ];
      
      // Act
      const errors = KermlValidator.validateTypeFeatureConsistency(types, features);
      
      // Assert
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('Feature1');
      expect(errors[0]).toContain('nonexistent');
    });
    
    test('should detect type with non-existent feature reference', () => {
      // Arrange
      const types = [
        new Type({
          id: 'type1',
          name: 'Type1',
          features: ['nonexistent']
        })
      ];
      
      const features = [
        new Feature({ id: 'feature1', name: 'Feature1' })
      ];
      
      // Act
      const errors = KermlValidator.validateTypeFeatureConsistency(types, features);
      
      // Assert
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('Type1');
      expect(errors[0]).toContain('nonexistent');
    });
    
    test('should pass for valid type-feature references', () => {
      // Arrange
      const features = [
        new Feature({ id: 'feature1', name: 'Feature1', typeId: 'type1' }),
        new Feature({ id: 'feature2', name: 'Feature2', typeId: 'type2' })
      ];
      
      const types = [
        new Type({ id: 'type1', name: 'Type1', features: ['feature1'] }),
        new Type({ id: 'type2', name: 'Type2', features: ['feature2'] })
      ];
      
      // Act
      const errors = KermlValidator.validateTypeFeatureConsistency(types, features);
      
      // Assert
      expect(errors.length).toBe(0);
    });
  });
  
  describe('validateAll', () => {
    test('should aggregate errors from all validations', () => {
      // Arrange
      const specializations = [
        new Specialization({
          id: 'spec1',
          general: 'typeB',
          specific: 'typeA'
        }),
        new Specialization({
          id: 'spec2',
          general: 'typeA',
          specific: 'typeB'
        })
      ];
      
      const ranges = [
        new MultiplicityRange({
          id: 'range1',
          lowerBound: 5,
          upperBound: 3
        })
      ];
      
      const unions = [
        new Union({
          id: 'union1',
          name: 'EmptyUnion',
          operands: []
        })
      ];
      
      const featureMemberships = [
        new FeatureMembership({
          id: 'fm1',
          owningType: '',
          memberFeature: 'feature1'
        })
      ];
      
      const elements = {
        types: [] as Type[],
        features: [] as Feature[],
        multiplicityRanges: ranges,
        specializations: specializations,
        unions: unions,
        intersects: [] as Intersect[],
        differences: [] as Difference[],
        featureMemberships: featureMemberships,
        typeFeaturing: [] as TypeFeaturing[],
        featureChainings: [] as FeatureChaining[],
        featureInvertings: [] as FeatureInverting[]
      };
      
      // Act
      const errors = KermlValidator.validateAll(elements);
      
      // Assert
      expect(errors.length).toBeGreaterThan(3); // At least one error per validation
    });
  });
});