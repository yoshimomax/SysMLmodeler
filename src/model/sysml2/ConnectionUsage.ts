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
import { SysML2_ConnectionUsage } from './interfaces';

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
  
  /** 接続元エンドの役割名（オプション） */
  sourceEndRole?: string;
  
  /** 接続先エンドの役割名（オプション） */
  targetEndRole?: string;
  
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
    sourceEndRole?: string;
    targetEndRole?: string;
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
    this.sourceEndRole = options.sourceEndRole;
    this.targetEndRole = options.targetEndRole;
    
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
   * 接続定義を設定する
   * @param connectionDefinitionId 接続定義のID
   */
  setConnectionDefinition(connectionDefinitionId: string): void {
    this.connectionDefinitionId = connectionDefinitionId;
  }
  
  /**
   * エンドの役割名を設定する
   * @param sourceRole 接続元の役割名
   * @param targetRole 接続先の役割名
   */
  setEndRoles(sourceRole: string, targetRole: string): void {
    this.sourceEndRole = sourceRole;
    this.targetEndRole = targetRole;
  }
  
  /**
   * エンドの特性IDを入れ替える（接続の向きを反転する）
   */
  reverseDirection(): void {
    const tempId = this.sourceEndId;
    this.sourceEndId = this.targetEndId;
    this.targetEndId = tempId;
    
    // 役割名も入れ替え
    if (this.sourceEndRole || this.targetEndRole) {
      const tempRole = this.sourceEndRole;
      this.sourceEndRole = this.targetEndRole;
      this.targetEndRole = tempRole;
    }
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
        vertices: this.vertices ? [...this.vertices] : undefined,
        sourceEndRole: this.sourceEndRole,
        targetEndRole: this.targetEndRole
      }
    };
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  override toJSON(): SysML2_ConnectionUsage {
    const baseJson = super.toJSON();
    
    return {
      ...baseJson,
      __type: 'ConnectionUsage',
      connectionDefinition: this.connectionDefinitionId,
      endFeatures: [this.sourceEndId, this.targetEndId],
      sourceType: this.sourceEndRole,
      targetType: this.targetEndRole,
      itemType: this.itemType,
      // インターフェース型で定義されていないプロパティはカスタムプロパティとして追加
      sourceEndId: this.sourceEndId,
      targetEndId: this.targetEndId,
      vertices: this.vertices
    };
  }
  
  /**
   * JSONデータからConnectionUsageインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいConnectionUsageインスタンス
   */
  static fromJSON(json: SysML2_ConnectionUsage): ConnectionUsage {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    // endFeaturesから接続元・先を取得、または直接指定されたプロパティを使用
    let sourceEndId = json.sourceEndId;
    let targetEndId = json.targetEndId;
    
    // endFeaturesが配列としてあり、sourceEndIdが指定されていない場合に使用
    if (Array.isArray(json.endFeatures) && json.endFeatures.length >= 2 && !sourceEndId) {
      sourceEndId = json.endFeatures[0];
      targetEndId = json.endFeatures[1];
    }
    
    // ソースまたはターゲットIDが見つからない場合はエラー
    if (!sourceEndId || !targetEndId) {
      throw new Error('接続元・接続先のエンドIDが指定されていません');
    }
    
    // ConnectionUsageインスタンスを作成
    const connectionUsage = new ConnectionUsage({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      description: json.description,
      sourceEndId: sourceEndId,
      targetEndId: targetEndId,
      connectionDefinitionId: json.connectionDefinition,
      itemType: json.itemType,
      vertices: json.vertices,
      sourceEndRole: json.sourceType,
      targetEndRole: json.targetType,
      isAbstract: json.isAbstract
    });
    
    return connectionUsage;
  }
  
  /**
   * このConnectionUsageのコピーを作成する
   * @param overrides 上書きするプロパティ
   * @returns 新しいConnectionUsageインスタンス
   */
  copy(overrides: Partial<{
    id: string;
    name: string;
    sourceEndId: string;
    targetEndId: string;
    itemType: string;
    vertices: { x: number; y: number }[];
  }> = {}): ConnectionUsage {
    return new ConnectionUsage({
      id: overrides.id,
      name: overrides.name || `${this.name}_copy`,
      ownerId: this.ownerId,
      description: this.description,
      sourceEndId: overrides.sourceEndId || this.sourceEndId,
      targetEndId: overrides.targetEndId || this.targetEndId,
      connectionDefinitionId: this.connectionDefinitionId,
      itemType: overrides.itemType || this.itemType,
      vertices: overrides.vertices || (this.vertices ? [...this.vertices] : undefined),
      sourceEndRole: this.sourceEndRole,
      targetEndRole: this.targetEndRole,
      isAbstract: this.isAbstract
    });
  }
}