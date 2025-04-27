/**
 * SysML v2 ConnectionUsage クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §9.10に準拠
 * 
 * ConnectionUsageは、システム内の要素間の接続の使用を表現するクラスです。
 * 物理的接続、データフロー、依存関係などを表現します。
 */

import { v4 as uuid } from 'uuid';
import { Feature } from '../kerml/Feature';
import { FeatureObject } from '../kerml/Feature';

export class ConnectionUsage extends Feature {
  /** 接続元エンドID */
  sourceEndId: string;
  
  /** 接続先エンドID */
  targetEndId: string;
  
  /** 接続定義ID（オプション） */
  connectionDefinitionId?: string;
  
  /** 伝達アイテムの型（オプション） */
  itemType?: string;
  
  /** 接続パス上の中間点（UI表示用） */
  vertices?: { x: number; y: number }[] = [];
  
  /**
   * ConnectionUsage コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    ownerId?: string;
    description?: string;
    sourceEndId: string;
    targetEndId: string;
    connectionDefinitionId?: string;
    itemType?: string;
    vertices?: { x: number; y: number }[];
    isAbstract?: boolean;
  }) {
    super({
      id: options.id,
      name: options.name,
      ownerId: options.ownerId,
      description: options.description,
      isAbstract: options.isAbstract
    });
    
    this.sourceEndId = options.sourceEndId;
    this.targetEndId = options.targetEndId;
    this.connectionDefinitionId = options.connectionDefinitionId;
    this.itemType = options.itemType;
    
    if (options.vertices) {
      this.vertices = [...options.vertices];
    }
  }
  
  /**
   * 中間点を設定する
   * @param vertices 中間点の配列
   */
  setVertices(vertices: { x: number; y: number }[]): void {
    this.vertices = [...vertices];
  }
  
  /**
   * 伝達アイテムの型を設定する
   * @param itemType アイテムの型
   */
  setItemType(itemType: string): void {
    this.itemType = itemType;
  }
  
  /**
   * 接続の情報をオブジェクトとして返す
   * @returns FeatureObject 構造
   */
  override toObject(): FeatureObject {
    const baseObject = super.toObject();
    return {
      ...baseObject,
      type: 'ConnectionUsage',
      properties: {
        ...baseObject.properties,
        sourceEndId: this.sourceEndId,
        targetEndId: this.targetEndId,
        connectionDefinitionId: this.connectionDefinitionId,
        itemType: this.itemType,
        vertices: this.vertices ? [...this.vertices] : undefined
      }
    };
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  override toJSON(): any {
    const obj = this.toObject();
    // obj.properties内のすべてのプロパティをトップレベルに移動
    const result = {
      ...obj,
      ...obj.properties,
      __type: 'ConnectionUsage'
    };
    // propertiesプロパティを除外した新しいオブジェクトを作成
    const { properties, ...resultWithoutProperties } = result;
    return resultWithoutProperties;
  }
  
  /**
   * JSONデータからConnectionUsageインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいConnectionUsageインスタンス
   */
  static fromJSON(json: any): ConnectionUsage {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    if (!json.sourceEndId || !json.targetEndId) {
      throw new Error('接続元・接続先のエンドIDが指定されていません');
    }
    
    // ConnectionUsageインスタンスを作成
    const connectionUsage = new ConnectionUsage({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      description: json.description,
      sourceEndId: json.sourceEndId,
      targetEndId: json.targetEndId,
      connectionDefinitionId: json.connectionDefinitionId,
      itemType: json.itemType,
      vertices: json.vertices,
      isAbstract: json.isAbstract
    });
    
    return connectionUsage;
  }
}