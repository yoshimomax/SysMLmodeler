import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// 新しいモデル要素のインポート
import { 
  BlockDefinition, 
  PortDefinition, 
  AttributeDefinition, 
  ConnectionDefinition,
  System,
  Subsystem,
  Component,
  Actor,
  StateMachine,
  State,
  Transition,
  DiagramProperties
} from '../model';

// ================================================
// インターフェース定義
// ================================================

export interface DiagramElement {
  id: string;
  name: string;
  type: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  stereotype?: string;
}

export interface DiagramRelationship {
  id: string;
  name: string;
  type: string;
  sourceId: string;
  targetId: string;
  vertices?: { x: number; y: number }[];
}

export interface Diagram {
  id: string;
  name: string;
  type: string;
  elements: DiagramElement[];
  relationships: DiagramRelationship[];
  properties?: DiagramProperties;
}

export interface SysMLModel {
  id: string;
  name: string;
  diagrams: Diagram[];
  blocks: BlockDefinition[];
  systems: System[];
  subsystems: Subsystem[];
  components: Component[];
  actors: Actor[];
  connections: ConnectionDefinition[];
  stateMachines: StateMachine[];
}

// ================================================
// ストア状態の型定義
// ================================================

interface SysMLStoreState {
  // モデル定義
  currentModel: SysMLModel | null;
  currentDiagramId: string | null;
  
  // 選択状態
  selectedElementId: string | null;
  selectedElementName: string | null;
  selectedRelationshipId: string | null;
  
  // ビュー状態
  isPropertyPanelOpen: boolean;
  zoom: number;
  
  // メソッド: モデル操作
  createModel: (name: string) => SysMLModel;
  loadModel: (model: SysMLModel) => void;
  saveModel: () => SysMLModel;
  clearModel: () => void;
  
  // メソッド: 図操作
  createDiagram: (name: string, type: string) => string;
  setCurrentDiagram: (diagramId: string) => void;
  
  // メソッド: 選択操作
  selectElement: (elementId: string, elementName: string) => void;
  selectRelationship: (relationshipId: string) => void;
  clearSelection: () => void;
  
  // メソッド: 要素操作
  addBlock: (name: string, x: number, y: number, stereotype?: string) => string;
  updateElement: (id: string, updates: Partial<DiagramElement>) => void;
  deleteElement: (id: string) => void;
  
  // メソッド: 関係操作
  addConnection: (
    sourceId: string, 
    targetId: string, 
    name?: string, 
    type?: string
  ) => string;
  updateRelationship: (id: string, updates: Partial<DiagramRelationship>) => void;
  deleteRelationship: (id: string) => void;
  
  // メソッド: 属性操作
  addAttribute: (blockId: string, name: string, type: string) => string;
  updateAttribute: (
    blockId: string,
    attributeId: string, 
    updates: Partial<AttributeDefinition>
  ) => void;
  deleteAttribute: (blockId: string, attributeId: string) => void;
  
  // メソッド: ポート操作
  addPort: (blockId: string, name: string, type: string) => string;
  updatePort: (
    blockId: string,
    portId: string, 
    updates: Partial<PortDefinition>
  ) => void;
  deletePort: (blockId: string, portId: string) => void;
  
  // メソッド: UI操作
  setPropertyPanelOpen: (isOpen: boolean) => void;
  setZoom: (zoom: number) => void;
}

// ================================================
// ストア実装
// ================================================

