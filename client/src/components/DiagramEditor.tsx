import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppStore } from '@/lib/store';
import Palette from './Palette';
import { initJointGraph } from '@/utils/joint';
import * as joint from 'jointjs';
import { Element, Relationship, ElementType, Diagram } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export default function DiagramEditor() {
  const { 
    currentDiagram, 
    selectedElement,
    selectedRelationship,
    setSelectedElement,
    setSelectedRelationship,
    updateElement,
    updateRelationship,
    addElement,
    addRelationship,
    removeElement,
    removeRelationship,
    setIsDirty,
    currentView,
    setCurrentDiagram
  } = useAppStore();
  
  // エラーメッセージ用の状態
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  // マップを使用して要素IDとJointJS要素間のマッピングを維持
  const elementsMapRef = useRef<Map<string, joint.dia.Element>>(new Map());
  const relationshipsMapRef = useRef<Map<string, joint.dia.Link>>(new Map());
  
  // ダイアグラム要素の選択ハンドラ
  const handleElementSelect = useCallback((elementView: any) => {
    const cellModel = elementView.model;
    const id = cellModel.id.toString();
    
    // 現在のダイアグラムから選択された要素を検索
    if (currentDiagram) {
      const element = currentDiagram.elements.find(e => e.id === id);
      if (element) {
        console.log('Element selected:', element.id, element.name);
        setSelectedElement(element);
        setSelectedRelationship(null); // 要素が選択されたらリレーションシップの選択を解除
      }
    }
  }, [currentDiagram, setSelectedElement, setSelectedRelationship]);
  
  // リレーションシップの選択ハンドラ
  const handleLinkSelect = useCallback((linkView: any) => {
    const cellModel = linkView.model;
    const id = cellModel.id.toString();
    
    // 現在のダイアグラムから選択されたリレーションシップを検索
    if (currentDiagram) {
      const relationship = currentDiagram.relationships.find(r => r.id === id);
      if (relationship) {
        setSelectedRelationship(relationship);
        setSelectedElement(null); // リレーションシップが選択されたら要素の選択を解除
      }
    }
  }, [currentDiagram, setSelectedElement, setSelectedRelationship]);
  
  // JointJSグラフの初期化
  useEffect(() => {
    if (containerRef.current && !graphRef.current) {
      const { graph, paper } = initJointGraph(containerRef.current);
      graphRef.current = { graph, paper };
      
      // サンプルダイアグラムの作成（初期データ）
      const initialDiagram: Diagram = {
        id: uuidv4(),
        name: 'Main Diagram',
        type: 'block',
        elements: [],
        relationships: []
      };
      
      // ストアにダイアグラムを設定（必ず最初に設定）
      setCurrentDiagram(initialDiagram);
      console.log('初期ダイアグラムをストアに設定:', initialDiagram.id);
      
      // 要素選択イベントリスナー
      paper.on('element:pointerclick', (elementView: any) => {
        const cellModel = elementView.model;
        const id = cellModel.id.toString();
        console.log('DEBUG - element:pointerclick - selected:', id);
        
        // 直接ストアから要素を検索（currentDiagramに依存しない）
        const store = useAppStore.getState();
        
        // 既存の要素かどうかを確認
        if (store.currentDiagram?.elements) {
          const element = store.currentDiagram.elements.find(e => e.id === id);
          if (element) {
            console.log('Element selected:', element.id, element.name);
            setSelectedElement(element);
            setSelectedRelationship(null);
            
            // ストアの状態を確認
            console.log('Store updated - selectedElement:', useAppStore.getState().selectedElement?.id);
          } else {
            // 新しい要素として追加
            const newElement: Element = {
              id,
              name: cellModel.attr('label/text') || 'New Element',
              type: cellModel.get('type') || 'block',
              stereotype: 'block',
              position: cellModel.position(),
              size: cellModel.size()
            };
            
            // 要素を追加
            addElement(newElement);
            setSelectedElement(newElement);
            setSelectedRelationship(null);
            console.log('New element created and selected:', newElement.id);
          }
        } else {
          // エラー表示
          setErrorMessage('currentDiagram が未初期化です。ページを更新してください。');
          console.error('currentDiagram is null or has no elements array');
        }
      });
      
      // リンク選択イベントリスナー
      paper.on('link:pointerclick', (linkView: any) => {
        const cellModel = linkView.model;
        const id = cellModel.id.toString();
        console.log('DEBUG - link:pointerclick - selected:', id);
        
        // 直接ストアから関連を検索（currentDiagramに依存しない）
        const store = useAppStore.getState();
        
        if (store.currentDiagram?.relationships) {
          const relationship = store.currentDiagram.relationships.find(r => r.id === id);
          if (relationship) {
            console.log('Relationship selected:', relationship.id, relationship.type);
            setSelectedRelationship(relationship);
            setSelectedElement(null);
            
            // ストアの状態を確認
            console.log('Store updated - selectedRelationship:', useAppStore.getState().selectedRelationship?.id);
          } else {
            // 新しい関連として追加
            const sourceId = cellModel.source().id;
            const targetId = cellModel.target().id;
            
            const newRelationship: Relationship = {
              id,
              type: 'association',
              sourceId,
              targetId,
              name: 'New Relationship'
            };
            
            // 関連を追加
            addRelationship(newRelationship);
            setSelectedRelationship(newRelationship);
            setSelectedElement(null);
            console.log('New relationship created and selected:', newRelationship.id);
          }
        } else {
          // エラー表示
          setErrorMessage('currentDiagram が未初期化です。ページを更新してください。');
          console.error('currentDiagram is null or has no relationships array');
        }
      });
      
      // 任意のセル選択イベントリスナー（要素とリンクの両方をキャッチ）
      paper.on('cell:pointerclick', (cellView: any) => {
        const cellModel = cellView.model;
        const id = cellModel.id.toString();
        
        console.log('DEBUG - cell:pointerclick - selected:', id);
        
        // セルの種類によって処理を分岐
        if (cellModel.isElement()) {
          // 要素の場合 - element:pointerclickでも処理されるが、確実に捕捉するために実装
          const store = useAppStore.getState();
          if (store.currentDiagram?.elements) {
            const element = store.currentDiagram.elements.find(e => e.id === id);
            if (element) {
              console.log('Cell clicked (element):', element.id, element.name);
              setSelectedElement(element);
              setSelectedRelationship(null);
            } else {
              // 新しい要素として扱う
              const newElement: Element = {
                id,
                name: cellModel.attr('label/text') || 'New Element',
                type: cellModel.get('type') || 'block',
                stereotype: 'block',
                position: cellModel.position(),
                size: cellModel.size()
              };
              
              addElement(newElement);
              setSelectedElement(newElement);
              setSelectedRelationship(null);
            }
          }
        } else if (cellModel.isLink()) {
          // リンク（リレーションシップ）の場合 - link:pointerclickでも処理されるが、確実に捕捉するために実装
          const store = useAppStore.getState();
          if (store.currentDiagram?.relationships) {
            const relationship = store.currentDiagram.relationships.find(r => r.id === id);
            if (relationship) {
              console.log('Cell clicked (relationship):', relationship.id, relationship.type);
              setSelectedRelationship(relationship);
              setSelectedElement(null);
            } else {
              // 新しい関連として扱う
              const sourceId = cellModel.source().id;
              const targetId = cellModel.target().id;
              
              const newRelationship: Relationship = {
                id,
                type: 'association',
                sourceId,
                targetId,
                name: 'New Relationship'
              };
              
              addRelationship(newRelationship);
              setSelectedRelationship(newRelationship);
              setSelectedElement(null);
            }
          }
        }
      });
      
      // 要素移動イベントリスナー
      paper.on('element:pointerup', (elementView: any) => {
        const cellModel = elementView.model;
        const id = cellModel.id.toString();
        const position = cellModel.position();
        
        // 位置情報でモデルを更新
        if (currentDiagram) {
          updateElement(id, { position: { x: position.x, y: position.y } });
          setIsDirty(true);
        }
      });
      
      // キャンバス空白クリックで選択解除
      paper.on('blank:pointerclick', () => {
        setSelectedElement(null);
        setSelectedRelationship(null);
      });
    }
    
    return () => {
      if (graphRef.current) {
        const { paper } = graphRef.current;
        // イベントリスナー削除
        paper.off('element:pointerclick');
        paper.off('link:pointerclick');
        paper.off('cell:pointerclick'); // 追加したイベントリスナーも削除
        paper.off('cell:pointerdblclick'); // ダブルクリックイベントリスナーも削除
        paper.off('element:pointerup');
        paper.off('blank:pointerclick');
      }
    };
  }, [handleElementSelect, handleLinkSelect, setSelectedElement, setSelectedRelationship, setCurrentDiagram, addElement, addRelationship, updateElement, setIsDirty, setErrorMessage]);
  
  // ダイアグラムデータが変更された時にグラフを更新
  useEffect(() => {
    if (!graphRef.current || !currentDiagram) return;
    
    const { graph } = graphRef.current;
    
    // グラフをクリア（マッピングも全て削除）
    graph.clear();
    elementsMapRef.current.clear();
    relationshipsMapRef.current.clear();
    
    // 要素の描画
    currentDiagram.elements.forEach(element => {
      // 位置情報がない場合はデフォルト値を設定
      const position = element.position || { x: 100, y: 100 };
      
      // 要素を作成
      const jointElement = createBlockElement(
        graph,
        element.name,
        position.x,
        position.y,
        element.type,
        element.stereotype || 'block'
      );
      
      // 作成された要素に実際のIDを設定
      jointElement.id = element.id;
      
      // 要素をマップに保存
      elementsMapRef.current.set(element.id, jointElement);
    });
    
    // リレーションシップの描画
    currentDiagram.relationships.forEach(relationship => {
      const sourceElement = elementsMapRef.current.get(relationship.sourceId);
      const targetElement = elementsMapRef.current.get(relationship.targetId);
      
      if (sourceElement && targetElement) {
        const link = createRelationship(
          graph,
          sourceElement,
          targetElement,
          relationship.type,
          relationship.name || ''
        );
        
        // 作成されたリンクに実際のIDを設定
        if (link) {
          link.id = relationship.id;
          relationshipsMapRef.current.set(relationship.id, link);
        }
      }
    });
    
  }, [currentDiagram]);
  
  // 選択した要素の変更を監視して、JointJS要素を更新
  useEffect(() => {
    if (!graphRef.current || !selectedElement) return;
    
    // 対応するJointJS要素を取得
    const jointElement = elementsMapRef.current.get(selectedElement.id);
    if (!jointElement) return;
    
    // 要素の名前とタイプを更新
    jointElement.attr({
      label: {
        text: selectedElement.name
      },
      stereotype: {
        text: `«${selectedElement.stereotype || selectedElement.type}»`
      }
    });
    
    // グラフに変更を適用
    const { graph } = graphRef.current;
    graph.findViewByModel(jointElement)?.update();
    
  }, [selectedElement]);
  
  // 選択したリレーションシップの変更を監視して、JointJS要素を更新
  useEffect(() => {
    if (!graphRef.current || !selectedRelationship) return;
    
    // 対応するJointJS要素を取得
    const jointLink = relationshipsMapRef.current.get(selectedRelationship.id);
    if (!jointLink) return;
    
    // リンクのラベルを更新
    jointLink.labels([{
      position: 0.5,
      attrs: {
        text: {
          text: selectedRelationship.name || '',
          fill: '#616161',
          fontSize: 12,
          fontFamily: 'Roboto',
          textAnchor: 'middle'
        }
      }
    }]);
    
    // グラフに変更を適用
    const { graph } = graphRef.current;
    graph.findViewByModel(jointLink)?.update();
    
  }, [selectedRelationship]);
  
  // 新しい要素追加ユーティリティ
  const addNewElement = useCallback((type: ElementType, x: number, y: number) => {
    if (!graphRef.current || !currentDiagram) return;
    
    const id = uuidv4();
    const name = `New ${type}`;
    
    // ストアに要素を追加
    const newElement: Element = {
      id,
      name,
      type,
      stereotype: type,
      position: { x, y },
      size: { width: 120, height: 80 }
    };
    
    addElement(newElement);
    setIsDirty(true);
    
    // 要素を選択
    setSelectedElement(newElement);
  }, [currentDiagram, addElement, setSelectedElement, setIsDirty]);
  
  // サンプルダイアグラム作成（初回表示時）
  useEffect(() => {
    if (graphRef.current && (!currentDiagram || currentDiagram.elements.length === 0)) {
      const { graph } = graphRef.current;
      
      // This would normally come from an API or store
      // サンプルダイアグラム設定
      
      // システムブロック作成
      const system = createBlockElement(graph, 'System', 200, 100, 'block', 'block');
      
      // サブシステムブロック作成
      const subsystem = createBlockElement(graph, 'Subsystem', 100, 250, 'block', 'block');
      
      // コンポーネントブロック作成
      const component = createBlockElement(graph, 'Component', 300, 250, 'block', 'block');
      
      // コンポジション関係作成
      createRelationship(graph, system, subsystem, 'composition', 'contains');
      
      // 集約関係作成
      createRelationship(graph, system, component, 'aggregation', 'has');
    }
  }, [graphRef.current, currentDiagram]);
  
  // Helper function to create a block element
  const createBlockElement = (
    graph: any, 
    name: string, 
    x: number, 
    y: number, 
    elementType: ElementType = 'block',
    stereotype: string = 'block'
  ) => {
    const block = new joint.shapes.standard.Rectangle({
      position: { x, y },
      size: { width: 120, height: 80 },
      attrs: {
        body: {
          fill: '#ffffff',
          stroke: '#616161',
          strokeWidth: 1.5,
          rx: 4,
          ry: 4
        },
        label: {
          text: name,
          fill: '#212121',
          fontSize: 14,
          fontWeight: 500,
          fontFamily: 'Roboto',
          textVerticalAnchor: 'middle',
          textAnchor: 'middle',
          refY: 0.6
        }
      }
    });
    
    // Type情報を設定
    block.set('type', elementType);
    
    // ステレオタイプテキストを追加
    block.attr({
      stereotype: {
        text: `«${stereotype}»`,
        fill: '#212121',
        fontSize: 14,
        fontFamily: 'Roboto',
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refY: 0.3
      }
    });
    
    graph.addCell(block);
    return block;
  };
  
  // Helper function to create a relationship between elements
  const createRelationship = (graph: any, source: any, target: any, type: string, label: string) => {
    let link;
    
    if (type === 'composition') {
      link = new joint.shapes.standard.Link({
        source: { id: source.id },
        target: { id: target.id },
        attrs: {
          line: {
            stroke: '#616161',
            strokeWidth: 1.5,
            targetMarker: {
              type: 'path',
              d: 'M 10 0 L 0 5 L 10 10 z',
              fill: '#616161'
            }
          }
        },
        labels: [
          {
            position: 0.5,
            attrs: {
              text: {
                text: label,
                fill: '#616161',
                fontSize: 12,
                fontFamily: 'Roboto',
                textAnchor: 'middle'
              }
            }
          }
        ]
      });
      
      // Add the filled circle to represent composition
      const sourcePoint = source.getBBox().bottomMiddle();
      link.source(source);
      link.target(target);
      
      // Create a circle at the start of the link
      const circle = new joint.shapes.standard.Circle({
        position: { 
          x: sourcePoint.x - 6, 
          y: sourcePoint.y - 6 
        },
        size: { width: 12, height: 12 },
        attrs: {
          body: {
            fill: '#212121',
            stroke: 'none'
          }
        },
        z: 2 // Ensure it's above the link
      });
      
      graph.addCell(circle);
    } else if (type === 'aggregation') {
      link = new joint.shapes.standard.Link({
        source: { id: source.id },
        target: { id: target.id },
        attrs: {
          line: {
            stroke: '#616161',
            strokeWidth: 1.5,
            targetMarker: {
              type: 'path',
              d: 'M 10 0 L 0 5 L 10 10 z',
              fill: '#616161'
            }
          }
        },
        labels: [
          {
            position: 0.5,
            attrs: {
              text: {
                text: label,
                fill: '#616161',
                fontSize: 12,
                fontFamily: 'Roboto',
                textAnchor: 'middle'
              }
            }
          }
        ]
      });
      
      // Add a diamond to represent aggregation
      const sourcePoint = source.getBBox().bottomMiddle();
      
      // Create a diamond at the start of the link
      const diamond = new joint.shapes.standard.Polygon({
        position: { 
          x: sourcePoint.x - 12, 
          y: sourcePoint.y - 12 
        },
        size: { width: 24, height: 24 },
        attrs: {
          body: {
            fill: '#ffffff',
            stroke: '#616161',
            strokeWidth: 1.5,
            points: '12,0 24,12 12,24 0,12'
          }
        },
        z: 2 // Ensure it's above the link
      });
      
      graph.addCell(diamond);
    }
    
    if (link) {
      graph.addCell(link);
    }
    
    return link;
  };
  
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
      <div 
        ref={containerRef} 
        className="border border-neutral-300 rounded-lg bg-neutral-50 h-full flex items-center justify-center relative"
      >
        {/* The JointJS paper will be rendered here */}
        <Palette />
      </div>
    </div>
  );
}
