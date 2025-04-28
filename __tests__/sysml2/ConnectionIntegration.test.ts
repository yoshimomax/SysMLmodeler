/**
 * ConnectionDefinition と ConnectionUsage の統合テスト
 * 接続定義と接続使用の双方向参照機能を検証
 */

import { ConnectionDefinition } from '../../src/model/sysml2/ConnectionDefinition';
import { ConnectionUsage } from '../../src/model/sysml2/ConnectionUsage';
import { Feature } from '../../src/model/kerml/Feature';

describe('ConnectionDefinition と ConnectionUsage の統合', () => {
  test('複数のConnectionUsageがConnectionDefinitionに登録できること', () => {
    // ConnectionDefinitionの作成
    const connectionDef = new ConnectionDefinition({
      id: 'def123',
      name: 'FlowConnection',
      stereotype: 'flow'
    });
    
    // 複数のConnectionUsageを作成
    const connectionUsage1 = new ConnectionUsage({
      id: 'usage1',
      name: 'Flow1',
      sourceEndId: 'port1',
      targetEndId: 'port2',
      itemType: 'Signal'
    });
    
    const connectionUsage2 = new ConnectionUsage({
      id: 'usage2',
      name: 'Flow2',
      sourceEndId: 'port3',
      targetEndId: 'port4',
      itemType: 'Power'
    });
    
    // ConnectionDefinitionに登録
    connectionDef.registerConnectionUsage(connectionUsage1);
    connectionDef.registerConnectionUsage(connectionUsage2);
    
    // 検証: ConnectionDefinition側
    expect(connectionDef.connectionUsages).toContain('usage1');
    expect(connectionDef.connectionUsages).toContain('usage2');
    expect(connectionDef.connectionUsages.length).toBe(2);
    
    expect(connectionDef.usages).toContainEqual(expect.objectContaining({
      id: 'usage1',
      name: 'Flow1',
      itemType: 'Signal'
    }));
    expect(connectionDef.usages).toContainEqual(expect.objectContaining({
      id: 'usage2',
      name: 'Flow2',
      itemType: 'Power'
    }));
    expect(connectionDef.usages.length).toBe(2);
    
    // 検証: ConnectionUsage側
    expect(connectionUsage1.connectionDefinitionId).toBe('def123');
    expect(connectionUsage2.connectionDefinitionId).toBe('def123');
  });
  
  test('ConnectionDefinitionが参照するConnectionUsageをID検索できること', () => {
    // ConnectionDefinitionの作成
    const connectionDef = new ConnectionDefinition({
      id: 'def123',
      name: 'FlowConnection'
    });
    
    // 複数のConnectionUsageを作成して登録
    const connectionUsage1 = new ConnectionUsage({
      id: 'usage1',
      name: 'Flow1',
      sourceEndId: 'port1',
      targetEndId: 'port2'
    });
    const connectionUsage2 = new ConnectionUsage({
      id: 'usage2',
      name: 'Flow2',
      sourceEndId: 'port3',
      targetEndId: 'port4'
    });
    
    connectionDef.registerConnectionUsage(connectionUsage1);
    connectionDef.registerConnectionUsage(connectionUsage2);
    
    // getUsageById()でIDによる検索
    const foundUsage = connectionDef.getUsageById('usage1');
    expect(foundUsage).toBeDefined();
    expect(foundUsage?.id).toBe('usage1');
    expect(foundUsage?.name).toBe('Flow1');
    
    // 存在しないIDで検索
    const notFoundUsage = connectionDef.getUsageById('nonexistent');
    expect(notFoundUsage).toBeUndefined();
  });
  
  test('connect()メソッドを使用して特性間の接続を作成できること', () => {
    // ConnectionDefinitionの作成
    const connectionDef = new ConnectionDefinition({
      id: 'def123',
      name: 'FlowConnection',
      stereotype: 'item flow'
    });
    
    // 接続する特性（ポートなど）を作成
    const sourcePort = new Feature({
      id: 'port1',
      name: 'OutputPort'
    });
    
    const targetPort = new Feature({
      id: 'port2',
      name: 'InputPort'
    });
    
    // 接続作成
    const connectionUsage = connectionDef.connect(sourcePort, targetPort, {
      name: 'DataFlow',
      itemType: 'DataPacket'
    });
    
    // 検証
    expect(connectionUsage.sourceEndId).toBe('port1');
    expect(connectionUsage.targetEndId).toBe('port2');
    expect(connectionUsage.name).toBe('DataFlow');
    expect(connectionUsage.itemType).toBe('DataPacket');
    expect(connectionUsage.connectionDefinitionId).toBe('def123');
    
    // ConnectionDefinitionに登録されていることの確認
    expect(connectionDef.connectionUsages).toContain(connectionUsage.id);
    const storedUsage = connectionDef.getUsageById(connectionUsage.id);
    expect(storedUsage).toBeDefined();
    expect(storedUsage).toBe(connectionUsage); // 同一オブジェクト参照であること
  });
  
  test('モデルファクトリから双方向参照が構築できること - サンプル', () => {
    // JSONデータ（一般的にはサーバーやファイルから取得）
    const modelData = {
      connectionDefinition: {
        __type: 'ConnectionDefinition',
        id: 'def123',
        name: 'FlowConnection',
        stereotype: 'flow',
        connectionUsages: ['usage1', 'usage2']
      },
      connectionUsages: [
        {
          __type: 'ConnectionUsage',
          id: 'usage1',
          name: 'Flow1',
          sourceEndId: 'port1',
          targetEndId: 'port2',
          itemType: 'Signal'
        },
        {
          __type: 'ConnectionUsage',
          id: 'usage2',
          name: 'Flow2',
          sourceEndId: 'port3',
          targetEndId: 'port4',
          itemType: 'Power'
        }
      ]
    };
    
    // モデルファクトリでインスタンスを構築（実装例）
    
    // 1. 接続定義を作成
    const connectionDef = ConnectionDefinition.fromJSON(modelData.connectionDefinition);
    
    // 2. 接続使用を作成
    const connectionUsages = modelData.connectionUsages.map(json => ConnectionUsage.fromJSON(json));
    
    // 3. 関連付け
    connectionUsages.forEach(usage => {
      connectionDef.registerConnectionUsage(usage);
    });
    
    // 検証
    expect(connectionDef.connectionUsages).toEqual(['usage1', 'usage2']);
    expect(connectionDef.usages.length).toBe(2);
    
    // 双方向参照が確立されていること
    const usage1 = connectionDef.getUsageById('usage1');
    const usage2 = connectionDef.getUsageById('usage2');
    
    expect(usage1?.connectionDefinitionId).toBe('def123');
    expect(usage2?.connectionDefinitionId).toBe('def123');
    
    expect(usage1?.itemType).toBe('Signal');
    expect(usage2?.itemType).toBe('Power');
  });
});