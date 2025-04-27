import { useSysMLModelStore, ModelElement, ModelRelationship } from '../../store/sysmlStore';
import { Type } from '../../model/kerml/Type';
import { Feature } from '../../model/kerml/Feature';
import { PartDefinition } from '../../model/sysml2/PartDefinition';
import { ActionUsage } from '../../model/sysml2/ActionUsage';

describe('SysML Model Store', () => {
  // 各テスト実行前にストアをリセット
  beforeEach(() => {
    useSysMLModelStore.getState().resetModel();
  });
  
  describe('Element CRUD operations', () => {
    test('should add an element to the store', () => {
      // 新しい Type 要素を作成
      const testType = new Type({ name: 'TestType' });
      
      // ストアに要素を追加
      useSysMLModelStore.getState().addElement(testType);
      
      // 要素が追加されたか確認
      const elements = useSysMLModelStore.getState().elements;
      expect(elements[testType.id]).toBeDefined();
      expect(elements[testType.id].name).toBe('TestType');
    });
    
    test('should update an element in the store', () => {
      // 新しい Type 要素を作成してストアに追加
      const testType = new Type({ name: 'TestType' });
      useSysMLModelStore.getState().addElement(testType);
      
      // 要素を更新
      useSysMLModelStore.getState().updateElement(testType.id, {
        name: 'UpdatedType',
        description: 'Updated description'
      });
      
      // 更新が適用されたか確認
      const updatedElement = useSysMLModelStore.getState().elements[testType.id];
      expect(updatedElement.name).toBe('UpdatedType');
      expect((updatedElement as Type).description).toBe('Updated description');
    });
    
    test('should remove an element from the store', () => {
      // 新しい Type 要素を作成してストアに追加
      const testType = new Type({ name: 'TestType' });
      useSysMLModelStore.getState().addElement(testType);
      
      // 要素を削除
      useSysMLModelStore.getState().removeElement(testType.id);
      
      // 要素が削除されたか確認
      const elements = useSysMLModelStore.getState().elements;
      expect(elements[testType.id]).toBeUndefined();
    });
  });
  
  describe('Relationship operations', () => {
    test('should add a relationship between elements', () => {
      // 2つの要素を作成
      const typeA = new Type({ name: 'TypeA' });
      const typeB = new Type({ name: 'TypeB' });
      
      // ストアに要素を追加
      useSysMLModelStore.getState().addElement(typeA);
      useSysMLModelStore.getState().addElement(typeB);
      
      // 関係を追加
      const relationship: ModelRelationship = {
        id: 'rel1',
        type: 'specialization',
        sourceId: typeA.id,
        targetId: typeB.id,
        name: 'inherits'
      };
      
      useSysMLModelStore.getState().addRelationship(relationship);
      
      // 関係が追加されたか確認
      const relationships = useSysMLModelStore.getState().relationships;
      expect(relationships['rel1']).toBeDefined();
      expect(relationships['rel1'].sourceId).toBe(typeA.id);
      expect(relationships['rel1'].targetId).toBe(typeB.id);
    });
    
    test('should update a relationship', () => {
      // 2つの要素を作成
      const typeA = new Type({ name: 'TypeA' });
      const typeB = new Type({ name: 'TypeB' });
      
      // ストアに要素を追加
      useSysMLModelStore.getState().addElement(typeA);
      useSysMLModelStore.getState().addElement(typeB);
      
      // 関係を追加
      const relationship: ModelRelationship = {
        id: 'rel1',
        type: 'specialization',
        sourceId: typeA.id,
        targetId: typeB.id,
        name: 'inherits'
      };
      
      useSysMLModelStore.getState().addRelationship(relationship);
      
      // 関係を更新
      useSysMLModelStore.getState().updateRelationship('rel1', {
        name: 'extends'
      });
      
      // 更新が適用されたか確認
      const updatedRelationship = useSysMLModelStore.getState().relationships['rel1'];
      expect(updatedRelationship.name).toBe('extends');
    });
    
    test('should remove a relationship', () => {
      // 2つの要素を作成
      const typeA = new Type({ name: 'TypeA' });
      const typeB = new Type({ name: 'TypeB' });
      
      // ストアに要素を追加
      useSysMLModelStore.getState().addElement(typeA);
      useSysMLModelStore.getState().addElement(typeB);
      
      // 関係を追加
      const relationship: ModelRelationship = {
        id: 'rel1',
        type: 'specialization',
        sourceId: typeA.id,
        targetId: typeB.id,
        name: 'inherits'
      };
      
      useSysMLModelStore.getState().addRelationship(relationship);
      
      // 関係を削除
      useSysMLModelStore.getState().removeRelationship('rel1');
      
      // 関係が削除されたか確認
      const relationships = useSysMLModelStore.getState().relationships;
      expect(relationships['rel1']).toBeUndefined();
    });
    
    test('should automatically remove relationships when an element is removed', () => {
      // 2つの要素を作成
      const typeA = new Type({ name: 'TypeA' });
      const typeB = new Type({ name: 'TypeB' });
      
      // ストアに要素を追加
      useSysMLModelStore.getState().addElement(typeA);
      useSysMLModelStore.getState().addElement(typeB);
      
      // 関係を追加
      const relationship: ModelRelationship = {
        id: 'rel1',
        type: 'specialization',
        sourceId: typeA.id,
        targetId: typeB.id,
        name: 'inherits'
      };
      
      useSysMLModelStore.getState().addRelationship(relationship);
      
      // 要素を削除
      useSysMLModelStore.getState().removeElement(typeA.id);
      
      // 関連する関係も削除されたか確認
      const relationships = useSysMLModelStore.getState().relationships;
      expect(relationships['rel1']).toBeUndefined();
    });
  });
  
  describe('SysML specific relationship operations', () => {
    test('should add a specialization relationship', () => {
      // 2つの要素を作成
      const supertype = new Type({ name: 'Supertype' });
      const subtype = new Type({ name: 'Subtype' });
      
      // ストアに要素を追加
      useSysMLModelStore.getState().addElement(supertype);
      useSysMLModelStore.getState().addElement(subtype);
      
      // 特殊化関係を追加
      useSysMLModelStore.getState().addSpecialization(subtype.id, supertype.id);
      
      // 関係が追加されたか確認
      const relationships = Object.values(useSysMLModelStore.getState().relationships);
      const specRel = relationships.find(rel => 
        rel.type === 'specialization' && 
        rel.sourceId === subtype.id && 
        rel.targetId === supertype.id
      );
      
      expect(specRel).toBeDefined();
    });
    
    test('should add a feature membership relationship', () => {
      // 所有者とフィーチャーを作成
      const owner = new PartDefinition({ name: 'Owner' });
      const feature = new ActionUsage({ name: 'Feature' });
      
      // ストアに要素を追加
      useSysMLModelStore.getState().addElement(owner);
      useSysMLModelStore.getState().addElement(feature);
      
      // フィーチャーメンバーシップを追加
      useSysMLModelStore.getState().addFeatureMembership(owner.id, feature.id);
      
      // 関係が追加されたか確認
      const relationships = Object.values(useSysMLModelStore.getState().relationships);
      const membershipRel = relationships.find(rel => 
        rel.type === 'featureMembership' && 
        rel.sourceId === owner.id && 
        rel.targetId === feature.id
      );
      
      expect(membershipRel).toBeDefined();
      
      // フィーチャーのownerIdも更新されていることを確認
      const updatedFeature = useSysMLModelStore.getState().elements[feature.id] as Feature;
      expect(updatedFeature.ownerId).toBe(owner.id);
    });
    
    test('should add a redefinition relationship', () => {
      // 2つのフィーチャーを作成
      const baseFeature = new Feature({ name: 'BaseFeature' });
      const redefiner = new Feature({ name: 'RedefiningFeature' });
      
      // ストアに要素を追加
      useSysMLModelStore.getState().addElement(baseFeature);
      useSysMLModelStore.getState().addElement(redefiner);
      
      // 再定義関係を追加
      useSysMLModelStore.getState().addRedefinition(redefiner.id, baseFeature.id);
      
      // 関係が追加されたか確認
      const relationships = Object.values(useSysMLModelStore.getState().relationships);
      const redefRel = relationships.find(rel => 
        rel.type === 'redefinition' && 
        rel.sourceId === redefiner.id && 
        rel.targetId === baseFeature.id
      );
      
      expect(redefRel).toBeDefined();
      
      // redefinerのredefinitionIdsも更新されていることを確認
      const updatedRedefiner = useSysMLModelStore.getState().elements[redefiner.id] as Feature;
      expect(updatedRedefiner.redefinitionIds).toContain(baseFeature.id);
    });
  });
  
  describe('Model serialization and deserialization', () => {
    test('should serialize and deserialize model correctly', () => {
      // モデル要素を作成してストアに追加
      const system = new PartDefinition({ name: 'System' });
      const action = new ActionUsage({ name: 'Action' });
      
      useSysMLModelStore.getState().addElement(system);
      useSysMLModelStore.getState().addElement(action);
      
      // 関係を追加
      useSysMLModelStore.getState().addFeatureMembership(system.id, action.id);
      
      // シリアライズ
      const json = useSysMLModelStore.getState().getModelAsJson();
      
      // ストアをリセット
      useSysMLModelStore.getState().resetModel();
      
      // デシリアライズ
      const success = useSysMLModelStore.getState().loadModelFromJson(json);
      
      // 正常に読み込めたか確認
      expect(success).toBe(true);
      
      // 要素が復元されたか確認
      const elements = useSysMLModelStore.getState().elements;
      const relationships = useSysMLModelStore.getState().relationships;
      
      // 要素の数をチェック
      expect(Object.keys(elements).length).toBe(2);
      
      // 要素のタイプと名前をチェック
      const restoredSystem = Object.values(elements).find(el => el.name === 'System');
      const restoredAction = Object.values(elements).find(el => el.name === 'Action');
      
      expect(restoredSystem).toBeDefined();
      expect(restoredAction).toBeDefined();
      
      // 関係が復元されたか確認
      expect(Object.keys(relationships).length).toBe(1);
      
      // アクションの所有者IDが正しく設定されているか確認
      if (restoredSystem && restoredAction) {
        const membership = Object.values(relationships).find(r => 
          r.type === 'featureMembership' && 
          r.sourceId === restoredSystem.id && 
          r.targetId === restoredAction.id
        );
        
        expect(membership).toBeDefined();
      }
    });
  });
  
  describe('Undo and redo operations', () => {
    test('should undo and redo element addition', () => {
      // 要素を追加
      const testType = new Type({ name: 'TestType' });
      useSysMLModelStore.getState().addElement(testType);
      
      // 要素が存在することを確認
      expect(useSysMLModelStore.getState().elements[testType.id]).toBeDefined();
      
      // 操作を取り消し
      useSysMLModelStore.getState().undo();
      
      // 要素が存在しないことを確認
      expect(useSysMLModelStore.getState().elements[testType.id]).toBeUndefined();
      
      // 操作をやり直し
      useSysMLModelStore.getState().redo();
      
      // 要素が復元されたことを確認
      expect(useSysMLModelStore.getState().elements[testType.id]).toBeDefined();
    });
    
    test('should undo and redo multiple operations', () => {
      // 複数の要素を追加
      const type1 = new Type({ name: 'Type1' });
      const type2 = new Type({ name: 'Type2' });
      
      useSysMLModelStore.getState().addElement(type1);
      useSysMLModelStore.getState().addElement(type2);
      
      // type1を更新
      useSysMLModelStore.getState().updateElement(type1.id, { name: 'UpdatedType1' });
      
      // type2を削除
      useSysMLModelStore.getState().removeElement(type2.id);
      
      // 最後の操作（type2の削除）を取り消し
      useSysMLModelStore.getState().undo();
      
      // type2が存在することを確認
      expect(useSysMLModelStore.getState().elements[type2.id]).toBeDefined();
      
      // もう一度取り消し（type1の更新を取り消し）
      useSysMLModelStore.getState().undo();
      
      // type1の名前が元に戻っていることを確認
      expect(useSysMLModelStore.getState().elements[type1.id].name).toBe('Type1');
      
      // redo操作（type1の更新を再適用）
      useSysMLModelStore.getState().redo();
      
      // type1の名前が更新されていることを確認
      expect(useSysMLModelStore.getState().elements[type1.id].name).toBe('UpdatedType1');
    });
  });
  
  describe('Sample model initialization', () => {
    test('should initialize sample model with correct elements and relationships', () => {
      // サンプルモデルを初期化
      useSysMLModelStore.getState().initializeSampleModel();
      
      // モデル要素が作成されていることを確認
      const elements = useSysMLModelStore.getState().elements;
      const relationships = useSysMLModelStore.getState().relationships;
      
      // 要素の存在確認
      const system = Object.values(elements).find(el => el.name === 'System');
      const subsystem = Object.values(elements).find(el => el.name === 'Subsystem');
      const interface1 = Object.values(elements).find(el => el.name === 'SystemInterface');
      
      expect(system).toBeDefined();
      expect(subsystem).toBeDefined();
      expect(interface1).toBeDefined();
      
      // 関係の存在確認
      const specRelationship = Object.values(relationships).find(
        rel => rel.type === 'specialization'
      );
      
      expect(specRelationship).toBeDefined();
      
      if (system && subsystem && specRelationship) {
        // 特殊化関係の方向が正しいか確認
        expect(specRelationship.sourceId).toBe(subsystem.id); // source = subtype
        expect(specRelationship.targetId).toBe(system.id);    // target = supertype
      }
    });
  });
});