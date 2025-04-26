import { PartDefinition } from '../../src/model/sysml2/PartDefinition';
import { PartUsage } from '../../src/model/sysml2/PartUsage';
import { InterfaceDefinition } from '../../src/model/sysml2/InterfaceDefinition';
import { ConnectionDefinition } from '../../src/model/sysml2/ConnectionDefinition';
import { ValidationError } from '../../src/model/sysml2/validator';

describe('SysML2 モデル間関係', () => {
  describe('PartDefinition と PartUsage の関係', () => {
    it('PartUsage は対応する PartDefinition を参照できる', () => {
      // 定義作成
      const partDef = new PartDefinition({
        id: 'engine-def',
        name: 'Engine',
        isAbstract: false,
        stereotype: 'part_def'
      });
      
      // 使用作成（定義参照あり）
      const partUsage = new PartUsage({
        id: 'main-engine',
        name: 'MainEngine',
        isAbstract: false,
        stereotype: 'part',
        partDefinitionId: partDef.id
      });
      
      // 定義側にも使用参照を追加
      partDef.addPartUsageReference(partUsage.id);
      
      // 双方向参照を検証
      expect(partUsage.partDefinitionId).toBe(partDef.id);
      expect(partDef.partUsages).toContain(partUsage.id);
      
      // バリデーション通過を確認
      expect(() => partUsage.validate()).not.toThrow();
      expect(() => partDef.validate()).not.toThrow();
    });
  });

  describe('接続インターフェースモデル', () => {
    it('InterfaceDefinition と ConnectionDefinition の連携', () => {
      // インターフェース定義作成
      const interface1 = new InterfaceDefinition({
        id: 'if-1',
        name: 'Interface1',
        endFeatures: ['end1']
      });
      
      const interface2 = new InterfaceDefinition({
        id: 'if-2',
        name: 'Interface2',
        endFeatures: ['end2']
      });
      
      // 接続定義作成
      const connection = new ConnectionDefinition({
        id: 'conn-1',
        name: 'Connection1',
        sourceTypeId: interface1.id,
        targetTypeId: interface2.id,
        endFeatures: ['source', 'target']
      });
      
      // 接続元/先の検証
      expect(connection.sourceTypeId).toBe(interface1.id);
      expect(connection.targetTypeId).toBe(interface2.id);
      
      // バリデーション通過を確認
      expect(() => interface1.validate()).not.toThrow();
      expect(() => interface2.validate()).not.toThrow();
      expect(() => connection.validate()).not.toThrow();
    });
  });

  describe('複合的なモデル構造', () => {
    it('複雑なシステムモデルでのバリデーション', () => {
      // システム
      const systemDef = new PartDefinition({
        id: 'system-def',
        name: 'SystemDefinition',
        isAbstract: false,
        stereotype: 'part_def'
      });
      
      // サブシステム
      const subsystemDef = new PartDefinition({
        id: 'subsystem-def',
        name: 'SubsystemDefinition',
        isAbstract: false,
        stereotype: 'part_def'
      });
      
      // インスタンス作成
      const systemUsage = new PartUsage({
        id: 'system-usage',
        name: 'SystemInstance',
        isAbstract: false,
        stereotype: 'part',
        partDefinitionId: systemDef.id
      });
      
      const subsystemUsage = new PartUsage({
        id: 'subsystem-usage',
        name: 'SubsystemInstance',
        isAbstract: false,
        stereotype: 'part',
        partDefinitionId: subsystemDef.id
      });
      
      // 関係を構築
      systemDef.addPartUsageReference(systemUsage.id);
      subsystemDef.addPartUsageReference(subsystemUsage.id);
      
      // サブシステムをシステムにネスト
      systemUsage.addNestedPart(subsystemUsage.id);
      
      // 相互参照の検証
      expect(systemUsage.partDefinitionId).toBe(systemDef.id);
      expect(systemDef.partUsages).toContain(systemUsage.id);
      expect(subsystemUsage.partDefinitionId).toBe(subsystemDef.id);
      expect(subsystemDef.partUsages).toContain(subsystemUsage.id);
      expect(systemUsage.nestedParts).toContain(subsystemUsage.id);
      
      // バリデーション通過を確認
      expect(() => systemDef.validate()).not.toThrow();
      expect(() => subsystemDef.validate()).not.toThrow();
      expect(() => systemUsage.validate()).not.toThrow();
      expect(() => subsystemUsage.validate()).not.toThrow();
    });
  });
});