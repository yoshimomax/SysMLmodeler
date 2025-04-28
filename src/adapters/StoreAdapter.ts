/**
 * StoreAdapter クラス
 * 既存のアプリケーションストア（client/src/lib/store）と
 * 新しいSysML v2モデルストア（src/store/sysmlStore）の間を
 * ブリッジするためのアダプター
 */

import { Block } from '@model/Block';
import { Connection } from '@model/Connection';
import { Port } from '@model/Port';
import { Property } from '@model/Property';

import { useModelStore } from '@/lib/store';
import { useSysMLModelStore, ModelElement, ModelRelationship } from '@store/sysmlStore';
import { ModelAdapter } from './ModelAdapter';
import { PartDefinition } from '@model/sysml2/PartDefinition';
import { AttributeUsage } from '@model/sysml2/AttributeUsage';
import { PortUsage } from '@model/sysml2/PortUsage';
import { ConnectionUsage } from '@model/sysml2/ConnectionUsage';

export class StoreAdapter {
  /**
   * AppStoreからSysMLStoreにモデルを変換する
   * @param appStore アプリケーションストア状態
   * @returns SysMLモデル
   */
  static appToSysML(appStore: any): any {
    const blocks = appStore.blocks || {};
    const connections = appStore.connections || {};
    
    // ModelAdapterを使用してSysML v2モデルに変換
    const sysmlModel = ModelAdapter.convertToSysMLModel(blocks, connections);
    
    // 変換結果をSysMLストアに適用
    const sysmlStore = useSysMLModelStore.getState();
    sysmlStore.resetModel();
    
    // 要素を追加
    Object.values(sysmlModel.elements).forEach(element => {
      sysmlStore.addElement(element);
    });
    
    // 関係を追加
    Object.values(sysmlModel.relationships).forEach(relationship => {
      sysmlStore.addRelationship(relationship);
    });
    
    return sysmlModel;
  }
  
  /**
   * SysMLStoreからAppStoreにモデルを変換する
   * @param sysmlStore SysMLストア状態
   * @returns AppStoreダイアグラム
   */
  static sysMLToApp(sysmlStore: any): any {
    const elements = sysmlStore.elements || {};
    const relationships = sysmlStore.relationships || {};
    
    const blocks: Record<string, Block> = {};
    const connections: Record<string, Connection> = {};
    
    // PartDefinition要素をBlockに変換
    Object.values(elements).forEach((element: ModelElement) => {
      if (element.constructor.name === 'PartDefinition') {
        const partDef = element as PartDefinition;
        const block = new Block(
          partDef.name,
          [],  // プロパティは後で追加
          [],  // ポートは後で追加
          'block',
          partDef.description,
          partDef.id
        );
        blocks[partDef.id] = block;
      }
    });
    
    // 関係を処理してプロパティとポートをブロックに追加
    Object.values(relationships).forEach((rel: ModelRelationship) => {
      if (rel.type === 'featureMembership') {
        const ownerElement = elements[rel.sourceId];
        const feature = elements[rel.targetId];
        
        if (ownerElement && feature && ownerElement.constructor.name === 'PartDefinition') {
          const block = blocks[ownerElement.id];
          
          if (block) {
            if (feature.constructor.name === 'AttributeUsage') {
              const attr = feature as AttributeUsage;
              const property = new Property(
                attr.name,
                attr.typeId || 'string',
                block.id,
                undefined,
                undefined,
                undefined,
                attr.description,
                attr.id
              );
              block.addProperty(property);
            } else if (feature.constructor.name === 'PortUsage') {
              const portUsage = feature as PortUsage;
              const port = new Port(
                portUsage.name,
                portUsage.typeId || 'Interface',
                block.id,
                portUsage.direction,
                portUsage.description,
                portUsage.id
              );
              if (portUsage.position) {
                port.position = portUsage.position;
              }
              block.addPort(port);
            }
          }
        }
      }
    });
    
    // ConnectionUsage要素をConnectionに変換
    Object.values(elements).forEach((element: ModelElement) => {
      if (element.constructor.name === 'ConnectionUsage') {
        const connUsage = element as ConnectionUsage;
        if (connUsage.sourceEndId && connUsage.targetEndId) {
          const connection = new Connection(
            connUsage.sourceEndId,
            connUsage.targetEndId,
            'connector',
            connUsage.name,
            connUsage.description,
            connUsage.itemType,
            connUsage.id
          );
          if (connUsage.vertices) {
            connection.vertices = connUsage.vertices;
          }
          connections[connUsage.id] = connection;
        }
      }
    });
    
    // AppStoreに適用
    const appStore = useModelStore.getState();
    appStore.resetModel();
    
    // ブロックとコネクションを設定
    useModelStore.setState({
      blocks,
      connections
    });
    
    return { blocks, connections };
  }
  
