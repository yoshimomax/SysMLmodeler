import { ConnectionDefinition } from '../../src/model/sysml2/ConnectionDefinition';
import { ValidationError } from '../../src/model/sysml2/validator';

describe('ConnectionDefinition', () => {
  describe('JSON round-trip', () => {
    it('toJSON → fromJSON で同一オブジェクトになる', () => {
      const original = new ConnectionDefinition({
        id: 'test-connection-def-1',
        name: 'TestConnectionDefinition',
        isAbstract: false,
        isVariation: false,
        stereotype: 'connection_def',
        endFeatures: ['source', 'target'],
        sourceTypeId: 'port1',
        targetTypeId: 'port2'
      });

      const json = original.toJSON();
      const restored = ConnectionDefinition.fromJSON(json);

      expect(restored.id).toEqual(original.id);
      expect(restored.name).toEqual(original.name);
      expect(restored.isAbstract).toEqual(original.isAbstract);
      expect(restored.isVariation).toEqual(original.isVariation);
      expect(restored.stereotype).toEqual(original.stereotype);
      expect(restored.endFeatures).toEqual(original.endFeatures);
      expect(restored.sourceTypeId).toEqual(original.sourceTypeId);
      expect(restored.targetTypeId).toEqual(original.targetTypeId);
    });
  });

  describe('validation', () => {
    it('endFeaturesが1つ以下の場合にエラーが発生する', () => {
      const connectionWithNoEnds = new ConnectionDefinition({
        id: 'connection-without-ends',
        name: 'EmptyConnection',
        isAbstract: false,
        endFeatures: []
      });
      
      const connectionWithOneEnd = new ConnectionDefinition({
        id: 'connection-with-one-end',
        name: 'OneEndConnection',
        isAbstract: false,
        endFeatures: ['source']
      });
      
      expect(() => connectionWithNoEnds.validate()).toThrow(ValidationError);
      expect(() => connectionWithNoEnds.validate()).toThrow(/endFeaturesを少なくとも2つ持つ必要があります/);
      
      expect(() => connectionWithOneEnd.validate()).toThrow(ValidationError);
      expect(() => connectionWithOneEnd.validate()).toThrow(/endFeaturesを少なくとも2つ持つ必要があります/);
    });

    it('endFeaturesが2つ以上ある場合は有効', () => {
      const validConnection = new ConnectionDefinition({
        id: 'valid-connection',
        name: 'ValidConnection',
        isAbstract: false,
        endFeatures: ['source', 'target']
      });
      
      expect(() => validConnection.validate()).not.toThrow();
    });
  });
});