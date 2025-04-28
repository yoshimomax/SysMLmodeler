/**
 * モデルのエクスポート/インポート機能テスト
 * SysML v2のモデルがJSON形式で正しくシリアライズ/デシリアライズできることを検証
 */
import { create } from 'zustand';
import { ModelElement, ModelRelationship, SysMLModelState } from '../../src/store/sysmlStore';

// テスト用のモックストアを作成する関数
const createMockStore = () => {
  // 本番と同様のストア構造を持つが、シンプル化したストアを作成
  const store = create<SysMLModelState>((set, get) => ({
    elements: {},
    relationships: {},
    selectedElementId: undefined,
    selectedRelationshipId: undefined,
    history: [],
    historyIndex: -1,
    
    // 要素操作
    addElement: (element: ModelElement) => {
      set(state => ({
        elements: {
          ...state.elements,
          [element.id]: element
        }
      }));
      return element.id;
    },
    
    updateElement: (id: string, updates: Partial<ModelElement>) => {
      set(state => ({
        elements: {
          ...state.elements,
          [id]: {
            ...state.elements[id],
            ...updates
          }
        }
      }));
    },
    
    removeElement: (id: string) => {
      set(state => {
        const { [id]: _, ...restElements } = state.elements;
        return { elements: restElements };
      });
    },
    
    // 関係操作
    addRelationship: (relationship: ModelRelationship) => {
      set(state => ({
        relationships: {
          ...state.relationships,
          [relationship.id]: relationship
        }
      }));
      return relationship.id;
    },
    
    updateRelationship: (id: string, updates: Partial<ModelRelationship>) => {
      set(state => ({
        relationships: {
          ...state.relationships,
          [id]: {
            ...state.relationships[id],
            ...updates
          }
        }
      }));
    },
    
    removeRelationship: (id: string) => {
      set(state => {
        const { [id]: _, ...restRelationships } = state.relationships;
        return { relationships: restRelationships };
      });
    },
    
    // 選択操作
    setSelectedElement: (id: string | undefined) => {
      set({ selectedElementId: id });
    },
    
    setSelectedRelationship: (id: string | undefined) => {
      set({ selectedRelationshipId: id });
    },
    
    // 履歴操作
    addHistoryItem: () => {}, // 簡略化
    undo: () => {}, // テスト目的では使用しない
    redo: () => {}, // テスト目的では使用しない
    
    // サンプルモデル
    initializeSampleModel: () => {},
    
    // エクスポート/インポート
    getModelAsJson: () => {
      const { elements, relationships } = get();
      return JSON.stringify({ elements, relationships }, null, 2);
    },
    
    loadModelFromJson: (json: string) => {
      const data = JSON.parse(json);
      set({
        elements: data.elements || {},
        relationships: data.relationships || {}
      });
    },

    // 特殊なリレーションシップ作成
    addSpecialization: (sourceId: string, targetId: string) => {
      const id = `spec-${sourceId}-${targetId}`;
      get().addRelationship({
        id,
        type: 'Specialization',
        sourceId,
        targetId,
        label: 'specializes'
      });
      return id;
    },
    
    addFeatureMembership: (sourceId: string, targetId: string) => {
      const id = `fm-${sourceId}-${targetId}`;
      get().addRelationship({
        id,
        type: 'FeatureMembership',
        sourceId,
        targetId,
        label: 'owns'
      });
      return id;
    }
  }));
  
  return store;
};

