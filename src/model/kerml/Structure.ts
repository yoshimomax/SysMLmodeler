import { v4 as uuidv4 } from 'uuid';
import { KerML_Structure } from './interfaces';
import { Classifier } from './Classifier';
import { Feature } from './Feature';

/**
 * KerML Structure クラス
 * KerML メタモデルの複合構造（シーケンス、記録など）概念を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Structure extends Classifier {
  /**
   * Structure コンストラクタ
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
    super(options);
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Structure {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Structure'
    } as KerML_Structure;
  }
  
  /**
   * JSON形式から構造を作成
   * @param json JSON表現
   * @returns 構造インスタンス
   */
  static fromJSON(json: KerML_Structure, featureInstances: Feature[] = []): Structure {
    // 基本的なClassifier情報でStructureを初期化
    const structure = new Structure({
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
        if (feature.ownerId === structure.id) {
          structure.addFeature(feature);
        }
      });
    }
    
    return structure;
  }
}