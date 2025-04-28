/**
 * SysML v2 ConnectionDefinition クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §8.5.2に準拠
 * 
 * ConnectionDefinitionは、要素間の接続の種類を定義するクラスです。
 */

import { v4 as uuid } from 'uuid';
import { Definition } from '../kerml/Definition';
import { Feature } from '../kerml/Feature';
import { SysML2_ConnectionDefinition } from './interfaces';
import { ConnectionUsage } from './ConnectionUsage';

/**
 * ConnectionDefinition クラス
 * SysML v2の接続定義を表現するクラス
 */
export class ConnectionDefinition extends Definition {
  /** 端点特性のID配列 */
  endFeatures: string[] = [];
  
  /** 接続使用のID配列 */
  connectionUsages: string[] = [];
  
  /** 内部で保持するConnectionUsageインスタンスのコレクション */
  usages: ConnectionUsage[] = [];
  
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
    usages?: ConnectionUsage[];
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
    
    this.usages = options.usages || [];
    
    // 既存のusagesにdefinitionIdが設定されていることを確認
    this.usages.forEach(usage => {
      this.registerConnectionUsage(usage);
    });
  }
  
  /**
   * ConnectionUsageインスタンスを登録する
   * @param usage 登録するConnectionUsageインスタンス
   */
  registerConnectionUsage(usage: ConnectionUsage): void {
    // usageのconnectionDefinitionIdを自身のIDに設定
    usage.connectionDefinitionId = this.id;
    
    // connectionUsagesリストにIDが未登録なら追加
    if (!this.connectionUsages.includes(usage.id)) {
      this.connectionUsages.push(usage.id);
    }
    
    // usagesコレクションにインスタンスが未登録なら追加
    if (!this.usages.some(u => u.id === usage.id)) {
      this.usages.push(usage);
    }
  }
  
  /**
   * 2つの特性間の接続を作成する
   * @param sourceFeature 接続元特性
   * @param targetFeature 接続先特性
   * @param options その他のオプション
   * @returns 作成された接続使用
   */
  connect(sourceFeature: Feature, targetFeature: Feature, options: {
    name?: string;
    itemType?: string;
    vertices?: { x: number; y: number }[];
  } = {}): ConnectionUsage {
    // 新しいConnectionUsageを作成
    const connectionUsage = new ConnectionUsage({
      name: options.name || `${this.name}_${sourceFeature.name}_to_${targetFeature.name}`,
      sourceEndId: sourceFeature.id,
      targetEndId: targetFeature.id,
      itemType: options.itemType,
      vertices: options.vertices
    });
    
    // 自身に登録
    this.registerConnectionUsage(connectionUsage);
    
    return connectionUsage;
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
   * @returns 削除が成功したかどうか
   */
  removeConnectionUsage(connectionUsageId: string): boolean {
    const initialLength = this.connectionUsages.length;
    this.connectionUsages = this.connectionUsages.filter(id => id !== connectionUsageId);
    
    // usagesコレクションからも削除
    this.usages = this.usages.filter(usage => usage.id !== connectionUsageId);
    
    return this.connectionUsages.length !== initialLength;
  }
  
  /**
   * 指定されたIDを持つConnectionUsageを取得する
   * @param id 取得するConnectionUsageのID
   * @returns 見つかったConnectionUsageまたはundefined
   */
  getUsageById(id: string): ConnectionUsage | undefined {
    return this.usages.find(usage => usage.id === id);
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  override toJSON(): SysML2_ConnectionDefinition {
    const baseJson = super.toJSON();
    
    return {
      ...baseJson,
      __type: 'ConnectionDefinition',
      stereotype: this.stereotype,
      relatedTypeId: this.relatedTypeId,
      sourceType: this.sourceTypeId,
      targetType: this.targetTypeId,
      endFeatures: [...this.endFeatures],
      connectionUsages: [...this.connectionUsages]
    };
  }
  
  /**
   * JSONデータからConnectionDefinitionインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいConnectionDefinitionインスタンス
   */
  static fromJSON(json: SysML2_ConnectionDefinition): ConnectionDefinition {
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
      sourceTypeId: json.sourceType,
      targetTypeId: json.targetType,
      endFeatures: json.endFeatures,
      connectionUsages: json.connectionUsages,
      usageReferences: json.usageReferences
    });
  }
  
  /**
   * オブジェクトをプレーンなJavaScriptオブジェクトに変換する（UI表示用）
   * @returns プレーンなJavaScriptオブジェクト
   */
  override toObject() {
    return {
      ...super.toObject(),
      stereotype: this.stereotype || 'connection_def',
      endFeatures: [...this.endFeatures],
      connectionUsages: [...this.connectionUsages],
      relatedTypeId: this.relatedTypeId,
      sourceTypeId: this.sourceTypeId,
      targetTypeId: this.targetTypeId
    };
  }
}