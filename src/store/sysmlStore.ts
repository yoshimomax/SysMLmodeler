import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// モデル要素の基本型
export interface ModelElement {
  id: string;
  name: string;
  type: string;
  [key: string]: any;
}

// モデル関係の基本型 
export interface ModelRelationship {
  id: string;
  type: string;
  sourceId: string;
  targetId: string;
  [key: string]: any;
}

// 操作履歴アイテムの基本型
interface HistoryItem {
  type: 'add' | 'update' | 'remove' | 'addRelationship' | 'updateRelationship' | 'removeRelationship';
  data: any;
  reverse: () => void;
  forward: () => void;
}

// SysMLモデルストアの状態型
export interface SysMLModelState {
  // データストア
  elements: Record<string, ModelElement>;
  relationships: Record<string, ModelRelationship>;
  
  // UI状態
  selectedElementId?: string;
  selectedRelationshipId?: string;
  
  // 操作履歴
  history: HistoryItem[];
  historyIndex: number;
  
  // 基本CRUD操作
  addElement: (element: ModelElement) => void;
  updateElement: (id: string, updates: Partial<ModelElement>) => void;
  removeElement: (id: string) => void;
  
  addRelationship: (relationship: ModelRelationship) => void;
  updateRelationship: (id: string, updates: Partial<ModelRelationship>) => void;
  removeRelationship: (id: string) => void;
  
  // SysML固有関係操作
  addSpecialization: (sourceId: string, targetId: string) => void;
  addFeatureMembership: (ownerId: string, featureId: string) => void;
  
  // UI操作
  setSelectedElement: (id: string | undefined) => void;
  setSelectedRelationship: (id: string | undefined) => void;
  
  // 履歴操作
  undo: () => void;
  redo: () => void;
  
  // モデル全体操作
  resetModel: () => void;
  initializeSampleModel: () => void;
  getModelAsJson: () => string;
  loadModelFromJson: (json: string) => void;
}

