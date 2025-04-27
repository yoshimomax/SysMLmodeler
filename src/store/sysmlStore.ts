import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

// KerML/SysML v2 基本クラスのインポート
import { Type } from '../model/kerml/Type';
import { Feature } from '../model/kerml/Feature';
import { Classifier } from '../model/kerml/Classifier';
import { Definition } from '../model/kerml/Definition';
import { PartDefinition } from '../model/sysml2/PartDefinition';
import { InterfaceDefinition } from '../model/sysml2/InterfaceDefinition';
import { ConnectionDefinition } from '../model/sysml2/ConnectionDefinition';
import { ActionUsage } from '../model/sysml2/ActionUsage';
import { PerformActionUsage } from '../model/sysml2/actions/PerformActionUsage';
import { IfActionUsage } from '../model/sysml2/actions/IfActionUsage';
import { LoopActionUsage } from '../model/sysml2/actions/LoopActionUsage';
import { FeatureObject } from '../model/kerml/Feature';

/**
 * モデル要素のユニオン型（Type からの継承ツリーに含まれる全ての要素）
 */
export type ModelElement = 
  | Type 
  | Feature 
  | Classifier 
  | Definition 
  | PartDefinition 
  | InterfaceDefinition 
  | ConnectionDefinition 
  | ActionUsage 
  | PerformActionUsage 
  | IfActionUsage 
  | LoopActionUsage;

/**
 * モデル間のリレーションシップの型
 */
export interface ModelRelationship {
  id: string;
  type: 'specialization' | 'featureMembership' | 'redefinition' | 'subclassification';
  sourceId: string;  // 関係の始点
  targetId: string;  // 関係の終点
  name?: string;     // オプショナルな名前
}

/**
 * モデルストアの状態インターフェース
 */
export interface SysMLModelState {
  // モデル要素とその関係の格納
  elements: Record<string, ModelElement>;
  relationships: Record<string, ModelRelationship>;
  
  // 選択状態の管理
  selectedElementId?: string;
  selectedRelationshipId?: string;
  
  // 履歴管理
  history: {
    past: Array<{
      elements: Record<string, ModelElement>;
      relationships: Record<string, ModelRelationship>;
    }>;
    future: Array<{
      elements: Record<string, ModelElement>;
      relationships: Record<string, ModelRelationship>;
    }>;
  };
  
  // 統一CRUD操作
  addElement: (element: ModelElement) => void;
  updateElement: (id: string, changes: Partial<ModelElement>) => void;
  removeElement: (id: string) => void;
  
  // 関係の操作
  addRelationship: (relationship: ModelRelationship) => void;
  updateRelationship: (id: string, changes: Partial<ModelRelationship>) => void;
  removeRelationship: (id: string) => void;
  
  // SysML固有の関係操作
  addSpecialization: (subId: string, superId: string) => void;
  addFeatureMembership: (ownerId: string, featureId: string) => void;
  addRedefinition: (redefinerId: string, redefinedId: string) => void;
  addSubclassification: (subclassId: string, superclassId: string) => void;
  
  // 選択操作
  selectElement: (id: string | undefined) => void;
  selectRelationship: (id: string | undefined) => void;
  
  // 履歴操作
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  // モデルの永続化
  getModelAsJson: () => string;
  loadModelFromJson: (json: string) => boolean;
  
  // モデルのリセットとサンプルデータ
  resetModel: () => void;
  initializeSampleModel: () => void;
}

/**
 * SysML v2モデル管理のためのZustandストア
 */
