import { useSysMLStore } from '@store/sysmlStore';
import { 
  BlockDefinition, 
  PortDefinition, 
  AttributeDefinition, 
  ConnectionDefinition,
  System,
  Subsystem
} from '../model';

// モックUUIDを設定
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid')
}));

describe('SysMLStore', () => {
  // 各テスト前にストアをリセット
  beforeEach(() => {
    useSysMLStore.setState({
      currentModel: null,
      currentDiagramId: null,
      selectedElementId: null,
      selectedElementName: null,
      selectedRelationshipId: null,
      isPropertyPanelOpen: true,
      zoom: 1,
    });
  });
  
  describe('モデル操作', () => {
    test('createModel should create a new model with unique ID', () => {
      // モデル作成
      const model = useSysMLStore.getState().createModel('Test Model');
      
      // 検証
      expect(model.id).toBe('test-uuid');
      expect(model.name).toBe('Test Model');
      expect(model.diagrams).toEqual([]);
      expect(model.blocks).toEqual([]);
      expect(model.systems).toEqual([]);
      expect(model.subsystems).toEqual([]);
      expect(model.components).toEqual([]);
      expect(model.actors).toEqual([]);
      expect(model.connections).toEqual([]);
      expect(model.stateMachines).toEqual([]);
      
      // ストア状態も確認
      expect(useSysMLStore.getState().currentModel).toEqual(model);
    });
    
    test('loadModel should update store state with provided model', () => {
      // テスト用モデル
      const testModel = {
        id: 'model-id',
        name: 'Test Model',
        diagrams: [{ id: 'diagram-id', name: 'Diagram', type: 'block', elements: [], relationships: [] }],
        blocks: [],
        systems: [],
        subsystems: [],
        components: [],
        actors: [],
        connections: [],
        stateMachines: []
      };
      
      // モデル読み込み
      useSysMLStore.getState().loadModel(testModel);
      
      // 検証
      expect(useSysMLStore.getState().currentModel).toEqual(testModel);
      expect(useSysMLStore.getState().currentDiagramId).toBe('diagram-id');
      expect(useSysMLStore.getState().selectedElementId).toBeNull();
      expect(useSysMLStore.getState().selectedElementName).toBeNull();
      expect(useSysMLStore.getState().selectedRelationshipId).toBeNull();
    });
    
    test('saveModel should return the current model', () => {
      // テスト用モデル
      const testModel = {
        id: 'model-id',
        name: 'Test Model',
        diagrams: [],
        blocks: [],
        systems: [],
        subsystems: [],
        components: [],
        actors: [],
        connections: [],
        stateMachines: []
      };
      
      // ストアにモデルを設定
      useSysMLStore.setState({ currentModel: testModel });
      
      // モデル保存
      const savedModel = useSysMLStore.getState().saveModel();
      
      // 検証
      expect(savedModel).toEqual(testModel);
    });
    
    test('saveModel should throw error if no model exists', () => {
      // モデルが存在しない状態
      expect(() => {
        useSysMLStore.getState().saveModel();
      }).toThrow('モデルが存在しません');
    });
    
    test('clearModel should reset the model state', () => {
      // テスト用モデル
      const testModel = {
        id: 'model-id',
        name: 'Test Model',
        diagrams: [],
        blocks: [],
        systems: [],
        subsystems: [],
        components: [],
        actors: [],
        connections: [],
        stateMachines: []
      };
      
      // ストアにモデルを設定
      useSysMLStore.setState({
        currentModel: testModel,
        currentDiagramId: 'diagram-id',
        selectedElementId: 'element-id',
        selectedElementName: 'Element',
        selectedRelationshipId: 'relationship-id'
      });
      
      // モデルクリア
      useSysMLStore.getState().clearModel();
      
      // 検証
      expect(useSysMLStore.getState().currentModel).toBeNull();
      expect(useSysMLStore.getState().currentDiagramId).toBeNull();
      expect(useSysMLStore.getState().selectedElementId).toBeNull();
      expect(useSysMLStore.getState().selectedElementName).toBeNull();
      expect(useSysMLStore.getState().selectedRelationshipId).toBeNull();
    });
  });
  
  describe('図操作', () => {
    test('createDiagram should add a new diagram to the model', () => {
      // モデル作成
      useSysMLStore.getState().createModel('Test Model');
      
      // 図作成
      const diagramId = useSysMLStore.getState().createDiagram('Test Diagram', 'block');
      
      // 検証
      const model = useSysMLStore.getState().currentModel;
      expect(model?.diagrams.length).toBe(1);
      expect(model?.diagrams[0].id).toBe('test-uuid');
      expect(model?.diagrams[0].name).toBe('Test Diagram');
      expect(model?.diagrams[0].type).toBe('block');
      expect(useSysMLStore.getState().currentDiagramId).toBe('test-uuid');
    });
    
    test('createDiagram should throw error if no model exists', () => {
      // モデルが存在しない状態
      expect(() => {
        useSysMLStore.getState().createDiagram('Test Diagram', 'block');
      }).toThrow('モデルが存在しません');
    });
    
    test('setCurrentDiagram should update the current diagram ID', () => {
      // モデル作成
      useSysMLStore.getState().createModel('Test Model');
      
      // 図を2つ作成
      const diagramId1 = useSysMLStore.getState().createDiagram('Diagram 1', 'block');
      const diagramId2 = useSysMLStore.getState().createDiagram('Diagram 2', 'block');
      
      // カレント図を2つ目に設定
      useSysMLStore.getState().setCurrentDiagram(diagramId2);
      
      // 検証
      expect(useSysMLStore.getState().currentDiagramId).toBe(diagramId2);
    });
    
    test('setCurrentDiagram should throw error for non-existent diagram', () => {
      // モデル作成
      useSysMLStore.getState().createModel('Test Model');
      
      // 存在しない図IDを指定
      expect(() => {
        useSysMLStore.getState().setCurrentDiagram('non-existent-id');
      }).toThrow('指定されたIDの図が見つかりません');
    });
  });
  
  describe('要素操作', () => {
    test('addBlock should add a new block to the model and current diagram', () => {
      // モデル作成
      useSysMLStore.getState().createModel('Test Model');
      
      // 図作成
      const diagramId = useSysMLStore.getState().createDiagram('Test Diagram', 'block');
      
      // ブロック追加
      const blockId = useSysMLStore.getState().addBlock('Test Block', 100, 200, 'block');
      
      // 検証
      const model = useSysMLStore.getState().currentModel;
      
      // モデル内のブロックをチェック
      expect(model?.blocks.length).toBe(1);
      expect(model?.blocks[0].id).toBe('test-uuid');
      expect(model?.blocks[0].name).toBe('Test Block');
      
      // 図内の要素をチェック
      const diagram = model?.diagrams[0];
      expect(diagram?.elements.length).toBe(1);
      expect(diagram?.elements[0].id).toBe('test-uuid');
      expect(diagram?.elements[0].name).toBe('Test Block');
      expect(diagram?.elements[0].position).toEqual({ x: 100, y: 200 });
      expect(diagram?.elements[0].size).toEqual({ width: 120, height: 80 });
      expect(diagram?.elements[0].type).toBe('block');
      expect(diagram?.elements[0].stereotype).toBe('block');
    });
    
    test('updateElement should update element properties in both model and diagram', () => {
      // モデル作成
      useSysMLStore.getState().createModel('Test Model');
      
      // 図作成
      const diagramId = useSysMLStore.getState().createDiagram('Test Diagram', 'block');
      
      // ブロック追加
      const blockId = useSysMLStore.getState().addBlock('Test Block', 100, 200, 'block');
      
      // 要素更新
      useSysMLStore.getState().updateElement(blockId, {
        name: 'Updated Block',
        stereotype: 'subsystem',
        position: { x: 150, y: 250 }
      });
      
      // 検証
      const model = useSysMLStore.getState().currentModel;
      
      // モデル内のブロックをチェック
      expect(model?.blocks[0].name).toBe('Updated Block');
      
      // 図内の要素をチェック
      const element = model?.diagrams[0].elements[0];
      expect(element?.name).toBe('Updated Block');
      expect(element?.stereotype).toBe('subsystem');
      expect(element?.position).toEqual({ x: 150, y: 250 });
    });
    
    test('deleteElement should remove the element from diagram and model', () => {
      // モデル作成
      useSysMLStore.getState().createModel('Test Model');
      
      // 図作成
      const diagramId = useSysMLStore.getState().createDiagram('Test Diagram', 'block');
      
      // ブロック追加
      const blockId = useSysMLStore.getState().addBlock('Test Block', 100, 200, 'block');
      
      // 要素削除
      useSysMLStore.getState().deleteElement(blockId);
      
      // 検証
      const model = useSysMLStore.getState().currentModel;
      expect(model?.blocks.length).toBe(0);
      expect(model?.diagrams[0].elements.length).toBe(0);
    });
  });
  
  describe('関係操作', () => {
    test('addConnection should add a relationship to the current diagram', () => {
      // モデル作成
      useSysMLStore.getState().createModel('Test Model');
      
      // 図作成
      const diagramId = useSysMLStore.getState().createDiagram('Test Diagram', 'block');
      
      // ブロック2つ追加
      const blockId1 = useSysMLStore.getState().addBlock('Block 1', 100, 200, 'block');
      const blockId2 = useSysMLStore.getState().addBlock('Block 2', 300, 200, 'block');
      
      // 接続追加
      const connectionId = useSysMLStore.getState().addConnection(
        blockId1, blockId2, 'contains', 'composition'
      );
      
      // 検証
      const model = useSysMLStore.getState().currentModel;
      const diagram = model?.diagrams[0];
      
      expect(diagram?.relationships.length).toBe(1);
      expect(diagram?.relationships[0].id).toBe('test-uuid');
      expect(diagram?.relationships[0].name).toBe('contains');
      expect(diagram?.relationships[0].type).toBe('composition');
      expect(diagram?.relationships[0].sourceId).toBe(blockId1);
      expect(diagram?.relationships[0].targetId).toBe(blockId2);
    });
    
    test('updateRelationship should update the relationship properties', () => {
      // モデル作成
      useSysMLStore.getState().createModel('Test Model');
      
      // 図作成
      const diagramId = useSysMLStore.getState().createDiagram('Test Diagram', 'block');
      
      // ブロック2つ追加
      const blockId1 = useSysMLStore.getState().addBlock('Block 1', 100, 200, 'block');
      const blockId2 = useSysMLStore.getState().addBlock('Block 2', 300, 200, 'block');
      
      // 接続追加
      const connectionId = useSysMLStore.getState().addConnection(
        blockId1, blockId2, 'contains', 'composition'
      );
      
      // 関係更新
      useSysMLStore.getState().updateRelationship(connectionId, {
        name: 'has',
        type: 'aggregation'
      });
      
      // 検証
      const model = useSysMLStore.getState().currentModel;
      const relationship = model?.diagrams[0].relationships[0];
      
      expect(relationship?.name).toBe('has');
      expect(relationship?.type).toBe('aggregation');
    });
    
    test('deleteRelationship should remove the relationship', () => {
      // モデル作成
      useSysMLStore.getState().createModel('Test Model');
      
      // 図作成
      const diagramId = useSysMLStore.getState().createDiagram('Test Diagram', 'block');
      
      // ブロック2つ追加
      const blockId1 = useSysMLStore.getState().addBlock('Block 1', 100, 200, 'block');
      const blockId2 = useSysMLStore.getState().addBlock('Block 2', 300, 200, 'block');
      
      // 接続追加
      const connectionId = useSysMLStore.getState().addConnection(
        blockId1, blockId2, 'contains', 'composition'
      );
      
      // 関係削除
      useSysMLStore.getState().deleteRelationship(connectionId);
      
      // 検証
      const model = useSysMLStore.getState().currentModel;
      expect(model?.diagrams[0].relationships.length).toBe(0);
      expect(model?.connections.length).toBe(0);
    });
  });
  
  describe('ポートとプロパティ操作', () => {
    test('addPort should add a port to a block', () => {
      // モデル作成とブロック追加
      useSysMLStore.getState().createModel('Test Model');
      const blockId = useSysMLStore.getState().addBlock('Test Block', 100, 200, 'block');
      
      // ポート追加
      const portId = useSysMLStore.getState().addPort(blockId, 'Test Port', 'Flow');
      
      // 検証
      const model = useSysMLStore.getState().currentModel;
      const block = model?.blocks[0];
      
      expect(block?.ports.length).toBe(1);
      expect(block?.ports[0].id).toBe('test-uuid');
      expect(block?.ports[0].name).toBe('Test Port');
      expect(block?.ports[0].typeName).toBe('Flow');
    });
    
    test('updatePort should update a port in a block', () => {
      // モデル作成とブロック・ポート追加
      useSysMLStore.getState().createModel('Test Model');
      const blockId = useSysMLStore.getState().addBlock('Test Block', 100, 200, 'block');
      const portId = useSysMLStore.getState().addPort(blockId, 'Test Port', 'Flow');
      
      // ポート更新
      useSysMLStore.getState().updatePort(blockId, portId, {
        name: 'Updated Port',
        typeName: 'Energy',
        direction: 'out'
      });
      
      // 検証
      const model = useSysMLStore.getState().currentModel;
      const port = model?.blocks[0].ports[0];
      
      expect(port?.name).toBe('Updated Port');
      expect(port?.typeName).toBe('Energy');
      expect(port?.direction).toBe('out');
    });
    
    test('addAttribute should add an attribute to a block', () => {
      // モデル作成とブロック追加
      useSysMLStore.getState().createModel('Test Model');
      const blockId = useSysMLStore.getState().addBlock('Test Block', 100, 200, 'block');
      
      // 属性追加
      const attributeId = useSysMLStore.getState().addAttribute(blockId, 'Test Attribute', 'String');
      
      // 検証
      const model = useSysMLStore.getState().currentModel;
      const block = model?.blocks[0];
      
      expect(block?.attributes.length).toBe(1);
      expect(block?.attributes[0].id).toBe('test-uuid');
      expect(block?.attributes[0].name).toBe('Test Attribute');
      expect(block?.attributes[0].typeName).toBe('String');
    });
    
    test('updateAttribute should update an attribute in a block', () => {
      // モデル作成とブロック・属性追加
      useSysMLStore.getState().createModel('Test Model');
      const blockId = useSysMLStore.getState().addBlock('Test Block', 100, 200, 'block');
      const attributeId = useSysMLStore.getState().addAttribute(blockId, 'Test Attribute', 'String');
      
      // 属性更新
      useSysMLStore.getState().updateAttribute(blockId, attributeId, {
        name: 'Updated Attribute',
        typeName: 'Number',
        defaultValue: 42
      });
      
      // 検証
      const model = useSysMLStore.getState().currentModel;
      const attribute = model?.blocks[0].attributes[0];
      
      expect(attribute?.name).toBe('Updated Attribute');
      expect(attribute?.typeName).toBe('Number');
      expect(attribute?.defaultValue).toBe(42);
    });
  });
  
  describe('UI操作', () => {
    test('setPropertyPanelOpen should update the panel state', () => {
      // パネル状態を閉じる
      useSysMLStore.getState().setPropertyPanelOpen(false);
      
      // 検証
      expect(useSysMLStore.getState().isPropertyPanelOpen).toBe(false);
      
      // パネル状態を開く
      useSysMLStore.getState().setPropertyPanelOpen(true);
      
      // 検証
      expect(useSysMLStore.getState().isPropertyPanelOpen).toBe(true);
    });
    
    test('setZoom should update the zoom level', () => {
      // ズームレベル設定
      useSysMLStore.getState().setZoom(1.5);
      
      // 検証
      expect(useSysMLStore.getState().zoom).toBe(1.5);
    });
  });
  
  describe('選択操作', () => {
    test('selectElement should update the selected element', () => {
      // 要素選択
      useSysMLStore.getState().selectElement('element-id', 'Element Name');
      
      // 検証
      expect(useSysMLStore.getState().selectedElementId).toBe('element-id');
      expect(useSysMLStore.getState().selectedElementName).toBe('Element Name');
      expect(useSysMLStore.getState().selectedRelationshipId).toBeNull();
      expect(useSysMLStore.getState().isPropertyPanelOpen).toBe(true);
    });
    
    test('selectRelationship should update the selected relationship', () => {
      // 関係選択
      useSysMLStore.getState().selectRelationship('relationship-id');
      
      // 検証
      expect(useSysMLStore.getState().selectedElementId).toBeNull();
      expect(useSysMLStore.getState().selectedElementName).toBeNull();
      expect(useSysMLStore.getState().selectedRelationshipId).toBe('relationship-id');
      expect(useSysMLStore.getState().isPropertyPanelOpen).toBe(true);
    });
    
    test('clearSelection should clear the selection state', () => {
      // 選択状態を設定
      useSysMLStore.setState({
        selectedElementId: 'element-id',
        selectedElementName: 'Element Name',
        selectedRelationshipId: null
      });
      
      // 選択をクリア
      useSysMLStore.getState().clearSelection();
      
      // 検証
      expect(useSysMLStore.getState().selectedElementId).toBeNull();
      expect(useSysMLStore.getState().selectedElementName).toBeNull();
      expect(useSysMLStore.getState().selectedRelationshipId).toBeNull();
    });
  });
});