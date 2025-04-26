import { v4 as uuidv4 } from 'uuid';
import { KerML_Difference } from './interfaces';
import { Type } from './Type';
import { Feature } from './Feature';

/**
 * KerML Difference クラス
 * KerML メタモデルの差分型概念を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Difference extends Type {
  /** 第1オペランド（ベース型）のID */
  firstOperand: string;
  
  /** 第2オペランド（除外型）のID */
  secondOperand: string;
  
  /**
   * Difference コンストラクタ
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
    features?: Feature[];
    firstOperand: string;
    secondOperand: string;
  }) {
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
    
    // 必須プロパティ
    this.firstOperand = options.firstOperand;
    this.secondOperand = options.secondOperand;
  }
  
  /**
   * オペランドを更新
   * @param firstOperand 新しい第1オペランド
   * @param secondOperand 新しい第2オペランド
   */
  updateOperands(firstOperand: string, secondOperand: string): void {
    this.firstOperand = firstOperand;
    this.secondOperand = secondOperand;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Difference {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Difference',
      firstOperand: this.firstOperand,
      secondOperand: this.secondOperand
    } as KerML_Difference;
  }
  
  /**
   * JSON形式から差分型を作成
   * @param json JSON表現
   * @returns 差分型インスタンス
   */
  static fromJSON(json: KerML_Difference, featureInstances: Feature[] = []): Difference {
    // 基本的なType情報でDifferenceを初期化
    const difference = new Difference({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      isAbstract: json.isAbstract,
      isConjugated: json.isConjugated,
      firstOperand: json.firstOperand,
      secondOperand: json.secondOperand
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === difference.id) {
          difference.addFeature(feature);
        }
      });
    }
    
    return difference;
  }
}