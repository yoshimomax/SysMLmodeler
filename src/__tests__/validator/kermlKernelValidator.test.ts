import { KermlKernelValidator } from '../../validator/kermlKernelValidator';
import {
  Association,
  Connector,
  BindingConnector,
  SuccessionItemFlow,
  Behavior,
  Function,
  Step,
  Expression,
  Package,
  Feature,
  Type
} from '../../model/kerml';

describe('KermlKernelValidator', () => {
  describe('validateAssociationMultiplicities', () => {
    test('should detect association with insufficient end features', () => {
      // Arrange
      const association = new Association({
        id: 'assoc1',
        name: 'TestAssociation'
      });
      
      const features: Feature[] = [];
      
      // Act
      const errors = KermlKernelValidator.validateAssociationMultiplicities(association, features);
      
      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('TestAssociation');
      expect(errors[0]).toContain('at least 2 end features');
    });
    
    test('should pass for association with valid end features', () => {
      // Arrange
      const association = new Association({
        id: 'assoc1',
        name: 'TestAssociation'
      });
      
      const features: Feature[] = [
        new Feature({
          id: 'feat1',
          ownerId: 'assoc1',
          name: 'end1',
          isEnd: true
        }),
        new Feature({
          id: 'feat2',
          ownerId: 'assoc1',
          name: 'end2',
          isEnd: true
        })
      ];
      
      // Act
      const errors = KermlKernelValidator.validateAssociationMultiplicities(association, features);
      
      // Assert
      expect(errors.length).toBe(0);
    });
  });
  
  describe('validateConnectorEnds', () => {
    test('should detect connector with insufficient connected features', () => {
      // Arrange
      const connector = new Connector({
        id: 'conn1',
        name: 'TestConnector',
        connectedFeatures: []
      });
      
      const features: Feature[] = [];
      
      // Act
      const errors = KermlKernelValidator.validateConnectorEnds(connector, features);
      
      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('TestConnector');
      expect(errors[0]).toContain('at least 2 features');
    });
    
    test('should detect connector with non-existent connected features', () => {
      // Arrange
      const connector = new Connector({
        id: 'conn1',
        name: 'TestConnector',
        connectedFeatures: ['nonexistent1', 'nonexistent2']
      });
      
      const features: Feature[] = [];
      
      // Act
      const errors = KermlKernelValidator.validateConnectorEnds(connector, features);
      
      // Assert
      expect(errors.length).toBe(2);
      expect(errors[0]).toContain('TestConnector');
      expect(errors[0]).toContain('nonexistent1');
    });
    
    test('should pass for connector with valid connected features', () => {
      // Arrange
      const connector = new Connector({
        id: 'conn1',
        name: 'TestConnector',
        connectedFeatures: ['feat1', 'feat2']
      });
      
      const features: Feature[] = [
        new Feature({ id: 'feat1', name: 'Feature1' }),
        new Feature({ id: 'feat2', name: 'Feature2' })
      ];
      
      // Act
      const errors = KermlKernelValidator.validateConnectorEnds(connector, features);
      
      // Assert
      expect(errors.length).toBe(0);
    });
  });
  
  describe('validateSuccessionItemFlow', () => {
    test('should detect succession item flow with non-existent item type', () => {
      // Arrange
      const flow = new SuccessionItemFlow({
        id: 'flow1',
        name: 'TestFlow',
        itemType: 'nonexistent'
      });
      
      const types: Type[] = [];
      
      // Act
      const errors = KermlKernelValidator.validateSuccessionItemFlow(flow, types);
      
      // Assert
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('TestFlow');
      expect(errors[0]).toContain('nonexistent');
    });
    
    test('should pass for succession item flow with valid item type', () => {
      // Arrange
      const flow = new SuccessionItemFlow({
        id: 'flow1',
        name: 'TestFlow',
        itemType: 'type1'
      });
      
      const types: Type[] = [
        new Type({ id: 'type1', name: 'Type1' })
      ];
      
      // Act
      const errors = KermlKernelValidator.validateSuccessionItemFlow(flow, types);
      
      // Assert
      expect(errors.length).toBe(0);
    });
  });
  
  describe('validateBehaviorHierarchy', () => {
    test('should detect behavior with non-existent step', () => {
      // Arrange
      const behavior = new Behavior({
        id: 'behavior1',
        name: 'TestBehavior',
        steps: ['nonexistent']
      });
      
      const steps: Step[] = [];
      const expressions: Expression[] = [];
      
      // Act
      const errors = KermlKernelValidator.validateBehaviorHierarchy(behavior, steps, expressions);
      
      // Assert
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('TestBehavior');
      expect(errors[0]).toContain('nonexistent');
    });
    
    test('should detect function with non-existent expression', () => {
      // Arrange
      const func = new Function({
        id: 'func1',
        name: 'TestFunction',
        expression: 'nonexistent'
      });
      
      const steps: Step[] = [];
      const expressions: Expression[] = [];
      
      // Act
      const errors = KermlKernelValidator.validateBehaviorHierarchy(func, steps, expressions);
      
      // Assert
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('TestFunction');
      expect(errors[0]).toContain('nonexistent');
    });
    
    test('should pass for behavior with valid steps', () => {
      // Arrange
      const behavior = new Behavior({
        id: 'behavior1',
        name: 'TestBehavior',
        steps: ['step1']
      });
      
      const steps: Step[] = [
        new Step({ id: 'step1', name: 'Step1', featureId: 'behavior1' })
      ];
      
      const expressions: Expression[] = [];
      
      // Act
      const errors = KermlKernelValidator.validateBehaviorHierarchy(behavior, steps, expressions);
      
      // Assert
      expect(errors.length).toBe(0);
    });
  });
  
  describe('validatePackageNesting', () => {
    test('should detect package with non-existent imports', () => {
      // Arrange
      const pkg = new Package({
        id: 'pkg1',
        name: 'TestPackage',
        imports: ['nonexistent']
      });
      
      const packages: Package[] = [];
      
      // Act
      const errors = KermlKernelValidator.validatePackageNesting(pkg, packages);
      
      // Assert
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('TestPackage');
      expect(errors[0]).toContain('nonexistent');
    });
    
    test('should detect package import cycle', () => {
      // Arrange
      const pkg1 = new Package({
        id: 'pkg1',
        name: 'Package1',
        imports: ['pkg2']
      });
      
      const pkg2 = new Package({
        id: 'pkg2',
        name: 'Package2',
        imports: ['pkg3']
      });
      
      const pkg3 = new Package({
        id: 'pkg3',
        name: 'Package3',
        imports: ['pkg1']
      });
      
      const packages: Package[] = [pkg1, pkg2, pkg3];
      
      // Act
      const errors = KermlKernelValidator.validatePackageNesting(pkg1, packages);
      
      // Assert
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('cycle');
      expect(errors[0]).toContain('pkg1');
      expect(errors[0]).toContain('pkg2');
      expect(errors[0]).toContain('pkg3');
    });
    
    test('should pass for package with valid imports', () => {
      // Arrange
      const pkg1 = new Package({
        id: 'pkg1',
        name: 'Package1',
        imports: ['pkg2']
      });
      
      const pkg2 = new Package({
        id: 'pkg2',
        name: 'Package2',
        imports: []
      });
      
      const packages: Package[] = [pkg1, pkg2];
      
      // Act
      const errors = KermlKernelValidator.validatePackageNesting(pkg1, packages);
      
      // Assert
      expect(errors.length).toBe(0);
    });
  });
  
  describe('validateAll', () => {
    test('should aggregate errors from all validations', () => {
      // Arrange
      const association = new Association({
        id: 'assoc1',
        name: 'TestAssociation'
      });
      
      const connector = new Connector({
        id: 'conn1',
        name: 'TestConnector',
        connectedFeatures: ['nonexistent']
      });
      
      const flow = new SuccessionItemFlow({
        id: 'flow1',
        name: 'TestFlow',
        itemType: 'nonexistent'
      });
      
      const behavior = new Behavior({
        id: 'behavior1',
        name: 'TestBehavior',
        steps: ['nonexistent']
      });
      
      const pkg = new Package({
        id: 'pkg1',
        name: 'TestPackage',
        imports: ['nonexistent']
      });
      
      const elements = {
        types: [] as Type[],
        features: [] as Feature[],
        associations: [association],
        connectors: [connector],
        bindingConnectors: [] as BindingConnector[],
        successionItemFlows: [flow],
        behaviors: [behavior],
        steps: [] as Step[],
        functions: [] as Function[],
        expressions: [] as Expression[],
        packages: [pkg]
      };
      
      // Act
      const errors = KermlKernelValidator.validateAll(elements);
      
      // Assert
      expect(errors.length).toBeGreaterThan(4); // At least one error per validation
    });
  });
});