// SysMLモデルを管理するZustandストア
export const useSysMLModelStore = create<SysMLModelState>((set, get) => ({
  elements: {},
  relationships: {},
  selectedElementId: undefined,
  selectedRelationshipId: undefined,
  history: [],
  historyIndex: -1,
  
  // 基本CRUD操作の実装
  addElement: (element: ModelElement) => {
    // IDが指定されていない場合は生成
    const elementWithId = {
      ...element,
      id: element.id || uuidv4()
    };
    
    set(state => {
      const newState = {
        ...state,
        elements: {
          ...state.elements,
          [elementWithId.id]: elementWithId
        }
      };
      
      // 履歴への追加
      const historyItem: HistoryItem = {
        type: 'add',
        data: { element: elementWithId },
        reverse: () => get().removeElement(elementWithId.id),
        forward: () => get().addElement(elementWithId)
      };
      
      return {
        ...newState,
        history: [...state.history.slice(0, state.historyIndex + 1), historyItem],
        historyIndex: state.historyIndex + 1
      };
    });
    
    return elementWithId.id;
  },
  
  updateElement: (id: string, updates: Partial<ModelElement>) => {
    const currentElement = get().elements[id];
    if (!currentElement) return;
    
    const originalElement = { ...currentElement };
    const updatedElement = { ...currentElement, ...updates };
    
    set(state => {
      const newState = {
        ...state,
        elements: {
          ...state.elements,
          [id]: updatedElement
        }
      };
      
      // 履歴への追加
      const historyItem: HistoryItem = {
        type: 'update',
        data: { id, updates, original: originalElement },
        reverse: () => get().updateElement(id, originalElement),
        forward: () => get().updateElement(id, updatedElement)
      };
      
      return {
        ...newState,
        history: [...state.history.slice(0, state.historyIndex + 1), historyItem],
        historyIndex: state.historyIndex + 1
      };
    });
  },
  
  removeElement: (id: string) => {
    const elementToRemove = get().elements[id];
    if (!elementToRemove) return;
    
    // この要素を参照しているリレーションシップを検索
    const relatedRelationships = Object.entries(get().relationships)
      .filter(([, rel]) => rel.sourceId === id || rel.targetId === id)
      .map(([relId, rel]) => ({ id: relId, relationship: rel }));
    
    set(state => {
      // 要素を削除した新しい状態
      const newElements = { ...state.elements };
      delete newElements[id];
      
      // 関連するリレーションシップも削除
      const newRelationships = { ...state.relationships };
      relatedRelationships.forEach(({ id: relId }) => {
        delete newRelationships[relId];
      });
      
      const newState = {
        ...state,
        elements: newElements,
        relationships: newRelationships
      };
      
      // 履歴への追加
      const historyItem: HistoryItem = {
        type: 'remove',
        data: { element: elementToRemove, relatedRelationships },
        reverse: () => {
          // 要素を復元
          get().addElement(elementToRemove);
          // 関連リレーションシップも復元
          relatedRelationships.forEach(({ relationship }) => {
            get().addRelationship(relationship);
          });
        },
        forward: () => get().removeElement(id)
      };
      
      return {
        ...newState,
        history: [...state.history.slice(0, state.historyIndex + 1), historyItem],
        historyIndex: state.historyIndex + 1
      };
    });
  },
  
  addRelationship: (relationship: ModelRelationship) => {
    // IDが指定されていない場合は生成
    const relationshipWithId = {
      ...relationship,
      id: relationship.id || uuidv4()
    };
    
    set(state => {
      const newState = {
        ...state,
        relationships: {
          ...state.relationships,
          [relationshipWithId.id]: relationshipWithId
        }
      };
      
      // 履歴への追加
      const historyItem: HistoryItem = {
        type: 'addRelationship',
        data: { relationship: relationshipWithId },
        reverse: () => get().removeRelationship(relationshipWithId.id),
        forward: () => get().addRelationship(relationshipWithId)
      };
      
      return {
        ...newState,
        history: [...state.history.slice(0, state.historyIndex + 1), historyItem],
        historyIndex: state.historyIndex + 1
      };
    });
    
    return relationshipWithId.id;
  },
  
  updateRelationship: (id: string, updates: Partial<ModelRelationship>) => {
    const currentRelationship = get().relationships[id];
    if (!currentRelationship) return;
    
    const originalRelationship = { ...currentRelationship };
    const updatedRelationship = { ...currentRelationship, ...updates };
    
    set(state => {
      const newState = {
        ...state,
        relationships: {
          ...state.relationships,
          [id]: updatedRelationship
        }
      };
      
      // 履歴への追加
      const historyItem: HistoryItem = {
        type: 'updateRelationship',
        data: { id, updates, original: originalRelationship },
        reverse: () => get().updateRelationship(id, originalRelationship),
        forward: () => get().updateRelationship(id, updatedRelationship)
      };
      
      return {
        ...newState,
        history: [...state.history.slice(0, state.historyIndex + 1), historyItem],
        historyIndex: state.historyIndex + 1
      };
    });
  },
  
  removeRelationship: (id: string) => {
    const relationshipToRemove = get().relationships[id];
    if (!relationshipToRemove) return;
    
    set(state => {
      const newRelationships = { ...state.relationships };
      delete newRelationships[id];
      
      const newState = {
        ...state,
        relationships: newRelationships
      };
      
      // 履歴への追加
      const historyItem: HistoryItem = {
        type: 'removeRelationship',
        data: { relationship: relationshipToRemove },
        reverse: () => get().addRelationship(relationshipToRemove),
        forward: () => get().removeRelationship(id)
      };
      
      return {
        ...newState,
        history: [...state.history.slice(0, state.historyIndex + 1), historyItem],
        historyIndex: state.historyIndex + 1
      };
    });
  },
  
  // SysML固有関係操作
  addSpecialization: (sourceId: string, targetId: string) => {
    const specialization: ModelRelationship = {
      id: uuidv4(),
      type: 'Specialization',
      sourceId,
      targetId,
      label: 'specializes'
    };
    
    return get().addRelationship(specialization);
  },
  
  addFeatureMembership: (ownerId: string, featureId: string) => {
    const membership: ModelRelationship = {
      id: uuidv4(),
      type: 'FeatureMembership',
      sourceId: ownerId,
      targetId: featureId,
      label: 'features'
    };
    
    return get().addRelationship(membership);
  },
  
  // UI操作
  setSelectedElement: (id: string | undefined) => {
    set({ 
      selectedElementId: id,
      selectedRelationshipId: undefined  // 要素選択時はリレーションシップ選択を解除
    });
  },
  
  setSelectedRelationship: (id: string | undefined) => {
    set({ 
      selectedRelationshipId: id,
      selectedElementId: undefined  // リレーションシップ選択時は要素選択を解除
    });
  },
  
  // 履歴操作
  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < 0) return;
    
    const item = history[historyIndex];
    item.reverse();
    
    set({ historyIndex: historyIndex - 1 });
  },
  
  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    
    const item = history[historyIndex + 1];
    item.forward();
    
    set({ historyIndex: historyIndex + 1 });
  },
  
  // モデル全体操作
  resetModel: () => {
    set({
      elements: {},
      relationships: {},
      selectedElementId: undefined,
      selectedRelationshipId: undefined,
      history: [],
      historyIndex: -1
    });
  },
  
  initializeSampleModel: () => {
    // いったんリセット
    get().resetModel();
    
    // サンプルモデル要素の作成
    const system = {
      id: 'sys1',
      name: 'Vehicle',
      type: 'PartDefinition',
      description: 'A sample vehicle system'
    };
    
    const engine = {
      id: 'eng1',
      name: 'Engine',
      type: 'PartDefinition',
      description: 'Vehicle engine'
    };
    
    const transmission = {
      id: 'trans1',
      name: 'Transmission',
      type: 'PartDefinition',
      description: 'Power transmission system'
    };
    
    const engineInterface = {
      id: 'engIf1',
      name: 'EnginePower',
      type: 'InterfaceDefinition',
      description: 'Engine power interface'
    };
    
    const stateOff = {
      id: 'state1',
      name: 'Off',
      type: 'StateDefinition',
      description: 'Engine off state'
    };
    
    const stateIdle = {
      id: 'state2',
      name: 'Idle',
      type: 'StateDefinition',
      description: 'Engine idle state'
    };
    
    const stateRunning = {
      id: 'state3',
      name: 'Running',
      type: 'StateDefinition',
      description: 'Engine running state'
    };
    
    // 要素の追加
    get().addElement(system);
    get().addElement(engine);
    get().addElement(transmission);
    get().addElement(engineInterface);
    get().addElement(stateOff);
    get().addElement(stateIdle);
    get().addElement(stateRunning);
    
    // 関係の追加
    get().addFeatureMembership('sys1', 'eng1');
    get().addFeatureMembership('sys1', 'trans1');
    get().addRelationship({
      id: 'conn1',
      type: 'ConnectionUsage',
      sourceId: 'eng1',
      targetId: 'trans1',
      label: 'connects',
      description: 'Power connection'
    });
    
    // 状態間の遷移
    get().addRelationship({
      id: 'trans1',
      type: 'Transition',
      sourceId: 'state1',
      targetId: 'state2',
      label: 'start',
      description: 'Engine start transition'
    });
    
    get().addRelationship({
      id: 'trans2',
      type: 'Transition',
      sourceId: 'state2',
      targetId: 'state3',
      label: 'accelerate',
      description: 'Engine acceleration'
    });
    
    get().addRelationship({
      id: 'trans3',
      type: 'Transition',
      sourceId: 'state3',
      targetId: 'state1',
      label: 'stop',
      description: 'Engine stop'
    });
  },
  
  getModelAsJson: () => {
    const { elements, relationships } = get();
    return JSON.stringify({ elements, relationships }, null, 2);
  },
  
  loadModelFromJson: (json: string) => {
    try {
      const { elements, relationships } = JSON.parse(json);
      
      // モデルをリセット
      get().resetModel();
      
      // 要素を追加
      Object.values(elements).forEach(element => {
        get().addElement(element as ModelElement);
      });
      
      // 関係を追加
      Object.values(relationships).forEach(relationship => {
        get().addRelationship(relationship as ModelRelationship);
      });
    } catch (error) {
      console.error('Failed to load model from JSON:', error);
      throw new Error(`Failed to load model: ${error}`);
    }
  }
}));

// ストアのサブスクリプション機能を追加
(useSysMLModelStore as any).subscribe = (callback: () => void) => {
  let previousState = useSysMLModelStore.getState();
  
  return useSysMLModelStore.subscribe(state => {
    if (state !== previousState) {
      previousState = state;
      callback();
    }
  });
};