import { useSysMLModelStore } from '../../src/store/sysmlStore';

// Zustand ストアをテスト用に初期化
const initStore = () => {
  // getStateとuseStoreにアクセスするためのヘルパー
  const store = useSysMLModelStore;
  
  // ストアをリセット
  store.getState().resetModel();
  
  return store;
};

describe('SysML model serialization', () => {
  it('should serialize and deserialize an empty model', () => {
    const store = initStore();
    const emptyJson = store.getState().getModelAsJson();
    
    // 空のモデルの構造を確認
    expect(JSON.parse(emptyJson)).toEqual({
      elements: {},
      relationships: {}
    });
    
    // 別のストアに読み込み
    store.getState().loadModelFromJson(emptyJson);
    
    // 同一のJSONが生成されることを確認
    expect(store.getState().getModelAsJson()).toEqual(emptyJson);
  });
  
  it('should serialize and deserialize a model with elements', () => {
    const store = initStore();
    
    // テストデータ作成
    const element1 = { 
      id: 'test1', 
      name: 'Test Element 1', 
      type: 'PartDefinition', 
      description: 'Test description' 
    };
    
    const element2 = { 
      id: 'test2', 
      name: 'Test Element 2', 
      type: 'InterfaceDefinition',
      multiplicity: '1..*' 
    };
    
    // データ追加
    store.getState().addElement(element1);
    store.getState().addElement(element2);
    
    // シリアライズ
    const json = store.getState().getModelAsJson();
    const parsed = JSON.parse(json);
    
    // 要素が正しく保存されていることを確認
    expect(parsed.elements.test1).toEqual(element1);
    expect(parsed.elements.test2).toEqual(element2);
    
    // リセット
    store.getState().resetModel();
    expect(store.getState().elements).toEqual({});
    
    // デシリアライズ
    store.getState().loadModelFromJson(json);
    
    // 要素が正しく復元されていることを確認
    expect(store.getState().elements.test1).toEqual(element1);
    expect(store.getState().elements.test2).toEqual(element2);
  });
  
  it('should serialize and deserialize relationships correctly', () => {
    const store = initStore();
    
    // テスト用の要素を追加
    store.getState().addElement({ id: 'elem1', name: 'Element 1', type: 'PartDefinition' });
    store.getState().addElement({ id: 'elem2', name: 'Element 2', type: 'PartDefinition' });
    
    // リレーションシップの追加
    const relId = store.getState().addSpecialization('elem1', 'elem2');
    
    // シリアライズ
    const json = store.getState().getModelAsJson();
    
    // リセット
    store.getState().resetModel();
    
    // デシリアライズ
    store.getState().loadModelFromJson(json);
    
    // リレーションシップが正しく復元されたか確認
    const restoredRel = store.getState().relationships[relId];
    expect(restoredRel).toBeDefined();
    expect(restoredRel.sourceId).toBe('elem1');
    expect(restoredRel.targetId).toBe('elem2');
    expect(restoredRel.type).toBe('Specialization');
  });
  
  it('should handle complex model with nested elements and various relationships', () => {
    const store = initStore();
    
    // サンプルモデルの作成
    store.getState().initializeSampleModel();
    
    // シリアライズ
    const json = store.getState().getModelAsJson();
    const originalElements = { ...store.getState().elements };
    const originalRelationships = { ...store.getState().relationships };
    
    // 既存の状態を保存
    const elementCount = Object.keys(originalElements).length;
    const relationshipCount = Object.keys(originalRelationships).length;
    
    expect(elementCount).toBeGreaterThan(0);
    expect(relationshipCount).toBeGreaterThan(0);
    
    // リセット
    store.getState().resetModel();
    expect(Object.keys(store.getState().elements).length).toBe(0);
    
    // デシリアライズ
    store.getState().loadModelFromJson(json);
    
    // 同じ数の要素とリレーションシップがあるか確認
    expect(Object.keys(store.getState().elements).length).toBe(elementCount);
    expect(Object.keys(store.getState().relationships).length).toBe(relationshipCount);
    
    // サンプルの特定要素を検証
    expect(store.getState().elements.sys1).toBeDefined();
    expect(store.getState().elements.sys1.name).toBe('Vehicle');
    
    // 全体のモデル構造が維持されていることを確認
    expect(store.getState().elements).toEqual(originalElements);
    expect(store.getState().relationships).toEqual(originalRelationships);
  });
  
  it('should handle invalid JSON gracefully', () => {
    const store = initStore();
    
    // 無効なJSONを読み込もうとした場合にエラーが発生することを確認
    expect(() => {
      store.getState().loadModelFromJson('{ invalid json }');
    }).toThrow();
    
    // 有効なJSONだがモデル構造に合わない場合
    expect(() => {
      store.getState().loadModelFromJson('{ "foo": "bar" }');
    }).toThrow();
  });
  
  it('should maintain operation history during serialization', () => {
    const store = initStore();
    
    // 要素を追加
    store.getState().addElement({ id: 'elem1', name: 'Element 1', type: 'PartDefinition' });
    
    // 要素を更新
    store.getState().updateElement('elem1', { name: 'Updated Element' });
    
    // 履歴長を確認
    const historyLengthBefore = store.getState().history.length;
    expect(historyLengthBefore).toBe(2); // 追加と更新で2つのアクション
    
    // シリアライズとデシリアライズ
    const json = store.getState().getModelAsJson();
    store.getState().resetModel();
    store.getState().loadModelFromJson(json);
    
    // 履歴はリセットされることを確認（シリアライズ対象外）
    expect(store.getState().history.length).toBe(0);
    
    // 要素自体は維持されていることを確認
    expect(store.getState().elements.elem1.name).toBe('Updated Element');
  });
});