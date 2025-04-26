import { v4 as uuidv4 } from 'uuid';
import { KerML_MetadataFeature } from './interfaces';
import { Feature } from './Feature';

/**
 * KerML MetadataFeature クラス
 * KerML メタモデルのメタデータを表現する特性
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class MetadataFeature extends Feature {
  /** 注釈を付ける要素のID配列 */
  private _annotatedElements: string[] = [];
  
  /**
   * MetadataFeature コンストラクタ
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
    annotatedElements?: string[];
  } = {}) {
    // 親クラスのコンストラクタを呼び出し
    super({
      id: options.id || uuidv4(),
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
    
    if (options.annotatedElements) {
      this._annotatedElements = [...options.annotatedElements];
    }
  }
  
  /**
   * 注釈を付ける要素のID配列を取得
   */
  get annotatedElements(): string[] {
    return [...this._annotatedElements];
  }
  
  /**
   * 注釈を付ける要素を追加
   * @param elementId 追加する要素のID
   */
  addAnnotatedElement(elementId: string): void {
    if (!this._annotatedElements.includes(elementId)) {
      this._annotatedElements.push(elementId);
    }
  }
  
  /**
   * 注釈を付ける要素を削除
   * @param elementId 削除する要素のID
   * @returns 削除に成功した場合はtrue、見つからない場合はfalse
   */
  removeAnnotatedElement(elementId: string): boolean {
    const initialLength = this._annotatedElements.length;
    this._annotatedElements = this._annotatedElements.filter(id => id !== elementId);
    return this._annotatedElements.length !== initialLength;
  }
  
  /**
   * JSON形式に変換
   * @returns メタデータ特性のJSON表現
   */
  toJSON(): KerML_MetadataFeature {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      __type: 'MetadataFeature',
      annotatedElements: this._annotatedElements
    } as KerML_MetadataFeature;
  }
  
  /**
   * JSON形式からメタデータ特性を作成
   * @param json JSON表現
   * @returns メタデータ特性インスタンス
   */
  static fromJSON(json: KerML_MetadataFeature, featureInstances: Feature[] = []): MetadataFeature {
    // 基本的なFeature情報でMetadataFeatureを初期化
    const metadataFeature = new MetadataFeature({
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
      annotatedElements: json.annotatedElements
    });
    
    // Feature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(feature => {
        if (feature.ownerId === metadataFeature.id) {
          metadataFeature.addFeature(feature);
        }
      });
    }
    
    return metadataFeature;
  }
}