export const useSysMLModelStore = create<SysMLModelState>((set, get) => ({
  // 初期状態
  elements: {},
  relationships: {},
  history: {
    past: [],
    future: []
  },
  
  // 要素のCRUD操作
  addElement: (element: ModelElement) => {
    get().saveToHistory();
    set(state => ({
      elements: { ...state.elements, [element.id]: element }
    }));
  },
  
  updateElement: (id: string, changes: Partial<ModelElement>) => {
    get().saveToHistory();
    set(state => {
      const element = state.elements[id];
      if (!element) return state;
      
      // ディープコピーを作成するためにシリアライズと逆シリアライズを使用
      const updatedElement = { ...element, ...changes };
      
      return {
        elements: { ...state.elements, [id]: updatedElement }
      };
    });
  },
  
  removeElement: (id: string) => {
    get().saveToHistory();
    set(state => {
      const newElements = { ...state.elements };
      delete newElements[id];
      
      // 削除する要素に関連する関係も削除
      const newRelationships = { ...state.relationships };
      Object.keys(newRelationships).forEach(relId => {
        const rel = newRelationships[relId];
        if (rel.sourceId === id || rel.targetId === id) {
          delete newRelationships[relId];
        }
      });
      
      return {
        elements: newElements,
        relationships: newRelationships
      };
    });
  },
  
  // 関係のCRUD操作
  addRelationship: (relationship: ModelRelationship) => {
    get().saveToHistory();
    set(state => ({
      relationships: { ...state.relationships, [relationship.id]: relationship }
    }));
  },
  
  updateRelationship: (id: string, changes: Partial<ModelRelationship>) => {
    get().saveToHistory();
    set(state => {
      const relationship = state.relationships[id];
      if (!relationship) return state;
      
      return {
        relationships: {
          ...state.relationships,
          [id]: { ...relationship, ...changes }
        }
      };
    });
  },
  
  removeRelationship: (id: string) => {
    get().saveToHistory();
    set(state => {
      const newRelationships = { ...state.relationships };
      delete newRelationships[id];
      
      return { relationships: newRelationships };
    });
  },
  
  // SysML固有の関係操作
  addSpecialization: (subId: string, superId: string) => {
    get().saveToHistory();
    const relationship: ModelRelationship = {
      id: uuid(),
      type: 'specialization',
      sourceId: subId,
      targetId: superId
    };
    
    set(state => ({
      relationships: { ...state.relationships, [relationship.id]: relationship }
    }));
  },
  
  addFeatureMembership: (ownerId: string, featureId: string) => {
    get().saveToHistory();
    const relationship: ModelRelationship = {
      id: uuid(),
      type: 'featureMembership',
      sourceId: ownerId,
      targetId: featureId
    };
    
    set(state => ({
      relationships: { ...state.relationships, [relationship.id]: relationship }
    }));
    
    // Feature のオーナーIDを設定
    const feature = get().elements[featureId] as Feature;
    if (feature && 'ownerId' in feature) {
      feature.ownerId = ownerId;
      set(state => ({
        elements: { ...state.elements, [featureId]: feature }
      }));
    }
  },
  
  addRedefinition: (redefinerId: string, redefinedId: string) => {
    get().saveToHistory();
    const relationship: ModelRelationship = {
      id: uuid(),
      type: 'redefinition',
      sourceId: redefinerId,
      targetId: redefinedId
    };
    
    set(state => ({
      relationships: { ...state.relationships, [relationship.id]: relationship }
    }));
    
    // Featureの場合、redefinitionIdsを更新
    const redefiner = get().elements[redefinerId];
    if (redefiner && 'redefinitionIds' in redefiner) {
      const feature = redefiner as Feature;
      if (!feature.redefinitionIds.includes(redefinedId)) {
        feature.redefinitionIds.push(redefinedId);
        set(state => ({
          elements: { ...state.elements, [redefinerId]: feature }
        }));
      }
    }
  },
  
  addSubclassification: (subclassId: string, superclassId: string) => {
    get().saveToHistory();
    const relationship: ModelRelationship = {
      id: uuid(),
      type: 'subclassification',
      sourceId: subclassId,
      targetId: superclassId
    };
    
    set(state => ({
      relationships: { ...state.relationships, [relationship.id]: relationship }
    }));
  },
  
  // 選択操作
  selectElement: (id: string | undefined) => {
    set({ selectedElementId: id, selectedRelationshipId: undefined });
  },
  
  selectRelationship: (id: string | undefined) => {
    set({ selectedRelationshipId: id, selectedElementId: undefined });
  },
  
  // 履歴操作
  saveToHistory: () => {
    set(state => {
      const { elements, relationships } = state;
      // ディープコピーのためのシリアライズと逆シリアライズ
      const pastState = {
        elements: JSON.parse(JSON.stringify(elements)),
        relationships: JSON.parse(JSON.stringify(relationships))
      };
      
      return {
        history: {
          past: [...state.history.past, pastState],
          future: [] // 新しい履歴ポイントが作られたので未来はリセット
        }
      };
    });
  },
  
  undo: () => {
    set(state => {
      const { past, future } = state.history;
      
      if (past.length === 0) return state;
      
      const newPast = [...past];
      const previousState = newPast.pop();
      
      if (!previousState) return state;
      
      const currentState = {
        elements: state.elements,
        relationships: state.relationships
      };
      
      return {
        elements: previousState.elements,
        relationships: previousState.relationships,
        history: {
          past: newPast,
          future: [currentState, ...future]
        }
      };
    });
  },
  
  redo: () => {
    set(state => {
      const { past, future } = state.history;
      
      if (future.length === 0) return state;
      
      const newFuture = [...future];
      const nextState = newFuture.shift();
      
      if (!nextState) return state;
      
      const currentState = {
        elements: state.elements,
        relationships: state.relationships
      };
      
      return {
        elements: nextState.elements,
        relationships: nextState.relationships,
        history: {
          past: [...past, currentState],
          future: newFuture
        }
      };
    });
  },
  
  // モデルの永続化
  getModelAsJson: () => {
    const { elements, relationships } = get();
    
    // モデル要素をシリアライズ可能な形式に変換
    const serializedElements = Object.values(elements).map(element => {
      if ('toObject' in element && typeof element.toObject === 'function') {
        return (element as any).toObject();
      }
      return element;
    });
    
    const model = {
      elements: serializedElements,
      relationships: Object.values(relationships)
    };
    
    return JSON.stringify(model, null, 2);
  },
  
  loadModelFromJson: (json: string) => {
    try {
      const data = JSON.parse(json);
      
      // 要素の復元
      const elements: Record<string, ModelElement> = {};
      
      if (Array.isArray(data.elements)) {
        data.elements.forEach((elementData: FeatureObject) => {
          let element: ModelElement | undefined;
          
          switch (elementData.type) {
            case 'Type':
              element = Type.fromJSON(elementData);
              break;
            case 'Feature':
              element = Feature.fromJSON(elementData);
              break;
            case 'PartDefinition':
              element = PartDefinition.fromJSON(elementData);
              break;
            case 'InterfaceDefinition':
              element = InterfaceDefinition.fromJSON(elementData);
              break;
            case 'ConnectionDefinition':
              element = ConnectionDefinition.fromJSON(elementData);
              break;
            case 'ActionUsage':
              element = ActionUsage.fromJSON(elementData);
              break;
            case 'PerformActionUsage':
              element = PerformActionUsage.fromJSON(elementData);
              break;
            case 'IfActionUsage':
              element = IfActionUsage.fromJSON(elementData);
              break;
            case 'LoopActionUsage':
              element = LoopActionUsage.fromJSON(elementData);
              break;
            default:
              console.warn(`未知の要素タイプ: ${elementData.type}`);
          }
          
          if (element) {
            elements[element.id] = element;
          }
        });
      }
      
      // 関係の復元
      const relationships: Record<string, ModelRelationship> = {};
      
      if (Array.isArray(data.relationships)) {
        data.relationships.forEach((relData: any) => {
          const relationship: ModelRelationship = {
            id: relData.id || uuid(),
            type: relData.type,
            sourceId: relData.sourceId,
            targetId: relData.targetId,
            name: relData.name
          };
          
          relationships[relationship.id] = relationship;
        });
      }
      
      set({
        elements,
        relationships,
        history: {
          past: [],
          future: []
        }
      });
      
      return true;
    } catch (error) {
      console.error('モデルのJSONからの読み込みに失敗しました:', error);
      return false;
    }
  },
  
  // モデルのリセットとサンプルデータ
  resetModel: () => {
    set({
      elements: {},
      relationships: {},
      selectedElementId: undefined,
      selectedRelationshipId: undefined,
      history: {
        past: [],
        future: []
      }
    });
  },
  
  initializeSampleModel: () => {
    get().resetModel();
    
    // サンプル PartDefinition (System) を作成
    const system = new PartDefinition({
      name: 'System',
      description: 'Top-level system definition'
    });
    
    // Subsystem PartDefinition を作成
    const subsystem = new PartDefinition({
      name: 'Subsystem',
      description: 'A major subsystem'
    });
    
    // Interface を作成
    const interface1 = new InterfaceDefinition({
      name: 'SystemInterface',
      description: 'Main system interface'
    });
    
    // Connection を作成
    const connection = new ConnectionDefinition({
      name: 'SystemToSubsystem',
      description: 'Connection between system and subsystem'
    });
    
    // 基本アクションを作成
    const action = new ActionUsage({
      name: 'MainAction',
      description: 'Primary system action'
    });
    
    // IF アクションを作成
    const ifAction = new IfActionUsage({
      name: 'DecisionPoint',
      loopType: 'while',
      condition: 'system.isActive',
      branches: [
        {
          id: uuid(),
          condition: 'status == "ok"',
          actions: [],
          isElse: false
        },
        {
          id: uuid(),
          actions: [],
          isElse: true
        }
      ]
    });
    
    // 状態の初期化
    const initialElements: Record<string, ModelElement> = {
      [system.id]: system,
      [subsystem.id]: subsystem,
      [interface1.id]: interface1,
      [connection.id]: connection,
      [action.id]: action,
      [ifAction.id]: ifAction
    };
    
    // 関係を定義
    const initialRelationships: Record<string, ModelRelationship> = {};
    
    // 特殊化関係（specializationRelationship）
    const specRel: ModelRelationship = {
      id: uuid(),
      type: 'specialization',
      sourceId: subsystem.id,
      targetId: system.id,
      name: 'inherits'
    };
    initialRelationships[specRel.id] = specRel;
    
    // Feature Membership
    const featureMembership: ModelRelationship = {
      id: uuid(),
      type: 'featureMembership',
      sourceId: system.id,
      targetId: action.id,
      name: 'performs'
    };
    initialRelationships[featureMembership.id] = featureMembership;
    action.ownerId = system.id;
    
    // ストアを更新
    set({
      elements: initialElements,
      relationships: initialRelationships,
      history: {
        past: [],
        future: []
      }
    });
  }
}));