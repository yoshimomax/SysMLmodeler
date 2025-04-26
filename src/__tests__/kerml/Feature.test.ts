import { Feature } from '../../model/kerml/Feature';
import { Type } from '../../model/kerml/Type';

describe('Feature', () => {
  let feature: Feature;
  let ownerType: Type;
  
  beforeEach(() => {
    ownerType = new Type({ name: 'OwnerType' });
    feature = new Feature({ 
      name: 'TestFeature',
      ownerId: ownerType.id
    });
  });
  
  test('should create a Feature with default values', () => {
    expect(feature.id).toBeDefined();
    expect(feature.name).toBe('TestFeature');
    expect(feature.ownerId).toBe(ownerType.id);
    expect(feature.isUnique).toBe(true);
    expect(feature.isOrdered).toBe(false);
    expect(feature.isComposite).toBe(false);
    expect(feature.isPortion).toBe(false);
    expect(feature.isReadOnly).toBe(false);
    expect(feature.isDerived).toBe(false);
    expect(feature.isEnd).toBe(false);
    expect(feature.direction).toBeUndefined();
    expect(feature.typeId).toBeUndefined();
  });
  
  test('should create a Feature with custom values', () => {
    const customFeature = new Feature({
      name: 'CustomFeature',
      isUnique: false,
      isOrdered: true,
      isComposite: true,
      isReadOnly: true,
      isDerived: true,
      isEnd: true,
      direction: 'in',
      typeId: 'some-type-id'
    });
    
    expect(customFeature.name).toBe('CustomFeature');
    expect(customFeature.isUnique).toBe(false);
    expect(customFeature.isOrdered).toBe(true);
    expect(customFeature.isComposite).toBe(true);
    expect(customFeature.isReadOnly).toBe(true);
    expect(customFeature.isDerived).toBe(true);
    expect(customFeature.isEnd).toBe(true);
    expect(customFeature.direction).toBe('in');
    expect(customFeature.typeId).toBe('some-type-id');
  });
  
  test('should set and get typeId', () => {
    // 初期値はundefined
    expect(feature.typeId).toBeUndefined();
    
    // typeIdを設定
    feature.typeId = 'new-type-id';
    expect(feature.typeId).toBe('new-type-id');
    
    // typeIdをundefinedに設定
    feature.typeId = undefined;
    expect(feature.typeId).toBeUndefined();
  });
  
  test('should serialize and deserialize Feature to/from JSON', () => {
    feature.typeId = 'referenced-type-id';
    feature.direction = 'out';
    
    // 子特性を追加
    const childFeature = new Feature({ name: 'ChildFeature' });
    feature.addFeature(childFeature);
    
    // シリアライズ
    const json = feature.toJSON();
    
    // 基本プロパティが正しくシリアライズされていることを確認
    expect(json.__type).toBe('Feature');
    expect(json.id).toBe(feature.id);
    expect(json.name).toBe('TestFeature');
    expect(json.ownerId).toBe(ownerType.id);
    expect(json.isUnique).toBe(true);
    expect(json.isOrdered).toBe(false);
    expect(json.isComposite).toBe(false);
    expect(json.isPortion).toBe(false);
    expect(json.isReadOnly).toBe(false);
    expect(json.isDerived).toBe(false);
    expect(json.isEnd).toBe(false);
    expect(json.direction).toBe('out');
    expect(json.type).toBe('referenced-type-id');
    expect(json.features).toHaveLength(1);
    expect(json.features[0].name).toBe('ChildFeature');
    
    // デシリアライズ
    const deserializedFeature = Feature.fromJSON(json, [childFeature]);
    
    // デシリアライズされた特性が元の特性と一致することを確認
    expect(deserializedFeature.id).toBe(feature.id);
    expect(deserializedFeature.name).toBe('TestFeature');
    expect(deserializedFeature.ownerId).toBe(ownerType.id);
    expect(deserializedFeature.isUnique).toBe(true);
    expect(deserializedFeature.isOrdered).toBe(false);
    expect(deserializedFeature.isComposite).toBe(false);
    expect(deserializedFeature.isPortion).toBe(false);
    expect(deserializedFeature.isReadOnly).toBe(false);
    expect(deserializedFeature.isDerived).toBe(false);
    expect(deserializedFeature.isEnd).toBe(false);
    expect(deserializedFeature.direction).toBe('out');
    expect(deserializedFeature.typeId).toBe('referenced-type-id');
    expect(deserializedFeature.features).toHaveLength(1);
    expect(deserializedFeature.features[0].name).toBe('ChildFeature');
  });
  
  test('should inherit properties from Type', () => {
    // Feature は Type を継承しているので、Type のプロパティを持つ
    feature.isAbstract = true;
    feature.isConjugated = true;
    
    expect(feature.isAbstract).toBe(true);
    expect(feature.isConjugated).toBe(true);
    
    // Type の addFeature、removeFeature メソッドも利用可能
    const subFeature = new Feature({ name: 'SubFeature' });
    feature.addFeature(subFeature);
    
    expect(feature.features).toHaveLength(1);
    expect(feature.features[0].name).toBe('SubFeature');
    
    feature.removeFeature(subFeature.id);
    expect(feature.features).toHaveLength(0);
  });
});