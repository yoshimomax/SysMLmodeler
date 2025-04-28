import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import Palette from './Palette';
import { Element, Relationship, Diagram } from '@/types/sysml';
import { v4 as uuidv4 } from 'uuid';
import { modelEvents } from '@shared/consistency';

export default function DiagramEditor() {
  const { 
    currentDiagram, 
    setCurrentDiagram,
    selectedElement,
    setSelectedElement,
    selectedRelationship,
    setSelectedRelationship,
    setIsDirty
  } = useAppStore();
  
  // エラーメッセージ用の状態
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // モデル更新通知用の状態
  const [modelUpdates, setModelUpdates] = useState<Array<{time: Date, type: string}>>([]);
  
  // モデル更新イベントハンドラー
  const handleModelUpdate = useCallback((payload: any) => {
    console.log('モデル更新イベントを受信:', payload);
    
    // 更新履歴に追加
    setModelUpdates(prev => [
      { 
        time: new Date(), 
        type: payload.type 
      },
      ...prev.slice(0, 4) // 最大5件まで保持
    ]);
    
    // 現在のダイアグラムに影響するモデル更新ならUIを更新
    // 現在はシンプルな実装: 更新通知のみ表示
    // 実際のアプリでは、ここでモデルデータの整合性を保つための
    // さらなる処理（再読み込み、差分更新など）を行う
  }, []);
  
  // イベントの購読設定
  useEffect(() => {
    // モデル更新イベントを購読
    modelEvents.on('model:update', handleModelUpdate);
    
    // クリーンアップ関数（コンポーネントのアンマウント時に実行）
    return () => {
      modelEvents.off('model:update', handleModelUpdate);
    };
  }, [handleModelUpdate]);
  
  // シンプルな初期化（テスト用）
  useEffect(() => {
    // 新しいダイアグラムを作成
    if (!currentDiagram) {
      const initialDiagram: Diagram = {
        id: uuidv4(),
        name: 'Main Diagram',
        type: 'block',
        elements: [],
        relationships: []
      };
      
      // ストアにダイアグラムを設定
      setCurrentDiagram(initialDiagram);
      console.log('初期ダイアグラムをストアに設定:', initialDiagram.id);
    }
  }, [currentDiagram, setCurrentDiagram]);
  
  // サンプルデータ作成（初回表示時）
  useEffect(() => {
    if (currentDiagram && currentDiagram.elements.length === 0) {
      console.log('Creating sample diagram elements');
      
      try {
        // 単純なブロック要素をいくつか追加
        const id1 = crypto.randomUUID();
        const id2 = crypto.randomUUID();
        const id3 = crypto.randomUUID();
        
        // システム要素をストアに追加
        const systemElement: Element = {
          id: id1,
          name: 'System',
          type: 'block',
          stereotype: 'block',
          position: { x: 200, y: 100 },
          size: { width: 120, height: 80 }
        };
        
        // サブシステム要素をストアに追加
        const subsystemElement: Element = {
          id: id2,
          name: 'Subsystem',
          type: 'block',
          stereotype: 'block',
          position: { x: 100, y: 250 },
          size: { width: 120, height: 80 }
        };
        
        // コンポーネント要素をストアに追加
        const componentElement: Element = {
          id: id3,
          name: 'Component',
          type: 'block',
          stereotype: 'block',
          position: { x: 300, y: 250 },
          size: { width: 120, height: 80 }
        };
        
        // 新しいダイアグラムをコピーし、要素を追加
        const updatedDiagram = {
          ...currentDiagram,
          elements: [
            ...currentDiagram.elements,
            systemElement,
            subsystemElement,
            componentElement
          ],
          relationships: [
            ...currentDiagram.relationships,
            {
              id: crypto.randomUUID(),
              type: 'composition' as const,
              sourceId: id1,
              targetId: id2,
              name: 'contains'
            },
            {
              id: crypto.randomUUID(),
              type: 'aggregation' as const,
              sourceId: id1,
              targetId: id3,
              name: 'has'
            }
          ]
        };
        
        // 更新されたダイアグラムをストアに設定
        setCurrentDiagram(updatedDiagram);
        
        console.log('Sample data added to diagram');
        
        // 変更フラグを設定
        setIsDirty(true);
        
        // テスト用に最初の要素を選択
        setSelectedElement(systemElement);
      } catch (error) {
        console.error('Error creating sample diagram:', error);
        setErrorMessage('サンプル図の作成に失敗しました');
      }
    }
  }, [currentDiagram, setCurrentDiagram, setIsDirty, setSelectedElement]);
  
  // テスト用の要素選択ハンドラー
  const handleElementClick = (element: Element) => {
    console.log('Element clicked:', element.id, element.name);
    setSelectedElement(element);
    setSelectedRelationship(null);
  };
  
  // テスト用の関係選択ハンドラー
  const handleRelationshipClick = (relationship: Relationship) => {
    console.log('Relationship clicked:', relationship.id, relationship.type);
    setSelectedRelationship(relationship);
    setSelectedElement(null);
  };
  
  // シンプルな表示用のコンポーネント（DiagramEditorの代わりに使用）
  return (
    <div className="flex-1 bg-white p-4 overflow-auto relative">
      {errorMessage && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 text-red-500 rounded-md shadow-md px-4 py-2 border border-red-200">
          {errorMessage}
          <button 
            className="ml-2 text-red-700 hover:text-red-900" 
            onClick={() => setErrorMessage(null)}
          >
            ×
          </button>
        </div>
      )}
      
      <div className="border border-neutral-300 rounded-lg bg-neutral-50 h-full flex flex-col p-4 relative">
        <h2 className="text-xl font-bold mb-4">テスト用ダイアグラム（要素選択テスト）</h2>
        
        {/* デバッグ情報（選択中の要素） */}
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-800">選択状態:</h3>
          <p className="text-sm">
            {selectedElement 
              ? `要素「${selectedElement.name}」を選択中 (ID: ${selectedElement.id})` 
              : selectedRelationship 
                ? `関係「${selectedRelationship.type}」を選択中 (ID: ${selectedRelationship.id})` 
                : '何も選択されていません'}
          </p>
        </div>
        
        {/* モデル更新通知 */}
        {modelUpdates.length > 0 && (
          <div className="mb-4 p-2 bg-orange-50 border border-orange-200 rounded-md">
            <h3 className="font-medium text-orange-800">モデル更新履歴:</h3>
            <ul className="text-sm mt-1 space-y-1">
              {modelUpdates.map((update, index) => (
                <li key={index} className="flex items-center text-orange-700">
                  <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  <span className="font-medium">{update.type}</span>
                  <span className="ml-2 text-orange-600 text-xs">
                    {update.time.toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 要素一覧（クリックで選択） */}
        <div className="overflow-auto flex-1">
          <h3 className="font-medium mb-2">要素一覧（クリックで選択）:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentDiagram?.elements.map(element => (
              <div 
                key={element.id}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedElement?.id === element.id 
                    ? 'bg-blue-100 border-blue-400' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleElementClick(element)}
              >
                <p className="text-xs text-gray-500">{`«${element.stereotype || 'block'}»`}</p>
                <p className="font-medium">{element.name}</p>
                <p className="text-xs text-gray-500">ID: {element.id.substring(0, 8)}...</p>
              </div>
            ))}
          </div>
          
          <h3 className="font-medium mb-2 mt-4">関係一覧（クリックで選択）:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentDiagram?.relationships.map(relationship => {
              // 関連する要素の名前を取得
              const sourceElement = currentDiagram.elements.find(e => e.id === relationship.sourceId);
              const targetElement = currentDiagram.elements.find(e => e.id === relationship.targetId);
              
              return (
                <div 
                  key={relationship.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedRelationship?.id === relationship.id 
                      ? 'bg-green-100 border-green-400' 
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleRelationshipClick(relationship)}
                >
                  <p className="text-xs text-gray-500">{`«${relationship.type}»`}</p>
                  <p className="font-medium">{relationship.name || 'Unnamed'}</p>
                  <p className="text-xs text-gray-600">
                    {sourceElement?.name || 'Unknown'} → {targetElement?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">ID: {relationship.id.substring(0, 8)}...</p>
                </div>
              );
            })}
          </div>
        </div>
        
        <Palette />
      </div>
    </div>
  );
}