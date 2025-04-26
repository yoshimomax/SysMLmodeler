import { create } from 'zustand';
import { Block } from '../../model/Block';
import { Port } from '../../model/Port';
import { Property } from '../../model/Property';
import { Connection } from '../../model/Connection';
import { v4 as uuidv4 } from 'uuid';

interface ModelState {
  // モデルの状態
  blocks: Record<string, Block>;
  connections: Record<string, Connection>;
  
  // モデルの操作（ブロック）
  addBlock: (block: Block) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  
  // モデルの操作（接続）
  addConnection: (conn: Connection) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  removeConnection: (id: string) => void;
  
  // プロパティとポートの操作
  addPropertyToBlock: (blockId: string, property: Property) => void;
  updateProperty: (blockId: string, propertyId: string, updates: Partial<Property>) => void;
  removeProperty: (blockId: string, propertyId: string) => void;
  
  addPortToBlock: (blockId: string, port: Port) => void;
  updatePort: (blockId: string, portId: string, updates: Partial<Port>) => void;
  removePort: (blockId: string, portId: string) => void;
  
  // モデル全体の操作
  resetModel: () => void;
  initializeSampleModel: () => void;
  getModelAsJson: () => string;
  loadModelFromJson: (json: string) => void;
}

/**
 * SysML v2モデル管理のためのZustandストア
 */
