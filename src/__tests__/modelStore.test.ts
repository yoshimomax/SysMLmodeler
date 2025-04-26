import { useModelStore } from '../store/modelStore';
import { Block } from '../../model/Block';
import { Port } from '../../model/Port';
import { Property } from '../../model/Property';
import { Connection } from '../../model/Connection';

// モックUUIDを設定
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid')
}));

describe('ModelStore', () => {
  // 各テスト前にストアをリセット
  beforeEach(() => {
    useModelStore.getState().resetModel();
  });

  // ブロック操作のテスト
  describe('Block Operations', () => {
    test('addBlock should add a block to the store', () => {
      const testBlock = new Block('TestBlock', [], [], 'block', 'Test description');
      
      useModelStore.getState().addBlock(testBlock);
      
      const blocks = useModelStore.getState().blocks;
      expect(Object.keys(blocks).length).toBe(1);
      expect(blocks[testBlock.id]).toBe(testBlock);
    });
    
    test('updateBlock should update block properties', () => {
      const testBlock = new Block('TestBlock', [], [], 'block', 'Test description');
      useModelStore.getState().addBlock(testBlock);
      
      // ブロックを更新
      useModelStore.getState().updateBlock(testBlock.id, {
        name: 'UpdatedBlock',
        description: 'Updated description'
      });
      
      const updatedBlock = useModelStore.getState().blocks[testBlock.id];
      expect(updatedBlock.name).toBe('UpdatedBlock');
      expect(updatedBlock.description).toBe('Updated description');
    });
    
    test('removeBlock should remove the block and its connections', () => {
      // テスト用のブロックとポートを作成
      const block1 = new Block('Block1');
      const port1 = new Port('Port1', 'Flow', block1.id);
      block1.addPort(port1);
      
      const block2 = new Block('Block2');
      const port2 = new Port('Port2', 'Flow', block2.id);
      block2.addPort(port2);
      
      // ブロックを追加
      useModelStore.getState().addBlock(block1);
      useModelStore.getState().addBlock(block2);
      
      // 接続を作成して追加
      const connection = new Connection(port1.id, port2.id, 'connector');
      useModelStore.getState().addConnection(connection);
      
      // ブロック1を削除
      useModelStore.getState().removeBlock(block1.id);
      
      // 検証
      const { blocks, connections } = useModelStore.getState();
      expect(Object.keys(blocks).length).toBe(1);
      expect(blocks[block1.id]).toBeUndefined();
      expect(blocks[block2.id]).toBeDefined();
      expect(Object.keys(connections).length).toBe(0);
    });
  });
  
  // 接続操作のテスト
  describe('Connection Operations', () => {
    test('addConnection should add a connection to the store', () => {
      const connection = new Connection('port1-id', 'port2-id', 'flow');
      
      useModelStore.getState().addConnection(connection);
      
      const connections = useModelStore.getState().connections;
      expect(Object.keys(connections).length).toBe(1);
      expect(connections[connection.id]).toBe(connection);
    });
    
    test('updateConnection should update connection properties', () => {
      const connection = new Connection('port1-id', 'port2-id', 'flow');
      useModelStore.getState().addConnection(connection);
      
      // 接続を更新
      useModelStore.getState().updateConnection(connection.id, {
        stereotype: 'updatedFlow',
        name: 'UpdatedConnection'
      });
      
      const updatedConnection = useModelStore.getState().connections[connection.id];
      expect(updatedConnection.stereotype).toBe('updatedFlow');
      expect(updatedConnection.name).toBe('UpdatedConnection');
    });
    
    test('removeConnection should remove the connection', () => {
      const connection = new Connection('port1-id', 'port2-id', 'flow');
      useModelStore.getState().addConnection(connection);
      
      useModelStore.getState().removeConnection(connection.id);
      
      const connections = useModelStore.getState().connections;
      expect(Object.keys(connections).length).toBe(0);
    });
  });
  
  // プロパティ操作のテスト
  describe('Property Operations', () => {
    test('addPropertyToBlock should add a property to a block', () => {
      const block = new Block('TestBlock');
      useModelStore.getState().addBlock(block);
      
      const property = new Property('TestProperty', 'string');
      useModelStore.getState().addPropertyToBlock(block.id, property);
      
      const updatedBlock = useModelStore.getState().blocks[block.id];
      expect(updatedBlock.properties.length).toBe(1);
      expect(updatedBlock.properties[0].name).toBe('TestProperty');
      expect(updatedBlock.properties[0].ownerBlockId).toBe(block.id);
    });
    
    test('updateProperty should update a property in a block', () => {
      const property = new Property('TestProperty', 'string');
      const block = new Block('TestBlock', [property]);
      useModelStore.getState().addBlock(block);
      
      useModelStore.getState().updateProperty(block.id, property.id, {
        name: 'UpdatedProperty',
        type: 'number',
        value: 42
      });
      
      const updatedBlock = useModelStore.getState().blocks[block.id];
      const updatedProperty = updatedBlock.properties[0];
      expect(updatedProperty.name).toBe('UpdatedProperty');
      expect(updatedProperty.type).toBe('number');
      expect(updatedProperty.value).toBe(42);
    });
    
    test('removeProperty should remove a property from a block', () => {
      const property = new Property('TestProperty', 'string');
      const block = new Block('TestBlock', [property]);
      useModelStore.getState().addBlock(block);
      
      useModelStore.getState().removeProperty(block.id, property.id);
      
      const updatedBlock = useModelStore.getState().blocks[block.id];
      expect(updatedBlock.properties.length).toBe(0);
    });
  });
  
  // ポート操作のテスト
  describe('Port Operations', () => {
    test('addPortToBlock should add a port to a block', () => {
      const block = new Block('TestBlock');
      useModelStore.getState().addBlock(block);
      
      const port = new Port('TestPort', 'Flow');
      useModelStore.getState().addPortToBlock(block.id, port);
      
      const updatedBlock = useModelStore.getState().blocks[block.id];
      expect(updatedBlock.ports.length).toBe(1);
      expect(updatedBlock.ports[0].name).toBe('TestPort');
      expect(updatedBlock.ports[0].ownerBlockId).toBe(block.id);
    });
    
    test('updatePort should update a port in a block', () => {
      const port = new Port('TestPort', 'Flow');
      const block = new Block('TestBlock', [], [port]);
      useModelStore.getState().addBlock(block);
      
      useModelStore.getState().updatePort(block.id, port.id, {
        name: 'UpdatedPort',
        type: 'UpdatedFlow',
        direction: 'out'
      });
      
      const updatedBlock = useModelStore.getState().blocks[block.id];
      const updatedPort = updatedBlock.ports[0];
      expect(updatedPort.name).toBe('UpdatedPort');
      expect(updatedPort.type).toBe('UpdatedFlow');
      expect(updatedPort.direction).toBe('out');
    });
    
    test('removePort should remove a port and its connections', () => {
      // テスト用のブロックとポートを作成
      const block1 = new Block('Block1');
      const port1 = new Port('Port1', 'Flow', block1.id);
      block1.addPort(port1);
      
      const block2 = new Block('Block2');
      const port2 = new Port('Port2', 'Flow', block2.id);
      block2.addPort(port2);
      
      // ブロックを追加
      useModelStore.getState().addBlock(block1);
      useModelStore.getState().addBlock(block2);
      
      // 接続を作成して追加
      const connection = new Connection(port1.id, port2.id, 'connector');
      useModelStore.getState().addConnection(connection);
      
      // ポート1を削除
      useModelStore.getState().removePort(block1.id, port1.id);
      
      // 検証
      const updatedBlock = useModelStore.getState().blocks[block1.id];
      const connections = useModelStore.getState().connections;
      expect(updatedBlock.ports.length).toBe(0);
      expect(Object.keys(connections).length).toBe(0);
    });
  });
  
  // モデル全体の操作テスト
  describe('Model Operations', () => {
    test('resetModel should clear all blocks and connections', () => {
      // テスト用のブロックと接続を追加
      const block = new Block('TestBlock');
      useModelStore.getState().addBlock(block);
      
      const connection = new Connection('port1-id', 'port2-id', 'flow');
      useModelStore.getState().addConnection(connection);
      
      // モデルをリセット
      useModelStore.getState().resetModel();
      
      // 検証
      const { blocks, connections } = useModelStore.getState();
      expect(Object.keys(blocks).length).toBe(0);
      expect(Object.keys(connections).length).toBe(0);
    });
    
    test('initializeSampleModel should create a sample model', () => {
      useModelStore.getState().initializeSampleModel();
      
      const { blocks, connections } = useModelStore.getState();
      expect(Object.keys(blocks).length).toBe(3);
      expect(Object.keys(connections).length).toBe(2);
      
      // ブロック名の確認
      const blockNames = Object.values(blocks).map(block => block.name);
      expect(blockNames).toContain('System');
      expect(blockNames).toContain('Subsystem');
      expect(blockNames).toContain('Component');
    });
    
    test('getModelAsJson should return a JSON string representation of the model', () => {
      const block = new Block('TestBlock');
      useModelStore.getState().addBlock(block);
      
      const jsonString = useModelStore.getState().getModelAsJson();
      const parsedJson = JSON.parse(jsonString);
      
      expect(parsedJson.blocks.length).toBe(1);
      expect(parsedJson.blocks[0].name).toBe('TestBlock');
    });
    
    test('loadModelFromJson should reconstruct the model from JSON', () => {
      // サンプルJSONを作成
      const jsonModel = {
        blocks: [
          {
            id: 'block1',
            name: 'Block1',
            stereotype: 'block',
            description: 'Test block',
            properties: [
              {
                id: 'prop1',
                name: 'Property1',
                type: 'string',
                value: 'test value',
                ownerBlockId: 'block1'
              }
            ],
            ports: [
              {
                id: 'port1',
                name: 'Port1',
                type: 'Flow',
                direction: 'inout',
                ownerBlockId: 'block1'
              }
            ]
          }
        ],
        connections: [
          {
            id: 'conn1',
            sourcePortId: 'port1',
            targetPortId: 'port2',
            stereotype: 'flow',
            name: 'TestConnection'
          }
        ]
      };
      
      useModelStore.getState().loadModelFromJson(JSON.stringify(jsonModel));
      
      // 検証
      const { blocks, connections } = useModelStore.getState();
      expect(Object.keys(blocks).length).toBe(1);
      expect(blocks['block1'].name).toBe('Block1');
      expect(blocks['block1'].properties.length).toBe(1);
      expect(blocks['block1'].ports.length).toBe(1);
      expect(Object.keys(connections).length).toBe(1);
    });
  });
});