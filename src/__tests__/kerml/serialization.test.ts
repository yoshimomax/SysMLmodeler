import {
  Type,
  Feature,
  Classifier,
  DataType,
  Class,
  Structure,
  Association,
  Connector,
  BindingConnector,
  Succession,
  ItemFlow,
  SuccessionItemFlow,
  Behavior,
  Step,
  Function,
  Expression,
  Predicate,
  Interaction,
  FeatureValue,
  MetadataFeature,
  Package,
  Specialization,
  Conjugation,
  FeatureMembership,
  TypeFeaturing,
  FeatureChaining,
  FeatureInverting,
  Union,
  Intersect,
  Difference,
  MultiplicityRange
} from '../../model/kerml';

// テスト用のヘルパー関数: toJSON → fromJSON の往復で元のオブジェクトと同じプロパティを持つことを検証
function testSerializationRoundTrip<T>(
  original: any,
  fromJsonFn: (json: any) => T,
  featureInstances: Feature[] = []
): void {
  // シリアライズ
  const json = original.toJSON();
  
  // デシリアライズ
  const reconstructed = fromJsonFn(json, featureInstances);
  
  // 再シリアライズ
  const jsonAgain = reconstructed.toJSON();
  
  // 初回シリアライズと再シリアライズの結果を比較（往復整合性）
  expect(jsonAgain).toEqual(json);
}

