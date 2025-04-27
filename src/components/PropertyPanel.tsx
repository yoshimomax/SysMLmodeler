import React, { useEffect, useState } from 'react';
import { useSysMLModelStore } from '../store/sysmlStore';
import { PartDefinition } from '../model/sysml2/PartDefinition';
import { PortUsage } from '../model/sysml2/PortUsage';
import { ConnectionUsage } from '../model/sysml2/ConnectionUsage';
import { AttributeUsage } from '../model/sysml2/AttributeUsage';

interface PropertyPanelProps {
  selectedElementId?: string;
}

/**
 * 選択されたSysML要素のプロパティ編集パネル
 */
const PropertyPanel: React.FC<PropertyPanelProps> = ({ selectedElementId }) => {
  const sysmlStore = useSysMLModelStore();
  const [elementType, setElementType] = useState<string>('');
  const [properties, setProperties] = useState<Record<string, any>>({});
  
  // 選択要素が変わったときの処理
  useEffect(() => {
    if (!selectedElementId) {
      setElementType('');
      setProperties({});
      return;
    }
    
    const element = sysmlStore.elements[selectedElementId];
    if (!element) return;
    
    // 要素の種類に応じたプロパティ初期化
    if (element instanceof PartDefinition) {
      setElementType('part');
      setProperties({
        id: element.id,
        name: element.name,
        description: element.description || '',
        isAbstract: element.isAbstract,
        isSingleton: element.isSingleton
      });
    } else if (element instanceof PortUsage) {
      setElementType('port');
      setProperties({
        id: element.id,
        name: element.name,
        description: element.description || '',
        direction: element.direction || 'inout',
        typeId: element.typeId || ''
      });
    } else if (element instanceof ConnectionUsage) {
      setElementType('connection');
      setProperties({
        id: element.id,
        name: element.name,
        description: element.description || '',
        itemType: element.itemType || ''
      });
    } else if (element instanceof AttributeUsage) {
      setElementType('attribute');
      setProperties({
        id: element.id,
        name: element.name,
        description: element.description || '',
        typeId: element.typeId || '',
        isReadOnly: element.isReadOnly
      });
    } else {
      // その他の要素タイプの処理
      setElementType('unknown');
      setProperties({
        id: element.id,
        name: element.name || 'Unnamed',
        description: element.description || ''
      });
    }
  }, [selectedElementId, sysmlStore.elements]);
  
  // フォーム入力変更時の処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // チェックボックスの場合は特別処理
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProperties(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // 通常の入力フィールド
      setProperties(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // フォーム送信時の処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedElementId) return;
    
    // 要素の種類に応じた更新処理
    switch (elementType) {
      case 'part':
        sysmlStore.updateElement(selectedElementId, {
          name: properties.name,
          description: properties.description,
          isAbstract: properties.isAbstract,
          isSingleton: properties.isSingleton
        });
        break;
        
      case 'port':
        sysmlStore.updateElement(selectedElementId, {
          name: properties.name,
          description: properties.description,
          direction: properties.direction,
          typeId: properties.typeId
        });
        break;
        
      case 'connection':
        sysmlStore.updateElement(selectedElementId, {
          name: properties.name,
          description: properties.description,
          itemType: properties.itemType
        });
        break;
        
      case 'attribute':
        sysmlStore.updateElement(selectedElementId, {
          name: properties.name,
          description: properties.description,
          typeId: properties.typeId,
          isReadOnly: properties.isReadOnly
        });
        break;
        
      default:
        // その他の要素タイプのデフォルト更新
        sysmlStore.updateElement(selectedElementId, {
          name: properties.name,
          description: properties.description
        });
    }
  };
  
  // PortUsageの属性を子要素として表示（PartDefinitionのみ）
  const renderChildElements = () => {
    if (!selectedElementId || elementType !== 'part') return null;
    
    // 所有しているポートと属性を検索
    const childElements: React.ReactNode[] = [];
    
    // relationshipsからfeatureMembershipを検索
    Object.values(sysmlStore.relationships).forEach(rel => {
      if (rel.type === 'featureMembership' && rel.sourceId === selectedElementId) {
        const childElement = sysmlStore.elements[rel.targetId];
        
        if (childElement instanceof AttributeUsage) {
          // 属性の表示
          childElements.push(
            <div key={childElement.id} className="child-element attribute">
              <span className="icon">📝</span>
              <span className="name">{childElement.name}</span>
              <span className="type">{childElement.typeId || 'any'}</span>
              <button 
                className="select-btn"
                onClick={() => sysmlStore.selectElement(childElement.id)}
              >
                編集
              </button>
            </div>
          );
        } else if (childElement instanceof PortUsage) {
          // ポートの表示
          childElements.push(
            <div key={childElement.id} className="child-element port">
              <span className="icon">🔌</span>
              <span className="name">{childElement.name}</span>
              <span className="direction">{childElement.direction || 'inout'}</span>
              <button 
                className="select-btn"
                onClick={() => sysmlStore.selectElement(childElement.id)}
              >
                編集
              </button>
            </div>
          );
        }
      }
    });
    
    if (childElements.length === 0) {
      return <p className="no-children">子要素はありません</p>;
    }
    
    return (
      <div className="child-elements">
        <h4>子要素</h4>
        {childElements}
      </div>
    );
  };
  
  // 何も選択されていない場合
  if (!selectedElementId) {
    return (
      <div className="property-panel">
        <div className="panel-content">
          <p className="no-selection">要素を選択してください</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="property-panel">
      <div className="panel-header">
        <h3>
          {elementType === 'part' && '📦 ブロックプロパティ'}
          {elementType === 'port' && '🔌 ポートプロパティ'}
          {elementType === 'connection' && '↔️ 接続プロパティ'}
          {elementType === 'attribute' && '📝 属性プロパティ'}
          {elementType === 'unknown' && '❓ 要素プロパティ'}
        </h3>
      </div>
      
      <div className="panel-content">
        <form onSubmit={handleSubmit}>
          {/* 共通プロパティ */}
          <div className="form-group">
            <label htmlFor="name">名前:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={properties.name || ''}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">説明:</label>
            <textarea
              id="description"
              name="description"
              value={properties.description || ''}
              onChange={handleInputChange}
              className="form-control"
              rows={3}
            />
          </div>
          
          {/* 要素タイプ固有のプロパティ */}
          {elementType === 'part' && (
            <>
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="isAbstract"
                  name="isAbstract"
                  checked={properties.isAbstract || false}
                  onChange={handleInputChange}
                />
                <label htmlFor="isAbstract">抽象要素</label>
              </div>
              
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="isSingleton"
                  name="isSingleton"
                  checked={properties.isSingleton || false}
                  onChange={handleInputChange}
                />
                <label htmlFor="isSingleton">シングルトン</label>
              </div>
            </>
          )}
          
          {elementType === 'port' && (
            <>
              <div className="form-group">
                <label htmlFor="direction">方向:</label>
                <select
                  id="direction"
                  name="direction"
                  value={properties.direction || 'inout'}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="in">in</option>
                  <option value="out">out</option>
                  <option value="inout">inout</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="typeId">型:</label>
                <input
                  type="text"
                  id="typeId"
                  name="typeId"
                  value={properties.typeId || ''}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="例: Signal, Data, Power"
                />
              </div>
            </>
          )}
          
          {elementType === 'connection' && (
            <div className="form-group">
              <label htmlFor="itemType">アイテム型:</label>
              <input
                type="text"
                id="itemType"
                name="itemType"
                value={properties.itemType || ''}
                onChange={handleInputChange}
                className="form-control"
                placeholder="例: DataPacket, Signal"
              />
            </div>
          )}
          
          {elementType === 'attribute' && (
            <>
              <div className="form-group">
                <label htmlFor="typeId">型:</label>
                <input
                  type="text"
                  id="typeId"
                  name="typeId"
                  value={properties.typeId || ''}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="例: Integer, String, Boolean"
                />
              </div>
              
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="isReadOnly"
                  name="isReadOnly"
                  checked={properties.isReadOnly || false}
                  onChange={handleInputChange}
                />
                <label htmlFor="isReadOnly">読み取り専用</label>
              </div>
            </>
          )}
          
          <div className="form-actions">
            <button type="submit" className="btn-save">変更を保存</button>
          </div>
        </form>
        
        {/* 子要素の表示（ブロックのみ） */}
        {renderChildElements()}
      </div>
      
      <style jsx>{`
        .property-panel {
          width: 300px;
          background-color: #f9f9f9;
          border-left: 1px solid #ddd;
          height: 100%;
          overflow-y: auto;
        }
        
        .panel-header {
          padding: 10px 15px;
          background-color: #eee;
          border-bottom: 1px solid #ddd;
        }
        
        .panel-header h3 {
          margin: 0;
          font-size: 16px;
        }
        
        .panel-content {
          padding: 15px;
        }
        
        .no-selection {
          color: #888;
          text-align: center;
          margin-top: 30px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .form-group.checkbox {
          display: flex;
          align-items: center;
        }
        
        .form-group.checkbox label {
          margin-bottom: 0;
          margin-left: 5px;
        }
        
        .form-control {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .btn-save {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        
        .btn-save:hover {
          background-color: #45a049;
        }
        
        .child-elements {
          margin-top: 20px;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
        
        .child-elements h4 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .child-element {
          display: flex;
          align-items: center;
          padding: 8px;
          background-color: #f0f0f0;
          border-radius: 4px;
          margin-bottom: 5px;
        }
        
        .child-element .icon {
          margin-right: 8px;
        }
        
        .child-element .name {
          flex-grow: 1;
          font-weight: 500;
        }
        
        .child-element .type,
        .child-element .direction {
          color: #666;
          font-size: 12px;
          background-color: #e0e0e0;
          padding: 2px 6px;
          border-radius: 3px;
          margin-right: 8px;
        }
        
        .select-btn {
          background-color: #2196F3;
          color: white;
          border: none;
          border-radius: 3px;
          padding: 3px 8px;
          font-size: 12px;
          cursor: pointer;
        }
        
        .select-btn:hover {
          background-color: #0b7dda;
        }
        
        .no-children {
          color: #888;
          font-style: italic;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default PropertyPanel;