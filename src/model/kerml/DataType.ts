import { v4 as uuidv4 } from 'uuid';
import { KerML_DataType } from './interfaces';
import { Classifier } from './Classifier';
import { Feature } from './Feature';

/**
 * KerML DataType クラス
 * KerML メタモデルの基本的なデータ型概念を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class DataType extends Classifier {
  /**
   * DataType コンストラクタ
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
  toJSON(): KerML_DataType {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'DataType'
    } as KerML_DataType;
  }
  
  /**
   * JSON形式からデータ型を作成
   * @param json JSON表現
   * @returns データ型インスタンス
   */
  static fromJSON(json: KerML_DataType, featureInstances: Feature[] = []): DataType {
    // 基本的なClassifier情報でDataTypeを初期化
    const dataType = new DataType({
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
        if (feature.ownerId === dataType.id) {
          dataType.addFeature(feature);
        }
      });
    }
    
    return dataType;
  }
}