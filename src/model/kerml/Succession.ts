import { v4 as uuidv4 } from 'uuid';
import { KerML_Succession } from './interfaces';
import { Connector } from './Connector';
import { Feature } from './Feature';

/**
 * KerML Succession クラス
 * KerML メタモデルの時間的な前後関係を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Succession extends Connector {
  /** 効果の記述 */
  effect?: string;
  
  /** ガード条件 */
  guard?: string;
  
  /**
   * Succession コンストラクタ
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
    
    this.effect = options.effect;
    this.guard = options.guard;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Succession {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Succession',
      effect: this.effect,
      guard: this.guard
    } as KerML_Succession;
  }
  
  /**
   * JSON形式からサクセションを作成
   * @param json JSON表現
   * @returns サクセションインスタンス
   */
  static fromJSON(json: KerML_Succession, featureInstances: Feature[] = []): Succession {
    // 基本的なConnector情報でSuccessionを初期化
    const succession = new Succession({
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
      guard: json.guard
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === succession.id) {
          succession.addFeature(feature);
        }
      });
    }
    
    return succession;
  }
}