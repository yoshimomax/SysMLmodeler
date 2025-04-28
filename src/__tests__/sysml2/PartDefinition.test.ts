import { PartDefinition } from '../../src/model/sysml2/PartDefinition';
import { ValidationError } from '../../src/model/sysml2/validator';

describe('PartDefinition', () => {
  describe('JSON round-trip', () => {
    it('toJSON → fromJSON で同一オブジェクトになる', () => {
      const original = new PartDefinition({
        id: 'test-part-def-1',
        name: 'TestPartDefinition',
        isAbstract: false,
        isVariation: false,
        stereotype: 'part_def',
        isHuman: false
      });

      const json = original.toJSON();
      const restored = PartDefinition.fromJSON(json);

      // 全体として等しいかチェック
      expect(restored.id).toEqual(original.id);
      expect(restored.name).toEqual(original.name);
      expect(restored.isAbstract).toEqual(original.isAbstract);
      expect(restored.isVariation).toEqual(original.isVariation);
      expect(restored.stereotype).toEqual(original.stereotype);
      expect(restored.isHuman).toEqual(original.isHuman);
      expect(restored.partUsages).toEqual(original.partUsages);
      expect(restored.ports).toEqual(original.ports);
    });

    it('複雑なオブジェクトでも正しく往復する', () => {
      const original = new PartDefinition({
        id: 'complex-part-def-1',
        name: 'ComplexPartDefinition',
        isAbstract: true,
        isVariation: true,
        stereotype: 'part_def',
        isHuman: true,
        ports: ['port1', 'port2'],
        partUsages: ['usage1', 'usage2'],
        interfaceDefinitions: ['interface1'],
        connectionDefinitions: ['connection1']
      });

      const json = original.toJSON();
      const restored = PartDefinition.fromJSON(json);

      expect(restored.id).toEqual(original.id);
      expect(restored.name).toEqual(original.name);
      expect(restored.isAbstract).toEqual(original.isAbstract);
      expect(restored.isVariation).toEqual(original.isVariation);
      expect(restored.stereotype).toEqual(original.stereotype);
      expect(restored.isHuman).toEqual(original.isHuman);
      expect(restored.ports).toEqual(original.ports);
      expect(restored.partUsages).toEqual(original.partUsages);
      expect(restored.interfaceDefinitions).toEqual(original.interfaceDefinitions);
      expect(restored.connectionDefinitions).toEqual(original.connectionDefinitions);
    });
  });

  describe('validation', () => {
    it('名前なしでバリデーションエラーが発生する', () => {
      const noName = new PartDefinition({
        id: 'part-def-no-name',
        isAbstract: false
      });
      
      // コンストラクタ内でバリデーションはwarnだけなので、明示的に呼び出して例外をキャッチ
      expect(() => noName.validate()).toThrow(ValidationError);
      expect(() => noName.validate()).toThrow(/名前が必要/);
    });

    it('抽象要素に対するUsage参照があるとバリデーションエラー', () => {
      const abstractPartDef = new PartDefinition({
        id: 'abstract-part-def',
        name: 'AbstractPartDef',
        isAbstract: true
      });
      
      // 手動でUsage参照を追加
      abstractPartDef.usageReferences = ['usage1', 'usage2'];
      
      expect(() => abstractPartDef.validate()).toThrow(ValidationError);
      expect(() => abstractPartDef.validate()).toThrow(/抽象Definition.*に直接Usageが関連付け/);
    });
  });
});