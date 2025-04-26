import { Definition } from '../../src/model/sysml2/Definition';
import { Usage } from '../../src/model/sysml2/Usage';
import { PartDefinition } from '../../src/model/sysml2/PartDefinition';
import { PartUsage } from '../../src/model/sysml2/PartUsage';
import { validateNoCyclicSpecialization, ValidationError } from '../../src/model/sysml2/validator';

describe('SysML2 バリデーション', () => {
  describe('循環特化検出', () => {
    it('直接的な自己循環特化を検出する', () => {
      // 自分自身を特化している定義
      const selfReferencingDef = new Definition({
        id: 'self-ref',
        name: 'SelfReferencingDef'
      });
      
      // 自己参照を追加
      selfReferencingDef.specializationIds = ['self-ref'];
      
      expect(() => validateNoCyclicSpecialization(selfReferencingDef)).toThrow(ValidationError);
      expect(() => validateNoCyclicSpecialization(selfReferencingDef)).toThrow(/自身を特化/);
    });

    it('間接的な循環特化を検出する', () => {
      // A → B → C → A の循環を作る
      const defA = new Definition({
        id: 'def-a',
        name: 'DefinitionA',
      });
      
      const defB = new Definition({
        id: 'def-b',
        name: 'DefinitionB',
      });
      
      const defC = new Definition({
        id: 'def-c',
        name: 'DefinitionC',
      });
      
      // 循環参照を設定
      defA.specializationIds = ['def-b'];
      defB.specializationIds = ['def-c'];
      defC.specializationIds = ['def-a'];
      
      // A → B → C までは問題ない
      expect(() => validateNoCyclicSpecialization(defA)).not.toThrow();
      expect(() => validateNoCyclicSpecialization(defB)).not.toThrow();
      expect(() => validateNoCyclicSpecialization(defC)).not.toThrow();
      
      // しかし訪問履歴を含めると循環が検出される
      expect(() => validateNoCyclicSpecialization(defA, ['def-c'])).toThrow(ValidationError);
      expect(() => validateNoCyclicSpecialization(defA, ['def-c'])).toThrow(/循環特化が検出/);
    });
  });

  describe('Usage-Definition 関連付け', () => {
    it('抽象でないUsageは対応するDefinitionが必要', () => {
      // Definition参照のない具象Usage
      const usage = new Usage({
        id: 'test-usage',
        name: 'TestUsage',
        isAbstract: false
      });
      
      expect(() => usage.validate()).toThrow(ValidationError);
      expect(() => usage.validate()).toThrow(/Definitionが関連付けられていません/);
    });

    it('抽象Usageは対応するDefinitionがなくてもよい', () => {
      // Definition参照はないが抽象
      const abstractUsage = new Usage({
        id: 'abstract-usage',
        name: 'AbstractUsage',
        isAbstract: true
      });
      
      expect(() => abstractUsage.validate()).not.toThrow();
    });
  });

  describe('多重度チェック', () => {
    // 多重度テストは共通ヘルパーを使うので別のテストファイルで実装
  });
});