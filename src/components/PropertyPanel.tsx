import React, { useState, useEffect } from 'react';
import { useSysMLModelStore } from '../store/sysmlStore';

interface PropertyPanelProps {
  selectedElementId?: string;
}

/**
 * 選択されたSysML要素のプロパティ編集パネル
 */
const PropertyPanel: React.FC<PropertyPanelProps> = ({ selectedElementId }) => {
  const sysmlStore = useSysMLModelStore();
  const { elements, relationships, selectedRelationshipId } = sysmlStore;
  
  // 実際にパネルで編集する要素ID
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [isElement, setIsElement] = useState(true);
  
  // 編集中のプロパティ値
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [elementType, setElementType] = useState('');
  const [customProps, setCustomProps] = useState<Record<string, any>>({});
  
  // パネルの表示状態
  const [isExpanded, setIsExpanded] = useState(true);
  
  // 選択変更を検出して状態を更新
  useEffect(() => {
    if (selectedElementId) {
      setActiveId(selectedElementId);
      setIsElement(true);
    } else if (selectedRelationshipId) {
      setActiveId(selectedRelationshipId);
      setIsElement(false);
    } else {
      setActiveId(undefined);
    }
  }, [selectedElementId, selectedRelationshipId]);
  
  // 選択されたアイテムの詳細を読み込み
  useEffect(() => {
    if (!activeId) {
      resetForm();
      return;
    }
    
    if (isElement) {
      const element = elements[activeId];
      if (element) {
        setName(element.name || '');
        setDescription(element.description || '');
        setElementType(element.type || '');
        
        // その他のカスタムプロパティを抽出
        const customProperties: Record<string, any> = {};
        Object.entries(element).forEach(([key, value]) => {
          if (!['id', 'name', 'type', 'description'].includes(key)) {
            customProperties[key] = value;
          }
        });
        setCustomProps(customProperties);
      }
    } else {
      const relationship = relationships[activeId];
      if (relationship) {
        setName(relationship.label || '');
        setDescription(relationship.description || '');
        setElementType(relationship.type || '');
        
        // その他のカスタムプロパティを抽出
        const customProperties: Record<string, any> = {};
        Object.entries(relationship).forEach(([key, value]) => {
          if (!['id', 'type', 'sourceId', 'targetId', 'label', 'description'].includes(key)) {
            customProperties[key] = value;
          }
        });
        setCustomProps(customProperties);
      }
    }
  }, [activeId, isElement, elements, relationships]);
  
  // フォームをリセット
  const resetForm = () => {
    setName('');
    setDescription('');
    setElementType('');
    setCustomProps({});
  };
  
  // 変更を適用
  const applyChanges = () => {
    if (!activeId) return;
    
    if (isElement) {
      const updates = {
        name,
        description,
        ...customProps
      };
      sysmlStore.updateElement(activeId, updates);
    } else {
      const updates = {
        label: name,
        description,
        ...customProps
      };
      sysmlStore.updateRelationship(activeId, updates);
    }
  };
  
  // 即時適用を行うハンドラ
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (activeId) {
      if (isElement) {
        sysmlStore.updateElement(activeId, { name: newName });
      } else {
        sysmlStore.updateRelationship(activeId, { label: newName });
      }
    }
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    if (activeId) {
      if (isElement) {
        sysmlStore.updateElement(activeId, { description: newDescription });
      } else {
        sysmlStore.updateRelationship(activeId, { description: newDescription });
      }
    }
  };
  
  const handleCustomPropChange = (key: string, value: any) => {
    const newProps = { ...customProps, [key]: value };
    setCustomProps(newProps);
    
    if (activeId) {
      if (isElement) {
        sysmlStore.updateElement(activeId, { [key]: value });
      } else {
        sysmlStore.updateRelationship(activeId, { [key]: value });
      }
    }
  };
  
  // カスタムプロパティのフォームコントロールを生成
  const renderCustomPropertyControl = (key: string, value: any) => {
    // 値の型に基づいて適切なコントロールを表示
    if (typeof value === 'boolean') {
      return (
        <div className="property-control" key={key}>
          <label>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleCustomPropChange(key, e.target.checked)}
            />
            {key}
          </label>
        </div>
      );
    } else if (typeof value === 'number') {
      return (
        <div className="property-control" key={key}>
          <label>{key}</label>
          <input
            type="number"
            value={value}
            onChange={(e) => handleCustomPropChange(key, Number(e.target.value))}
          />
        </div>
      );
    } else if (key === 'multiplicity') {
      return (
        <div className="property-control" key={key}>
          <label>{key}</label>
          <select
            value={value as string}
            onChange={(e) => handleCustomPropChange(key, e.target.value)}
          >
            <option value="1">1</option>
            <option value="0..1">0..1</option>
            <option value="0..*">0..*</option>
            <option value="1..*">1..*</option>
            <option value="*">*</option>
          </select>
        </div>
      );
    } else if (key === 'itemType') {
      return (
        <div className="property-control" key={key}>
          <label>{key}</label>
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleCustomPropChange(key, e.target.value)}
            placeholder="Type name"
          />
        </div>
      );
    } else if (Array.isArray(value)) {
      return (
        <div className="property-control" key={key}>
          <label>{key} (Array)</label>
          <textarea
            value={JSON.stringify(value)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleCustomPropChange(key, parsed);
              } catch (err) {
                // JSONパースに失敗した場合は更新しない
                console.error('Failed to parse JSON:', err);
              }
            }}
            rows={3}
          />
        </div>
      );
    } else if (typeof value === 'object' && value !== null) {
      return (
        <div className="property-control" key={key}>
          <label>{key} (Object)</label>
          <textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleCustomPropChange(key, parsed);
              } catch (err) {
                // JSONパースに失敗した場合は更新しない
                console.error('Failed to parse JSON:', err);
              }
            }}
            rows={5}
          />
        </div>
      );
    } else {
      // デフォルトはテキスト入力
      return (
        <div className="property-control" key={key}>
          <label>{key}</label>
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleCustomPropChange(key, e.target.value)}
          />
        </div>
      );
    }
  };
  
  // 関係の場合はソースとターゲットの情報も表示
  const renderRelationshipEndpoints = () => {
    if (isElement || !activeId) return null;
    
    const relationship = relationships[activeId];
    if (!relationship) return null;
    
    const sourceElement = elements[relationship.sourceId];
    const targetElement = elements[relationship.targetId];
    
    return (
      <div className="relationship-endpoints">
        <h3>Endpoints</h3>
        <div className="endpoints-container">
          <div className="endpoint source">
            <strong>Source:</strong> {sourceElement ? sourceElement.name : 'Unknown'} ({relationship.sourceId})
          </div>
          <div className="endpoint-arrow">→</div>
          <div className="endpoint target">
            <strong>Target:</strong> {targetElement ? targetElement.name : 'Unknown'} ({relationship.targetId})
          </div>
        </div>
      </div>
    );
  };
  
  // パネルのコンテンツ
  const renderPanelContent = () => {
    if (!activeId) {
      return (
        <div className="no-selection">
          <p>No element selected.</p>
          <p>Click on a diagram element to edit its properties.</p>
        </div>
      );
    }
    
    return (
      <>
        <div className="property-section">
          <h3>General</h3>
          <div className="property-control">
            <label>ID</label>
            <input type="text" value={activeId} disabled />
          </div>
          <div className="property-control">
            <label>{isElement ? 'Name' : 'Label'}</label>
            <input type="text" value={name} onChange={handleNameChange} />
          </div>
          <div className="property-control">
            <label>Type</label>
            <input type="text" value={elementType} disabled />
          </div>
          <div className="property-control">
            <label>Description</label>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              rows={3}
              placeholder="Element description..."
            />
          </div>
        </div>
        
        {renderRelationshipEndpoints()}
        
        <div className="property-section">
          <h3>Custom Properties</h3>
          {Object.entries(customProps).length > 0 ? (
            Object.entries(customProps).map(([key, value]) =>
              renderCustomPropertyControl(key, value)
            )
          ) : (
            <p className="no-props">No additional properties available.</p>
          )}
        </div>
        
        <div className="property-actions">
          <button onClick={applyChanges}>Apply All Changes</button>
        </div>
      </>
    );
  };
  
  return (
    <div className={`property-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h2>Properties {activeId ? `- ${isElement ? elementType : 'Relationship'}` : ''}</h2>
        <span className="toggle-icon">{isExpanded ? '▲' : '▼'}</span>
      </div>
      
      {isExpanded && (
        <div className="panel-content">
          {renderPanelContent()}
        </div>
      )}
      
      <style>
        {`
          .property-panel {
            background-color: #f5f5f5;
            border-left: 1px solid #ddd;
            height: 100%;
            transition: width 0.3s ease;
            overflow: hidden;
          }
          
          .expanded {
            width: 100%;
          }
          
          .collapsed {
            width: 40px;
          }
          
          .panel-header {
            background-color: #e0e0e0;
            padding: 10px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            user-select: none;
          }
          
          .panel-header h2 {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .toggle-icon {
            font-size: 12px;
          }
          
          .panel-content {
            padding: 15px;
            overflow-y: auto;
            max-height: calc(100% - 40px);
          }
          
          .property-section {
            margin-bottom: 20px;
          }
          
          .property-section h3 {
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 14px;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          
          .property-control {
            margin-bottom: 10px;
          }
          
          .property-control label {
            display: block;
            margin-bottom: 5px;
            font-size: 12px;
            color: #555;
          }
          
          .property-control input[type="text"],
          .property-control input[type="number"],
          .property-control textarea,
          .property-control select {
            width: 100%;
            padding: 6px 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 13px;
          }
          
          .property-control textarea {
            resize: vertical;
          }
          
          .property-control input[type="checkbox"] {
            margin-right: 5px;
          }
          
          .property-actions {
            margin-top: 20px;
            text-align: right;
          }
          
          .property-actions button {
            padding: 8px 12px;
            background-color: #4285f4;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 13px;
            cursor: pointer;
          }
          
          .property-actions button:hover {
            background-color: #3367d6;
          }
          
          .no-selection {
            color: #888;
            text-align: center;
            margin-top: 40px;
          }
          
          .no-props {
            color: #888;
            font-style: italic;
            font-size: 13px;
          }
          
          .relationship-endpoints {
            margin-bottom: 20px;
          }
          
          .endpoints-container {
            display: flex;
            align-items: center;
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 4px;
          }
          
          .endpoint {
            flex: 1;
            font-size: 12px;
            padding: 5px;
          }
          
          .endpoint-arrow {
            padding: 0 10px;
            color: #555;
          }
        `}
      </style>
    </div>
  );
};

export default PropertyPanel;