export const useSysMLStore = create<SysMLStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初期状態
        currentModel: null,
        currentDiagramId: null,
        selectedElementId: null,
        selectedElementName: null,
        selectedRelationshipId: null,
        isPropertyPanelOpen: true,
        zoom: 1,
        
        // モデル操作
        createModel: (name: string) => {
          const newModel: SysMLModel = {
            id: uuidv4(),
            name,
            diagrams: [],
            blocks: [],
            systems: [],
            subsystems: [],
            components: [],
            actors: [],
            connections: [],
            stateMachines: []
          };
          
          set({ currentModel: newModel });
          return newModel;
        },
        
        loadModel: (model: SysMLModel) => {
          set({ 
            currentModel: model,
            currentDiagramId: model.diagrams.length > 0 ? model.diagrams[0].id : null,
            selectedElementId: null,
            selectedElementName: null,
            selectedRelationshipId: null
          });
        },
        
        saveModel: () => {
          const model = get().currentModel;
          if (!model) {
            throw new Error('モデルが存在しません');
          }
          return model;
        },
        
        clearModel: () => {
          set({
            currentModel: null,
            currentDiagramId: null,
            selectedElementId: null,
            selectedElementName: null,
            selectedRelationshipId: null
          });
        },
        
        // 図操作
        createDiagram: (name: string, type: string) => {
          const { currentModel } = get();
          if (!currentModel) {
            throw new Error('モデルが存在しません');
          }
          
          const newDiagram: Diagram = {
            id: uuidv4(),
            name,
            type,
            elements: [],
            relationships: []
          };
          
          set({
            currentModel: {
              ...currentModel,
              diagrams: [...currentModel.diagrams, newDiagram]
            },
            currentDiagramId: newDiagram.id
          });
          
          return newDiagram.id;
        },
        
        setCurrentDiagram: (diagramId: string) => {
          const { currentModel } = get();
          if (!currentModel) {
            throw new Error('モデルが存在しません');
          }
          
          const diagramExists = currentModel.diagrams.some(d => d.id === diagramId);
          if (!diagramExists) {
            throw new Error('指定されたIDの図が見つかりません');
          }
          
          set({
            currentDiagramId: diagramId,
            selectedElementId: null,
            selectedElementName: null,
            selectedRelationshipId: null
          });
        },
        
        // 選択操作
        selectElement: (elementId: string, elementName: string) => {
          set({
            selectedElementId: elementId,
            selectedElementName: elementName,
            selectedRelationshipId: null,
            isPropertyPanelOpen: true
          });
        },
        
        selectRelationship: (relationshipId: string) => {
          set({
            selectedElementId: null,
            selectedElementName: null,
            selectedRelationshipId: relationshipId,
            isPropertyPanelOpen: true
          });
        },
        
        clearSelection: () => {
          set({
            selectedElementId: null,
            selectedElementName: null,
            selectedRelationshipId: null
          });
        },
        
        // 要素操作
        addBlock: (name: string, x: number, y: number, stereotype = 'block') => {
          const { currentModel, currentDiagramId } = get();
          if (!currentModel || !currentDiagramId) {
            throw new Error('モデルまたは現在の図が存在しません');
          }
          
          // 新しいブロック定義作成
          const blockId = uuidv4();
          const newBlock = new BlockDefinition(
            name,
            [],
            [],
            stereotype,
            blockId
          );
          
          // 図要素用のオブジェクト作成
          const diagramElement: DiagramElement = {
            id: blockId,
            name,
            type: 'block',
            position: { x, y },
            size: { width: 120, height: 80 },
            stereotype
          };
          
          // ステート更新
          set({
            currentModel: {
              ...currentModel,
              blocks: [...currentModel.blocks, newBlock],
              diagrams: currentModel.diagrams.map(diagram => 
                diagram.id === currentDiagramId
                  ? {
                      ...diagram,
                      elements: [...diagram.elements, diagramElement]
                    }
                  : diagram
              )
            }
          });
          
          return blockId;
        },
        
        updateElement: (id: string, updates: Partial<DiagramElement>) => {
          const { currentModel, currentDiagramId } = get();
          if (!currentModel || !currentDiagramId) {
            throw new Error('モデルまたは現在の図が存在しません');
          }
          
          // 図要素の更新
          const updatedDiagrams = currentModel.diagrams.map(diagram => 
            diagram.id === currentDiagramId
              ? {
                  ...diagram,
                  elements: diagram.elements.map(element => 
                    element.id === id
                      ? { ...element, ...updates }
                      : element
                  )
                }
              : diagram
          );
          
          // 対応するブロック定義の更新
          const updatedBlocks = currentModel.blocks.map(block => 
            block.id === id && updates.name
              ? { ...block, name: updates.name }
              : block
          );
          
          set({
            currentModel: {
              ...currentModel,
              diagrams: updatedDiagrams,
              blocks: updatedBlocks
            }
          });
        },
        
        deleteElement: (id: string) => {
          const { currentModel, currentDiagramId } = get();
          if (!currentModel || !currentDiagramId) {
            throw new Error('モデルまたは現在の図が存在しません');
          }
          
          // 図要素の削除
          const updatedDiagrams = currentModel.diagrams.map(diagram => 
            diagram.id === currentDiagramId
              ? {
                  ...diagram,
                  elements: diagram.elements.filter(element => element.id !== id),
                  // 削除された要素に関連する関係も削除
                  relationships: diagram.relationships.filter(
                    rel => rel.sourceId !== id && rel.targetId !== id
                  )
                }
              : diagram
          );
          
          // 対応するブロック定義の削除
          const updatedBlocks = currentModel.blocks.filter(block => block.id !== id);
          
          // 対応する接続の削除
          const updatedConnections = currentModel.connections.filter(
            conn => conn.sourcePortId !== id && conn.targetPortId !== id
          );
          
          set({
            currentModel: {
              ...currentModel,
              diagrams: updatedDiagrams,
              blocks: updatedBlocks,
              connections: updatedConnections
            },
            selectedElementId: null,
            selectedElementName: null
          });
        },
        
        // 関係操作
        addConnection: (sourceId: string, targetId: string, name = 'connection', type = 'association') => {
          const { currentModel, currentDiagramId } = get();
          if (!currentModel || !currentDiagramId) {
            throw new Error('モデルまたは現在の図が存在しません');
          }
          
          const connectionId = uuidv4();
          
          // 図関係用のオブジェクト作成
          const diagramRelationship: DiagramRelationship = {
            id: connectionId,
            name,
            type,
            sourceId,
            targetId
          };
          
          // ステート更新
          set({
            currentModel: {
              ...currentModel,
              diagrams: currentModel.diagrams.map(diagram => 
                diagram.id === currentDiagramId
                  ? {
                      ...diagram,
                      relationships: [...diagram.relationships, diagramRelationship]
                    }
                  : diagram
              )
            }
          });
          
          return connectionId;
        },
        
        updateRelationship: (id: string, updates: Partial<DiagramRelationship>) => {
          const { currentModel, currentDiagramId } = get();
          if (!currentModel || !currentDiagramId) {
            throw new Error('モデルまたは現在の図が存在しません');
          }
          
          // 図関係の更新
          const updatedDiagrams = currentModel.diagrams.map(diagram => 
            diagram.id === currentDiagramId
              ? {
                  ...diagram,
                  relationships: diagram.relationships.map(relationship => 
                    relationship.id === id
                      ? { ...relationship, ...updates }
                      : relationship
                  )
                }
              : diagram
          );
          
          set({
            currentModel: {
              ...currentModel,
              diagrams: updatedDiagrams
            }
          });
        },
        
        deleteRelationship: (id: string) => {
          const { currentModel, currentDiagramId } = get();
          if (!currentModel || !currentDiagramId) {
            throw new Error('モデルまたは現在の図が存在しません');
          }
          
          // 図関係の削除
          const updatedDiagrams = currentModel.diagrams.map(diagram => 
            diagram.id === currentDiagramId
              ? {
                  ...diagram,
                  relationships: diagram.relationships.filter(relationship => relationship.id !== id)
                }
              : diagram
          );
          
          // 対応する接続の削除
          const updatedConnections = currentModel.connections.filter(conn => conn.id !== id);
          
          set({
            currentModel: {
              ...currentModel,
              diagrams: updatedDiagrams,
              connections: updatedConnections
            },
            selectedRelationshipId: null
          });
        },
        
        // 属性操作
        addAttribute: (blockId: string, name: string, type: string) => {
          const { currentModel } = get();
          if (!currentModel) {
            throw new Error('モデルが存在しません');
          }
          
          const blockToUpdate = currentModel.blocks.find(block => block.id === blockId);
          if (!blockToUpdate) {
            throw new Error('指定されたIDのブロックが見つかりません');
          }
          
          const attributeId = uuidv4();
          const newAttribute = new AttributeDefinition(
            name,
            type,
            blockToUpdate,
            undefined,
            undefined,
            undefined,
            attributeId
          );
          
          // ブロックに属性を追加
          const updatedBlocks = currentModel.blocks.map(block => 
            block.id === blockId
              ? {
                  ...block,
                  attributes: [...block.attributes, newAttribute]
                }
              : block
          );
          
          set({
            currentModel: {
              ...currentModel,
              blocks: updatedBlocks
            }
          });
          
          return attributeId;
        },
        
        updateAttribute: (blockId: string, attributeId: string, updates: Partial<AttributeDefinition>) => {
          const { currentModel } = get();
          if (!currentModel) {
            throw new Error('モデルが存在しません');
          }
          
          // ブロックの属性を更新
          const updatedBlocks = currentModel.blocks.map(block => 
            block.id === blockId
              ? {
                  ...block,
                  attributes: block.attributes.map(attr => 
                    attr.id === attributeId
                      ? { ...attr, ...updates }
                      : attr
                  )
                }
              : block
          );
          
          set({
            currentModel: {
              ...currentModel,
              blocks: updatedBlocks
            }
          });
        },
        
        deleteAttribute: (blockId: string, attributeId: string) => {
          const { currentModel } = get();
          if (!currentModel) {
            throw new Error('モデルが存在しません');
          }
          
          // ブロックの属性を削除
          const updatedBlocks = currentModel.blocks.map(block => 
            block.id === blockId
              ? {
                  ...block,
                  attributes: block.attributes.filter(attr => attr.id !== attributeId)
                }
              : block
          );
          
          set({
            currentModel: {
              ...currentModel,
              blocks: updatedBlocks
            }
          });
        },
        
        // ポート操作
        addPort: (blockId: string, name: string, type: string) => {
          const { currentModel } = get();
          if (!currentModel) {
            throw new Error('モデルが存在しません');
          }
          
          const blockToUpdate = currentModel.blocks.find(block => block.id === blockId);
          if (!blockToUpdate) {
            throw new Error('指定されたIDのブロックが見つかりません');
          }
          
          const portId = uuidv4();
          const newPort = new PortDefinition(
            name,
            type,
            blockToUpdate,
            undefined,
            undefined,
            portId
          );
          
          // ブロックにポートを追加
          const updatedBlocks = currentModel.blocks.map(block => 
            block.id === blockId
              ? {
                  ...block,
                  ports: [...block.ports, newPort]
                }
              : block
          );
          
          set({
            currentModel: {
              ...currentModel,
              blocks: updatedBlocks
            }
          });
          
          return portId;
        },
        
        updatePort: (blockId: string, portId: string, updates: Partial<PortDefinition>) => {
          const { currentModel } = get();
          if (!currentModel) {
            throw new Error('モデルが存在しません');
          }
          
          // ブロックのポートを更新
          const updatedBlocks = currentModel.blocks.map(block => 
            block.id === blockId
              ? {
                  ...block,
                  ports: block.ports.map(port => 
                    port.id === portId
                      ? { ...port, ...updates }
                      : port
                  )
                }
              : block
          );
          
          set({
            currentModel: {
              ...currentModel,
              blocks: updatedBlocks
            }
          });
        },
        
        deletePort: (blockId: string, portId: string) => {
          const { currentModel } = get();
          if (!currentModel) {
            throw new Error('モデルが存在しません');
          }
          
          // ブロックのポートを削除
          const updatedBlocks = currentModel.blocks.map(block => 
            block.id === blockId
              ? {
                  ...block,
                  ports: block.ports.filter(port => port.id !== portId)
                }
              : block
          );
          
          // 削除されたポートに関連する接続も削除
          const updatedConnections = currentModel.connections.filter(
            conn => conn.sourcePortId !== portId && conn.targetPortId !== portId
          );
          
          set({
            currentModel: {
              ...currentModel,
              blocks: updatedBlocks,
              connections: updatedConnections
            }
          });
        },
        
        // UI操作
        setPropertyPanelOpen: (isOpen: boolean) => {
          set({ isPropertyPanelOpen: isOpen });
        },
        
        setZoom: (zoom: number) => {
          set({ zoom });
        }
      }),
      {
        name: 'sysml-store',
        // ローカルストレージに永続化する際に除外する状態
        partialize: (state) => ({
          currentModel: state.currentModel,
          // UIステートは保存しない
        })
      }
    ),
    { name: 'SysML-Store' }
  )
);