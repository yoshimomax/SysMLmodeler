import { v4 as uuidv4 } from 'uuid';
import { KerML_ItemFlow } from './interfaces';
import { Connector } from './Connector';
import { Feature } from './Feature';

/**
 * KerML ItemFlow クラス
 * KerML メタモデルの特性間のアイテム流れを表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class ItemFlow extends Connector {
  /** アイテムの型ID */
  itemType?: string;
  
  /**
   * ItemFlow コンストラクタ
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
      connectedFeatures: options.connectedFeatures
    });
    
    this.itemType = options.itemType;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_ItemFlow {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'ItemFlow',
      itemType: this.itemType
    } as KerML_ItemFlow;
  }
  
  /**
   * JSON形式からアイテムフローを作成
   * @param json JSON表現
   * @returns アイテムフローインスタンス
   */
  static fromJSON(json: KerML_ItemFlow, featureInstances: Feature[] = []): ItemFlow {
    // 基本的なConnector情報でItemFlowを初期化
    const itemFlow = new ItemFlow({
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
      itemType: json.itemType
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === itemFlow.id) {
          itemFlow.addFeature(feature);
        }
      });
    }
    
    return itemFlow;
  }
}