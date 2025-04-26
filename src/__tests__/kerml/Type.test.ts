import { Type } from '../../model/kerml/Type';
import { Feature } from '../../model/kerml/Feature';

describe('Type', () => {
  let type: Type;
  let feature1: Feature;
  let feature2: Feature;
  
  beforeEach(() => {
    type = new Type({ name: 'TestType' });
    feature1 = new Feature({ name: 'Feature1' });
    feature2 = new Feature({ name: 'Feature2' });
  });
  
  test('should create a Type with default values', () => {
    expect(type.id).toBeDefined();
    expect(type.name).toBe('TestType');
    expect(type.isAbstract).toBe(false);
    expect(type.isConjugated).toBe(false);
    expect(type.features).toEqual([]);
  });
  
  test('should create a Type with custom values', () => {
    const customType = new Type({
      name: 'CustomType',
      isAbstract: true,
      isConjugated: true
    });
    
    expect(customType.name).toBe('CustomType');
    expect(customType.isAbstract).toBe(true);
    expect(customType.isConjugated).toBe(true);
  });
  
  test('should add and remove features', () => {
    // 特性を追加
    type.addFeature(feature1);
    type.addFeature(feature2);
    
    // 特性が正しく追加されたことを確認
    expect(type.features.length).toBe(2);
    expect(type.features[0].name).toBe('Feature1');
    expect(type.features[1].name).toBe('Feature2');
    
    // feature1のownerIdがtypeのidに設定されたことを確認
    expect(feature1.ownerId).toBe(type.id);
    
    // 特性を削除
    const result = type.removeFeature(feature1.id);
    
    // 削除が成功したことを確認
    expect(result).toBe(true);
    expect(type.features.length).toBe(1);
    expect(type.features[0].name).toBe('Feature2');
    
    // 存在しない特性の削除を試みる
    const nonExistResult = type.removeFeature('non-existent-id');
    expect(nonExistResult).toBe(false);
  });
  
  test('should find features by ID and name', () => {
    type.addFeature(feature1);
    type.addFeature(feature2);
    
    // IDで特性を検索
    const foundById = type.findFeatureById(feature1.id);
    expect(foundById).toBeDefined();
    expect(foundById?.name).toBe('Feature1');
    
    // 名前で特性を検索
    const foundByName = type.findFeatureByName('Feature2');
    expect(foundByName).toBeDefined();
    expect(foundByName?.id).toBe(feature2.id);
    
    // 存在しないIDで検索
    const notFoundById = type.findFeatureById('non-existent-id');
    expect(notFoundById).toBeUndefined();
    
    // 存在しない名前で検索
    const notFoundByName = type.findFeatureByName('NonExistentFeature');
    expect(notFoundByName).toBeUndefined();
  });
  
  test('should serialize and deserialize Type to/from JSON', () => {
    type.addFeature(feature1);
    
    // シリアライズ
    const json = type.toJSON();
    
    // 基本プロパティが正しくシリアライズされていることを確認
    expect(json.__type).toBe('Type');
    expect(json.id).toBe(type.id);
    expect(json.name).toBe('TestType');
    expect(json.features.length).toBe(1);
    expect(json.features[0].name).toBe('Feature1');
    
    // デシリアライズ
    const deserializedType = Type.fromJSON(json, [feature1]);
    
    // デシリアライズされた型が元の型と一致することを確認
    expect(deserializedType.id).toBe(type.id);
    expect(deserializedType.name).toBe('TestType');
    expect(deserializedType.features.length).toBe(1);
    expect(deserializedType.features[0].name).toBe('Feature1');
  });
});