describe('KerML Serialization', () => {
  // Core 要素のシリアライズテスト
  describe('Core Elements', () => {
    test('Type serialization round-trip', () => {
      const type = new Type({
        name: 'TestType',
        isAbstract: true,
        description: 'A test type'
      });
      testSerializationRoundTrip(type, Type.fromJSON);
    });
    
    test('Feature serialization round-trip', () => {
      const feature = new Feature({
        name: 'TestFeature',
        isUnique: true,
        direction: 'out'
      });
      testSerializationRoundTrip(feature, Feature.fromJSON);
    });
    
    test('Classifier serialization round-trip', () => {
      const classifier = new Classifier({
        name: 'TestClassifier',
        isAbstract: true,
        isFinal: false
      });
      testSerializationRoundTrip(classifier, Classifier.fromJSON);
    });
    
    test('MultiplicityRange serialization round-trip', () => {
      const range = new MultiplicityRange({
        lowerBound: 1,
        upperBound: 5
      });
      testSerializationRoundTrip(range, MultiplicityRange.fromJSON);
    });
  });
  
  // 関係要素のシリアライズテスト
  describe('Relationship Elements', () => {
    test('Specialization serialization round-trip', () => {
      const specialization = new Specialization({
        general: 'type1',
        specific: 'type2'
      });
      testSerializationRoundTrip(specialization, Specialization.fromJSON);
    });
    
    test('Conjugation serialization round-trip', () => {
      const conjugation = new Conjugation({
        originalType: 'type1',
        conjugatedType: 'type2'
      });
      testSerializationRoundTrip(conjugation, Conjugation.fromJSON);
    });
    
    test('FeatureMembership serialization round-trip', () => {
      const membership = new FeatureMembership({
        owningType: 'type1',
        memberFeature: 'feature1'
      });
      testSerializationRoundTrip(membership, FeatureMembership.fromJSON);
    });
  });
  
  // 型演算子のシリアライズテスト
  describe('Type Operators', () => {
    test('Union serialization round-trip', () => {
      const union = new Union({
        name: 'TestUnion',
        operands: ['type1', 'type2', 'type3']
      });
      testSerializationRoundTrip(union, Union.fromJSON);
    });
    
    test('Intersect serialization round-trip', () => {
      const intersect = new Intersect({
        name: 'TestIntersect',
        operands: ['type1', 'type2']
      });
      testSerializationRoundTrip(intersect, Intersect.fromJSON);
    });
    
    test('Difference serialization round-trip', () => {
      const difference = new Difference({
        name: 'TestDifference',
        firstOperand: 'type1',
        secondOperand: 'type2'
      });
      testSerializationRoundTrip(difference, Difference.fromJSON);
    });
  });
  
  // Kernel 要素のシリアライズテスト
  describe('Kernel Elements', () => {
    test('DataType serialization round-trip', () => {
      const dataType = new DataType({
        name: 'TestDataType',
        isAbstract: false
      });
      testSerializationRoundTrip(dataType, DataType.fromJSON);
    });
    
    test('Class serialization round-trip', () => {
      const classObj = new Class({
        name: 'TestClass',
        isAbstract: true
      });
      testSerializationRoundTrip(classObj, Class.fromJSON);
    });
    
    test('Structure serialization round-trip', () => {
      const structure = new Structure({
        name: 'TestStructure'
      });
      testSerializationRoundTrip(structure, Structure.fromJSON);
    });
    
    test('Association serialization round-trip', () => {
      const association = new Association({
        name: 'TestAssociation',
        relatedTypes: ['type1', 'type2']
      });
      testSerializationRoundTrip(association, Association.fromJSON);
    });
    
    test('Connector serialization round-trip', () => {
      const connector = new Connector({
        name: 'TestConnector',
        connectedFeatures: ['feat1', 'feat2']
      });
      testSerializationRoundTrip(connector, Connector.fromJSON);
    });
    
    test('BindingConnector serialization round-trip', () => {
      const bindingConnector = new BindingConnector({
        name: 'TestBindingConnector',
        connectedFeatures: ['feat1', 'feat2']
      });
      testSerializationRoundTrip(bindingConnector, BindingConnector.fromJSON);
    });
    
    test('Succession serialization round-trip', () => {
      const succession = new Succession({
        name: 'TestSuccession',
        connectedFeatures: ['feat1', 'feat2'],
        effect: 'Some effect',
        guard: 'x > 0'
      });
      testSerializationRoundTrip(succession, Succession.fromJSON);
    });
    
    test('ItemFlow serialization round-trip', () => {
      const itemFlow = new ItemFlow({
        name: 'TestItemFlow',
        connectedFeatures: ['feat1', 'feat2'],
        itemType: 'String'
      });
      testSerializationRoundTrip(itemFlow, ItemFlow.fromJSON);
    });
    
    test('SuccessionItemFlow serialization round-trip', () => {
      const successionItemFlow = new SuccessionItemFlow({
        name: 'TestSuccessionItemFlow',
        connectedFeatures: ['feat1', 'feat2'],
        effect: 'Some effect',
        guard: 'x > 0',
        itemType: 'Integer'
      });
      testSerializationRoundTrip(successionItemFlow, SuccessionItemFlow.fromJSON);
    });
    
    test('Behavior serialization round-trip', () => {
      const behavior = new Behavior({
        name: 'TestBehavior',
        steps: ['step1', 'step2']
      });
      testSerializationRoundTrip(behavior, Behavior.fromJSON);
    });
    
    test('Step serialization round-trip', () => {
      const step = new Step({
        name: 'TestStep',
        behaviorReference: 'behavior1'
      });
      testSerializationRoundTrip(step, Step.fromJSON);
    });
    
    test('Function serialization round-trip', () => {
      const func = new Function({
        name: 'TestFunction',
        steps: ['step1'],
        expression: 'expr1'
      });
      testSerializationRoundTrip(func, Function.fromJSON);
    });
    
    test('Expression serialization round-trip', () => {
      const expression = new Expression({
        name: 'TestExpression',
        body: 'a + b',
        result: 'c'
      });
      testSerializationRoundTrip(expression, Expression.fromJSON);
    });
    
    test('Predicate serialization round-trip', () => {
      const predicate = new Predicate({
        name: 'TestPredicate',
        body: 'x > 0'
      });
      testSerializationRoundTrip(predicate, Predicate.fromJSON);
    });
    
    test('Interaction serialization round-trip', () => {
      const interaction = new Interaction({
        name: 'TestInteraction',
        participants: ['part1', 'part2']
      });
      testSerializationRoundTrip(interaction, Interaction.fromJSON);
    });
    
    test('FeatureValue serialization round-trip', () => {
      const featureValue = new FeatureValue({
        featureId: 'feat1',
        value: 42,
        isDefault: false
      });
      testSerializationRoundTrip(featureValue, FeatureValue.fromJSON);
    });
    
    test('MetadataFeature serialization round-trip', () => {
      const metadata = new MetadataFeature({
        name: 'TestMetadata',
        annotatedElements: ['elem1', 'elem2']
      });
      testSerializationRoundTrip(metadata, MetadataFeature.fromJSON);
    });
    
    test('Package serialization round-trip', () => {
      const pkg = new Package({
        name: 'TestPackage',
        imports: ['pkg1', 'pkg2']
      });
      testSerializationRoundTrip(pkg, Package.fromJSON);
    });
  });
  
  // 依存関係を持つ要素の複合シリアライズテスト
  describe('Complex Serialization', () => {
    test('Type with features serialization round-trip', () => {
      // 特性を作成
      const feature1 = new Feature({
        id: 'feat1',
        ownerId: 'type1',
        name: 'Feature1',
        direction: 'in'
      });
      
      const feature2 = new Feature({
        id: 'feat2',
        ownerId: 'type1',
        name: 'Feature2',
        direction: 'out'
      });
      
      // 特性を持つ型を作成
      const type = new Type({
        id: 'type1',
        name: 'TypeWithFeatures',
        features: [feature1, feature2]
      });
      
      // シリアライズテスト
      const json = type.toJSON();
      const reconstructed = Type.fromJSON(json, [feature1, feature2]);
      const jsonAgain = reconstructed.toJSON();
      
      // 検証
      expect(jsonAgain).toEqual(json);
      expect(reconstructed.features.length).toBe(2);
      expect(reconstructed.features[0].name).toBe('Feature1');
      expect(reconstructed.features[1].name).toBe('Feature2');
    });
    
    test('Behavior with steps serialization round-trip', () => {
      // ステップを作成
      const step1 = new Step({
        id: 'step1',
        ownerId: 'behavior1',
        name: 'Step1',
        behaviorReference: 'otherBehavior'
      });
      
      // ステップを持つ振る舞いを作成
      const behavior = new Behavior({
        id: 'behavior1',
        name: 'BehaviorWithSteps',
        steps: ['step1']
      });
      
      // シリアライズテスト
      const json = behavior.toJSON();
      const reconstructed = Behavior.fromJSON(json);
      const jsonAgain = reconstructed.toJSON();
      
      // 検証
      expect(jsonAgain).toEqual(json);
      expect(reconstructed.steps.length).toBe(1);
      expect(reconstructed.steps[0]).toBe('step1');
    });
  });
});