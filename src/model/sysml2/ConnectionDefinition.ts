/**
 * SysML v2 ConnectionDefinition クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §8.5.2に準拠
 * 
 * ConnectionDefinitionは、要素間の接続の種類を定義するクラスです。
 */

import { v4 as uuid } from 'uuid';
import { Definition } from '../kerml/Definition';
import { Feature } from '../kerml/Feature';

/**
 * ConnectionDefinition クラス
 * SysML v2の接続定義を表現するクラス
 */
export class ConnectionDefinition extends Definition {
  /** 端点特性のID配列 */
  endFeatures: string[] = [];
  
  /** 接続使用のID配列 */
  connectionUsages: string[] = [];
  
  /** ステレオタイプ（種類） */
  stereotype?: string;
  
  /** 関連する型ID（オプション） */
  relatedTypeId?: string;
  
  /** ソース型ID（オプション） */
  sourceTypeId?: string;
  
  /** ターゲット型ID（オプション） */
  targetTypeId?: string;
  
  /**
   * ConnectionDefinition コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    description?: string;
    isAbstract?: boolean;
    stereotype?: string;
    ownerId?: string;
    relatedTypeId?: string;
    sourceTypeId?: string;
    targetTypeId?: string;
    ownedFeatures?: Feature[];
    endFeatures?: string[];
    connectionUsages?: string[];
    usageReferences?: string[];
  } = {}) {
    super({
      id: options.id,
      name: options.name,
      description: options.description,
      isAbstract: options.isAbstract,
      ownedFeatures: options.ownedFeatures,
      usageReferences: options.usageReferences
    });
    
    this.stereotype = options.stereotype;
    this.relatedTypeId = options.relatedTypeId;
    this.sourceTypeId = options.sourceTypeId;
    this.targetTypeId = options.targetTypeId;
    
    if (options.endFeatures) {
      this.endFeatures = [...options.endFeatures];
    }
    
    if (options.connectionUsages) {
      this.connectionUsages = [...options.connectionUsages];
    }
  }
  
  /**
   * 端点特性を追加する
   * @param endFeatureId 追加する端点特性のID
   */
  addEndFeature(endFeatureId: string): void {
    if (!this.endFeatures.includes(endFeatureId)) {
      this.endFeatures.push(endFeatureId);
    }
  }
  
  /**
   * 端点特性を削除する
   * @param endFeatureId 削除する端点特性のID
   */
  removeEndFeature(endFeatureId: string): void {
    this.endFeatures = this.endFeatures.filter(id => id !== endFeatureId);
  }
  
  /**
   * 接続使用を追加する
   * @param connectionUsageId 追加する接続使用のID
   */
  addConnectionUsage(connectionUsageId: string): void {
    if (!this.connectionUsages.includes(connectionUsageId)) {
      this.connectionUsages.push(connectionUsageId);
    }
  }
  
  /**
   * 接続使用を削除する
   * @param connectionUsageId 削除する接続使用のID
   */
  removeConnectionUsage(connectionUsageId: string): void {
    this.connectionUsages = this.connectionUsages.filter(id => id !== connectionUsageId);
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  override toJSON(): any {
    const baseJson = super.toJSON();
    
    return {
      ...baseJson,
      stereotype: this.stereotype,
      relatedTypeId: this.relatedTypeId,
      sourceTypeId: this.sourceTypeId,
      targetTypeId: this.targetTypeId,
      endFeatures: [...this.endFeatures],
      connectionUsages: [...this.connectionUsages],
      __type: 'ConnectionDefinition'
    };
  }
  
  /**
   * JSONデータからConnectionDefinitionインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいConnectionDefinitionインスタンス
   */
  static fromJSON(json: any): ConnectionDefinition {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    return new ConnectionDefinition({
      id: json.id || uuid(),
      name: json.name,
      description: json.description,
      isAbstract: json.isAbstract,
      stereotype: json.stereotype,
      relatedTypeId: json.relatedTypeId,
      sourceTypeId: json.sourceTypeId,
      targetTypeId: json.targetTypeId,
      endFeatures: json.endFeatures,
      connectionUsages: json.connectionUsages,
      usageReferences: json.usageReferences
    });
  }
}