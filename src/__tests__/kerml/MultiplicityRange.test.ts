import { MultiplicityRange } from '../../model/kerml/MultiplicityRange';

describe('MultiplicityRange', () => {
  test('should create a MultiplicityRange with default values', () => {
    const range = new MultiplicityRange();
    
    expect(range.id).toBeDefined();
    expect(range.lowerBound).toBe(0);
    expect(range.upperBound).toBe(1);
    expect(range.multiplicityString).toBe('0..1');
  });
  
  test('should create a MultiplicityRange with custom values', () => {
    const range = new MultiplicityRange({
      lowerBound: 1,
      upperBound: 5,
      name: 'TestRange',
      description: 'A test range'
    });
    
    expect(range.lowerBound).toBe(1);
    expect(range.upperBound).toBe(5);
    expect(range.name).toBe('TestRange');
    expect(range.description).toBe('A test range');
    expect(range.multiplicityString).toBe('1..5');
  });
  
  test('should handle single value multiplicity correctly', () => {
    const range = new MultiplicityRange({
      lowerBound: 1,
      upperBound: 1
    });
    
    expect(range.multiplicityString).toBe('1');
  });
  
  test('should handle unbounded multiplicity correctly', () => {
    const range = new MultiplicityRange({
      lowerBound: 0,
      upperBound: -1
    });
    
    expect(range.multiplicityString).toBe('0..*');
  });
  
  test('should update range values', () => {
    const range = new MultiplicityRange();
    
    // 初期値を確認
    expect(range.lowerBound).toBe(0);
    expect(range.upperBound).toBe(1);
    
    // 範囲を更新
    range.updateRange(2, 4);
    
    // 更新された値を確認
    expect(range.lowerBound).toBe(2);
    expect(range.upperBound).toBe(4);
    expect(range.multiplicityString).toBe('2..4');
    
    // 無限大に更新
    range.updateRange(1, -1);
    expect(range.multiplicityString).toBe('1..*');
  });
  
  test('should check if a value is in range', () => {
    const range = new MultiplicityRange({
      lowerBound: 2,
      upperBound: 5
    });
    
    // 範囲内の値
    expect(range.isInRange(2)).toBe(true);
    expect(range.isInRange(3)).toBe(true);
    expect(range.isInRange(5)).toBe(true);
    
    // 範囲外の値
    expect(range.isInRange(1)).toBe(false);
    expect(range.isInRange(6)).toBe(false);
    
    // 無制限の範囲
    const unboundedRange = new MultiplicityRange({
      lowerBound: 2,
      upperBound: -1
    });
    
    expect(unboundedRange.isInRange(2)).toBe(true);
    expect(unboundedRange.isInRange(100)).toBe(true);
    expect(unboundedRange.isInRange(1)).toBe(false);
  });
  
  test('should validate ranges correctly', () => {
    // 有効な範囲
    const validRange1 = new MultiplicityRange({
      lowerBound: 0,
      upperBound: 1
    });
    expect(validRange1.isValid()).toBe(true);
    
    const validRange2 = new MultiplicityRange({
      lowerBound: 2,
      upperBound: 2
    });
    expect(validRange2.isValid()).toBe(true);
    
    const validRange3 = new MultiplicityRange({
      lowerBound: 0,
      upperBound: -1
    });
    expect(validRange3.isValid()).toBe(true);
    
    // 無効な範囲：下限が負
    const invalidRange1 = new MultiplicityRange();
    invalidRange1.updateRange(-1, 5);
    expect(invalidRange1.isValid()).toBe(false);
    
    // 無効な範囲：上限が下限より小さい
    const invalidRange2 = new MultiplicityRange();
    invalidRange2.updateRange(5, 3);
    expect(invalidRange2.isValid()).toBe(false);
  });
  
  test('should serialize and deserialize MultiplicityRange to/from JSON', () => {
    const range = new MultiplicityRange({
      lowerBound: 1,
      upperBound: -1,
      name: 'TestRange',
      description: 'A test range',
      boundingTypeId: 'test-type-id'
    });
    
    // シリアライズ
    const json = range.toJSON();
    
    // 基本プロパティが正しくシリアライズされていることを確認
    expect(json.__type).toBe('MultiplicityRange');
    expect(json.id).toBe(range.id);
    expect(json.name).toBe('TestRange');
    expect(json.description).toBe('A test range');
    expect(json.lowerBound).toBe(1);
    expect(json.upperBound).toBe(-1);
    expect(json.boundingType).toBe('test-type-id');
    
    // デシリアライズ
    const deserializedRange = MultiplicityRange.fromJSON(json);
    
    // デシリアライズされた範囲が元の範囲と一致することを確認
    expect(deserializedRange.id).toBe(range.id);
    expect(deserializedRange.name).toBe('TestRange');
    expect(deserializedRange.description).toBe('A test range');
    expect(deserializedRange.lowerBound).toBe(1);
    expect(deserializedRange.upperBound).toBe(-1);
    expect(deserializedRange.boundingTypeId).toBe('test-type-id');
    expect(deserializedRange.multiplicityString).toBe('1..*');
  });
  
  test('should create MultiplicityRange from string representation', () => {
    // 単一値
    const range1 = MultiplicityRange.fromString('3');
    expect(range1.lowerBound).toBe(3);
    expect(range1.upperBound).toBe(3);
    expect(range1.multiplicityString).toBe('3');
    
    // 範囲指定
    const range2 = MultiplicityRange.fromString('2..4');
    expect(range2.lowerBound).toBe(2);
    expect(range2.upperBound).toBe(4);
    expect(range2.multiplicityString).toBe('2..4');
    
    // 無制限
    const range3 = MultiplicityRange.fromString('*');
    expect(range3.lowerBound).toBe(0);
    expect(range3.upperBound).toBe(-1);
    expect(range3.multiplicityString).toBe('0..*');
    
    // 下限付き無制限
    const range4 = MultiplicityRange.fromString('1..*');
    expect(range4.lowerBound).toBe(1);
    expect(range4.upperBound).toBe(-1);
    expect(range4.multiplicityString).toBe('1..*');
    
    // 空文字列（デフォルト値を使用）
    const range5 = MultiplicityRange.fromString('');
    expect(range5.lowerBound).toBe(0);
    expect(range5.upperBound).toBe(1);
    expect(range5.multiplicityString).toBe('0..1');
  });
});