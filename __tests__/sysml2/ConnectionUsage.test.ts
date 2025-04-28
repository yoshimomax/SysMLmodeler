/**
 * ConnectionUsage テスト
 * src/model/sysml2/ConnectionUsage.ts のテスト
 */

import { ConnectionUsage } from '../../src/model/sysml2/ConnectionUsage';
import { SysML2_ConnectionUsage } from '../../src/model/sysml2/interfaces';

describe('ConnectionUsage', () => {
  describe('基本プロパティ', () => {
    test('コンストラクタで初期化されること', () => {
      const connectionUsage = new ConnectionUsage({
        name: 'TestConnection',
        sourceEndId: 'source1',
        targetEndId: 'target1',
        connectionDefinitionId: 'def123',
        itemType: 'Signal',
        sourceEndRole: 'sender',
        targetEndRole: 'receiver',
        vertices: [{ x: 10, y: 20 }, { x: 30, y: 40 }]
      });
      
      expect(connectionUsage.name).toBe('TestConnection');
      expect(connectionUsage.sourceEndId).toBe('source1');
      expect(connectionUsage.targetEndId).toBe('target1');
      expect(connectionUsage.connectionDefinitionId).toBe('def123');
      expect(connectionUsage.itemType).toBe('Signal');
      expect(connectionUsage.sourceEndRole).toBe('sender');
      expect(connectionUsage.targetEndRole).toBe('receiver');
      expect(connectionUsage.vertices).toEqual([{ x: 10, y: 20 }, { x: 30, y: 40 }]);
    });
    
    test('setVertices()で中間点を設定できること', () => {
      const connectionUsage = new ConnectionUsage({
        sourceEndId: 'source1',
        targetEndId: 'target1'
      });
      
      const vertices = [{ x: 50, y: 60 }, { x: 70, y: 80 }];
      connectionUsage.setVertices(vertices);
      
      expect(connectionUsage.vertices).toEqual(vertices);
      expect(connectionUsage.vertices).not.toBe(vertices); // コピーされているか確認
    });
    
    test('setItemType()で伝達アイテムの型を設定できること', () => {
      const connectionUsage = new ConnectionUsage({
        sourceEndId: 'source1',
        targetEndId: 'target1'
      });
      
      connectionUsage.setItemType('DataPacket');
      expect(connectionUsage.itemType).toBe('DataPacket');
    });
    
    test('setConnectionDefinition()で接続定義IDを設定できること', () => {
      const connectionUsage = new ConnectionUsage({
        sourceEndId: 'source1',
        targetEndId: 'target1'
      });
      
      connectionUsage.setConnectionDefinition('def456');
      expect(connectionUsage.connectionDefinitionId).toBe('def456');
    });
    
    test('setEndRoles()で端点の役割名を設定できること', () => {
      const connectionUsage = new ConnectionUsage({
        sourceEndId: 'source1',
        targetEndId: 'target1'
      });
      
      connectionUsage.setEndRoles('producer', 'consumer');
      expect(connectionUsage.sourceEndRole).toBe('producer');
      expect(connectionUsage.targetEndRole).toBe('consumer');
    });
  });
  
  describe('方向反転', () => {
    test('reverseDirection()で接続の方向を反転できること', () => {
      const connectionUsage = new ConnectionUsage({
        sourceEndId: 'source1',
        targetEndId: 'target1',
        sourceEndRole: 'sender',
        targetEndRole: 'receiver'
      });
      
      connectionUsage.reverseDirection();
      
      expect(connectionUsage.sourceEndId).toBe('target1');
      expect(connectionUsage.targetEndId).toBe('source1');
      expect(connectionUsage.sourceEndRole).toBe('receiver');
      expect(connectionUsage.targetEndRole).toBe('sender');
    });
    
    test('reverseDirection()は役割名がundefinedの場合も処理されること', () => {
      const connectionUsage = new ConnectionUsage({
        sourceEndId: 'source1',
        targetEndId: 'target1'
      });
      
      connectionUsage.reverseDirection();
      
      expect(connectionUsage.sourceEndId).toBe('target1');
      expect(connectionUsage.targetEndId).toBe('source1');
      expect(connectionUsage.sourceEndRole).toBeUndefined();
      expect(connectionUsage.targetEndRole).toBeUndefined();
    });
  });
  
  describe('JSON変換', () => {
    test('toJSON()でJSONオブジェクトに変換できること', () => {
      const connectionUsage = new ConnectionUsage({
        id: 'usage123',
        name: 'TestConnection',
        sourceEndId: 'source1',
        targetEndId: 'target1',
        connectionDefinitionId: 'def123',
        itemType: 'Signal',
        sourceEndRole: 'sender',
        targetEndRole: 'receiver',
        vertices: [{ x: 10, y: 20 }]
      });
      
      const json = connectionUsage.toJSON();
      
      expect(json.__type).toBe('ConnectionUsage');
      expect(json.id).toBe('usage123');
      expect(json.name).toBe('TestConnection');
      expect(json.connectionDefinition).toBe('def123');
      expect(json.endFeatures).toEqual(['source1', 'target1']);
      expect(json.sourceType).toBe('sender');
      expect(json.targetType).toBe('receiver');
      expect(json.itemType).toBe('Signal');
      expect(json.sourceEndId).toBe('source1');
      expect(json.targetEndId).toBe('target1');
      expect(json.vertices).toEqual([{ x: 10, y: 20 }]);
    });
    
    test('fromJSON()でJSONオブジェクトからインスタンスを生成できること', () => {
      const json: SysML2_ConnectionUsage = {
        __type: 'ConnectionUsage',
        id: 'usage123',
        name: 'TestConnection',
        connectionDefinition: 'def123',
        endFeatures: ['source1', 'target1'],
        sourceType: 'sender',
        targetType: 'receiver',
        sourceEndId: 'source1',
        targetEndId: 'target1',
        vertices: [{ x: 10, y: 20 }],
        itemType: 'Signal'
      };
      
      const connectionUsage = ConnectionUsage.fromJSON(json);
      
      expect(connectionUsage.id).toBe('usage123');
      expect(connectionUsage.name).toBe('TestConnection');
      expect(connectionUsage.connectionDefinitionId).toBe('def123');
      expect(connectionUsage.sourceEndId).toBe('source1');
      expect(connectionUsage.targetEndId).toBe('target1');
      expect(connectionUsage.sourceEndRole).toBe('sender');
      expect(connectionUsage.targetEndRole).toBe('receiver');
      expect(connectionUsage.itemType).toBe('Signal');
      expect(connectionUsage.vertices).toEqual([{ x: 10, y: 20 }]);
    });
    
    test('fromJSON()でendFeaturesから接続端点IDを解析できること', () => {
      const json: SysML2_ConnectionUsage = {
        __type: 'ConnectionUsage',
        id: 'usage123',
        name: 'TestConnection',
        connectionDefinition: 'def123',
        endFeatures: ['endpoint1', 'endpoint2'],
        sourceType: 'sender',
        targetType: 'receiver'
      };
      
      const connectionUsage = ConnectionUsage.fromJSON(json);
      
      expect(connectionUsage.sourceEndId).toBe('endpoint1');
      expect(connectionUsage.targetEndId).toBe('endpoint2');
    });
    
    test('fromJSON()で不正なJSONが渡された場合にエラーが発生すること', () => {
      expect(() => {
        // @ts-ignore: 型チェックを無視して意図的に不正な値を渡す
        ConnectionUsage.fromJSON(null);
      }).toThrow('有効なJSONオブジェクトではありません');
      
      expect(() => {
        // @ts-ignore: 型チェックを無視して意図的に不正な値を渡す
        ConnectionUsage.fromJSON({});
      }).toThrow('接続元・接続先のエンドIDが指定されていません');
    });
  });
  
  describe('コピー機能', () => {
    test('copy()でインスタンスのコピーを作成できること', () => {
      const original = new ConnectionUsage({
        id: 'usage123',
        name: 'OriginalConnection',
        sourceEndId: 'source1',
        targetEndId: 'target1',
        connectionDefinitionId: 'def123',
        itemType: 'Signal',
        vertices: [{ x: 10, y: 20 }]
      });
      
      // デフォルトオプションでコピー
      const copy1 = original.copy();
      
      expect(copy1.id).not.toBe(original.id); // 新しいIDが生成される
      expect(copy1.name).toBe('OriginalConnection_copy');
      expect(copy1.sourceEndId).toBe('source1');
      expect(copy1.targetEndId).toBe('target1');
      expect(copy1.connectionDefinitionId).toBe('def123');
      expect(copy1.itemType).toBe('Signal');
      expect(copy1.vertices).toEqual([{ x: 10, y: 20 }]);
      
      // カスタムオプションでコピー
      const copy2 = original.copy({
        name: 'CustomCopy',
        sourceEndId: 'newSource',
        targetEndId: 'newTarget',
        itemType: 'DataPacket'
      });
      
      expect(copy2.name).toBe('CustomCopy');
      expect(copy2.sourceEndId).toBe('newSource');
      expect(copy2.targetEndId).toBe('newTarget');
      expect(copy2.itemType).toBe('DataPacket');
      expect(copy2.connectionDefinitionId).toBe('def123'); // 上書きされていない値はオリジナルと同じ
    });
  });
});