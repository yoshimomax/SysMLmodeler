/**
 * PortDefinition と PortUsage の統合テスト
 * ポート定義とポート使用の双方向参照機能を検証
 */

import { PortDefinition } from '../../src/model/sysml2/PortDefinition';
import { PortUsage } from '../../src/model/sysml2/PortUsage';

describe('PortDefinition と PortUsage の統合', () => {
  test('複数のPortUsageがPortDefinitionに登録できること', () => {
    // PortDefinitionの作成
    const portDef = new PortDefinition({
      id: 'def123',
      name: 'SignalPort',
      typeName: 'SignalFlow',
      direction: 'inout'
    });
    
    // 複数のPortUsageを作成
    const portUsage1 = new PortUsage({
      id: 'usage1',
      name: 'InputPort',
      direction: 'in'
    });
    
    const portUsage2 = new PortUsage({
      id: 'usage2',
      name: 'OutputPort',
      direction: 'out'
    });
    
    // PortDefinitionに登録
    portDef.registerPortUsage(portUsage1);
    portDef.registerPortUsage(portUsage2);
    
    // 検証: PortDefinition側
    expect(portDef.portUsages).toContain('usage1');
    expect(portDef.portUsages).toContain('usage2');
    expect(portDef.portUsages.length).toBe(2);
    
    expect(portDef.usages).toContainEqual(expect.objectContaining({
      id: 'usage1',
      name: 'InputPort',
      direction: 'in'
    }));
    expect(portDef.usages).toContainEqual(expect.objectContaining({
      id: 'usage2',
      name: 'OutputPort',
      direction: 'out'
    }));
    expect(portDef.usages.length).toBe(2);
    
    // 検証: PortUsage側
    expect(portUsage1.definitionId).toBe('def123');
    expect(portUsage2.definitionId).toBe('def123');
  });
  
  test('PortDefinitionが参照するPortUsageをID検索できること', () => {
    // PortDefinitionの作成
    const portDef = new PortDefinition({
      id: 'def123',
      name: 'SignalPort'
    });
    
    // 複数のPortUsageを作成して登録
    const portUsage1 = new PortUsage({ id: 'usage1', name: 'Port1' });
    const portUsage2 = new PortUsage({ id: 'usage2', name: 'Port2' });
    
    portDef.registerPortUsage(portUsage1);
    portDef.registerPortUsage(portUsage2);
    
    // getUsageById()でIDによる検索
    const foundUsage = portDef.getUsageById('usage1');
    expect(foundUsage).toBeDefined();
    expect(foundUsage?.id).toBe('usage1');
    expect(foundUsage?.name).toBe('Port1');
    
    // 存在しないIDで検索
    const notFoundUsage = portDef.getUsageById('nonexistent');
    expect(notFoundUsage).toBeUndefined();
  });
  
  test('PortUsageをPortDefinitionから削除できること', () => {
    // PortDefinitionの作成
    const portDef = new PortDefinition({
      id: 'def123',
      name: 'SignalPort'
    });
    
    // 複数のPortUsageを作成して登録
    const portUsage1 = new PortUsage({ id: 'usage1', name: 'Port1' });
    const portUsage2 = new PortUsage({ id: 'usage2', name: 'Port2' });
    
    portDef.registerPortUsage(portUsage1);
    portDef.registerPortUsage(portUsage2);
    
    // 初期状態の確認
    expect(portDef.portUsages.length).toBe(2);
    expect(portDef.usages.length).toBe(2);
    
    // PortUsageを削除
    const result = portDef.removePortUsage('usage1');
    
    // 検証
    expect(result).toBe(true);  // 削除成功
    expect(portDef.portUsages).not.toContain('usage1');
    expect(portDef.portUsages).toContain('usage2');
    expect(portDef.portUsages.length).toBe(1);
    
    // usagesコレクションからも削除されていること
    expect(portDef.usages.length).toBe(1);
    expect(portDef.usages[0].id).toBe('usage2');
    
    // definitionIdはportUsage1に残ったままになる（参照切れ状態）
    // これは別途ガベージコレクションまたはリファレンス整合機能で対処すべき課題
    expect(portUsage1.definitionId).toBe('def123');
  });
  
  test('モデルファクトリから双方向参照が構築できること - サンプル', () => {
    // JSONデータ（一般的にはサーバーやファイルから取得）
    const modelData = {
      portDefinition: {
        __type: 'PortDefinition',
        id: 'def123',
        name: 'SignalPort',
        portUsages: ['usage1', 'usage2']
      },
      portUsages: [
        {
          __type: 'PortUsage',
          id: 'usage1',
          name: 'InputPort',
          direction: 'in'
        },
        {
          __type: 'PortUsage',
          id: 'usage2',
          name: 'OutputPort',
          direction: 'out'
        }
      ]
    };
    
    // モデルファクトリでインスタンスを構築（実装例）
    
    // 1. ポート定義を作成
    const portDef = PortDefinition.fromJSON(modelData.portDefinition);
    
    // 2. ポート使用を作成
    const portUsages = modelData.portUsages.map(json => PortUsage.fromJSON(json));
    
    // 3. 関連付け
    portUsages.forEach(usage => {
      portDef.registerPortUsage(usage);
    });
    
    // 検証
    expect(portDef.portUsages).toEqual(['usage1', 'usage2']);
    expect(portDef.usages.length).toBe(2);
    
    // 双方向参照が確立されていること
    const usage1 = portDef.getUsageById('usage1');
    const usage2 = portDef.getUsageById('usage2');
    
    expect(usage1?.definitionId).toBe('def123');
    expect(usage2?.definitionId).toBe('def123');
    
    expect(usage1?.direction).toBe('in');
    expect(usage2?.direction).toBe('out');
  });
});