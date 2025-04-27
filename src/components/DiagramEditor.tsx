import React, { useEffect, useRef } from 'react';
import * as joint from 'jointjs';
import { useSysMLModelStore } from '../store/sysmlStore';

/**
 * 要素パレットアイテムの定義
 */
interface PaletteItem {
  type: string;
  label: string;
  icon: string;
}

/**
 * SysML v2要素をJointJSで表示するためのDiagramEditorコンポーネント
 */
const DiagramEditor: React.FC = () => {
  const paperRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<joint.dia.Graph | null>(null);
  const paperInstanceRef = useRef<joint.dia.Paper | null>(null);
  
  const sysmlStore = useSysMLModelStore();
  const { elements, relationships, selectedElementId, selectedRelationshipId } = sysmlStore;
  
  // パレットアイテムの定義
  const paletteItems: PaletteItem[] = [
    { type: 'PartDefinition', label: 'Part Definition', icon: '📦' },
    { type: 'InterfaceDefinition', label: 'Interface Definition', icon: '🔌' },
    { type: 'ActionDefinition', label: 'Action Definition', icon: '⚙️' },
    { type: 'StateDefinition', label: 'State Definition', icon: '🔄' },
    { type: 'AttributeDefinition', label: 'Attribute Definition', icon: '📝' }
  ];
  
  /**
   * カスタムSysML v2要素の定義（JointJSの拡張）
   */
  useEffect(() => {
    if (!joint.shapes.sysml) {
      // SysMLの名前空間を作成
      joint.shapes.sysml = {};
      
      // 共通の基本形状 - すべてのSysML要素の基底
      joint.shapes.sysml.Base = joint.shapes.basic.Rect.extend({
        defaults: joint.util.defaultsDeep({
          type: 'sysml.Base',
          attrs: {
            rect: {
              fill: '#ffffff',
              stroke: '#000000',
              'stroke-width': 2,
              rx: 5,
              ry: 5
            },
            text: {
              'font-size': 14,
              'font-family': 'Arial, sans-serif',
              'font-weight': 'bold',
              fill: '#000000',
              'text-anchor': 'middle',
              'ref-x': .5,
              'ref-y': .2,
              'y-alignment': 'middle'
            },
            '.type-text': {
              'font-size': 12,
              'font-family': 'Arial, sans-serif',
              'font-weight': 'normal',
              'font-style': 'italic',
              fill: '#666666',
              'text-anchor': 'middle',
              'ref-x': .5,
              'ref-y': .5,
              'y-alignment': 'middle'
            }
          },
          sysmlType: 'Element',
          sysmlId: ''
        }, joint.shapes.basic.Rect.prototype.defaults)
      });
      
      // PartDefinition形状
      joint.shapes.sysml.PartDefinition = joint.shapes.sysml.Base.extend({
        defaults: joint.util.defaultsDeep({
          type: 'sysml.PartDefinition',
          size: { width: 160, height: 80 },
          attrs: {
            rect: { fill: '#E1F5FE' },
            text: { text: 'PartDefinition' },
            '.type-text': { text: '«PartDefinition»' }
          },
          sysmlType: 'PartDefinition'
        }, joint.shapes.sysml.Base.prototype.defaults)
      });
      
      // InterfaceDefinition形状
      joint.shapes.sysml.InterfaceDefinition = joint.shapes.sysml.Base.extend({
        defaults: joint.util.defaultsDeep({
          type: 'sysml.InterfaceDefinition',
          size: { width: 160, height: 80 },
          attrs: {
            rect: { fill: '#E8F5E9' },
            text: { text: 'InterfaceDefinition' },
            '.type-text': { text: '«InterfaceDefinition»' }
          },
          sysmlType: 'InterfaceDefinition'
        }, joint.shapes.sysml.Base.prototype.defaults)
      });
      
      // ActionDefinition形状
      joint.shapes.sysml.ActionDefinition = joint.shapes.sysml.Base.extend({
        defaults: joint.util.defaultsDeep({
          type: 'sysml.ActionDefinition',
          size: { width: 160, height: 80 },
          attrs: {
            rect: { fill: '#FFF9C4', rx: 20, ry: 20 },
            text: { text: 'ActionDefinition' },
            '.type-text': { text: '«ActionDefinition»' }
          },
          sysmlType: 'ActionDefinition'
        }, joint.shapes.sysml.Base.prototype.defaults)
      });
      
      // StateDefinition形状
      joint.shapes.sysml.StateDefinition = joint.shapes.sysml.Base.extend({
        defaults: joint.util.defaultsDeep({
          type: 'sysml.StateDefinition',
          size: { width: 160, height: 80 },
          attrs: {
            rect: { fill: '#E0E0E0', rx: 30, ry: 30 },
            text: { text: 'StateDefinition' },
            '.type-text': { text: '«StateDefinition»' }
          },
          sysmlType: 'StateDefinition'
        }, joint.shapes.sysml.Base.prototype.defaults)
      });
      
      // AttributeDefinition形状
      joint.shapes.sysml.AttributeDefinition = joint.shapes.sysml.Base.extend({
        defaults: joint.util.defaultsDeep({
          type: 'sysml.AttributeDefinition',
          size: { width: 160, height: 60 },
          attrs: {
            rect: { fill: '#FFEBEE' },
            text: { text: 'AttributeDefinition' },
            '.type-text': { text: '«AttributeDefinition»' }
          },
          sysmlType: 'AttributeDefinition'
        }, joint.shapes.sysml.Base.prototype.defaults)
      });
      
      // 特化関係のリンク
      joint.shapes.sysml.Specialization = joint.dia.Link.extend({
        defaults: joint.util.defaultsDeep({
          type: 'sysml.Specialization',
          attrs: {
            '.connection': {
              stroke: '#000000',
              'stroke-width': 2,
              'stroke-dasharray': '0'
            },
            '.marker-target': {
              fill: '#ffffff',
              stroke: '#000000',
              d: 'M 20 0 L 0 10 L 20 20 z'
            },
            '.marker-vertices': { display: 'none' },
            '.marker-arrowheads': { display: 'none' },
            '.link-tools': { display: 'none' }
          },
          labels: [
            {
              position: 0.5,
              attrs: {
                text: {
                  text: 'specializes',
                  'font-size': 12,
                  'font-family': 'Arial, sans-serif'
                },
                rect: {
                  fill: 'white'
                }
              }
            }
          ],
          sysmlType: 'Specialization',
          sysmlId: ''
        }, joint.dia.Link.prototype.defaults)
      });
      
      // 特徴メンバーシップのリンク
      joint.shapes.sysml.FeatureMembership = joint.dia.Link.extend({
        defaults: joint.util.defaultsDeep({
          type: 'sysml.FeatureMembership',
          attrs: {
            '.connection': {
              stroke: '#000000',
              'stroke-width': 2,
              'stroke-dasharray': '0'
            },
            '.marker-target': {
              fill: '#000000',
              stroke: '#000000',
              d: 'M 10 0 L 0 5 L 10 10 z'
            },
            '.marker-vertices': { display: 'none' },
            '.marker-arrowheads': { display: 'none' },
            '.link-tools': { display: 'none' }
          },
          labels: [
            {
              position: 0.5,
              attrs: {
                text: {
                  text: 'features',
                  'font-size': 12,
                  'font-family': 'Arial, sans-serif'
                },
                rect: {
                  fill: 'white'
                }
              }
            }
          ],
          sysmlType: 'FeatureMembership',
          sysmlId: ''
        }, joint.dia.Link.prototype.defaults)
      });
      
      // 接続関係のリンク
      joint.shapes.sysml.Connection = joint.dia.Link.extend({
        defaults: joint.util.defaultsDeep({
          type: 'sysml.Connection',
          attrs: {
            '.connection': {
              stroke: '#000000',
              'stroke-width': 2,
              'stroke-dasharray': '0'
            },
            '.marker-vertices': { display: 'none' },
            '.marker-arrowheads': { display: 'none' },
            '.link-tools': { display: 'none' }
          },
          labels: [
            {
              position: 0.5,
              attrs: {
                text: {
                  text: 'connects',
                  'font-size': 12,
                  'font-family': 'Arial, sans-serif'
                },
                rect: {
                  fill: 'white'
                }
              }
            }
          ],
          sysmlType: 'ConnectionUsage',
          sysmlId: ''
        }, joint.dia.Link.prototype.defaults)
      });
      
      // 状態遷移のリンク
      joint.shapes.sysml.Transition = joint.dia.Link.extend({
        defaults: joint.util.defaultsDeep({
          type: 'sysml.Transition',
          attrs: {
            '.connection': {
              stroke: '#000000',
              'stroke-width': 2,
              'stroke-dasharray': '0'
            },
            '.marker-target': {
              fill: '#000000',
              stroke: '#000000',
              d: 'M 10 0 L 0 5 L 10 10 z'
            },
            '.marker-vertices': { display: 'none' },
            '.marker-arrowheads': { display: 'none' },
            '.link-tools': { display: 'none' }
          },
          labels: [
            {
              position: 0.5,
              attrs: {
                text: {
                  text: 'transition',
                  'font-size': 12,
                  'font-family': 'Arial, sans-serif'
                },
                rect: {
                  fill: 'white'
                }
              }
            }
          ],
          sysmlType: 'Transition',
          sysmlId: ''
        }, joint.dia.Link.prototype.defaults)
      });
    }
  }, []);
  
  /**
   * JointJS初期化関数
   */
  useEffect(() => {
    if (paperRef.current && !graphRef.current) {
      // グラフとペーパーの初期化
      const graph = new joint.dia.Graph();
      graphRef.current = graph;
      
      const paper = new joint.dia.Paper({
        el: paperRef.current,
        model: graph,
        width: '100%',
        height: '100%',
        gridSize: 10,
        drawGrid: true,
        background: {
          color: '#F8F9FA'
        },
        interactive: {
          linkMove: true,
          vertexMove: true,
          elementMove: true
        }
      });
      paperInstanceRef.current = paper;
      
      // ペーパーのイベントを設定
      
      // 要素クリック時の選択処理
      paper.on('cell:pointerclick', (cellView) => {
        const cell = cellView.model;
        console.log('Selected cell:', cell.id, cell.attributes.sysmlId);
        
        // 要素またはリレーションシップをストアで選択
        if (cell.isLink()) {
          const sysmlId = cell.attributes.sysmlId;
          if (sysmlId) {
            sysmlStore.setSelectedRelationship(sysmlId);
            console.log('Selected relationship:', sysmlId);
          }
        } else {
          const sysmlId = cell.attributes.sysmlId;
          if (sysmlId) {
            sysmlStore.setSelectedElement(sysmlId);
            console.log('Selected element:', sysmlId);
          }
        }
      });
      
      // 要素ダブルクリック時の編集処理
      paper.on('cell:pointerdblclick', (cellView) => {
        const cell = cellView.model;
        console.log('Double-clicked cell:', cell.id, cell.attributes.sysmlId);
        
        if (!cell.isLink()) {
          const sysmlId = cell.attributes.sysmlId;
          if (sysmlId) {
            // 編集モードを開始（必要に応じてダイアログ表示など）
            sysmlStore.setSelectedElement(sysmlId);
            console.log('Editing element:', sysmlId);
          }
        }
      });
      
      // 要素ドラッグ中の処理
      paper.on('cell:pointerdown', () => {
        // ドラッグ中の視覚的フィードバック（必要に応じて）
      });
      
      // 要素位置変更完了時の処理
      paper.on('element:pointerup', (elementView) => {
        const element = elementView.model;
        const position = element.position();
        const sysmlId = element.attributes.sysmlId;
        
        if (sysmlId) {
          // モデル上の位置を更新
          sysmlStore.updateElement(sysmlId, {
            position: { x: position.x, y: position.y }
          });
          console.log('Updated position:', position, 'for element:', sysmlId);
        }
      });
      
      // リンク接続完了時の処理
      paper.on('link:connect', (linkView) => {
        const link = linkView.model;
        const sysmlType = link.attributes.sysmlType;
        const sourceId = link.getSourceElement()?.attributes.sysmlId;
        const targetId = link.getTargetElement()?.attributes.sysmlId;
        
        if (sourceId && targetId) {
          // リレーションシップタイプに応じてモデルに追加
          if (sysmlType === 'Specialization') {
            const relId = sysmlStore.addSpecialization(sourceId, targetId);
            link.attributes.sysmlId = relId;
          } else if (sysmlType === 'FeatureMembership') {
            const relId = sysmlStore.addFeatureMembership(sourceId, targetId);
            link.attributes.sysmlId = relId;
          } else if (sysmlType === 'ConnectionUsage') {
            const relId = sysmlStore.addRelationship({
              id: uuidv4(),
              type: 'ConnectionUsage',
              sourceId,
              targetId,
              label: 'connects'
            });
            link.attributes.sysmlId = relId;
          } else if (sysmlType === 'Transition') {
            const relId = sysmlStore.addRelationship({
              id: uuidv4(),
              type: 'Transition',
              sourceId,
              targetId,
              label: 'transition'
            });
            link.attributes.sysmlId = relId;
          }
          
          console.log('Created relationship:', sysmlType, 'from', sourceId, 'to', targetId);
        }
      });
      
      // モデルからJointJS図形への同期処理開始
      syncModelToJointJS();
    }
  }, []);
  
  /**
   * パレットアイテムのドラッグアンドドロップ処理
   */
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, item: PaletteItem) => {
    event.dataTransfer.setData('text/plain', item.type);
    // ドラッグ中の視覚的フィードバック用のデータ
    event.dataTransfer.effectAllowed = 'copy';
  };
  
  /**
   * キャンバスへのドロップ処理
   */
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    // ドロップ位置の取得とペーパー座標への変換
    const paper = paperInstanceRef.current;
    if (!paper) return;
    
    const paperRect = paper.el.getBoundingClientRect();
    const dropX = event.clientX - paperRect.left;
    const dropY = event.clientY - paperRect.top;
    
    // ドラッグされた要素の型を取得
    const elementType = event.dataTransfer.getData('text/plain');
    
    // 新しい要素をモデルに追加し、グラフに反映
    createElementAtPosition(elementType, dropX, dropY);
  };
  
  /**
   * ドラッグ中の処理
   */
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };
  
  /**
   * 要素タイプに応じたJointJS要素とSysML要素の作成
   */
  const createElementAtPosition = (elementType: string, x: number, y: number) => {
    // 新しいSysML要素の作成
    const newElement = {
      id: uuidv4(),
      name: `New ${elementType}`,
      type: elementType,
      description: `A new ${elementType} created at (${x},${y})`,
      position: { x, y }
    };
    
    // モデルストアに追加
    const sysmlId = sysmlStore.addElement(newElement);
    
    // JointJSの図形を作成
    const jointJsShape = createJointJSShape(elementType, newElement.name, sysmlId, x, y);
    
    // グラフに追加
    if (graphRef.current && jointJsShape) {
      graphRef.current.addCell(jointJsShape);
    }
    
    return sysmlId;
  };
  
  /**
   * 要素編集ダイアログを開く
   */
  const openElementEditor = (elementId: string) => {
    sysmlStore.setSelectedElement(elementId);
  };
  
  /**
   * ストアの変更を監視してJointJS要素に反映
   */
  useEffect(() => {
    // サブスクリプション設定
    // TODO: Zustand自体のサブスクライブを実装
    
    return () => {
      // クリーンアップ
    };
  }, [sysmlStore]);
  
  /**
   * ストアに変化があったときの更新処理
   */
  const syncModelToJointJS = () => {
    if (!graphRef.current) return;
    
    const graph = graphRef.current;
    const modelElements = sysmlStore.elements;
    const modelRelationships = sysmlStore.relationships;
    
    // グラフをクリア
    graph.clear();
    
    // 要素をグラフに追加
    Object.values(modelElements).forEach(element => {
      // 位置情報がある場合はそれを使用、ない場合はデフォルト位置
      const position = element.position || { x: 50, y: 50 };
      
      const jointShape = createJointJSShape(
        element.type,
        element.name,
        element.id,
        position.x,
        position.y
      );
      
      if (jointShape) {
        graph.addCell(jointShape);
      }
    });
    
    // リレーションシップをグラフに追加
    Object.values(modelRelationships).forEach(rel => {
      const sourceCell = graph.getElements().find(el => el.attributes.sysmlId === rel.sourceId);
      const targetCell = graph.getElements().find(el => el.attributes.sysmlId === rel.targetId);
      
      if (sourceCell && targetCell) {
        const linkShape = createJointJSLink(
          rel.type,
          rel.id,
          sourceCell,
          targetCell,
          rel.label
        );
        
        if (linkShape) {
          graph.addCell(linkShape);
        }
      }
    });
    
    // 選択状態の適用
    if (selectedElementId) {
      const selectedShape = graph.getElements().find(el => el.attributes.sysmlId === selectedElementId);
      if (selectedShape && paperInstanceRef.current) {
        paperInstanceRef.current.findViewByModel(selectedShape).highlight();
      }
    }
    
    if (selectedRelationshipId) {
      const selectedLink = graph.getLinks().find(link => link.attributes.sysmlId === selectedRelationshipId);
      if (selectedLink && paperInstanceRef.current) {
        paperInstanceRef.current.findViewByModel(selectedLink).highlight();
      }
    }
  };
  
  /**
   * 要素タイプに基づいてJointJS図形を作成
   */
  const createJointJSShape = (type: string, name: string, sysmlId: string, x: number, y: number) => {
    let shape = null;
    
    switch (type) {
      case 'PartDefinition':
        shape = new joint.shapes.sysml.PartDefinition({
          position: { x, y },
          attrs: {
            text: { text: name },
            '.type-text': { text: '«PartDefinition»' }
          },
          sysmlId: sysmlId
        });
        break;
        
      case 'InterfaceDefinition':
        shape = new joint.shapes.sysml.InterfaceDefinition({
          position: { x, y },
          attrs: {
            text: { text: name },
            '.type-text': { text: '«InterfaceDefinition»' }
          },
          sysmlId: sysmlId
        });
        break;
        
      case 'ActionDefinition':
        shape = new joint.shapes.sysml.ActionDefinition({
          position: { x, y },
          attrs: {
            text: { text: name },
            '.type-text': { text: '«ActionDefinition»' }
          },
          sysmlId: sysmlId
        });
        break;
        
      case 'StateDefinition':
        shape = new joint.shapes.sysml.StateDefinition({
          position: { x, y },
          attrs: {
            text: { text: name },
            '.type-text': { text: '«StateDefinition»' }
          },
          sysmlId: sysmlId
        });
        break;
        
      case 'AttributeDefinition':
        shape = new joint.shapes.sysml.AttributeDefinition({
          position: { x, y },
          attrs: {
            text: { text: name },
            '.type-text': { text: '«AttributeDefinition»' }
          },
          sysmlId: sysmlId
        });
        break;
        
      default:
        console.warn(`Unknown element type: ${type}`);
        break;
    }
    
    return shape;
  };
  
  /**
   * リレーションシップタイプに基づいてJointJSリンクを作成
   */
  const createJointJSLink = (type: string, sysmlId: string, source: joint.dia.Element, target: joint.dia.Element, label?: string) => {
    let link = null;
    
    switch (type) {
      case 'Specialization':
        link = new joint.shapes.sysml.Specialization({
          source: { id: source.id },
          target: { id: target.id },
          sysmlId: sysmlId
        });
        if (label) {
          link.label(0, { attrs: { text: { text: label } } });
        }
        break;
        
      case 'FeatureMembership':
        link = new joint.shapes.sysml.FeatureMembership({
          source: { id: source.id },
          target: { id: target.id },
          sysmlId: sysmlId
        });
        if (label) {
          link.label(0, { attrs: { text: { text: label } } });
        }
        break;
        
      case 'ConnectionUsage':
        link = new joint.shapes.sysml.Connection({
          source: { id: source.id },
          target: { id: target.id },
          sysmlId: sysmlId
        });
        if (label) {
          link.label(0, { attrs: { text: { text: label } } });
        }
        break;
        
      case 'Transition':
        link = new joint.shapes.sysml.Transition({
          source: { id: source.id },
          target: { id: target.id },
          sysmlId: sysmlId
        });
        if (label) {
          link.label(0, { attrs: { text: { text: label } } });
        }
        break;
        
      default:
        console.warn(`Unknown relationship type: ${type}`);
        // デフォルトの接続として作成
        link = new joint.dia.Link({
          source: { id: source.id },
          target: { id: target.id },
          attrs: {
            '.connection': { stroke: '#333333' }
          },
          labels: [
            {
              position: 0.5,
              attrs: { text: { text: label || type } }
            }
          ],
          sysmlId: sysmlId
        });
        break;
    }
    
    return link;
  };
  
  /**
   * UUID生成関数
   */
  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * 編集／操作ツールバー
   */
  const DiagramToolbar = () => (
    <div className="diagram-toolbar">
      <button onClick={() => sysmlStore.undo()} title="Undo">
        ↩️ Undo
      </button>
      <button onClick={() => sysmlStore.redo()} title="Redo">
        ↪️ Redo
      </button>
      <button onClick={() => syncModelToJointJS()} title="Refresh Diagram">
        🔄 Refresh
      </button>
      <button onClick={() => {
        const json = sysmlStore.getModelAsJson();
        console.log(json);
        // ブラウザでJSON保存ダイアログを表示
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sysml-model.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }} title="Export to JSON">
        💾 Export
      </button>
      <input
        type="file"
        id="import-json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const json = event.target?.result as string;
              try {
                sysmlStore.loadModelFromJson(json);
                syncModelToJointJS();
              } catch (error) {
                console.error('Failed to import model:', error);
                alert('Failed to import model. Invalid JSON format.');
              }
            };
            reader.readAsText(file);
          }
        }}
      />
      <button onClick={() => document.getElementById('import-json')?.click()} title="Import from JSON">
        📂 Import
      </button>
    </div>
  );
  
  return (
    <div className="diagram-editor">
      <DiagramToolbar />
      
      <div className="editor-content">
        <div className="palette">
          <h3>SysML v2 Elements</h3>
          <div className="palette-items">
            {paletteItems.map((item) => (
              <div
                key={item.type}
                className="palette-item"
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
              >
                <span className="item-icon">{item.icon}</span>
                <span className="item-label">{item.label}</span>
              </div>
            ))}
          </div>
          
          <h3>Relationships</h3>
          <div className="palette-items">
            <div className="palette-item">
              <span className="item-icon">⟹</span>
              <span className="item-label">Specialization</span>
            </div>
            <div className="palette-item">
              <span className="item-icon">→</span>
              <span className="item-label">Feature Membership</span>
            </div>
            <div className="palette-item">
              <span className="item-icon">↔</span>
              <span className="item-label">Connection</span>
            </div>
            <div className="palette-item">
              <span className="item-icon">⇒</span>
              <span className="item-label">Transition</span>
            </div>
          </div>
        </div>
        
        <div
          className="paper-container"
          ref={paperRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        ></div>
      </div>
      
      <style>
        {`
          .diagram-editor {
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
          }
          
          .diagram-toolbar {
            padding: 8px;
            background-color: #f0f0f0;
            border-bottom: 1px solid #ddd;
            display: flex;
            gap: 8px;
          }
          
          .diagram-toolbar button {
            padding: 6px 12px;
            border: 1px solid #ccc;
            background-color: white;
            border-radius: 4px;
            cursor: pointer;
          }
          
          .diagram-toolbar button:hover {
            background-color: #e9e9e9;
          }
          
          .editor-content {
            display: flex;
            flex: 1;
            overflow: hidden;
          }
          
          .palette {
            width: 200px;
            border-right: 1px solid #ddd;
            padding: 16px;
            background-color: #fafafa;
            overflow-y: auto;
          }
          
          .palette h3 {
            margin-top: 0;
            margin-bottom: 12px;
            font-size: 14px;
            color: #333;
          }
          
          .palette-items {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 20px;
          }
          
          .palette-item {
            display: flex;
            align-items: center;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: white;
            cursor: grab;
            user-select: none;
          }
          
          .palette-item:hover {
            background-color: #f5f5f5;
          }
          
          .item-icon {
            margin-right: 8px;
            font-size: 16px;
          }
          
          .item-label {
            font-size: 13px;
          }
          
          .paper-container {
            flex: 1;
            overflow: auto;
            background-color: #F8F9FA;
          }
        `}
      </style>
    </div>
  );
};

export default DiagramEditor;