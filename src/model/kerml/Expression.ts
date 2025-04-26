import { v4 as uuidv4 } from 'uuid';
import { KerML_Expression } from './interfaces';
import { Behavior } from './Behavior';
import { Feature } from './Feature';

/**
 * KerML Expression クラス
 * KerML メタモデルの式を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Expression extends Behavior {
  /** 式本体 */
  body?: string;
  
  /** 結果への参照 */
  result?: string;
  
  /**
   * Expression コンストラクタ
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
    result?: string;
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
      steps: options.steps
    });
    
    this.body = options.body;
    this.result = options.result;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Expression {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Expression',
      body: this.body,
      result: this.result
    } as KerML_Expression;
  }
  
  /**
   * JSON形式から式を作成
   * @param json JSON表現
   * @returns 式インスタンス
   */
  static fromJSON(json: KerML_Expression, featureInstances: Feature[] = []): Expression {
    // 基本的なBehavior情報でExpressionを初期化
    const expression = new Expression({
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
      body: json.body,
      result: json.result
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === expression.id) {
          expression.addFeature(feature);
        }
      });
    }
    
    return expression;
  }
}