export const useModelStore = create<ModelState>((set, get) => ({
  // 初期状態
  blocks: {},
  connections: {},
  
  // ブロック操作
  addBlock: (block: Block) => set(state => ({
    blocks: { ...state.blocks, [block.id]: block }
  })),
  
  updateBlock: (id: string, updates: Partial<Block>) => set(state => {
    const block = state.blocks[id];
    if (!block) return state;
    
    // 新しいブロックオブジェクトを作成
    const updatedBlock = { ...block };
    
    // 単純なプロパティの更新
    if (updates.name !== undefined) updatedBlock.name = updates.name;
    if (updates.stereotype !== undefined) updatedBlock.stereotype = updates.stereotype;
    if (updates.description !== undefined) updatedBlock.description = updates.description;
    
    // プロパティとポートの更新（もし含まれていれば）
    if (updates.properties !== undefined) updatedBlock.properties = updates.properties;
    if (updates.ports !== undefined) updatedBlock.ports = updates.ports;
    
    return {
      blocks: { ...state.blocks, [id]: updatedBlock }
    };
  }),
  
  removeBlock: (id: string) => set(state => {
    const newBlocks = { ...state.blocks };
    delete newBlocks[id];
    
    // このブロックに関連する接続も削除
    const newConnections = { ...state.connections };
    const ports = state.blocks[id]?.ports || [];
    const portIds = ports.map(port => port.id);
    
    Object.keys(newConnections).forEach(connId => {
      const conn = newConnections[connId];
      if (portIds.includes(conn.sourcePortId) || portIds.includes(conn.targetPortId)) {
        delete newConnections[connId];
      }
    });
    
    return {
      blocks: newBlocks,
      connections: newConnections
    };
  }),
  
  // 接続操作
  addConnection: (conn: Connection) => set(state => ({
    connections: { ...state.connections, [conn.id]: conn }
  })),
  
  updateConnection: (id: string, updates: Partial<Connection>) => set(state => {
    const connection = state.connections[id];
    if (!connection) return state;
    
    return {
      connections: {
        ...state.connections,
        [id]: { ...connection, ...updates }
      }
    };
  }),
  
  removeConnection: (id: string) => set(state => {
    const newConnections = { ...state.connections };
    delete newConnections[id];
    
    return { connections: newConnections };
  }),
  
  // プロパティ操作
  addPropertyToBlock: (blockId: string, property: Property) => set(state => {
    const block = state.blocks[blockId];
    if (!block) return state;
    
    // プロパティの所有者IDを設定
    property.ownerBlockId = blockId;
    
    // ブロックを更新
    const updatedBlock = new Block(
      block.name,
      [...block.properties, property],
      block.ports,
      block.stereotype,
      block.description,
      block.id
    );
    
    return {
      blocks: { ...state.blocks, [blockId]: updatedBlock }
    };
  }),
  
  updateProperty: (blockId: string, propertyId: string, updates: Partial<Property>) => set(state => {
    const block = state.blocks[blockId];
    if (!block) return state;
    
    // プロパティを見つける
    const propertyIndex = block.properties.findIndex(p => p.id === propertyId);
    if (propertyIndex === -1) return state;
    
    // プロパティのコピーを作成して更新
    const updatedProperties = [...block.properties];
    updatedProperties[propertyIndex] = {
      ...updatedProperties[propertyIndex],
      ...updates
    };
    
    // ブロックを更新
    const updatedBlock = new Block(
      block.name,
      updatedProperties,
      block.ports,
      block.stereotype,
      block.description,
      block.id
    );
    
    return {
      blocks: { ...state.blocks, [blockId]: updatedBlock }
    };
  }),
  
  removeProperty: (blockId: string, propertyId: string) => set(state => {
    const block = state.blocks[blockId];
    if (!block) return state;
    
    // プロパティを除外
    const updatedProperties = block.properties.filter(p => p.id !== propertyId);
    
    // ブロックを更新
    const updatedBlock = new Block(
      block.name,
      updatedProperties,
      block.ports,
      block.stereotype,
      block.description,
      block.id
    );
    
    return {
      blocks: { ...state.blocks, [blockId]: updatedBlock }
    };
  }),
  
  // ポート操作
  addPortToBlock: (blockId: string, port: Port) => set(state => {
    const block = state.blocks[blockId];
    if (!block) return state;
    
    // ポートの所有者IDを設定
    port.ownerBlockId = blockId;
    
    // ブロックを更新
    const updatedBlock = new Block(
      block.name,
      block.properties,
      [...block.ports, port],
      block.stereotype,
      block.description,
      block.id
    );
    
    return {
      blocks: { ...state.blocks, [blockId]: updatedBlock }
    };
  }),
  
  updatePort: (blockId: string, portId: string, updates: Partial<Port>) => set(state => {
    const block = state.blocks[blockId];
    if (!block) return state;
    
    // ポートを見つける
    const portIndex = block.ports.findIndex(p => p.id === portId);
    if (portIndex === -1) return state;
    
    // ポートのコピーを作成して更新
    const updatedPorts = [...block.ports];
    updatedPorts[portIndex] = {
      ...updatedPorts[portIndex],
      ...updates
    };
    
    // ブロックを更新
    const updatedBlock = new Block(
      block.name,
      block.properties,
      updatedPorts,
      block.stereotype,
      block.description,
      block.id
    );
    
    return {
      blocks: { ...state.blocks, [blockId]: updatedBlock }
    };
  }),
  
  removePort: (blockId: string, portId: string) => set(state => {
    const block = state.blocks[blockId];
    if (!block) return state;
    
    // ポートを除外
    const updatedPorts = block.ports.filter(p => p.id !== portId);
    
    // ブロックを更新
    const updatedBlock = new Block(
      block.name,
      block.properties,
      updatedPorts,
      block.stereotype,
      block.description,
      block.id
    );
    
    // このポートに関連する接続も削除
    const newConnections = { ...state.connections };
    Object.keys(newConnections).forEach(connId => {
      const conn = newConnections[connId];
      if (conn.sourcePortId === portId || conn.targetPortId === portId) {
        delete newConnections[connId];
      }
    });
    
    return {
      blocks: { ...state.blocks, [blockId]: updatedBlock },
      connections: newConnections
    };
  }),
  
  // モデル全体の操作
  resetModel: () => set({ blocks: {}, connections: {} }),
  
  initializeSampleModel: () => {
    // システムブロック作成
    const systemId = uuidv4();
    const system = new Block(
      'System',
      [
        new Property('name', 'string', systemId, 'MySystem'),
        new Property('version', 'string', systemId, '1.0.0')
      ],
      [
        new Port('output', 'DataFlow', systemId, 'out'),
        new Port('input', 'ControlFlow', systemId, 'in')
      ],
      'block',
      'メインシステム',
      systemId
    );
    
    // サブシステムブロック作成
    const subsystemId = uuidv4();
    const subsystem = new Block(
      'Subsystem',
      [
        new Property('priority', 'number', subsystemId, 1)
      ],
      [
        new Port('datain', 'DataFlow', subsystemId, 'in')
      ],
      'block',
      'サブシステム',
      subsystemId
    );
    
    // コンポーネントブロック作成
    const componentId = uuidv4();
    const component = new Block(
      'Component',
      [
        new Property('status', 'boolean', componentId, true)
      ],
      [
        new Port('control', 'ControlFlow', componentId, 'in')
      ],
      'block',
      'コンポーネント',
      componentId
    );
    
    // 接続作成
    const connection1 = new Connection(
      system.ports[0].id,     // System.output
      subsystem.ports[0].id,  // Subsystem.datain
      'flow',
      'dataFlow'
    );
    
    const connection2 = new Connection(
      system.ports[1].id,     // System.input
      component.ports[0].id,  // Component.control
      'connector',
      'controlFlow'
    );
    
    // ストアに追加
    set({
      blocks: {
        [system.id]: system,
        [subsystem.id]: subsystem,
        [component.id]: component
      },
      connections: {
        [connection1.id]: connection1,
        [connection2.id]: connection2
      }
    });
  },
  
  getModelAsJson: () => {
    const { blocks, connections } = get();
    
    // 単純な構造に変換
    const simplifiedModel = {
      blocks: Object.values(blocks).map(block => block.toObject()),
      connections: Object.values(connections).map(conn => conn.toObject())
    };
    
    return JSON.stringify(simplifiedModel, null, 2);
  },
  
  loadModelFromJson: (json: string) => {
    try {
      const data = JSON.parse(json);
      
      // ブロックを再構築
      const blocks: Record<string, Block> = {};
      
      // まずプロパティとポートなしでブロックを作成
      if (Array.isArray(data.blocks)) {
        data.blocks.forEach((blockData: any) => {
          const block = new Block(
            blockData.name,
            [],
            [],
            blockData.stereotype,
            blockData.description,
            blockData.id
          );
          blocks[block.id] = block;
        });
        
        // 次にプロパティとポートを追加
        data.blocks.forEach((blockData: any) => {
          const block = blocks[blockData.id];
          
          if (block) {
            // プロパティを追加
            if (Array.isArray(blockData.properties)) {
              blockData.properties.forEach((propData: any) => {
                const property = new Property(
                  propData.name,
                  propData.type,
                  block.id,
                  propData.value,
                  propData.multiplicity,
                  propData.defaultValue,
                  propData.description,
                  propData.id
                );
                block.addProperty(property);
              });
            }
            
            // ポートを追加
            if (Array.isArray(blockData.ports)) {
              blockData.ports.forEach((portData: any) => {
                const port = new Port(
                  portData.name,
                  portData.type,
                  block.id,
                  portData.direction,
                  portData.description,
                  portData.id
                );
                if (portData.position) {
                  port.position = portData.position;
                }
                block.addPort(port);
              });
            }
          }
        });
      }
      
      // 接続を再構築
      const connections: Record<string, Connection> = {};
      
      if (Array.isArray(data.connections)) {
        data.connections.forEach((connData: any) => {
          const connection = new Connection(
            connData.sourcePortId,
            connData.targetPortId,
            connData.stereotype,
            connData.name,
            connData.description,
            connData.itemType,
            connData.id
          );
          
          if (connData.vertices) {
            connection.vertices = connData.vertices;
          }
          
          connections[connection.id] = connection;
        });
      }
      
      set({ blocks, connections });
      
      return true;
    } catch (error) {
      console.error('モデルのJSONからの読み込みに失敗しました:', error);
      return false;
    }
  }
}));