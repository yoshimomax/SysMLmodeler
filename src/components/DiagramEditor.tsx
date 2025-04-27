import React, { useEffect, useRef, useState } from 'react';
import * as joint from 'jointjs';
import { useSysMLModelStore } from '../store/sysmlStore';
import { PartDefinition } from '../model/sysml2/PartDefinition';
import { PortUsage } from '../model/sysml2/PortUsage';
import { ConnectionUsage } from '../model/sysml2/ConnectionUsage';
import { AttributeUsage } from '../model/sysml2/AttributeUsage';
import { ModelElement } from '../store/sysmlStore';

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
  // Refs for jointjs elements
  const paperRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<joint.dia.Graph | null>(null);
  const paperInstanceRef = useRef<joint.dia.Paper | null>(null);
  const [selectedElement, setSelectedElement] = useState<{ id: string, type: string } | null>(null);
  
  // SysML model store
  const sysmlStore = useSysMLModelStore();
  
  // Palette items
  const paletteItems: PaletteItem[] = [
    { type: 'part', label: 'Block', icon: '📦' },
    { type: 'port', label: 'Port', icon: '🔌' },
    { type: 'attribute', label: 'Attribute', icon: '📝' },
    { type: 'connection', label: 'Connection', icon: '↔️' }
  ];
  
  /**
   * カスタムSysML v2要素の定義（JointJSの拡張）
   */
  const initializeJointJsCustomElements = () => {
    // PartDefinition（ブロック）の表現
    joint.shapes.sysml = joint.shapes.sysml || {};
    joint.shapes.sysml.Part = joint.dia.Element.extend({
      defaults: joint.util.deepSupplement({
        type: 'sysml.Part',
        attrs: {
          rect: { 
            fill: '#FFFFFF', 
            stroke: '#000000', 
            'stroke-width': 2,
            rx: 5, 
            ry: 5, 
            width: 120, 
            height: 80 
          },
          '.title-rect': { 
            fill: '#DDDDDD', 
            stroke: '#000000', 
            'stroke-width': 1,
            height: 20 
          },
          '.title-text': {
            'text-anchor': 'middle',
            'font-size': 12,
            'font-weight': 'bold',
            'ref-y': 10,
            'y-alignment': 'middle'
          },
          '.content-text': {
            'ref-y': 25,
            'y-alignment': 'top',
            'font-size': 10
          }
        }
      }, joint.dia.Element.prototype.defaults)
    });
    
    // PortUsageの表現
    joint.shapes.sysml.Port = joint.dia.Element.extend({
      defaults: joint.util.deepSupplement({
        type: 'sysml.Port',
        size: { width: 12, height: 12 },
        attrs: {
          rect: { 
            fill: '#4B9CD3', 
            stroke: '#000000', 
            'stroke-width': 1,
            width: 12, 
            height: 12 
          },
          text: {
            'text-anchor': 'middle',
            'font-size': 8,
            'ref-y': 16,
            'y-alignment': 'top'
          }
        }
      }, joint.dia.Element.prototype.defaults)
    });
    
    // ConnectionUsageの表現
    joint.shapes.sysml.Connection = joint.dia.Link.extend({
      defaults: joint.util.deepSupplement({
        type: 'sysml.Connection',
        attrs: {
          '.connection': { 
            stroke: '#000000', 
            'stroke-width': 1.5 
          },
          '.marker-target': { 
            fill: '#000000', 
            stroke: '#000000', 
            d: 'M 10 0 L 0 5 L 10 10 z'
          },
          '.connection-label': {
            'font-size': 10,
            'font-weight': 'bold'
          }
        },
        labels: [{
          position: 0.5,
          attrs: {
            text: {
              'font-size': 10,
              'font-weight': 'bold'
            },
            rect: {
              fill: 'white'
            }
          }
        }]
      }, joint.dia.Link.prototype.defaults)
    });
    
    // AttributeUsageの表現（テキスト表示用）
    joint.shapes.sysml.Attribute = joint.dia.Element.extend({
      defaults: joint.util.deepSupplement({
        type: 'sysml.Attribute',
        attrs: {
          text: {
            'font-size': 10,
            'text-anchor': 'start'
          }
        }
      }, joint.dia.Element.prototype.defaults)
    });
  };
  
  /**
   * JointJS初期化関数
   */
  const initializeJointJs = () => {
    if (!paperRef.current) return;
    
    // カスタム要素の定義
    initializeJointJsCustomElements();
    
    // JointJSグラフ作成
    const graph = new joint.dia.Graph();
    graphRef.current = graph;
    
    // JointJSペーパー（描画領域）作成
    const paper = new joint.dia.Paper({
      el: paperRef.current,
      model: graph,
      width: 1000,
      height: 600,
      gridSize: 10,
      drawGrid: true,
      background: {
        color: '#F8F9FA'
      },
      interactive: true,
      defaultLink: new joint.shapes.sysml.Connection(),
      linkPinning: false,
      validateConnection: function(cellViewS, magnetS, cellViewT, magnetT) {
        // ポート間の接続のみ許可（PartとPort間、Port同士）
        return (
          (cellViewS.model.get('type') === 'sysml.Port' || magnetS) && 
          (cellViewT.model.get('type') === 'sysml.Port' || magnetT) &&
          cellViewS !== cellViewT
        );
      }
    });
    paperInstanceRef.current = paper;
    
    // イベントリスナー設定
    paper.on('element:pointerdown', function(elementView) {
      const element = elementView.model;
      setSelectedElement({
        id: element.id as string,
        type: element.get('type') as string
      });
    });
    
    paper.on('blank:pointerdown', function() {
      setSelectedElement(null);
    });
    
    // 要素の移動を検知し、ストアを更新
    paper.on('element:pointerup', function(elementView) {
      const element = elementView.model;
      const position = element.position();
      const elementId = element.id as string;
      
      // 要素タイプに基づいてストア更新
      const elementType = element.get('type');
      if (elementType === 'sysml.Part' && elementId in sysmlStore.elements) {
        sysmlStore.updateElement(elementId, { position: { x: position.x, y: position.y } });
      } else if (elementType === 'sysml.Port' && elementId in sysmlStore.elements) {
        // ポートの位置更新
        const portElement = sysmlStore.elements[elementId] as PortUsage;
        if (portElement) {
          sysmlStore.updateElement(elementId, { position: { x: position.x, y: position.y } });
        }
      }
    });
    
    // リンク（接続）の更新を検知
    paper.on('link:connect', function(linkView) {
      const link = linkView.model;
      const sourceId = link.source().id;
      const targetId = link.target().id;
      
      // ConnectionUsageを作成または更新
      const linkId = link.id as string;
      if (linkId in sysmlStore.elements) {
        // 既存の接続を更新
        sysmlStore.updateElement(linkId, {
          sourceEndId: sourceId, 
          targetEndId: targetId
        });
      } else {
        // 新しい接続を作成
        const newConnection = new ConnectionUsage({
          id: linkId,
          name: 'Connection',
          sourceEndId: sourceId,
          targetEndId: targetId
        });
        sysmlStore.addElement(newConnection);
      }
    });
  };
  
  /**
   * パレットアイテムのドラッグアンドドロップ処理
   */
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, item: PaletteItem) => {
    event.dataTransfer.setData('application/x-sysml-element', item.type);
  };
  
  /**
   * キャンバスへのドロップ処理
   */
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    // ドロップされた要素のタイプを取得
    const elementType = event.dataTransfer.getData('application/x-sysml-element');
    if (!elementType || !graphRef.current || !paperInstanceRef.current) return;
    
    // ドロップ位置の計算（ペーパー内の相対座標に変換）
    const paperElement = paperInstanceRef.current.el;
    const paperRect = paperElement.getBoundingClientRect();
    const x = event.clientX - paperRect.left;
    const y = event.clientY - paperRect.top;
    
    // 要素タイプに応じた処理
    createElementByType(elementType, x, y);
  };
  
  /**
   * ドラッグ中の処理
   */
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  
  /**
   * 要素タイプに応じたJointJS要素とSysML要素の作成
   */
  const createElementByType = (elementType: string, x: number, y: number) => {
    if (!graphRef.current) return;
    
    switch (elementType) {
      case 'part': {
        // PartDefinition作成
        const partDef = new PartDefinition({
          name: 'NewBlock',
          description: 'A new block'
        });
        
        // JointJS要素作成
        const blockElement = new joint.shapes.sysml.Part({
          id: partDef.id,
          position: { x, y },
          size: { width: 120, height: 80 },
          attrs: {
            '.title-text': { text: partDef.name },
            '.content-text': { text: partDef.description || '' }
          }
        });
        
        // グラフに追加
        graphRef.current.addCell(blockElement);
        
        // SysMLストアに追加
        sysmlStore.addElement(partDef);
        
        // 要素選択
        setSelectedElement({ id: partDef.id, type: 'part' });
        openElementEditor(partDef.id, 'part');
        break;
      }
      
      case 'port': {
        if (!selectedElement || selectedElement.type !== 'sysml.Part') {
          alert('先にブロックを選択してください');
          return;
        }
        
        // PortUsage作成
        const portUsage = new PortUsage({
          name: 'NewPort',
          ownerId: selectedElement.id,
          position: { x, y }
        });
        
        // JointJS要素作成
        const portElement = new joint.shapes.sysml.Port({
          id: portUsage.id,
          position: { x, y },
          attrs: {
            text: { text: portUsage.name }
          }
        });
        
        // グラフに追加
        graphRef.current.addCell(portElement);
        
        // SysMLストアに追加
        sysmlStore.addElement(portUsage);
        
        // 選択されたブロックとの関係を設定
        sysmlStore.addFeatureMembership(selectedElement.id, portUsage.id);
        
        // 要素選択
        setSelectedElement({ id: portUsage.id, type: 'port' });
        openElementEditor(portUsage.id, 'port');
        break;
      }
      
      case 'attribute': {
        if (!selectedElement || selectedElement.type !== 'sysml.Part') {
          alert('先にブロックを選択してください');
          return;
        }
        
        // AttributeUsage作成
        const attributeUsage = new AttributeUsage({
          name: 'NewAttribute',
          ownerId: selectedElement.id
        });
        
        // SysMLストアに追加
        sysmlStore.addElement(attributeUsage);
        
        // 選択されたブロックとの関係を設定
        sysmlStore.addFeatureMembership(selectedElement.id, attributeUsage.id);
        
        // 属性はビジュアル要素として追加しない（プロパティパネルで表示）
        openElementEditor(attributeUsage.id, 'attribute');
        break;
      }
      
      case 'connection': {
        // 接続モードを有効化（ユーザーが手動で接続を作成）
        if (paperInstanceRef.current) {
          paperInstanceRef.current.setInteractivity({
            linkModel: joint.shapes.sysml.Connection,
            arrowheadMove: true
          });
        }
        break;
      }
    }
  };
  
  /**
   * 要素編集ダイアログを開く
   */
  const openElementEditor = (elementId: string, elementType: string) => {
    // 簡易的な実装 - 実際にはモーダルやフォーム表示などを実装
    console.log(`Editing element: ${elementId} of type ${elementType}`);
    
    if (elementType === 'part') {
      const name = prompt('ブロック名を入力:', 'NewBlock');
      if (name) {
        // ストア更新
        sysmlStore.updateElement(elementId, { name });
        
        // JointJS要素の表示更新
        if (graphRef.current) {
          const element = graphRef.current.getCell(elementId);
          if (element && element.isElement()) {
            element.attr('.title-text/text', name);
          }
        }
      }
    } else if (elementType === 'port') {
      const name = prompt('ポート名を入力:', 'NewPort');
      if (name) {
        sysmlStore.updateElement(elementId, { name });
        
        if (graphRef.current) {
          const element = graphRef.current.getCell(elementId);
          if (element && element.isElement()) {
            element.attr('text/text', name);
          }
        }
      }
    } else if (elementType === 'attribute') {
      const name = prompt('属性名を入力:', 'NewAttribute');
      const type = prompt('属性の型を入力:', 'String');
      
      if (name && type) {
        sysmlStore.updateElement(elementId, { 
          name,
          typeId: type
        });
      }
    }
  };
  
  /**
   * ストアの変更を監視してJointJS要素に反映
   */
  useEffect(() => {
    // JointJS初期化
    initializeJointJs();
    
    // クリーンアップ関数
    return () => {
      if (graphRef.current) {
        graphRef.current.clear();
      }
    };
  }, []);
  
  /**
   * ストアに変化があったときの更新処理
   */
  useEffect(() => {
    if (!graphRef.current) return;
    
    // ストアの要素をJointJS要素に同期
    Object.values(sysmlStore.elements).forEach(element => {
      if (element instanceof PartDefinition) {
        // すでに存在する要素か確認
        let jointElement = graphRef.current?.getCell(element.id);
        
        if (!jointElement) {
          // 新しいブロック要素を作成
          jointElement = new joint.shapes.sysml.Part({
            id: element.id,
            position: { x: 100, y: 100 }, // デフォルト位置
            size: { width: 120, height: 80 },
            attrs: {
              '.title-text': { text: element.name },
              '.content-text': { text: element.description || '' }
            }
          });
          graphRef.current?.addCell(jointElement);
        } else if (jointElement.isElement()) {
          // 既存要素の更新
          jointElement.attr('.title-text/text', element.name);
          jointElement.attr('.content-text/text', element.description || '');
        }
      } else if (element instanceof PortUsage) {
        // ポート要素の同期
        let jointElement = graphRef.current?.getCell(element.id);
        
        if (!jointElement && element.position) {
          // 新しいポート要素を作成
          jointElement = new joint.shapes.sysml.Port({
            id: element.id,
            position: element.position,
            attrs: {
              text: { text: element.name }
            }
          });
          graphRef.current?.addCell(jointElement);
        } else if (jointElement && jointElement.isElement()) {
          // 既存ポートの更新
          jointElement.attr('text/text', element.name);
          if (element.position) {
            jointElement.position(element.position.x, element.position.y);
          }
        }
      } else if (element instanceof ConnectionUsage) {
        // 接続要素の同期
        let jointElement = graphRef.current?.getCell(element.id);
        
        if (!jointElement && element.sourceEndId && element.targetEndId) {
          // 新しい接続要素を作成
          jointElement = new joint.shapes.sysml.Connection({
            id: element.id,
            source: { id: element.sourceEndId },
            target: { id: element.targetEndId },
            labels: [{
              position: 0.5,
              attrs: { text: { text: element.name || 'Connection' } }
            }]
          });
          graphRef.current?.addCell(jointElement);
        } else if (jointElement && jointElement.isLink()) {
          // 既存接続の更新
          const link = jointElement as joint.dia.Link;
          link.label(0, { attrs: { text: { text: element.name || 'Connection' } } });
          
          if (element.sourceEndId && element.targetEndId) {
            link.source({ id: element.sourceEndId });
            link.target({ id: element.targetEndId });
          }
          
          // 中間点の設定
          if (element.vertices && element.vertices.length > 0) {
            link.vertices(element.vertices);
          }
        }
      }
    });
  }, [sysmlStore.elements]);
  
  return (
    <div className="diagram-editor-container">
      <div className="palette">
        <h3>要素パレット</h3>
        {paletteItems.map((item) => (
          <div 
            key={item.type}
            className="palette-item"
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
          >
            <span className="palette-icon">{item.icon}</span>
            <span className="palette-label">{item.label}</span>
          </div>
        ))}
      </div>
      
      <div 
        className="paper-container"
        ref={paperRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      ></div>
      
      <style jsx>{`
        .diagram-editor-container {
          display: flex;
          height: 100%;
          min-height: 600px;
        }
        
        .palette {
          width: 150px;
          background-color: #f0f0f0;
          padding: 10px;
          border-right: 1px solid #ccc;
        }
        
        .palette h3 {
          margin-top: 0;
          margin-bottom: 15px;
          text-align: center;
        }
        
        .palette-item {
          display: flex;
          align-items: center;
          padding: 8px;
          margin-bottom: 8px;
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: grab;
          transition: background-color 0.2s;
        }
        
        .palette-item:hover {
          background-color: #e6e6e6;
        }
        
        .palette-icon {
          margin-right: 8px;
          font-size: 16px;
        }
        
        .paper-container {
          flex-grow: 1;
          border: 1px solid #ccc;
          overflow: auto;
        }
      `}</style>
    </div>
  );
};

export default DiagramEditor;