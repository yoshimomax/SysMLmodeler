import React, { useState, useEffect } from 'react';
import { useSysMLStore } from '../store/sysmlStore';
import { 
  BlockDefinition, 
  PortDefinition, 
  AttributeDefinition, 
  ConnectionDefinition,
  System,
  Subsystem,
  Component,
  SysMLConcept,
  getConceptInfo,
  getSpecificationUrl
} from '../services/specs/SysMLSpecifications';

/**
 * SysML v2仕様に準拠したプロパティパネルコンポーネント
 * 選択された要素またはリレーションシップの詳細な編集ができる
 */
export default function PropertyPanelSysML() {
  // SysMLストアから状態を取得
  const {
    currentModel,
    currentDiagramId,
    selectedElementId,
    selectedElementName,
    selectedRelationshipId,
    updateElement,
    updateRelationship,
    addAttribute,
    updateAttribute,
    deleteAttribute,
    addPort,
    updatePort,
    deletePort,
    isPropertyPanelOpen,
    setPropertyPanelOpen
  } = useSysMLStore();
  
  // ローカル状態
  const [activeTab, setActiveTab] = useState<string>('properties');
  const [selectionType, setSelectionType] = useState<'none' | 'element' | 'relationship'>('none');
  const [selectedBlockType, setSelectedBlockType] = useState<SysMLConcept | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // 選択要素/リレーションシップの変更を検知
  useEffect(() => {
    if (selectedElementId) {
      setSelectionType('element');
      setActiveTab('properties');
      
      // 選択されたブロックの型を判定
      const element = getSelectedElement();
      if (element) {
        if (element.stereotype === 'system') {
          setSelectedBlockType(SysMLConcept.SYSTEM);
        } else if (element.stereotype === 'subsystem') {
          setSelectedBlockType(SysMLConcept.SUBSYSTEM);
        } else if (element.stereotype === 'component') {
          setSelectedBlockType(SysMLConcept.COMPONENT);
        } else if (element.stereotype === 'actor') {
          setSelectedBlockType(SysMLConcept.ACTOR);
        } else {
          setSelectedBlockType(SysMLConcept.BLOCK_DEFINITION);
        }
      }
    } else if (selectedRelationshipId) {
      setSelectionType('relationship');
      setActiveTab('properties');
      setSelectedBlockType(null);
    } else {
      setSelectionType('none');
      setSelectedBlockType(null);
    }
  }, [selectedElementId, selectedRelationshipId]);
  
  // 選択されたブロック要素を取得
  const getSelectedElement = () => {
    if (!currentModel || !selectedElementId) return null;
    
    // 現在の図からダイアグラム要素を検索
    const currentDiagram = currentModel.diagrams.find(d => d.id === currentDiagramId);
    if (!currentDiagram) return null;
    
    return currentDiagram.elements.find(e => e.id === selectedElementId) || null;
  };
  
  // 選択された接続を取得
  const getSelectedRelationship = () => {
    if (!currentModel || !selectedRelationshipId) return null;
    
    // 現在の図から接続要素を検索
    const currentDiagram = currentModel.diagrams.find(d => d.id === currentDiagramId);
    if (!currentDiagram) return null;
    
    return currentDiagram.relationships.find(r => r.id === selectedRelationshipId) || null;
  };
  
  // 選択された要素のブロック定義を取得
  const getSelectedBlock = () => {
    if (!currentModel || !selectedElementId) return null;
    
    // ブロック情報を検索
    return currentModel.blocks.find(b => b.id === selectedElementId) ||
           currentModel.systems.find(s => s.id === selectedElementId) ||
           currentModel.subsystems.find(s => s.id === selectedElementId) ||
           currentModel.components.find(c => c.id === selectedElementId) ||
           null;
  };
  
  // 要素の変更を処理
  const handleElementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (selectedElementId) {
      try {
        // 要素を更新
        updateElement(selectedElementId, { [name]: value });
        
        // エラー状態をクリア
        setErrorMessage(null);
      } catch (error) {
        console.error('Error updating element:', error);
        setErrorMessage(`エラー: 要素の更新に失敗しました - ${error}`);
      }
    }
  };
  
  // リレーションシップの変更を処理
  const handleRelationshipChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (selectedRelationshipId) {
      try {
        // リレーションシップを更新
        updateRelationship(selectedRelationshipId, { [name]: value });
        
        // エラー状態をクリア
        setErrorMessage(null);
      } catch (error) {
        console.error('Error updating relationship:', error);
        setErrorMessage(`エラー: リレーションシップの更新に失敗しました - ${error}`);
      }
    }
  };
  
  // 属性の追加
  const handleAddAttribute = () => {
    const selectedBlock = getSelectedBlock();
    if (selectedBlock && selectedElementId) {
      addAttribute(selectedElementId, 'New Attribute', 'String');
    }
  };
  
  // ポートの追加
  const handleAddPort = () => {
    const selectedBlock = getSelectedBlock();
    if (selectedBlock && selectedElementId) {
      addPort(selectedElementId, 'New Port', 'Flow');
    }
  };
  
  // 属性の変更を処理
  const handleAttributeChange = (attributeId: string, field: string, value: any) => {
    const selectedBlock = getSelectedBlock();
    if (selectedBlock && selectedElementId) {
      updateAttribute(selectedElementId, attributeId, { [field]: value });
    }
  };
  
  // ポートの変更を処理
  const handlePortChange = (portId: string, field: string, value: any) => {
    const selectedBlock = getSelectedBlock();
    if (selectedBlock && selectedElementId) {
      updatePort(selectedElementId, portId, { [field]: value });
    }
  };
  
  // 属性の削除
  const handleDeleteAttribute = (attributeId: string) => {
    const selectedBlock = getSelectedBlock();
    if (selectedBlock && selectedElementId) {
      deleteAttribute(selectedElementId, attributeId);
    }
  };
  
  // ポートの削除
  const handleDeletePort = (portId: string) => {
    const selectedBlock = getSelectedBlock();
    if (selectedBlock && selectedElementId) {
      deletePort(selectedElementId, portId);
    }
  };
  
  // リレーションシップのエンドポイント情報を取得
  const getRelationshipEndpoints = () => {
    if (!currentModel || !selectedRelationshipId) return { sourceName: '', targetName: '' };
    
    const currentDiagram = currentModel.diagrams.find(d => d.id === currentDiagramId);
    if (!currentDiagram) return { sourceName: '', targetName: '' };
    
    const relationship = currentDiagram.relationships.find(r => r.id === selectedRelationshipId);
    if (!relationship) return { sourceName: '', targetName: '' };
    
    const sourceElement = currentDiagram.elements.find(e => e.id === relationship.sourceId);
    const targetElement = currentDiagram.elements.find(e => e.id === relationship.targetId);
    
    return {
      sourceName: sourceElement?.name || '不明なソース',
      targetName: targetElement?.name || '不明なターゲット'
    };
  };
  
  // パネル表示を切り替え
  const togglePanel = () => {
    setPropertyPanelOpen(!isPropertyPanelOpen);
  };
  
  // 選択された要素
  const selectedElement = getSelectedElement();
  const selectedRelationship = getSelectedRelationship();
  const selectedBlock = getSelectedBlock();
  const relationshipEndpoints = getRelationshipEndpoints();
  
  // タブの切り替え
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  return (
    <div className="border-t border-neutral-200 bg-white overflow-hidden flex flex-col">
      {/* ヘッダー */}
      <div className="flex justify-between items-center p-2 border-b border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-900">
          {selectionType === 'element' ? (
            <>要素プロパティ: {selectedElementName}</>
          ) : selectionType === 'relationship' ? (
            <>関係プロパティ: {selectedRelationship?.name || 'リレーションシップ'}</>
          ) : (
            <>プロパティパネル</>
          )}
        </h3>
        <button 
          onClick={togglePanel}
          className="text-neutral-500 hover:text-neutral-700"
        >
          {isPropertyPanelOpen ? '最小化' : '展開'}
        </button>
      </div>
      
      {/* パネルコンテンツ */}
      {isPropertyPanelOpen && (
        <div className="flex flex-col overflow-auto">
          {/* タブ切り替え */}
          <div className="flex border-b border-neutral-200">
            <button 
              className={`px-4 py-2 text-sm ${activeTab === 'properties' ? 'font-medium text-primary border-b-2 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}
              onClick={() => handleTabChange('properties')}
            >
              プロパティ
            </button>
            <button 
              className={`px-4 py-2 text-sm ${activeTab === 'documentation' ? 'font-medium text-primary border-b-2 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}
              onClick={() => handleTabChange('documentation')}
            >
              ドキュメント
            </button>
            <button 
              className={`px-4 py-2 text-sm ${activeTab === 'specification' ? 'font-medium text-primary border-b-2 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}
              onClick={() => handleTabChange('specification')}
            >
              SysML仕様
            </button>
          </div>
          
          {/* タブコンテンツ */}
          <div className="p-4 overflow-y-auto flex-grow">
            {/* プロパティタブ */}
            {activeTab === 'properties' && selectionType === 'element' && selectedElement && (
              <div>
                {/* 基本プロパティ */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">名前</label>
                    <input 
                      type="text" 
                      name="name"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      value={selectedElement.name || ''}
                      onChange={handleElementChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">型</label>
                    <select 
                      name="stereotype"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      value={selectedElement.stereotype || 'block'}
                      onChange={handleElementChange}
                    >
                      <option value="block">Block</option>
                      <option value="system">System</option>
                      <option value="subsystem">Subsystem</option>
                      <option value="component">Component</option>
                      <option value="actor">Actor</option>
                      <option value="interface">Interface</option>
                      <option value="value">Value Type</option>
                      <option value="constraint">Constraint</option>
                      <option value="requirement">Requirement</option>
                    </select>
                  </div>
                </div>
                
                {/* ID表示 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">ID</label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 border border-neutral-300 bg-neutral-50 rounded-md shadow-sm"
                    value={selectedElement.id}
                    disabled
                  />
                </div>
                
                {/* 属性セクション */}
                {selectedBlock && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-neutral-900">属性</h4>
                      <button
                        onClick={handleAddAttribute}
                        className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary-dark"
                      >
                        + 属性追加
                      </button>
                    </div>
                    
                    {/* 属性リスト */}
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">名前</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">型</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">多重度</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">操作</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                          {selectedBlock.attributes.map(attr => (
                            <tr key={attr.id}>
                              <td className="px-3 py-2 text-sm text-neutral-900">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 border border-neutral-300 rounded text-sm"
                                  value={attr.name}
                                  onChange={(e) => handleAttributeChange(attr.id, 'name', e.target.value)}
                                />
                              </td>
                              <td className="px-3 py-2 text-sm text-neutral-900">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 border border-neutral-300 rounded text-sm"
                                  value={attr.typeName}
                                  onChange={(e) => handleAttributeChange(attr.id, 'typeName', e.target.value)}
                                />
                              </td>
                              <td className="px-3 py-2 text-sm text-neutral-900">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 border border-neutral-300 rounded text-sm"
                                  value={attr.multiplicity || ''}
                                  onChange={(e) => handleAttributeChange(attr.id, 'multiplicity', e.target.value)}
                                  placeholder="1..* など"
                                />
                              </td>
                              <td className="px-3 py-2 text-sm text-neutral-900">
                                <button
                                  onClick={() => handleDeleteAttribute(attr.id)}
                                  className="text-xs px-2 py-1 text-red-600 hover:text-red-800"
                                >
                                  削除
                                </button>
                              </td>
                            </tr>
                          ))}
                          {selectedBlock.attributes.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-3 py-3 text-sm text-neutral-500 text-center">
                                属性がありません
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* ポートセクション */}
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-neutral-900">ポート</h4>
                        <button
                          onClick={handleAddPort}
                          className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary-dark"
                        >
                          + ポート追加
                        </button>
                      </div>
                      
                      {/* ポートリスト */}
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead className="bg-neutral-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">名前</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">型</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">方向</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500">操作</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {selectedBlock.ports.map(port => (
                              <tr key={port.id}>
                                <td className="px-3 py-2 text-sm text-neutral-900">
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1 border border-neutral-300 rounded text-sm"
                                    value={port.name}
                                    onChange={(e) => handlePortChange(port.id, 'name', e.target.value)}
                                  />
                                </td>
                                <td className="px-3 py-2 text-sm text-neutral-900">
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1 border border-neutral-300 rounded text-sm"
                                    value={port.typeName}
                                    onChange={(e) => handlePortChange(port.id, 'typeName', e.target.value)}
                                  />
                                </td>
                                <td className="px-3 py-2 text-sm text-neutral-900">
                                  <select
                                    className="w-full px-2 py-1 border border-neutral-300 rounded text-sm"
                                    value={port.direction || 'inout'}
                                    onChange={(e) => handlePortChange(port.id, 'direction', e.target.value)}
                                  >
                                    <option value="in">in</option>
                                    <option value="out">out</option>
                                    <option value="inout">inout</option>
                                  </select>
                                </td>
                                <td className="px-3 py-2 text-sm text-neutral-900">
                                  <button
                                    onClick={() => handleDeletePort(port.id)}
                                    className="text-xs px-2 py-1 text-red-600 hover:text-red-800"
                                  >
                                    削除
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {selectedBlock.ports.length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-3 py-3 text-sm text-neutral-500 text-center">
                                  ポートがありません
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* リレーションシッププロパティ */}
            {activeTab === 'properties' && selectionType === 'relationship' && selectedRelationship && (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">名前</label>
                    <input 
                      type="text" 
                      name="name"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      value={selectedRelationship.name || ''}
                      onChange={handleRelationshipChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">型</label>
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
                      <option value="connection">Connection</option>
                      <option value="flow">Flow</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">ソース</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-neutral-300 bg-neutral-50 rounded-md shadow-sm"
                      value={relationshipEndpoints.sourceName}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">ターゲット</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-neutral-300 bg-neutral-50 rounded-md shadow-sm"
                      value={relationshipEndpoints.targetName}
                      disabled
                    />
                  </div>
                </div>
                
                {/* ID表示 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">ID</label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 border border-neutral-300 bg-neutral-50 rounded-md shadow-sm"
                    value={selectedRelationship.id}
                    disabled
                  />
                </div>
              </div>
            )}
            
            {/* ドキュメントタブ */}
            {activeTab === 'documentation' && (
              <div>
                <h4 className="text-sm font-medium text-neutral-900 mb-2">
                  {selectionType === 'element' ? '要素ドキュメント' : selectionType === 'relationship' ? '関係ドキュメント' : 'ドキュメント'}
                </h4>
                <textarea
                  className="w-full h-48 px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="ここにドキュメントを入力..."
                  name="description"
                  value={
                    selectionType === 'element' ? selectedElement?.description || '' :
                    selectionType === 'relationship' ? selectedRelationship?.description || '' :
                    ''
                  }
                  onChange={
                    selectionType === 'element' ? handleElementChange : 
                    selectionType === 'relationship' ? handleRelationshipChange :
                    undefined
                  }
                />
              </div>
            )}
            
            {/* SysML仕様タブ */}
            {activeTab === 'specification' && selectedBlockType && (
              <div>
                <h4 className="text-sm font-medium text-neutral-900 mb-2">SysML v2 仕様参照</h4>
                <div className="border rounded-md p-4 bg-neutral-50">
                  <h5 className="font-medium mb-2">{selectedBlockType}</h5>
                  <p className="text-sm mb-4">{getConceptInfo(selectedBlockType)?.description}</p>
                  
                  <h6 className="font-medium text-xs text-neutral-700 mt-3 mb-1">許可されている子要素:</h6>
                  <ul className="text-xs list-disc pl-5 mb-3">
                    {getConceptInfo(selectedBlockType)?.allowedChildren.map(child => (
                      <li key={child}>{child}</li>
                    ))}
                  </ul>
                  
                  <h6 className="font-medium text-xs text-neutral-700 mt-3 mb-1">許可されている関係:</h6>
                  <ul className="text-xs list-disc pl-5 mb-3">
                    {getConceptInfo(selectedBlockType)?.allowedRelationships.map(rel => (
                      <li key={rel}>{rel}</li>
                    ))}
                  </ul>
                  
                  <div className="mt-4">
                    <a
                      href={getSpecificationUrl(selectedBlockType)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      OMG SysML v2 仕様を参照する →
                    </a>
                  </div>
                </div>
              </div>
            )}
            
            {/* SysML仕様タブのフォールバック */}
            {activeTab === 'specification' && !selectedBlockType && (
              <div className="text-neutral-500 text-sm">
                SysML v2要素を選択すると、その仕様が表示されます。
              </div>
            )}
            
            {/* 何も選択されていない場合 */}
            {selectionType === 'none' && activeTab === 'properties' && (
              <div className="flex flex-col items-center justify-center h-48 text-neutral-500">
                <p>要素または関係を選択して、プロパティを表示/編集します</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* エラーメッセージ表示 */}
      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-3 text-sm">
          {errorMessage}
        </div>
      )}
    </div>
  );
}