describe('ModelExportImport', () => {
  test('モデルをJSONにエクスポートし、再度インポートすると同じ内容が復元される', () => {
    // テスト用のストアを作成
    const store = createMockStore();
    
    // テスト用のモデル要素を追加
    store.addElement({
      id: 'part1',
      name: 'TestPart',
      type: 'PartDefinition',
      description: 'Test part definition',
      position: { x: 100, y: 200 }
    });
    
    store.addElement({
      id: 'part2',
      name: 'ChildPart',
      type: 'PartDefinition',
      description: 'Child part',
      position: { x: 300, y: 200 }
    });
    
    store.addElement({
      id: 'interface1',
      name: 'TestInterface',
      type: 'InterfaceDefinition',
      description: 'Test interface definition',
      position: { x: 100, y: 400 }
    });
    
    // リレーションシップを追加
    store.addRelationship({
      id: 'rel1',
      type: 'FeatureMembership',
      sourceId: 'part1',
      targetId: 'part2',
      label: 'owns'
    });
    
    store.addRelationship({
      id: 'rel2',
      type: 'ConnectionUsage',
      sourceId: 'part1',
      targetId: 'interface1',
      label: 'connects'
    });
    
    // モデルをJSON文字列にエクスポート
    const jsonExport = store.getModelAsJson();
    
    // 新しいテスト用ストアを作成
    const importStore = createMockStore();
    
    // JSONをインポート
    importStore.loadModelFromJson(jsonExport);
    
    // 元のモデルと同じ内容がインポートされていることを検証
    expect(Object.keys(importStore.elements).length).toBe(3);
    expect(Object.keys(importStore.relationships).length).toBe(2);
    
    // 要素の内容を検証
    expect(importStore.elements['part1'].name).toBe('TestPart');
    expect(importStore.elements['part2'].name).toBe('ChildPart');
    expect(importStore.elements['interface1'].name).toBe('TestInterface');
    
    // 要素の位置情報も維持されていることを検証
    expect(importStore.elements['part1'].position.x).toBe(100);
    expect(importStore.elements['part1'].position.y).toBe(200);
    
    // リレーションシップの内容を検証
    expect(importStore.relationships['rel1'].type).toBe('FeatureMembership');
    expect(importStore.relationships['rel1'].sourceId).toBe('part1');
    expect(importStore.relationships['rel1'].targetId).toBe('part2');
    
    expect(importStore.relationships['rel2'].type).toBe('ConnectionUsage');
    expect(importStore.relationships['rel2'].sourceId).toBe('part1');
    expect(importStore.relationships['rel2'].targetId).toBe('interface1');
    
    // 再度エクスポートしてJSONが一致することを確認
    const secondExport = importStore.getModelAsJson();
    expect(secondExport).toBe(jsonExport);
  });
  
  test('位置情報や特殊属性を含むモデルが正しくシリアライズされる', () => {
    const store = createMockStore();
    
    // 複雑な要素を追加
    store.addElement({
      id: 'complex1',
      name: 'ComplexPart',
      type: 'PartDefinition',
      description: 'Complex part with attributes',
      position: { x: 100, y: 200 },
      multiplicity: '1..*',
      isAbstract: true,
      customProperty: 'test-value',
      nestedObject: {
        key1: 'value1',
        key2: 42,
        key3: { subkey: 'subvalue' }
      }
    });
    
    // 複雑なリレーションシップを追加
    store.addRelationship({
      id: 'complex-rel',
      type: 'Specialization',
      sourceId: 'complex1',
      targetId: 'not-exists',
      label: 'specializes',
      vertices: [
        { x: 120, y: 220 },
        { x: 140, y: 240 },
        { x: 160, y: 260 }
      ],
      customProperty: 'test-rel-value'
    });
    
    // エクスポート
    const jsonExport = store.getModelAsJson();
    
    // 新しいストアにインポート
    const importStore = createMockStore();
    importStore.loadModelFromJson(jsonExport);
    
    // 複雑な要素の内容が保持されていることを検証
    const importedElement = importStore.elements['complex1'];
    expect(importedElement.name).toBe('ComplexPart');
    expect(importedElement.multiplicity).toBe('1..*');
    expect(importedElement.isAbstract).toBe(true);
    expect(importedElement.customProperty).toBe('test-value');
    expect(importedElement.nestedObject.key1).toBe('value1');
    expect(importedElement.nestedObject.key2).toBe(42);
    expect(importedElement.nestedObject.key3.subkey).toBe('subvalue');
    
    // 複雑なリレーションシップの内容が保持されていることを検証
    const importedRel = importStore.relationships['complex-rel'];
    expect(importedRel.type).toBe('Specialization');
    expect(importedRel.vertices.length).toBe(3);
    expect(importedRel.vertices[0].x).toBe(120);
    expect(importedRel.vertices[2].y).toBe(260);
    expect(importedRel.customProperty).toBe('test-rel-value');
  });
});