  /**
   * AppStoreの要素更新をSysMLStoreに反映する
   * @param elementId 要素ID
   * @param updates 更新内容
   */
  static updateElementInBothStores(elementId: string, updates: any): void {
    // AppStoreの更新
    const appStore = useModelStore.getState();
    
    // 要素の種類を判定
    if (elementId in appStore.blocks) {
      appStore.updateBlock(elementId, updates);
      
      // SysMLStoreに同期
      const sysmlStore = useSysMLModelStore.getState();
      if (elementId in sysmlStore.elements) {
        const element = sysmlStore.elements[elementId];
        if (element.constructor.name === 'PartDefinition') {
          const partDef = element as PartDefinition;
          const partUpdates: Partial<PartDefinition> = {};
          
          if (updates.name !== undefined) partUpdates.name = updates.name;
          if (updates.description !== undefined) partUpdates.description = updates.description;
          
          sysmlStore.updateElement(elementId, partUpdates);
        }
      }
    }
  }
  
  /**
   * AppStoreのリレーションシップ更新をSysMLStoreに反映する
   * @param relationshipId リレーションシップID
   * @param updates 更新内容
   */
  static updateRelationshipInBothStores(relationshipId: string, updates: any): void {
    // AppStoreの更新
    const appStore = useModelStore.getState();
    
    // リレーションシップの種類を判定
    if (relationshipId in appStore.connections) {
      appStore.updateConnection(relationshipId, updates);
      
      // SysMLStoreに同期
      const sysmlStore = useSysMLModelStore.getState();
      if (relationshipId in sysmlStore.elements) {
        const element = sysmlStore.elements[relationshipId];
        if (element.constructor.name === 'ConnectionUsage') {
          const connUsage = element as ConnectionUsage;
          const connUpdates: Partial<ConnectionUsage> = {};
          
          if (updates.name !== undefined) connUpdates.name = updates.name;
          if (updates.description !== undefined) connUpdates.description = updates.description;
          if (updates.itemType !== undefined) connUpdates.itemType = updates.itemType;
          if (updates.vertices !== undefined) connUpdates.vertices = updates.vertices;
          
          sysmlStore.updateElement(relationshipId, connUpdates);
        }
      }
    }
  }
  
  /**
   * AppStore選択をSysMLStoreに同期する
   * @param elementId 要素ID
   * @param elementName 要素名
   */
  static syncElementSelection(elementId: string, elementName: string): void {
    const sysmlStore = useSysMLModelStore.getState();
    sysmlStore.selectElement(elementId);
  }
  
  /**
   * AppStoreのリレーションシップ選択をSysMLStoreに同期する
   * @param relationshipId リレーションシップID
   */
  static syncRelationshipSelection(relationshipId: string): void {
    const sysmlStore = useSysMLModelStore.getState();
    sysmlStore.selectRelationship(relationshipId);
  }
  
  /**
   * 選択クリアを両方のストアに適用
   */
  static clearSelectionInBothStores(): void {
    // AppStore側での選択クリア
    // TODO: AppStore側に適切な選択クリアメソッドがあれば呼び出す
    
    // SysMLStore側での選択クリア
    const sysmlStore = useSysMLModelStore.getState();
    sysmlStore.selectElement(undefined);
    sysmlStore.selectRelationship(undefined);
  }
}

/**
 * SysMLとAppStoreの連携ユーティリティ
 */
export const StoreSync = {
  /**
   * ストア同期の初期化
   * AppStore状態変更をリッスンしてSysMLストアにも反映する
   */
  init() {
    // TODO: ZustandのAppStore購読処理を実装
    console.log('ストア同期を初期化しました');
  },
  
  /**
   * モデルを双方のストアに適用
   * @param modelData モデルデータ
   */
  applyModelToBothStores(modelData: any) {
    // AppStoreに適用
    const appStore = useModelStore.getState();
    appStore.loadModelFromJson(JSON.stringify(modelData));
    
    // AppStoreからSysMLStoreに変換
    StoreAdapter.appToSysML(appStore);
  }
};