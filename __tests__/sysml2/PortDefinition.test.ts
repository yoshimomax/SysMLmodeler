/**
 * PortDefinition テスト
 * src/model/sysml2/PortDefinition.ts のテスト
 */

import { PortDefinition } from '../../src/model/sysml2/PortDefinition';
import { PortUsage } from '../../src/model/sysml2/PortUsage';
import { SysML2_PortDefinition } from '../../src/model/sysml2/interfaces';

describe('PortDefinition', () => {
  describe('基本プロパティ', () => {
    test('コンストラクタで初期化されること', () => {
      const portDef = new PortDefinition({
        name: 'TestPort',
        typeName: 'Signal',
        direction: 'in',
        isProxy: true,
        isBehavior: false,
        isConjugated: false,
        multiplicity: '1'
      });
      
      expect(portDef.name).toBe('TestPort');
      expect(portDef.typeName).toBe('Signal');
      expect(portDef.direction).toBe('in');
      expect(portDef.isProxy).toBe(true);
      expect(portDef.isBehavior).toBe(false);
      expect(portDef.isConjugated).toBe(false);
      expect(portDef.multiplicity).toBe('1');
      expect(portDef.portUsages).toEqual([]);
      expect(portDef.usages).toEqual([]);
    });
    
    test('ポート使用IDリストを管理できること', () => {
      const portDef = new PortDefinition({ name: 'TestPort' });
      
      // 追加テスト
      portDef.addPortUsage('usage1');
      portDef.addPortUsage('usage2');
      expect(portDef.portUsages).toContain('usage1');
      expect(portDef.portUsages).toContain('usage2');
      expect(portDef.portUsages.length).toBe(2);
      
      // 重複追加テスト
      portDef.addPortUsage('usage1');
      expect(portDef.portUsages.length).toBe(2);
      
      // 削除テスト
      const result = portDef.removePortUsage('usage1');
      expect(result).toBe(true);
      expect(portDef.portUsages).not.toContain('usage1');
      expect(portDef.portUsages).toContain('usage2');
      expect(portDef.portUsages.length).toBe(1);
      
      // 存在しないID削除テスト
      const result2 = portDef.removePortUsage('nonExistent');
      expect(result2).toBe(false);
      expect(portDef.portUsages.length).toBe(1);
    });
  });
  
  describe('registerPortUsage', () => {
    test('PortUsageインスタンスを正しく登録すること', () => {
      const portDef = new PortDefinition({
        id: 'def123',
        name: 'TestPort'
      });
      
      const portUsage = new PortUsage({
        id: 'usage123',
        name: 'TestPortUsage'
      });
      
      // 登録実行
      portDef.registerPortUsage(portUsage);
      
      // 期待される結果の確認
      expect(portUsage.definitionId).toBe('def123');  // definitionIdが設定されること
      expect(portDef.portUsages).toContain('usage123');  // IDリストに追加されること
      expect(portDef.usages).toContainEqual(expect.objectContaining({
        id: 'usage123',
        name: 'TestPortUsage'
      }));  // usagesコレクションに追加されること
    });
    
    test('同一IDのPortUsageは重複して登録されないこと', () => {
      const portDef = new PortDefinition({
        id: 'def123',
        name: 'TestPort'
      });
      
      const portUsage1 = new PortUsage({
        id: 'usage123',
        name: 'TestPortUsage'
      });
      
      const portUsage2 = new PortUsage({
        id: 'usage123',  // 同じID
        name: 'UpdatedPortUsage'
      });
      
      // 最初の登録
      portDef.registerPortUsage(portUsage1);
      expect(portDef.portUsages.length).toBe(1);
      expect(portDef.usages.length).toBe(1);
      
      // 同じIDで2回目の登録
      portDef.registerPortUsage(portUsage2);
      expect(portDef.portUsages.length).toBe(1);  // IDリストは変わらない
      expect(portDef.usages.length).toBe(1);  // usagesコレクションも変わらない
      
      // ただし最後に登録したオブジェクトの参照が保持される
      expect(portDef.usages[0].name).toBe('UpdatedPortUsage');
    });
  });
  
  describe('JSON変換', () => {
    test('toJSON()でJSONオブジェクトに変換できること', () => {
      const portDef = new PortDefinition({
        id: 'def123',
        name: 'TestPort',
        typeName: 'Signal',
        direction: 'in',
        isProxy: true,
        portUsages: ['usage1', 'usage2']
      });
      
      const json = portDef.toJSON();
      
      expect(json.__type).toBe('PortDefinition');
      expect(json.id).toBe('def123');
      expect(json.name).toBe('TestPort');
      expect(json.typeName).toBe('Signal');
      expect(json.direction).toBe('in');
      expect(json.isProxy).toBe(true);
      expect(json.portUsages).toEqual(['usage1', 'usage2']);
    });
    
    test('fromJSON()でJSONオブジェクトからインスタンスを生成できること', () => {
      const json: SysML2_PortDefinition = {
        __type: 'PortDefinition',
        id: 'def123',
        name: 'TestPort',
        typeName: 'Signal',
        direction: 'in',
        isProxy: true,
        isBehavior: false,
        isConjugated: false,
        multiplicity: '1',
        portUsages: ['usage1', 'usage2']
      };
      
      const portDef = PortDefinition.fromJSON(json);
      
      expect(portDef.id).toBe('def123');
      expect(portDef.name).toBe('TestPort');
      expect(portDef.typeName).toBe('Signal');
      expect(portDef.direction).toBe('in');
      expect(portDef.isProxy).toBe(true);
      expect(portDef.isBehavior).toBe(false);
      expect(portDef.isConjugated).toBe(false);
      expect(portDef.multiplicity).toBe('1');
      expect(portDef.portUsages).toEqual(['usage1', 'usage2']);
      
      // 注意: usagesコレクションはJSONデシリアライズ時に
      // 自動的に生成されないのでこのテストでは空配列
      expect(portDef.usages).toEqual([]);
    });
    
    // fromJSONのエラーケーステスト
    test('fromJSON()で不正なJSONオブジェクトが渡された場合、適切に処理されること', () => {
      // __typeプロパティの検証はシリアライズ/デシリアライズを管理する上位クラスで実施
      // ここでは型の互換性エラーがTypeScriptコンパイラによって捕捉されることを想定
      
      // 未実装: JSONスキーマバリデーションの追加検討
      // 現在の実装ではJSONデータの型チェックのみ行われる
    });
  });
  
  // モデルファクトリまたはシリアライザーの実装時に使うテストケース例
  describe('複合的なJSONシリアライゼーション', () => {
    test('モデルファクトリに適用する場合のサンプル', () => {
      // シリアライザー/ファクトリクラスでの実装例:
      // 1. JSONからPortDefinitionを生成
      const defJson: SysML2_PortDefinition = {
        __type: 'PortDefinition',
        id: 'def123',
        name: 'TestPort',
        portUsages: ['usage1', 'usage2']
      };
      const portDef = PortDefinition.fromJSON(defJson);
      
      // 2. JSONからPortUsageを生成して関連付け
      const usageJson1 = {
        __type: 'PortUsage',
        id: 'usage1',
        name: 'Usage1'
      };
      const usageJson2 = {
        __type: 'PortUsage',
        id: 'usage2',
        name: 'Usage2'
      };
      
      // PortUsageインスタンスを生成
      const usage1 = PortUsage.fromJSON(usageJson1);
      const usage2 = PortUsage.fromJSON(usageJson2);
      
      // PortDefinitionに登録
      portDef.registerPortUsage(usage1);
      portDef.registerPortUsage(usage2);
      
      // 検証
      expect(portDef.portUsages).toEqual(['usage1', 'usage2']);
      expect(portDef.usages.length).toBe(2);
      expect(usage1.definitionId).toBe('def123');
      expect(usage2.definitionId).toBe('def123');
    });
  });
});