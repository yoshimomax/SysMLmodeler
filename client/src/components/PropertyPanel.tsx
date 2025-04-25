import { useState, useEffect } from 'react';
import { Element, Relationship } from '@/types/sysml';
import { useAppStore } from '@/lib/store';

export default function PropertyPanel() {
  const { 
    selectedElement, 
    selectedRelationship,
    updateElement,
    updateRelationship,
    setIsDirty,
    currentDiagram
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<string>('properties');
  const [localElementData, setLocalElementData] = useState<Element | null>(null);
  
  // 選択要素が変更されたときにローカルデータを更新
  useEffect(() => {
    if (selectedElement) {
      console.log('PropertyPanel: Selected element updated:', selectedElement.id, selectedElement.name);
      setLocalElementData(selectedElement);
      // プロパティタブを自動的に表示
      setActiveTab('properties');
    } else {
      setLocalElementData(null);
    }
  }, [selectedElement]);
  
  // 選択解除されたときにローカルデータをクリア
  useEffect(() => {
    if (!selectedElement && !selectedRelationship) {
      setLocalElementData(null);
    }
  }, [selectedElement, selectedRelationship]);
  
  const handleElementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (selectedElement) {
      // ローカルデータを更新
      setLocalElementData(prev => prev ? { ...prev, [name]: value } : null);
      
      // 要素のプロパティを更新
      updateElement(selectedElement.id, { [name]: value });
      
      // JointJSの図形にも反映 (DiagramEditorコンポーネントでuseEffectでも反映されるが、即時反映のために実装)
      const graphElement = document.querySelector(`[model-id="${selectedElement.id}"]`);
      if (graphElement && name === 'name') {
        // テキストラベルを更新 (JointJSの要素が存在する場合)
        const textElement = graphElement.querySelector('.joint-label text');
        if (textElement) {
          textElement.textContent = value;
        }
      }
      
      // 変更を記録
      setIsDirty(true);
    }
  };
  
  const handleRelationshipChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (selectedRelationship) {
      // リレーションシップのプロパティを更新
      updateRelationship(selectedRelationship.id, { [name]: value });
      
      // JointJSの図形にも反映
      const linkElement = document.querySelector(`[model-id="${selectedRelationship.id}"]`);
      if (linkElement && name === 'name') {
        // テキストラベルを更新 (JointJSのリンクが存在する場合)
        const textElement = linkElement.querySelector('.joint-label text');
        if (textElement) {
          textElement.textContent = value;
        }
      }
      
      // 変更を記録
      setIsDirty(true);
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
          <div className="flex h-full items-center justify-center text-neutral-500">
            Select an element or relationship to view and edit its properties
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
