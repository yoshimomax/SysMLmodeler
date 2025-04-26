import { useState, useEffect } from 'react';
import { Element, Relationship } from '@/types/sysml';
import { useAppStore } from '@/lib/store';

export default function PropertyPanel() {
  // 選択要素の状態を取得
  const store = useAppStore();
  
  // 明示的に状態を分割して取得
  const selectedElement = store.selectedElement;
  const selectedRelationship = store.selectedRelationship;
  const updateElement = store.updateElement;
  const updateRelationship = store.updateRelationship;
  const setIsDirty = store.setIsDirty;
  const currentDiagram = store.currentDiagram;
  
  const [activeTab, setActiveTab] = useState<string>('properties');
  const [localElementData, setLocalElementData] = useState<Element | null>(null);
  const [selectionStatus, setSelectionStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // デバッグ用：コンポーネントがレンダリングされる時の状態を検証（初回とその後の更新）
  useEffect(() => {
    console.log('PropertyPanel rendering with state:', {
      selectedElementId: selectedElement?.id,
      selectedElementName: selectedElement?.name,
      selectedRelationshipId: selectedRelationship?.id,
      selectedRelationshipType: selectedRelationship?.type
    });
  });
  
  // 選択要素が変更されたときにローカルデータを更新
  useEffect(() => {
    console.log('PropertyPanel: selectedElement Effect triggered:', 
      selectedElement ? `ID: ${selectedElement.id}, Name: ${selectedElement.name}` : 'null');
    
    if (selectedElement) {
      console.log('PropertyPanel: Updating for selected element:', selectedElement.id, selectedElement.name);
      setLocalElementData(selectedElement);
      // 状態をクリア
      setErrorMessage(null);
      setSelectionStatus(`要素「${selectedElement.name}」を選択中（ID: ${selectedElement.id}）`);
      
      // プロパティタブを自動的に表示
      setActiveTab('properties');
    } else {
      setLocalElementData(null);
      // 何も選択されていない状態を記録
      if (!selectedRelationship) {
        setSelectionStatus('要素が選択されていません');
      }
    }
  }, [selectedElement]);
  
  // リレーションシップ選択の監視
  useEffect(() => {
    console.log('PropertyPanel: selectedRelationship Effect triggered:',
      selectedRelationship ? `ID: ${selectedRelationship.id}, Type: ${selectedRelationship.type}` : 'null');
    
    if (selectedRelationship) {
      console.log('PropertyPanel: Updating for selected relationship:', selectedRelationship.id, selectedRelationship.type);
      // 状態をクリア
      setErrorMessage(null);
      setSelectionStatus(`リレーションシップ「${selectedRelationship.type}」を選択中（ID: ${selectedRelationship.id}）`);
      
      // プロパティタブを自動的に表示
      setActiveTab('properties');
    } else if (!selectedElement) {
      // 何も選択されていない場合
      setSelectionStatus('何も選択されていません');
    }
  }, [selectedRelationship]);
  
  // 選択解除されたときにローカルデータをクリア
  useEffect(() => {
    console.log('PropertyPanel: Combined selection effect triggered:', {
      selectedElement: !!selectedElement,
      selectedRelationship: !!selectedRelationship
    });
    
    if (!selectedElement && !selectedRelationship) {
      setLocalElementData(null);
      setSelectionStatus('何も選択されていません');
    }
  }, [selectedElement, selectedRelationship]);
  
  const handleElementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (selectedElement) {
      // ローカルデータを更新
      setLocalElementData(prev => prev ? { ...prev, [name]: value } : null);
      
      try {
        // 要素のプロパティを更新
        updateElement(selectedElement.id, { [name]: value });
        
        // 成功メッセージ表示（オプション）
        if (name === 'name') {
          setSelectionStatus(`要素「${value}」を更新しました`);
        }
        
        // JointJSの図形にも反映 (DiagramEditorコンポーネントでuseEffectでも反映されるが、即時反映のために実装)
        const graphElement = document.querySelector(`[model-id="${selectedElement.id}"]`);
        if (graphElement && name === 'name') {
          // テキストラベルを更新 (JointJSの要素が存在する場合)
          const textElement = graphElement.querySelector('.joint-label text');
          if (textElement) {
            textElement.textContent = value;
          }
        }
        
        // エラーメッセージをクリア
        setErrorMessage(null);
        
        // 変更を記録
        setIsDirty(true);
        
        // ストアの状態を確認（デバッグ用）
        console.log('Element updated in store:', useAppStore.getState().selectedElement);
      } catch (error) {
        console.error('Error updating element:', error);
        setErrorMessage(`エラー: 要素の更新に失敗しました - ${error}`);
      }
    }
  };
  
  const handleRelationshipChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (selectedRelationship) {
      try {
        // リレーションシップのプロパティを更新
        updateRelationship(selectedRelationship.id, { [name]: value });
        
        // 成功メッセージ表示（オプション）
        if (name === 'name' || name === 'type') {
          setSelectionStatus(`リレーションシップ「${value}」を更新しました`);
        }
        
        // JointJSの図形にも反映
        const linkElement = document.querySelector(`[model-id="${selectedRelationship.id}"]`);
        if (linkElement && name === 'name') {
          // テキストラベルを更新 (JointJSのリンクが存在する場合)
          const textElement = linkElement.querySelector('.joint-label text');
          if (textElement) {
            textElement.textContent = value;
          }
        }
        
        // エラーメッセージをクリア
        setErrorMessage(null);
        
        // 変更を記録
        setIsDirty(true);
        
        // ストアの状態を確認（デバッグ用）
        console.log('Relationship updated in store:', useAppStore.getState().selectedRelationship);
      } catch (error) {
        console.error('Error updating relationship:', error);
        setErrorMessage(`エラー: リレーションシップの更新に失敗しました - ${error}`);
      }
    }
  };
  
  return (
    <div className="h-64 border-t border-neutral-200 bg-white overflow-hidden flex flex-col">
      <div className="flex border-b border-neutral-200">
        <button 
          className={`px-4 py-2 text-sm ${activeTab === 'properties' ? 'font-medium text-primary border-b-2 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </button>
        <button 
          className={`px-4 py-2 text-sm ${activeTab === 'issues' ? 'font-medium text-primary border-b-2 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}
          onClick={() => setActiveTab('issues')}
        >
          Issues
        </button>
        <button 
          className={`px-4 py-2 text-sm ${activeTab === 'terminal' ? 'font-medium text-primary border-b-2 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}
          onClick={() => setActiveTab('terminal')}
        >
          Terminal
        </button>
        <button 
          className={`px-4 py-2 text-sm ${activeTab === 'console' ? 'font-medium text-primary border-b-2 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}
          onClick={() => setActiveTab('console')}
        >
          Console
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'properties' && selectedElement ? (
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={selectedElement.name || ''}
                  onChange={handleElementChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
                <select 
                  name="type"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={selectedElement.type || 'block'}
                  onChange={handleElementChange}
                >
                  <option value="block">Block</option>
                  <option value="part">Part</option>
                  <option value="package">Package</option>
                  <option value="action">Action</option>
                  <option value="state">State</option>
                  <option value="requirement">Requirement</option>
                  <option value="port">Port</option>
                  <option value="activity">Activity</option>
                  <option value="interface">Interface</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Stereotype</label>
                <input 
                  type="text" 
                  name="stereotype"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={selectedElement.stereotype || 'block'}
                  onChange={handleElementChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">ID</label>
                <input 
                  type="text" 
                  name="id"
                  className="w-full px-3 py-2 border border-neutral-300 bg-neutral-50 rounded-md shadow-sm"
                  value={selectedElement.id || ''}
                  disabled
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
              <textarea 
                name="description"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                rows={2}
                value={selectedElement.description || ''}
                onChange={handleElementChange}
              />
            </div>
          </div>
        ) : activeTab === 'properties' && selectedRelationship ? (
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={selectedRelationship.name || ''}
                  onChange={handleRelationshipChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
                <select 
                  name="type"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={selectedRelationship.type || 'association'}
                  onChange={handleRelationshipChange}
                >
                  <option value="association">Association</option>
                  <option value="composition">Composition</option>
                  <option value="aggregation">Aggregation</option>
                  <option value="inheritance">Inheritance</option>
                  <option value="dependency">Dependency</option>
                  <option value="allocation">Allocation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Source</label>
                <input 
                  type="text" 
                  name="sourceName"
                  className="w-full px-3 py-2 border border-neutral-300 bg-neutral-50 rounded-md shadow-sm"
                  value={selectedRelationship.sourceName || ''}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Target</label>
                <input 
                  type="text" 
                  name="targetName"
                  className="w-full px-3 py-2 border border-neutral-300 bg-neutral-50 rounded-md shadow-sm"
                  value={selectedRelationship.targetName || ''}
                  disabled
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">ID</label>
              <input 
                type="text" 
                name="id"
                className="w-full px-3 py-2 border border-neutral-300 bg-neutral-50 rounded-md shadow-sm"
                value={selectedRelationship.id || ''}
                disabled
              />
            </div>
          </div>
        ) : activeTab === 'properties' ? (
          <div className="flex flex-col h-full items-center justify-center text-neutral-500">
            <p>Select an element or relationship to view and edit its properties</p>
            
            {/* 選択状態を表示 */}
            <div className="mt-4 p-2 bg-neutral-100 rounded text-sm w-full max-w-md text-center">
              {selectionStatus || 'No selection status available'}
            </div>
            
            {/* ストア内の選択要素情報を直接表示（デバッグ用） */}
            <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded text-sm w-full max-w-md">
              <p>Store debug info:</p>
              <div>
                <strong>Selected Element:</strong> {selectedElement ? `${selectedElement.id} (${selectedElement.name})` : 'none'}
              </div>
              <div>
                <strong>Selected Relationship:</strong> {selectedRelationship ? `${selectedRelationship.id} (${selectedRelationship.type})` : 'none'}
              </div>
              <div>
                <strong>Current Diagram:</strong> {currentDiagram ? `${currentDiagram.id} (${currentDiagram.elements.length} elements)` : 'none'}
              </div>
            </div>
            
            {/* エラーメッセージ表示 */}
            {errorMessage && (
              <div className="mt-2 p-2 bg-red-50 text-red-500 rounded text-sm w-full max-w-md">
                {errorMessage}
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-500">
            {activeTab === 'issues' ? 'No issues found' : 
             activeTab === 'terminal' ? 'Terminal output will appear here' : 
             'Console output will appear here'}
          </div>
        )}
      </div>
    </div>
  );
}
