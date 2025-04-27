import { useSysMLModelStore } from '../../src/store/sysmlStore';

// Zustand ストアをテスト用に初期化
const initStore = () => {
  // getStateとuseStoreにアクセスするためのヘルパー
  const store = useSysMLModelStore;
  
  // ストアをリセット
  store.getState().resetModel();
  
  return store;
};

describe('SysML model relationships', () => {
  it('should create specialization relationships', () => {
    const store = initStore();
    
    // 親子要素を作成
    store.getState().addElement({ id: 'parent', name: 'Parent', type: 'PartDefinition' });
    store.getState().addElement({ id: 'child', name: 'Child', type: 'PartDefinition' });
    
    // 特化関係を追加
    const relId = store.getState().addSpecialization('child', 'parent');
    
    // 関係が正しく作成されたか確認
    const rel = store.getState().relationships[relId];
    expect(rel).toBeDefined();
    expect(rel.type).toBe('Specialization');
    expect(rel.sourceId).toBe('child');
    expect(rel.targetId).toBe('parent');
    expect(rel.label).toBe('specializes');
  });
  
  it('should create feature membership relationships', () => {
    const store = initStore();
    
    // 親要素とフィーチャー要素を作成
    store.getState().addElement({ id: 'owner', name: 'Owner', type: 'PartDefinition' });
    store.getState().addElement({ id: 'feature', name: 'Feature', type: 'AttributeDefinition' });
    
    // フィーチャーメンバーシップ関係を追加
    const relId = store.getState().addFeatureMembership('owner', 'feature');
    
    // 関係が正しく作成されたか確認
    const rel = store.getState().relationships[relId];
    expect(rel).toBeDefined();
    expect(rel.type).toBe('FeatureMembership');
    expect(rel.sourceId).toBe('owner');
    expect(rel.targetId).toBe('feature');
    expect(rel.label).toBe('features');
  });
  
  it('should update relationships', () => {
    const store = initStore();
    
    // 要素を作成
    store.getState().addElement({ id: 'elem1', name: 'Element 1', type: 'PartDefinition' });
    store.getState().addElement({ id: 'elem2', name: 'Element 2', type: 'PartDefinition' });
    
    // 関係を追加
    const relId = store.getState().addRelationship({
      id: 'rel1',
      type: 'ConnectionUsage',
      sourceId: 'elem1',
      targetId: 'elem2',
      label: 'connects'
    });
    
    // 関係を更新
    store.getState().updateRelationship(relId, {
      label: 'updated connection',
      description: 'Updated description'
    });
    
    // 更新が反映されたか確認
    const updatedRel = store.getState().relationships[relId];
    expect(updatedRel.label).toBe('updated connection');
    expect(updatedRel.description).toBe('Updated description');
    
    // 更新されていない値は維持されていることを確認
    expect(updatedRel.sourceId).toBe('elem1');
    expect(updatedRel.targetId).toBe('elem2');
    expect(updatedRel.type).toBe('ConnectionUsage');
  });
  
  it('should remove relationships', () => {
    const store = initStore();
    
    // 要素を作成
    store.getState().addElement({ id: 'elem1', name: 'Element 1', type: 'PartDefinition' });
    store.getState().addElement({ id: 'elem2', name: 'Element 2', type: 'PartDefinition' });
    
    // 関係を追加
    const relId = store.getState().addRelationship({
      id: 'rel1',
      type: 'ConnectionUsage',
      sourceId: 'elem1',
      targetId: 'elem2',
      label: 'connects'
    });
    
    // 関係を削除
    store.getState().removeRelationship(relId);
    
    // 関係が削除されたことを確認
    expect(store.getState().relationships[relId]).toBeUndefined();
  });
  
  it('should automatically remove relationships when referenced element is removed', () => {
    const store = initStore();
    
    // 要素を作成
    store.getState().addElement({ id: 'elem1', name: 'Element 1', type: 'PartDefinition' });
    store.getState().addElement({ id: 'elem2', name: 'Element 2', type: 'PartDefinition' });
    
    // 関係を追加
    const relId = store.getState().addRelationship({
      id: 'rel1',
      type: 'ConnectionUsage',
      sourceId: 'elem1',
      targetId: 'elem2',
      label: 'connects'
    });
    
    // 要素1を削除
    store.getState().removeElement('elem1');
    
    // 関連する関係も削除されたことを確認
    expect(store.getState().relationships[relId]).toBeUndefined();
  });
  
  it('should support undo/redo operations for relationships', () => {
    const store = initStore();
    
    // 要素を作成
    store.getState().addElement({ id: 'elem1', name: 'Element 1', type: 'PartDefinition' });
    store.getState().addElement({ id: 'elem2', name: 'Element 2', type: 'PartDefinition' });
    
    // 関係を追加
    const relId = store.getState().addRelationship({
      id: 'rel1',
      type: 'ConnectionUsage',
      sourceId: 'elem1',
      targetId: 'elem2',
      label: 'connects'
    });
    
    // 関係が存在することを確認
    expect(store.getState().relationships[relId]).toBeDefined();
    
    // 操作を元に戻す
    store.getState().undo();
    
    // 関係が削除されたことを確認
    expect(store.getState().relationships[relId]).toBeUndefined();
    
    // 操作をやり直す
    store.getState().redo();
    
    // 関係が復元されたことを確認
    expect(store.getState().relationships[relId]).toBeDefined();
    expect(store.getState().relationships[relId].sourceId).toBe('elem1');
    expect(store.getState().relationships[relId].targetId).toBe('elem2');
  });
  
  it('should retrieve all relationships associated with an element', () => {
    const store = initStore();
    
    // いくつかの要素を作成
    store.getState().addElement({ id: 'center', name: 'Center', type: 'PartDefinition' });
    store.getState().addElement({ id: 'part1', name: 'Part 1', type: 'PartDefinition' });
    store.getState().addElement({ id: 'part2', name: 'Part 2', type: 'PartDefinition' });
    store.getState().addElement({ id: 'attr1', name: 'Attribute 1', type: 'AttributeDefinition' });
    
    // 複数の関係を追加
    store.getState().addFeatureMembership('center', 'attr1');
    store.getState().addRelationship({
      id: 'conn1',
      type: 'ConnectionUsage',
      sourceId: 'center',
      targetId: 'part1',
      label: 'connects'
    });
    store.getState().addRelationship({
      id: 'conn2',
      type: 'ConnectionUsage',
      sourceId: 'part2',
      targetId: 'center',
      label: 'connects'
    });
    
    // center要素に関連する関係を取得
    const centerRels = Object.values(store.getState().relationships)
      .filter(rel => rel.sourceId === 'center' || rel.targetId === 'center');
    
    // 3つの関係があることを確認
    expect(centerRels.length).toBe(3);
    
    // centerを起点とする関係は2つあることを確認
    const outgoingRels = centerRels.filter(rel => rel.sourceId === 'center');
    expect(outgoingRels.length).toBe(2);
    
    // centerを終点とする関係は1つあることを確認
    const incomingRels = centerRels.filter(rel => rel.targetId === 'center');
    expect(incomingRels.length).toBe(1);
  });
});