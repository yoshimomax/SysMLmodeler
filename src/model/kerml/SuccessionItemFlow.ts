import { v4 as uuidv4 } from 'uuid';
import { KerML_SuccessionItemFlow } from './interfaces';
import { Succession } from './Succession';
import { Feature } from './Feature';

/**
 * KerML SuccessionItemFlow クラス
 * KerML メタモデルの時間的な前後関係の中でのアイテム流れを表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class SuccessionItemFlow extends Succession {
  /** アイテムの型ID */
  itemType?: string;
  
  /**
   * SuccessionItemFlow コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    ownerId?: string;
    name?: string;
    shortName?: string;
    qualifiedName?: string;
    description?: string;
    isAbstract?: boolean;
    isConjugated?: boolean;
    isUnique?: boolean;
    isOrdered?: boolean;
    direction?: 'in' | 'out' | 'inout';
    typeId?: string;
    features?: Feature[];
    connectedFeatures?: string[];
    effect?: string;
    guard?: string;
    itemType?: string;
  } = {}) {
    // 親クラスのコンストラクタを呼び出し
    super({
      id: options.id,
      ownerId: options.ownerId,
      name: options.name,
      shortName: options.shortName,
      qualifiedName: options.qualifiedName,
      description: options.description,
      isAbstract: options.isAbstract,
      isConjugated: options.isConjugated,
      isUnique: options.isUnique,
      isOrdered: options.isOrdered,
      direction: options.direction,
      typeId: options.typeId,
      features: options.features,
      connectedFeatures: options.connectedFeatures,
      effect: options.effect,
      guard: options.guard
    });
    
    this.itemType = options.itemType;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_SuccessionItemFlow {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'SuccessionItemFlow',
      itemType: this.itemType
    } as KerML_SuccessionItemFlow;
  }
  
  /**
   * JSON形式からサクセションアイテムフローを作成
   * @param json JSON表現
   * @returns サクセションアイテムフローインスタンス
   */
  static fromJSON(json: KerML_SuccessionItemFlow, featureInstances: Feature[] = []): SuccessionItemFlow {
    // 基本的なSuccession情報でSuccessionItemFlowを初期化
    const successionItemFlow = new SuccessionItemFlow({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated,
      isUnique: json.isUnique,
      isOrdered: json.isOrdered,
      direction: json.direction,
      typeId: json.type,
      connectedFeatures: json.connectedFeatures,
      effect: json.effect,
      guard: json.guard,
      itemType: json.itemType
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === successionItemFlow.id) {
          successionItemFlow.addFeature(feature);
        }
      });
    }
    
    return successionItemFlow;
  }
}