import { InterfaceDefinition } from '../../src/model/sysml2/InterfaceDefinition';
import { ValidationError } from '../../src/model/sysml2/validator';

describe('InterfaceDefinition', () => {
  describe('JSON round-trip', () => {
    it('toJSON → fromJSON で同一オブジェクトになる', () => {
      const original = new InterfaceDefinition({
        id: 'test-interface-def-1',
        name: 'TestInterfaceDefinition',
        isAbstract: false,
        isVariation: false,
        stereotype: 'interface_def',
        endFeatures: ['end1', 'end2']
      });

      const json = original.toJSON();
      const restored = InterfaceDefinition.fromJSON(json);

      expect(restored.id).toEqual(original.id);
      expect(restored.name).toEqual(original.name);
      expect(restored.isAbstract).toEqual(original.isAbstract);
      expect(restored.isVariation).toEqual(original.isVariation);
      expect(restored.stereotype).toEqual(original.stereotype);
      expect(restored.endFeatures).toEqual(original.endFeatures);
    });
  });

  describe('validation', () => {
    it('endFeaturesが空の場合にエラーが発生する', () => {
      const interfaceDef = new InterfaceDefinition({
        id: 'interface-without-ends',
        name: 'EmptyInterface',
        isAbstract: false,
        endFeatures: []
      });
      
      expect(() => interfaceDef.validate()).toThrow(ValidationError);
      expect(() => interfaceDef.validate()).toThrow(/endFeaturesを少なくとも1つ持つ必要があります/);
    });

    it('endFeaturesがある場合は有効', () => {
      const interfaceDef = new InterfaceDefinition({
        id: 'valid-interface',
        name: 'ValidInterface',
        isAbstract: false,
        endFeatures: ['end1']
      });
      
      expect(() => interfaceDef.validate()).not.toThrow();
    });
  });
});