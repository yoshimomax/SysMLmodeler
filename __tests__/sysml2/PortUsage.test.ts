/**
 * PortUsage テスト
 * src/model/sysml2/PortUsage.ts のテスト
 */

import { PortUsage } from '../../src/model/sysml2/PortUsage';
import { PortDefinition } from '../../src/model/sysml2/PortDefinition';
import { SysML2_PortUsage } from '../../src/model/sysml2/interfaces';

describe('PortUsage', () => {
  describe('基本プロパティ', () => {
    test('コンストラクタで初期化されること', () => {
      const portUsage = new PortUsage({
        name: 'TestPortUsage',
        definitionId: 'def123',
        direction: 'out',
        isConjugated: true,
        position: { x: 100, y: 200 },
        flowSpecifications: ['flow1', 'flow2'],
        interfaces: ['iface1']
      });
      
      expect(portUsage.name).toBe('TestPortUsage');
      expect(portUsage.definitionId).toBe('def123');
      expect(portUsage.direction).toBe('out');
      expect(portUsage.isConjugated).toBe(true);
      expect(portUsage.position).toEqual({ x: 100, y: 200 });
      expect(portUsage.flowSpecifications).toEqual(['flow1', 'flow2']);
      expect(portUsage.interfaces).toEqual(['iface1']);
    });
    
    test('setPosition()で位置を設定できること', () => {
      const portUsage = new PortUsage({ name: 'TestPortUsage' });
      portUsage.setPosition(150, 250);
      expect(portUsage.position).toEqual({ x: 150, y: 250 });
    });
    
    test('setDefinition()でポート定義IDを設定できること', () => {
      const portUsage = new PortUsage({ name: 'TestPortUsage' });
      portUsage.setDefinition('def456');
      expect(portUsage.definitionId).toBe('def456');
    });
    
    test('addFlowSpecification()でフロー仕様を追加できること', () => {
      const portUsage = new PortUsage({ name: 'TestPortUsage' });
      
      // 初期状態は未定義
      expect(portUsage.flowSpecifications).toBeUndefined();
      
      // 最初の追加で配列が初期化されること
      portUsage.addFlowSpecification('flow1');
      expect(portUsage.flowSpecifications).toEqual(['flow1']);
      
      // 追加のIDが正しく登録されること
      portUsage.addFlowSpecification('flow2');
      expect(portUsage.flowSpecifications).toEqual(['flow1', 'flow2']);
      
      // 重複IDは追加されないこと
      portUsage.addFlowSpecification('flow1');
      expect(portUsage.flowSpecifications).toEqual(['flow1', 'flow2']);
    });
    
    test('addInterface()でインターフェースを追加できること', () => {
      const portUsage = new PortUsage({ name: 'TestPortUsage' });
      
      // 初期状態は未定義
      expect(portUsage.interfaces).toBeUndefined();
      
      // 最初の追加で配列が初期化されること
      portUsage.addInterface('iface1');
      expect(portUsage.interfaces).toEqual(['iface1']);
      
      // 追加のIDが正しく登録されること
      portUsage.addInterface('iface2');
      expect(portUsage.interfaces).toEqual(['iface1', 'iface2']);
      
      // 重複IDは追加されないこと
      portUsage.addInterface('iface1');
      expect(portUsage.interfaces).toEqual(['iface1', 'iface2']);
    });
  });
  
  describe('PortDefinitionとの連携', () => {
    test('PortDefinitionに登録されるとdefinitionIdが設定されること', () => {
      const portDef = new PortDefinition({
        id: 'def123',
        name: 'TestPort'
      });
      
      const portUsage = new PortUsage({
        id: 'usage123',
        name: 'TestPortUsage'
      });
      
      // 初期状態ではdefinitionIdは未設定
      expect(portUsage.definitionId).toBeUndefined();
      
      // PortDefinitionに登録
      portDef.registerPortUsage(portUsage);
      
      // definitionIdが設定されていることを確認
      expect(portUsage.definitionId).toBe('def123');
    });
  });
  
  describe('共役ポート', () => {
    test('createConjugate()で共役ポートを生成できること', () => {
      const portUsage = new PortUsage({
        name: 'SourcePort',
        definitionId: 'def123',
        direction: 'in',
        isConjugated: false,
        flowSpecifications: ['flow1', 'flow2'],
        interfaces: ['iface1']
      });
      
      const conjugate = portUsage.createConjugate();
      
      // 名前に_conjugateが付加されること
      expect(conjugate.name).toBe('SourcePort_conjugate');
      // 説明が追加されること
      expect(conjugate.description).toBe('SourcePortの共役ポート');
      // 同じ定義を参照すること
      expect(conjugate.definitionId).toBe('def123');
      // 方向が反転すること
      expect(conjugate.direction).toBe('out');
      // 共役フラグがtrue
      expect(conjugate.isConjugated).toBe(true);
      // 特性が継承されること
      expect(conjugate.flowSpecifications).toEqual(['flow1', 'flow2']);
      expect(conjugate.interfaces).toEqual(['iface1']);
    });
    
    test('out方向のポートの共役はin方向になること', () => {
      const portUsage = new PortUsage({
        direction: 'out'
      });
      
      const conjugate = portUsage.createConjugate();
      expect(conjugate.direction).toBe('in');
    });
    
    test('inout方向のポートの共役もinout方向のままであること', () => {
      const portUsage = new PortUsage({
        direction: 'inout'
      });
      
      const conjugate = portUsage.createConjugate();
      expect(conjugate.direction).toBe('inout');
    });
  });
  
  describe('JSON変換', () => {
    test('toJSON()でJSONオブジェクトに変換できること', () => {
      const portUsage = new PortUsage({
        id: 'usage123',
        name: 'TestPortUsage',
        definitionId: 'def123',
        direction: 'out',
        isConjugated: true,
        position: { x: 100, y: 200 },
        flowSpecifications: ['flow1'],
        interfaces: ['iface1']
      });
      
      const json = portUsage.toJSON();
      
      expect(json.__type).toBe('PortUsage');
      expect(json.id).toBe('usage123');
      expect(json.name).toBe('TestPortUsage');
      expect(json.portDefinition).toBe('def123');  // 注：definitionIdはportDefinitionとして出力
      expect(json.direction).toBe('out');
      expect(json.isConjugated).toBe(true);
      expect(json.position).toEqual({ x: 100, y: 200 });
      expect(json.flowSpecifications).toEqual(['flow1']);
      expect(json.interfaces).toEqual(['iface1']);
    });
    
    test('fromJSON()でJSONオブジェクトからインスタンスを生成できること', () => {
      const json: SysML2_PortUsage = {
        __type: 'PortUsage',
        id: 'usage123',
        name: 'TestPortUsage',
        portDefinition: 'def123',  // 注：JSONではportDefinitionとして入力
        direction: 'out',
        isConjugated: true,
        position: { x: 100, y: 200 },
        flowSpecifications: ['flow1'],
        interfaces: ['iface1']
      };
      
      const portUsage = PortUsage.fromJSON(json);
      
      expect(portUsage.id).toBe('usage123');
      expect(portUsage.name).toBe('TestPortUsage');
      expect(portUsage.definitionId).toBe('def123');  // 内部ではdefinitionIdとして保持
      expect(portUsage.direction).toBe('out');
      expect(portUsage.isConjugated).toBe(true);
      expect(portUsage.position).toEqual({ x: 100, y: 200 });
      expect(portUsage.flowSpecifications).toEqual(['flow1']);
      expect(portUsage.interfaces).toEqual(['iface1']);
    });
    
    test('fromJSON()で不正なJSONが渡された場合にエラーが発生すること', () => {
      expect(() => {
        // @ts-ignore: 型チェックを無視して意図的に不正な値を渡す
        PortUsage.fromJSON(null);
      }).toThrow('有効なJSONオブジェクトではありません');
      
      expect(() => {
        // @ts-ignore: 型チェックを無視して意図的に不正な値を渡す
        PortUsage.fromJSON('not an object');
      }).toThrow('有効なJSONオブジェクトではありません');
    });
  });
});