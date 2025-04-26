import { v4 as uuidv4 } from 'uuid';
import { KerML_Classifier } from './interfaces';
import { Type } from './Type';
import { Feature } from './Feature';

/**
 * KerML Classifier クラス
 * KerML メタモデルの分類子（Classifier）概念を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Classifier extends Type {
  /** 密閉クラスかどうか（拡張できないクラス） */
  isFinal: boolean = false;
  
  /** 個体クラスかどうか（インスタンスの識別性を持つ） */
  isIndividual: boolean = false;
  
  /**
   * Classifier コンストラクタ
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
    isFinal?: boolean;
    isIndividual?: boolean;
    features?: Feature[];
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
      features: options.features
    });
    
    if (options.isFinal !== undefined) {
      this.isFinal = options.isFinal;
    }
    
    if (options.isIndividual !== undefined) {
      this.isIndividual = options.isIndividual;
    }
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Classifier {
    return {
      ...super.toJSON(),
      __type: 'Classifier',
      isFinal: this.isFinal,
      isIndividual: this.isIndividual
    } as KerML_Classifier;
  }
  
  /**
   * JSON形式から分類子を作成
   * @param json JSON表現
   * @returns 分類子インスタンス
   */
  static fromJSON(json: KerML_Classifier, featureInstances: Feature[] = []): Classifier {
    // 基本的なClassifier情報で初期化
    const classifier = new Classifier({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated,
      isFinal: json.isFinal,
      isIndividual: json.isIndividual
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === classifier.id) {
          classifier.addFeature(feature);
        }
      });
    }
    
    return classifier;
  }
}