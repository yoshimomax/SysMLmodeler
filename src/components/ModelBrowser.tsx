/**
 * ModelBrowser
 * SysML v2モデル要素を階層的に表示するコンポーネント
 */
import React, { useState, useEffect } from 'react';
import { SysMLModel, Element, Relationship, TreeItemData } from '@/types';
import { useAppStore } from '@/lib/store';
import { modelEvents } from '../../shared/consistency';
import TreeItem from '@/components/TreeItem';

// モデル更新のペイロードタイプ定義
interface ModelUpdatePayload {
  type: 'add' | 'delete' | 'update' | 'load';
  element?: Element;
  relationship?: Relationship;
  model?: {
    id: number;
    filename: string;
    model: SysMLModel;
  };
}

/**
 * SysMLモデル階層をツリー形式で表示するコンポーネント
 */
export default function ModelBrowser() {
  // ツリーデータの状態
  const [treeData, setTreeData] = useState<TreeItemData[]>([]);
  
  // アプリケーションの状態
  const { 
    currentModel,
    setSelectedElement,
    setCurrentView
  } = useAppStore();
  
  /**
   * モデルからツリーデータを構築する
   * @param model SysMLモデル
   * @returns ツリーデータ構造
   */
  const buildTreeData = (model: SysMLModel | null): TreeItemData[] => {
    if (!model) return [];
    
    // パッケージやフォルダーのツリーアイテム
    const packageItems: TreeItemData[] = [];
    
    // 最上位の「モデル」ノード
    const rootItem: TreeItemData = {
      id: model.id,
      name: model.name || 'モデル',
      type: 'folder',
      icon: 'model_training',
      expanded: true,
      children: []
    };
    
    // ダイアグラムフォルダ
    if (model.diagrams && model.diagrams.length > 0) {
      const diagramFolder: TreeItemData = {
        id: 'diagrams',
        name: 'ダイアグラム',
        type: 'folder',
        icon: 'insert_chart',
        expanded: true,
        children: model.diagrams.map(diagram => ({
          id: diagram.id,
          name: diagram.name,
          type: 'file',
          icon: 'auto_awesome_motion',
        }))
      };
      rootItem.children?.push(diagramFolder);
    }
    
    // 要素フォルダ
    if (model.elements && model.elements.length > 0) {
      // 要素をタイプごとに分類
      const elementsByType: Record<string, Element[]> = {};
      
      model.elements.forEach(element => {
        const type = element.type;
        if (!elementsByType[type]) {
          elementsByType[type] = [];
        }
        elementsByType[type].push(element);
      });
      
      // タイプごとにフォルダを作成
      Object.entries(elementsByType).forEach(([type, elements]) => {
        const typeFolder: TreeItemData = {
          id: `type-${type}`,
          name: getTypeFolderName(type),
          type: 'folder',
          icon: getTypeIcon(type),
          expanded: false,
          children: elements.map(element => ({
            id: element.id,
            name: element.name,
            type: 'file',
            icon: getTypeIcon(element.type),
          }))
        };
        rootItem.children?.push(typeFolder);
      });
    }
    
    // 関係フォルダ
    if (model.relationships && model.relationships.length > 0) {
      const relationshipFolder: TreeItemData = {
        id: 'relationships',
        name: '関係',
        type: 'folder',
        icon: 'share',
        expanded: false,
        children: model.relationships.map(relationship => ({
          id: relationship.id,
          name: relationship.name || `${relationship.type} (${relationship.sourceId}-${relationship.targetId})`,
          type: 'file',
          icon: getRelationshipIcon(relationship.type),
        }))
      };
      rootItem.children?.push(relationshipFolder);
    }
    
    return [rootItem];
  };
  
  /**
   * 要素タイプからフォルダ名を取得
   */
  const getTypeFolderName = (type: string): string => {
    const typeNames: Record<string, string> = {
      'block': 'ブロック',
      'part': 'パート',
      'package': 'パッケージ',
      'action': 'アクション',
      'activity': 'アクティビティ',
      'state': '状態',
      'requirement': '要求',
      'port': 'ポート',
      'interface': 'インターフェース'
    };
    
    return typeNames[type] || type;
  };
  
  /**
   * 要素タイプからアイコン名を取得
   */
  const getTypeIcon = (type: string): string => {
    const typeIcons: Record<string, string> = {
      'block': 'view_module',
      'part': 'widgets',
      'package': 'folder',
      'action': 'bolt',
      'activity': 'call_split',
      'state': 'flip_camera_android',
      'requirement': 'assignment',
      'port': 'power_input',
      'interface': 'api'
    };
    
    return typeIcons[type] || 'description';
  };
  
  /**
   * 関係タイプからアイコン名を取得
   */
  const getRelationshipIcon = (type: string): string => {
    const relationshipIcons: Record<string, string> = {
      'association': 'arrow_forward',
      'composition': 'device_hub',
      'aggregation': 'join_full',
      'inheritance': 'call_merge',
      'dependency': 'arrow_right_alt',
      'allocation': 'compare_arrows'
    };
    
    return relationshipIcons[type] || 'timeline';
  };
  
  /**
   * 初期化：現在のモデルからツリーデータを構築
   */
  useEffect(() => {
    // 現在のモデルからツリーデータを構築
    const tree = buildTreeData(currentModel);
    setTreeData(tree);
  }, [currentModel]);
  
  /**
   * モデル更新イベントを購読
   */
  useEffect(() => {
    const handleModelUpdate = (payload: ModelUpdatePayload) => {
      console.log('ModelBrowser: モデル更新イベント受信', payload);
      
      // モデルのロード完了イベント
      if (payload.type === 'load' && payload.model) {
        // モデル全体を再構築
        const tree = buildTreeData(payload.model.model);
        setTreeData(tree);
        return;
      }
      
      // 要素の追加/更新/削除
      if (payload.element) {
        switch(payload.type) {
          case 'add':
            setTreeData(prev => addNodeToTree(prev, payload.element!));
            break;
          case 'delete':
            setTreeData(prev => removeNodeFromTree(prev, payload.element!.id));
            break;
          case 'update':
            setTreeData(prev => updateNodeInTree(prev, payload.element!));
            break;
        }
      }
      
      // 関係の追加/更新/削除
      if (payload.relationship) {
        switch(payload.type) {
          case 'add':
            setTreeData(prev => addRelationshipToTree(prev, payload.relationship!));
            break;
          case 'delete':
            setTreeData(prev => removeNodeFromTree(prev, payload.relationship!.id));
            break;
          case 'update':
            setTreeData(prev => updateRelationshipInTree(prev, payload.relationship!));
            break;
        }
      }
    };
    
    // イベント登録
    modelEvents.on('model:update', handleModelUpdate);
    
    // クリーンアップ
    return () => {
      modelEvents.off('model:update', handleModelUpdate);
    };
  }, []);
  
  /**
   * ツリーに新しい要素ノードを追加
   */
  const addNodeToTree = (items: TreeItemData[], element: Element): TreeItemData[] => {
    // ディープコピー
    const newItems = JSON.parse(JSON.stringify(items));
    
    // 要素タイプに対応するフォルダを検索
    const rootItem = newItems[0];
    if (!rootItem || !rootItem.children) return newItems;
    
    // タイプフォルダのIDを特定
    const typeFolderId = `type-${element.type}`;
    
    // 対応するタイプフォルダを検索
    const typeFolder = rootItem.children.find(child => child.id === typeFolderId);
    
    if (typeFolder) {
      // 既存のタイプフォルダに追加
      if (!typeFolder.children) {
        typeFolder.children = [];
      }
      
      // 新しい要素をフォルダに追加
      typeFolder.children.push({
        id: element.id,
        name: element.name,
        type: 'file',
        icon: getTypeIcon(element.type)
      });
    } else {
      // タイプフォルダが存在しない場合は新規作成
      const newTypeFolder: TreeItemData = {
        id: typeFolderId,
        name: getTypeFolderName(element.type),
        type: 'folder',
        icon: getTypeIcon(element.type),
        expanded: true,
        children: [{
          id: element.id,
          name: element.name,
          type: 'file',
          icon: getTypeIcon(element.type)
        }]
      };
      
      rootItem.children.push(newTypeFolder);
    }
    
    return newItems;
  };
  
  /**
   * ツリーに新しい関係ノードを追加
   */
  const addRelationshipToTree = (items: TreeItemData[], relationship: Relationship): TreeItemData[] => {
    // ディープコピー
    const newItems = JSON.parse(JSON.stringify(items));
    
    // ルートアイテム取得
    const rootItem = newItems[0];
    if (!rootItem || !rootItem.children) return newItems;
    
    // 関係フォルダを検索
    let relationshipFolder = rootItem.children.find(child => child.id === 'relationships');
    
    if (relationshipFolder) {
      // 既存の関係フォルダに追加
      if (!relationshipFolder.children) {
        relationshipFolder.children = [];
      }
      
      // 新しい関係をフォルダに追加
      relationshipFolder.children.push({
        id: relationship.id,
        name: relationship.name || `${relationship.type} (${relationship.sourceId}-${relationship.targetId})`,
        type: 'file',
        icon: getRelationshipIcon(relationship.type)
      });
    } else {
      // 関係フォルダが存在しない場合は新規作成
      relationshipFolder = {
        id: 'relationships',
        name: '関係',
        type: 'folder',
        icon: 'share',
        expanded: true,
        children: [{
          id: relationship.id,
          name: relationship.name || `${relationship.type} (${relationship.sourceId}-${relationship.targetId})`,
          type: 'file',
          icon: getRelationshipIcon(relationship.type)
        }]
      };
      
      rootItem.children.push(relationshipFolder);
    }
    
    return newItems;
  };
  
  /**
   * ツリーから指定IDのノードを削除
   */
  const removeNodeFromTree = (items: TreeItemData[], id: string): TreeItemData[] => {
    // ディープコピー
    const newItems = JSON.parse(JSON.stringify(items));
    
    // 再帰的に検索と削除を行う関数
    const removeNode = (nodes: TreeItemData[]): boolean => {
      // このレベルで該当ノードを探す
      const index = nodes.findIndex(node => node.id === id);
      if (index !== -1) {
        // ノードを見つけたら削除
        nodes.splice(index, 1);
        return true;
      }
      
      // 子ノードを再帰的に検索
      for (const node of nodes) {
        if (node.children && removeNode(node.children)) {
          // 子要素が削除された場合、空になったフォルダを処理
          if (node.children.length === 0 && node.id.startsWith('type-')) {
            // 空のタイプフォルダを削除するロジックはここに追加可能
          }
          return true;
        }
      }
      
      return false;
    };
    
    removeNode(newItems);
    return newItems;
  };
  
  /**
   * ツリー内の要素ノードを更新
   */
  const updateNodeInTree = (items: TreeItemData[], element: Element): TreeItemData[] => {
    // ディープコピー
    const newItems = JSON.parse(JSON.stringify(items));
    
    // 再帰的に検索と更新を行う関数
    const updateNode = (nodes: TreeItemData[]): boolean => {
      // このレベルで該当ノードを探す
      const node = nodes.find(node => node.id === element.id);
      if (node) {
        // ノードを見つけたら更新
        node.name = element.name;
        return true;
      }
      
      // 子ノードを再帰的に検索
      for (const node of nodes) {
        if (node.children && updateNode(node.children)) {
          return true;
        }
      }
      
      return false;
    };
    
    updateNode(newItems);
    return newItems;
  };
  
  /**
   * ツリー内の関係ノードを更新
   */
  const updateRelationshipInTree = (items: TreeItemData[], relationship: Relationship): TreeItemData[] => {
    // ディープコピー
    const newItems = JSON.parse(JSON.stringify(items));
    
    // 再帰的に検索と更新を行う関数
    const updateNode = (nodes: TreeItemData[]): boolean => {
      // このレベルで該当ノードを探す
      const node = nodes.find(node => node.id === relationship.id);
      if (node) {
        // ノードを見つけたら更新
        node.name = relationship.name || `${relationship.type} (${relationship.sourceId}-${relationship.targetId})`;
        return true;
      }
      
      // 子ノードを再帰的に検索
      for (const node of nodes) {
        if (node.children && updateNode(node.children)) {
          return true;
        }
      }
      
      return false;
    };
    
    updateNode(newItems);
    return newItems;
  };
  
  /**
   * ツリーアイテム選択時の処理
   */
  const handleSelectItem = (id: string) => {
    console.log('ModelBrowser: アイテム選択:', id);
    
    // 現在のモデルからIDに対応する要素または関係を探す
    if (currentModel) {
      // 要素を検索
      const element = currentModel.elements.find(el => el.id === id);
      if (element) {
        // 要素を選択状態に設定
        setSelectedElement(element);
        // ダイアグラムビューに切り替え
        setCurrentView('diagram');
        return;
      }
      
      // ダイアグラムを検索
      const diagram = currentModel.diagrams.find(diag => diag.id === id);
      if (diagram) {
        // タブをアクティブにする
        useAppStore.getState().setActiveTab(id);
        return;
      }
      
      // 関係を検索
      const relationship = currentModel.relationships.find(rel => rel.id === id);
      if (relationship) {
        // 関係を選択状態に設定
        useAppStore.getState().setSelectedRelationship(relationship);
        // ダイアグラムビューに切り替え
        setCurrentView('diagram');
        return;
      }
    }
  };
  
  /**
   * フォルダ展開・折りたたみ時の処理
   */
  const handleToggleExpand = (id: string) => {
    console.log('ModelBrowser: フォルダ展開切替:', id);
    
    setTreeData(prevData => {
      // ディープコピー
      const newData = JSON.parse(JSON.stringify(prevData));
      
      // 再帰的にフォルダを検索し、展開状態を切り替える関数
      const toggleFolder = (nodes: TreeItemData[]): boolean => {
        // このレベルで該当ノードを探す
        const node = nodes.find(node => node.id === id);
        if (node && node.type === 'folder') {
          // フォルダを見つけたら展開状態を切り替え
          node.expanded = !node.expanded;
          return true;
        }
        
        // 子ノードを再帰的に検索
        for (const node of nodes) {
          if (node.children && toggleFolder(node.children)) {
            return true;
          }
        }
        
        return false;
      };
      
      toggleFolder(newData);
      return newData;
    });
  };
  
  return (
    <div className="bg-white border rounded-md shadow-sm h-full overflow-auto p-2">
      <h2 className="text-lg font-semibold px-2 py-1 border-b mb-2">モデルブラウザ</h2>
      
      {treeData.length > 0 ? (
        <div className="model-tree">
          {treeData.map(item => (
            <TreeItem
              key={item.id}
              item={item}
              onSelect={handleSelectItem}
              onToggleExpand={handleToggleExpand}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-neutral-500 py-4">
          <span className="material-icons text-3xl mb-2">hourglass_empty</span>
          <p>モデルが読み込まれていません</p>
        </div>
      )}
    </div>
  );
}