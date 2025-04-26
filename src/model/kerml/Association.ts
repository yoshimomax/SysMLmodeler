import { v4 as uuidv4 } from 'uuid';
import { KerML_Association } from './interfaces';
import { Classifier } from './Classifier';
import { Feature } from './Feature';

/**
 * KerML Association クラス
 * KerML メタモデルの型間の関連を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Association extends Classifier {
  /** 関連する型のID配列 */
  private _relatedTypes: string[] = [];
  
  /**
   * Association コンストラクタ
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
    relatedTypes?: string[];
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
      features: options.features
    });
    
    if (options.relatedTypes) {
      this._relatedTypes = [...options.relatedTypes];
    }
  }
  
  /**
   * 関連する型を取得
   */
  get relatedTypes(): string[] {
    return [...this._relatedTypes];
  }
  
  /**
   * 関連する型を追加
   * @param typeId 追加する型のID
   */
  addRelatedType(typeId: string): void {
    if (!this._relatedTypes.includes(typeId)) {
      this._relatedTypes.push(typeId);
    }
  }
  
  /**
   * 関連する型を削除
   * @param typeId 削除する型のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeRelatedType(typeId: string): boolean {
    const initialLength = this._relatedTypes.length;
    this._relatedTypes = this._relatedTypes.filter(id => id !== typeId);
    return this._relatedTypes.length !== initialLength;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Association {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'Association',
      relatedTypes: this._relatedTypes
    } as KerML_Association;
  }
  
  /**
   * JSON形式から関連を作成
   * @param json JSON表現
   * @returns 関連インスタンス
   */
  static fromJSON(json: KerML_Association, featureInstances: Feature[] = []): Association {
    // 基本的なClassifier情報でAssociationを初期化
    const association = new Association({
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
      relatedTypes: json.relatedTypes
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === association.id) {
          association.addFeature(feature);
        }
      });
    }
    
    return association;
  }
}