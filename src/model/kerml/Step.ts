import { v4 as uuidv4 } from 'uuid';
import { KerML_Step } from './interfaces';
import { Feature } from './Feature';

/**
 * KerML Step クラス
 * KerML メタモデルの振る舞いの中の単一ステップを表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Step extends Feature {
  /** 参照する振る舞いのID */
  behaviorReference?: string;
  
  /**
   * Step コンストラクタ
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
    behaviorReference?: string;
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
      features: options.features
    });
    
    this.behaviorReference = options.behaviorReference;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Step {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Step',
      behaviorReference: this.behaviorReference
    } as KerML_Step;
  }
  
  /**
   * JSON形式からステップを作成
   * @param json JSON表現
   * @returns ステップインスタンス
   */
  static fromJSON(json: KerML_Step, featureInstances: Feature[] = []): Step {
    // 基本的なFeature情報でStepを初期化
    const step = new Step({
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
      behaviorReference: json.behaviorReference
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === step.id) {
          step.addFeature(feature);
        }
      });
    }
    
    return step;
  }
}