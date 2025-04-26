import { v4 as uuidv4 } from 'uuid';
import { KerML_Predicate } from './interfaces';
import { Expression } from './Expression';
import { Feature } from './Feature';

/**
 * KerML Predicate クラス
 * KerML メタモデルのブール述語（条件）を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Predicate extends Expression {
  /**
   * Predicate コンストラクタ
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
    steps?: string[];
    body?: string;
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
      isFinal: options.isFinal,
      isIndividual: options.isIndividual,
      features: options.features,
      steps: options.steps,
      body: options.body,
      // 述語の結果は常にブール値なので、結果の型を指定しない
      result: undefined
    });
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Predicate {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Predicate'
    } as KerML_Predicate;
  }
  
  /**
   * JSON形式から述語を作成
   * @param json JSON表現
   * @returns 述語インスタンス
   */
  static fromJSON(json: KerML_Predicate, featureInstances: Feature[] = []): Predicate {
    // 基本的なExpression情報でPredicateを初期化
    const predicate = new Predicate({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated,
      isFinal: json.isFinal,
      isIndividual: json.isIndividual,
      steps: json.steps,
      body: json.body
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === predicate.id) {
          predicate.addFeature(feature);
        }
      });
    }
    
    return predicate;
  }
}