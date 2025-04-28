/**
 * ConnectionDefinition テスト
 * src/model/sysml2/ConnectionDefinition.ts のテスト
 */

import { ConnectionDefinition } from '../../src/model/sysml2/ConnectionDefinition';
import { ConnectionUsage } from '../../src/model/sysml2/ConnectionUsage';
import { Feature } from '../../src/model/kerml/Feature';
import { SysML2_ConnectionDefinition } from '../../src/model/sysml2/interfaces';

describe('ConnectionDefinition', () => {
  describe('基本プロパティ', () => {
    test('コンストラクタで初期化されること', () => {
      const connectionDef = new ConnectionDefinition({
        name: 'TestConnection',
        stereotype: 'flow',
        relatedTypeId: 'relatedType1',
        sourceTypeId: 'sourceType1',
        targetTypeId: 'targetType1',
        endFeatures: ['feature1', 'feature2'],
        connectionUsages: ['usage1']
      });
      
      expect(connectionDef.name).toBe('TestConnection');
      expect(connectionDef.stereotype).toBe('flow');
      expect(connectionDef.relatedTypeId).toBe('relatedType1');
      expect(connectionDef.sourceTypeId).toBe('sourceType1');
      expect(connectionDef.targetTypeId).toBe('targetType1');
      expect(connectionDef.endFeatures).toEqual(['feature1', 'feature2']);
      expect(connectionDef.connectionUsages).toEqual(['usage1']);
      expect(connectionDef.usages).toEqual([]);
    });
    
    test('端点特性を管理できること', () => {
      const connectionDef = new ConnectionDefinition({ name: 'TestConnection' });
      
      // 追加テスト
      connectionDef.addEndFeature('feature1');
      connectionDef.addEndFeature('feature2');
      expect(connectionDef.endFeatures).toContain('feature1');
      expect(connectionDef.endFeatures).toContain('feature2');
      expect(connectionDef.endFeatures.length).toBe(2);
      
      // 重複追加テスト
      connectionDef.addEndFeature('feature1');
      expect(connectionDef.endFeatures.length).toBe(2);
      
      // 削除テスト
      connectionDef.removeEndFeature('feature1');
      expect(connectionDef.endFeatures).not.toContain('feature1');
      expect(connectionDef.endFeatures).toContain('feature2');
      expect(connectionDef.endFeatures.length).toBe(1);
    });
  });
  
  describe('接続使用管理', () => {
    test('接続使用IDを管理できること', () => {
      const connectionDef = new ConnectionDefinition({ name: 'TestConnection' });
      
      // 追加テスト
      connectionDef.addConnectionUsage('usage1');
      connectionDef.addConnectionUsage('usage2');
      expect(connectionDef.connectionUsages).toContain('usage1');
      expect(connectionDef.connectionUsages).toContain('usage2');
      expect(connectionDef.connectionUsages.length).toBe(2);
      
      // 重複追加テスト
      connectionDef.addConnectionUsage('usage1');
      expect(connectionDef.connectionUsages.length).toBe(2);
      
      // 削除テスト
      const result = connectionDef.removeConnectionUsage('usage1');
      expect(result).toBe(true);
      expect(connectionDef.connectionUsages).not.toContain('usage1');
      expect(connectionDef.connectionUsages).toContain('usage2');
      expect(connectionDef.connectionUsages.length).toBe(1);
      
      // 存在しないID削除テスト
      const result2 = connectionDef.removeConnectionUsage('nonExistent');
      expect(result2).toBe(false);
      expect(connectionDef.connectionUsages.length).toBe(1);
    });
  });
  
  describe('registerConnectionUsage', () => {
    test('ConnectionUsageインスタンスを正しく登録すること', () => {
      const connectionDef = new ConnectionDefinition({
        id: 'def123',
        name: 'TestConnection'
      });
      
      const connectionUsage = new ConnectionUsage({
        id: 'usage123',
        name: 'TestConnectionUsage',
        sourceEndId: 'source1',
        targetEndId: 'target1'
      });
      
      // 登録実行
      connectionDef.registerConnectionUsage(connectionUsage);
      
      // 期待される結果の確認
      expect(connectionUsage.connectionDefinitionId).toBe('def123');  // definitionIdが設定されること
      expect(connectionDef.connectionUsages).toContain('usage123');  // IDリストに追加されること
      expect(connectionDef.usages).toContainEqual(expect.objectContaining({
        id: 'usage123',
        name: 'TestConnectionUsage'
      }));  // usagesコレクションに追加されること
    });
    
    test('同一IDのConnectionUsageは重複して登録されないこと', () => {
      const connectionDef = new ConnectionDefinition({
        id: 'def123',
        name: 'TestConnection'
      });
      
      const connectionUsage1 = new ConnectionUsage({
        id: 'usage123',
        name: 'TestConnectionUsage',
        sourceEndId: 'source1',
        targetEndId: 'target1'
      });
      
      const connectionUsage2 = new ConnectionUsage({
        id: 'usage123',  // 同じID
        name: 'UpdatedConnectionUsage',
        sourceEndId: 'source1',
        targetEndId: 'target1'
      });
      
      // 最初の登録
      connectionDef.registerConnectionUsage(connectionUsage1);
      expect(connectionDef.connectionUsages.length).toBe(1);
      expect(connectionDef.usages.length).toBe(1);
      
      // 同じIDで2回目の登録
      connectionDef.registerConnectionUsage(connectionUsage2);
      expect(connectionDef.connectionUsages.length).toBe(1);  // IDリストは変わらない
      expect(connectionDef.usages.length).toBe(1);  // usagesコレクションも変わらない
      
      // ただし最後に登録したオブジェクトの参照が保持される
      expect(connectionDef.usages[0].name).toBe('UpdatedConnectionUsage');
    });
  });
  
  describe('接続作成', () => {
    test('connect()メソッドで端点間の接続を作成できること', () => {
      const connectionDef = new ConnectionDefinition({
        id: 'def123',
        name: 'FlowDefinition'
      });
      
      // モック特性オブジェクト
      const source = new Feature({
        id: 'source1',
        name: 'SourceFeature'
      });
      
      const target = new Feature({
        id: 'target1',
        name: 'TargetFeature'
      });
      
      // connect()メソッドで接続を作成
      const connectionUsage = connectionDef.connect(source, target, {
        name: 'CustomFlow',
        itemType: 'Data',
        vertices: [{ x: 10, y: 20 }, { x: 30, y: 40 }]
      });
      
      // 期待される結果の確認
      expect(connectionUsage.sourceEndId).toBe('source1');
      expect(connectionUsage.targetEndId).toBe('target1');
      expect(connectionUsage.connectionDefinitionId).toBe('def123');
      expect(connectionUsage.name).toBe('CustomFlow');
      expect(connectionUsage.itemType).toBe('Data');
      expect(connectionUsage.vertices).toEqual([{ x: 10, y: 20 }, { x: 30, y: 40 }]);
      
      // ConnectionDefinitionに登録されていることの確認
      expect(connectionDef.connectionUsages).toContain(connectionUsage.id);
      expect(connectionDef.usages).toContain(connectionUsage);
    });
    
    test('connect()でオプションを省略した場合は自動生成された名前を使用すること', () => {
      const connectionDef = new ConnectionDefinition({
        id: 'def123',
        name: 'FlowDefinition'
      });
      
      const source = new Feature({ id: 'source1', name: 'Source' });
      const target = new Feature({ id: 'target1', name: 'Target' });
      
      // オプションを省略して接続を作成
      const connectionUsage = connectionDef.connect(source, target);
      
      // 期待される結果の確認
      expect(connectionUsage.name).toBe('FlowDefinition_Source_to_Target');
      expect(connectionUsage.sourceEndId).toBe('source1');
      expect(connectionUsage.targetEndId).toBe('target1');
    });
  });
  
  describe('JSON変換', () => {
    test('toJSON()でJSONオブジェクトに変換できること', () => {
      const connectionDef = new ConnectionDefinition({
        id: 'def123',
        name: 'TestConnection',
        stereotype: 'flow',
        sourceTypeId: 'sourceType1',
        targetTypeId: 'targetType1',
        endFeatures: ['feature1', 'feature2'],
        connectionUsages: ['usage1', 'usage2']
      });
      
      const json = connectionDef.toJSON();
      
      expect(json.__type).toBe('ConnectionDefinition');
      expect(json.id).toBe('def123');
      expect(json.name).toBe('TestConnection');
      expect(json.stereotype).toBe('flow');
      expect(json.sourceType).toBe('sourceType1');
      expect(json.targetType).toBe('targetType1');
      expect(json.endFeatures).toEqual(['feature1', 'feature2']);
      expect(json.connectionUsages).toEqual(['usage1', 'usage2']);
    });
    
    test('fromJSON()でJSONオブジェクトからインスタンスを生成できること', () => {
      const json: SysML2_ConnectionDefinition = {
        __type: 'ConnectionDefinition',
        id: 'def123',
        name: 'TestConnection',
        stereotype: 'flow',
        sourceType: 'sourceType1',
        targetType: 'targetType1',
        endFeatures: ['feature1', 'feature2'],
        connectionUsages: ['usage1', 'usage2']
      };
      
      const connectionDef = ConnectionDefinition.fromJSON(json);
      
      expect(connectionDef.id).toBe('def123');
      expect(connectionDef.name).toBe('TestConnection');
      expect(connectionDef.stereotype).toBe('flow');
      expect(connectionDef.sourceTypeId).toBe('sourceType1');  // sourceTypeとしてJSONから読み込まれる
      expect(connectionDef.targetTypeId).toBe('targetType1');  // targetTypeとしてJSONから読み込まれる
      expect(connectionDef.endFeatures).toEqual(['feature1', 'feature2']);
      expect(connectionDef.connectionUsages).toEqual(['usage1', 'usage2']);
      
      // 注意: usagesコレクションはJSONデシリアライズ時に
      // 自動的に生成されないのでこのテストでは空配列
      expect(connectionDef.usages).toEqual([]);
    });
    
    // 不正なJSONが渡された場合のエラーテスト
    test('fromJSON()で不正なJSONオブジェクトが渡された場合、例外が発生すること', () => {
      expect(() => {
        // @ts-ignore: 型チェックを無視して意図的に不正な値を渡す
        ConnectionDefinition.fromJSON(null);
      }).toThrow('有効なJSONオブジェクトではありません');
      
      expect(() => {
        // @ts-ignore: 型チェックを無視して意図的に不正な値を渡す
        ConnectionDefinition.fromJSON('not an object');
      }).toThrow('有効なJSONオブジェクトではありません');
    });
  });
});