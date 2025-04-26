import { SysMLModel, Diagram, DiagramElement, DiagramRelationship } from '../../store/sysmlStore';
import { 
  BlockDefinition, 
  PortDefinition, 
  AttributeDefinition, 
  ConnectionDefinition,
  System,
  Subsystem,
  generateUUID
} from '../../model';
import { v4 as uuidv4 } from 'uuid';

/**
 * XMI形式のファイルをインポートするクラス
 */
export class XmiImporter {
  /**
   * XMI文字列からモデルを生成する
   * @param xmlContent XMI形式のXML文字列
   * @returns インポートされたSysMLモデル
   */
  importFromXmi(xmlContent: string): SysMLModel {
    try {
      // DOM パーサーを使用してXMLをパース
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');
      
      // パース中にエラーが発生したかチェック
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XMLのパースに失敗しました: ' + parserError.textContent);
      }
      
      // モデル情報の取得
      const modelElement = xmlDoc.querySelector('sysml\\:Model, Model');
      if (!modelElement) {
        throw new Error('SysML モデルが見つかりません');
      }
      
      const modelId = modelElement.getAttribute('xmi:id') || uuidv4();
      const modelName = modelElement.getAttribute('name') || 'Imported Model';
      
      // 新しいモデルオブジェクトを作成
      const model: SysMLModel = {
        id: modelId,
        name: modelName,
        diagrams: [],
        blocks: [],
        systems: [],
        subsystems: [],
        components: [],
        actors: [],
        connections: [],
        stateMachines: []
      };
      
      // ブロック定義のインポート
      this.importBlocks(xmlDoc, model);
      
      // 接続のインポート
      this.importConnections(xmlDoc, model);
      
      // ダイアグラムのインポート
      this.importDiagrams(xmlDoc, model);
      
      return model;
    } catch (error) {
      console.error('XMIインポート中にエラーが発生しました:', error);
      throw error;
    }
  }
  
  /**
   * ブロック定義をインポートする
   * @param xmlDoc XMLドキュメント
   * @param model インポート先のモデル
   */
  private importBlocks(xmlDoc: Document, model: SysMLModel): void {
    // ブロック要素の選択
    const blockElements = xmlDoc.querySelectorAll('packagedElement[xmi\\:type="sysml:Block"], Block');
    
    blockElements.forEach(blockElement => {
      const id = blockElement.getAttribute('xmi:id') || uuidv4();
      const name = blockElement.getAttribute('name') || 'Unnamed Block';
      const stereotype = blockElement.getAttribute('stereotype') || 'block';
      const isAbstract = blockElement.getAttribute('isAbstract') === 'true';
      
      // 属性のインポート
      const attributes: AttributeDefinition[] = [];
      const attributeElements = blockElement.querySelectorAll('ownedAttribute');
      
      attributeElements.forEach(attrElement => {
        const attrId = attrElement.getAttribute('xmi:id') || uuidv4();
        const attrName = attrElement.getAttribute('name') || 'Unnamed Attribute';
        const attrType = attrElement.getAttribute('type') || 'String';
        const multiplicity = attrElement.getAttribute('multiplicity');
        const isReadOnly = attrElement.getAttribute('isReadOnly') === 'true';
        const isDerived = attrElement.getAttribute('isDerived') === 'true';
        
        // デフォルト値の取得
        let defaultValue;
        const defaultValueElement = attrElement.querySelector('defaultValue');
        if (defaultValueElement) {
          defaultValue = defaultValueElement.getAttribute('value');
        }
        
        const attribute = new AttributeDefinition(
          attrName,
          attrType,
          undefined, // owner is set later
          undefined,
          multiplicity || undefined,
          defaultValue,
          attrId
        );
        
        attribute.isReadOnly = isReadOnly;
        attribute.isDerived = isDerived;
        
        attributes.push(attribute);
      });
      
      // ポートのインポート
      const ports: PortDefinition[] = [];
      const portElements = blockElement.querySelectorAll('ownedPort');
      
      portElements.forEach(portElement => {
        const portId = portElement.getAttribute('xmi:id') || uuidv4();
        const portName = portElement.getAttribute('name') || 'Unnamed Port';
        const portType = portElement.getAttribute('type') || 'Interface';
        const direction = portElement.getAttribute('direction') as 'in' | 'out' | 'inout' | undefined;
        const isConjugated = portElement.getAttribute('isConjugated') === 'true';
        const isBehavior = portElement.getAttribute('isBehavior') === 'true';
        
        const port = new PortDefinition(
          portName,
          portType,
          undefined, // owner is set later
          direction,
          undefined,
          portId
        );
        
        port.isConjugated = isConjugated;
        port.isBehavior = isBehavior;
        
        ports.push(port);
      });
      
      // ブロックのステレオタイプに基づいて適切なクラスに割り当て
      if (stereotype === 'system' || stereotype === 'System') {
        const system = new System(name, attributes, ports, [], [], id);
        system.isAbstract = isAbstract;
        model.systems.push(system);
        
        // 属性とポートの所有者を設定
        attributes.forEach(attr => {
          attr.ownerBlock = system;
        });
        ports.forEach(port => {
          port.ownerBlock = system;
        });
      } else if (stereotype === 'subsystem' || stereotype === 'Subsystem') {
        const subsystem = new Subsystem(name, attributes, ports, [], undefined, id);
        subsystem.isAbstract = isAbstract;
        model.subsystems.push(subsystem);
        
        // 属性とポートの所有者を設定
        attributes.forEach(attr => {
          attr.ownerBlock = subsystem;
        });
        ports.forEach(port => {
          port.ownerBlock = subsystem;
        });
      } else {
        // 通常のブロック
        const block = new BlockDefinition(name, attributes, ports, stereotype, id);
        block.isAbstract = isAbstract;
        model.blocks.push(block);
        
        // 属性とポートの所有者を設定
        attributes.forEach(attr => {
          attr.ownerBlock = block;
        });
        ports.forEach(port => {
          port.ownerBlock = block;
        });
      }
    });
  }
  
  /**
   * 接続をインポートする
   * @param xmlDoc XMLドキュメント
   * @param model インポート先のモデル
   */
  private importConnections(xmlDoc: Document, model: SysMLModel): void {
    // 接続要素の選択
    const connectorElements = xmlDoc.querySelectorAll('packagedElement[xmi\\:type="sysml:Connector"], Connector');
    
    connectorElements.forEach(connectorElement => {
      const id = connectorElement.getAttribute('xmi:id') || uuidv4();
      const name = connectorElement.getAttribute('name') || '';
      const stereotype = connectorElement.getAttribute('stereotype') || 'connector';
      
      // 接続端点の取得
      const ends = connectorElement.querySelectorAll('end');
      if (ends.length < 2) {
        console.warn(`接続 ${id} に十分な端点がありません`);
        return;
      }
      
      const sourcePortId = ends[0].getAttribute('role') || '';
      const targetPortId = ends[1].getAttribute('role') || '';
      
      // アイテムフローの取得
      let itemType;
      const itemFlowElement = connectorElement.querySelector('conveyed');
      if (itemFlowElement) {
        itemType = itemFlowElement.getAttribute('itemType');
      }
      
      // 接続の作成
      const connection = new ConnectionDefinition(
        sourcePortId,
        targetPortId,
        stereotype,
        name,
        itemType,
        id
      );
      
      model.connections.push(connection);
    });
  }
  
  /**
   * ダイアグラムをインポートする
   * @param xmlDoc XMLドキュメント
   * @param model インポート先のモデル
   */
  private importDiagrams(xmlDoc: Document, model: SysMLModel): void {
    // ダイアグラム要素の選択
    const diagramElements = xmlDoc.querySelectorAll('notation\\:Diagram, Diagram');
    
    diagramElements.forEach(diagramElement => {
      const id = diagramElement.getAttribute('xmi:id') || uuidv4();
      const name = diagramElement.getAttribute('name') || 'Unnamed Diagram';
      const type = diagramElement.getAttribute('type') || 'block';
      
      const diagram: Diagram = {
        id,
        name,
        type,
        elements: [],
        relationships: []
      };
      
      // 図の要素（ノード）のインポート
      const children = diagramElement.querySelectorAll('children');
      children.forEach(child => {
        const elementId = child.getAttribute('element');
        if (!elementId) return;
        
        // ブロックデータの検索
        const block = this.findBlockById(model, elementId);
        if (!block) return;
        
        // 位置とサイズの解析
        const positionStr = child.getAttribute('position') || '0,0';
        const sizeStr = child.getAttribute('size') || '120,80';
        
        const [x, y] = positionStr.split(',').map(Number);
        const [width, height] = sizeStr.split(',').map(Number);
        
        const element: DiagramElement = {
          id: elementId,
          name: block.name,
          type: 'block',
          position: { x, y },
          size: { width, height },
          stereotype: block.stereotype
        };
        
        diagram.elements.push(element);
      });
      
      // 図の関係（エッジ）のインポート
      const edges = diagramElement.querySelectorAll('edges');
      edges.forEach(edge => {
        const relationshipId = edge.getAttribute('element');
        if (!relationshipId) return;
        
        const sourceId = edge.getAttribute('source')?.replace('_view', '') || '';
        const targetId = edge.getAttribute('target')?.replace('_view', '') || '';
        
        // 接続データの検索
        const connection = model.connections.find(c => c.id === relationshipId);
        
        const relationship: DiagramRelationship = {
          id: relationshipId,
          name: connection?.name || 'connection',
          type: connection?.stereotype || 'association',
          sourceId,
          targetId
        };
        
        // 中間点のインポート
        const bendpoints = edge.querySelectorAll('bendpoints point');
        if (bendpoints.length > 0) {
          relationship.vertices = [];
          bendpoints.forEach(point => {
            const x = parseInt(point.getAttribute('x') || '0', 10);
            const y = parseInt(point.getAttribute('y') || '0', 10);
            relationship.vertices?.push({ x, y });
          });
        }
        
        diagram.relationships.push(relationship);
      });
      
      model.diagrams.push(diagram);
    });
    
    // ダイアグラムがない場合はデフォルトのダイアグラムを作成
    if (model.diagrams.length === 0 && model.blocks.length > 0) {
      this.createDefaultDiagram(model);
    }
  }
  
  /**
   * デフォルトのダイアグラムを作成する
   * @param model モデル
   */
  private createDefaultDiagram(model: SysMLModel): void {
    const diagramId = uuidv4();
    const diagram: Diagram = {
      id: diagramId,
      name: 'Default Diagram',
      type: 'block',
      elements: [],
      relationships: []
    };
    
    // すべてのブロックを配置
    let x = 100;
    let y = 100;
    
    // ブロックを追加
    [...model.blocks, ...model.systems, ...model.subsystems].forEach(block => {
      const element: DiagramElement = {
        id: block.id,
        name: block.name,
        type: 'block',
        position: { x, y },
        size: { width: 120, height: 80 },
        stereotype: block.stereotype
      };
      
      diagram.elements.push(element);
      
      // 次のブロックの位置を調整
      x += 200;
      if (x > 700) {
        x = 100;
        y += 150;
      }
    });
    
    // 接続を追加
    model.connections.forEach(connection => {
      // 関連するブロック要素のIDを探す
      const sourceBlock = this.findBlockByPortId(model, connection.sourcePortId);
      const targetBlock = this.findBlockByPortId(model, connection.targetPortId);
      
      if (sourceBlock && targetBlock) {
        const relationship: DiagramRelationship = {
          id: connection.id,
          name: connection.name || 'connection',
          type: connection.stereotype || 'association',
          sourceId: sourceBlock.id,
          targetId: targetBlock.id
        };
        
        diagram.relationships.push(relationship);
      }
    });
    
    model.diagrams.push(diagram);
  }
  
  /**
   * IDによってブロックを検索する
   * @param model モデル
   * @param id 検索するID
   * @returns 見つかったブロックまたはundefined
   */
  private findBlockById(model: SysMLModel, id: string): BlockDefinition | System | Subsystem | undefined {
    // すべてのブロックタイプから検索
    return model.blocks.find(b => b.id === id) ||
           model.systems.find(s => s.id === id) ||
           model.subsystems.find(s => s.id === id);
  }
  
  /**
   * ポートIDによってブロックを検索する
   * @param model モデル
   * @param portId 検索するポートID
   * @returns 見つかったブロックまたはundefined
   */
  private findBlockByPortId(model: SysMLModel, portId: string): BlockDefinition | System | Subsystem | undefined {
    // すべてのブロックタイプからポートを持つブロックを検索
    return model.blocks.find(b => b.ports.some(p => p.id === portId)) ||
           model.systems.find(s => s.ports.some(p => p.id === portId)) ||
           model.subsystems.find(s => s.ports.some(p => p.id === portId));
  }
}