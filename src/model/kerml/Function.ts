import { v4 as uuidv4 } from 'uuid';
import { KerML_Function } from './interfaces';
import { Behavior } from './Behavior';
import { Feature } from './Feature';

/**
 * KerML Function クラス
 * KerML メタモデルの関数的な振る舞いを表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Function extends Behavior {
  /** 関数式のID */
  expression?: string;
  
  /**
   * Function コンストラクタ
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
    expression?: string;
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
    
    this.expression = options.expression;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Function {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Function',
      expression: this.expression
    } as KerML_Function;
  }
  
  /**
   * JSON形式から関数を作成
   * @param json JSON表現
   * @returns 関数インスタンス
   */
  static fromJSON(json: KerML_Function, featureInstances: Feature[] = []): Function {
    // 基本的なBehavior情報でFunctionを初期化
    const functionInstance = new Function({
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
      expression: json.expression
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === functionInstance.id) {
          functionInstance.addFeature(feature);
        }
      });
    }
    
    return functionInstance;
  }
}