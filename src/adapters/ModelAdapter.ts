/**
 * ModelAdapter クラス
 * 既存のモデルオブジェクト（Block, Port, Property, Connection）と
 * 新しいSysML v2モデル要素（PartDefinition, InterfaceUsage, Feature, ConnectionUsage）の
 * 間を変換するためのアダプター
 */

import { Block } from '../../model/Block';
import { Port } from '../../model/Port';
import { Property } from '../../model/Property';
import { Connection } from '../../model/Connection';

import { Type } from '../model/kerml/Type';
import { Feature } from '../model/kerml/Feature';
import { PartDefinition } from '../model/sysml2/PartDefinition';
import { PortUsage } from '../model/sysml2/PortUsage';
import { AttributeUsage } from '../model/sysml2/AttributeUsage';
import { ConnectionUsage } from '../model/sysml2/ConnectionUsage';
import { ModelElement, ModelRelationship } from '../store/sysmlStore';

/**
 * モデルアダプタークラス
 * 旧モデル（v1）と新モデル（v2）の間の変換を担当
 */
export class ModelAdapter {
  /**
   * 旧ブロックをSysML v2 PartDefinitionに変換
   * @param block 変換元のブロック
   * @returns 新しいPartDefinitionオブジェクト
   */
  static blockToPartDefinition(block: Block): PartDefinition {
    const partDef = new PartDefinition({
      id: block.id,
      name: block.name,
      description: block.description
    });
    
    return partDef;
  }
  
  /**
   * 旧ポートをSysML v2 PortUsageに変換
   * @param port 変換元のポート
   * @returns 新しいPortUsageオブジェクト
   */
  static portToPortUsage(port: Port): PortUsage {
    const direction = port.direction === 'in' ? 'in' : 
                     port.direction === 'out' ? 'out' : 'inout';
    
    const portUsage = new PortUsage({
      id: port.id,
      name: port.name,
      description: port.description,
      direction,
      ownerId: port.ownerBlockId
    });
    
    return portUsage;
  }
  
  /**
   * 旧プロパティをSysML v2 AttributeUsageに変換
   * @param property 変換元のプロパティ
   * @returns 新しいAttributeUsageオブジェクト
   */
  static propertyToAttributeUsage(property: Property): AttributeUsage {
    const attributeUsage = new AttributeUsage({
      id: property.id,
      name: property.name,
      description: property.description,
      ownerId: property.ownerBlockId
    });
    
    return attributeUsage;
  }
  
  /**
   * 旧接続をSysML v2 ConnectionUsageに変換
   * @param connection 変換元の接続
   * @returns 新しいConnectionUsageオブジェクト
   */
  static connectionToConnectionUsage(connection: Connection): ConnectionUsage {
    const connectionUsage = new ConnectionUsage({
      id: connection.id,
      name: connection.name || `Connection_${connection.id.substring(0, 8)}`,
      description: connection.description,
      sourceEndId: connection.sourcePortId,
      targetEndId: connection.targetPortId
    });
    
    return connectionUsage;
  }
  
  /**
   * 複合ブロックモデルをSysML v2モデルに変換
   * @param blocks ブロック辞書
   * @param connections 接続辞書
   * @returns SysML v2モデル状態（要素と関係）
   */
  static convertToSysMLModel(
    blocks: Record<string, Block>,
    connections: Record<string, Connection>
  ): {
    elements: Record<string, ModelElement>;
    relationships: Record<string, ModelRelationship>;
  } {
    const elements: Record<string, ModelElement> = {};
    const relationships: Record<string, ModelRelationship> = {};
    
    // 1. まずブロックからPartDefinitionを作成
    Object.values(blocks).forEach(block => {
      const partDef = this.blockToPartDefinition(block);
      elements[partDef.id] = partDef;
      
      // 2. ブロックの各プロパティからAttributeUsageを作成
      block.properties.forEach(property => {
        const attributeUsage = this.propertyToAttributeUsage(property);
        elements[attributeUsage.id] = attributeUsage;
        
        // FeatureMembership関係を作成
        const relationshipId = `fm_${partDef.id}_${attributeUsage.id}`;
        relationships[relationshipId] = {
          id: relationshipId,
          type: 'featureMembership',
          sourceId: partDef.id,
          targetId: attributeUsage.id,
          name: `${partDef.name}_has_${attributeUsage.name}`
        };
      });
      
      // 3. ブロックの各ポートからPortUsageを作成
      block.ports.forEach(port => {
        const portUsage = this.portToPortUsage(port);
        elements[portUsage.id] = portUsage;
        
        // FeatureMembership関係を作成
        const relationshipId = `fm_${partDef.id}_${portUsage.id}`;
        relationships[relationshipId] = {
          id: relationshipId,
          type: 'featureMembership',
          sourceId: partDef.id,
          targetId: portUsage.id,
          name: `${partDef.name}_has_${portUsage.name}`
        };
      });
    });
    
    // 4. 接続からConnectionUsageを作成
    Object.values(connections).forEach(connection => {
      const connectionUsage = this.connectionToConnectionUsage(connection);
      elements[connectionUsage.id] = connectionUsage;
      
      // 接続の所有者を決定（接続元ポートの所有者のPartDefinition）
      let ownerPartId = null;
      
      // 接続元ポートの所有者を検索
      for (const block of Object.values(blocks)) {
        const sourcePort = block.ports.find(p => p.id === connection.sourcePortId);
        if (sourcePort) {
          ownerPartId = block.id;
          break;
        }
      }
      
      if (ownerPartId) {
        // FeatureMembership関係を作成
        const relationshipId = `fm_${ownerPartId}_${connectionUsage.id}`;
        relationships[relationshipId] = {
          id: relationshipId,
          type: 'featureMembership',
          sourceId: ownerPartId,
          targetId: connectionUsage.id,
          name: `${elements[ownerPartId].name}_has_${connectionUsage.name}`
        };
      }
    });
    
    return { elements, relationships };
  }
  
  /**
   * SysML v2モデルを単純なJSONオブジェクトに変換
   * (APIシリアライズ用)
   * @param elements モデル要素辞書
   * @param relationships 関係辞書
   * @returns シリアライズ可能なJSONオブジェクト
   */
  static modelToJsonObject(
    elements: Record<string, ModelElement>,
    relationships: Record<string, ModelRelationship>
  ): any {
    // 要素をシリアライズ可能な形式に変換
    const serializedElements = Object.values(elements).map(element => {
      if ('toObject' in element && typeof element.toObject === 'function') {
        return (element as any).toObject();
      }
      return element;
    });
    
    return {
      elements: serializedElements,
      relationships: Object.values(relationships)
    };
  }
}