import { v4 as uuidv4 } from 'uuid';
import { KerML_Feature } from './interfaces';
import { Type } from './Type';

/**
 * Feature オブジェクトのインターフェース
 * Feature クラスとその派生クラスの共通オブジェクト構造を定義
 */
export interface FeatureObject {
  id: string;
  name?: string;
  type: string;
  properties: Record<string, any>;
}

/**
 * KerML Feature クラス
 * KerML メタモデルの特性（Feature）概念を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Feature extends Type {
  /** 一意かどうか */
  isUnique: boolean = true;
  
  /** 順序付けられているかどうか */
  isOrdered: boolean = false;
  
  /** コンポジションかどうか */
  isComposite: boolean = false;
  
  /** 部分かどうか */
  isPortion: boolean = false;
  
  /** 読み取り専用かどうか */
  isReadOnly: boolean = false;
  
  /** 派生かどうか */
  isDerived: boolean = false;
  
  /** 関連の終端かどうか */
  isEnd: boolean = false;
  
  /** 方向 */
  direction?: 'in' | 'out' | 'inout';
  
  /** 再定義対象のFeature ID配列 */
  redefinitionIds: string[] = [];
  
  /** 型参照ID */
  private _typeId?: string;
  
  /**
   * Feature コンストラクタ
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
    isComposite?: boolean;
    isPortion?: boolean;
    isReadOnly?: boolean;
    isDerived?: boolean;
    isEnd?: boolean;
    direction?: 'in' | 'out' | 'inout';
    typeId?: string;
    redefinitionIds?: string[];
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
    
    if (options.isUnique !== undefined) {
      this.isUnique = options.isUnique;
    }
    
    if (options.isOrdered !== undefined) {
      this.isOrdered = options.isOrdered;
    }
    
    if (options.isComposite !== undefined) {
      this.isComposite = options.isComposite;
    }
    
    if (options.isPortion !== undefined) {
      this.isPortion = options.isPortion;
    }
    
    if (options.isReadOnly !== undefined) {
      this.isReadOnly = options.isReadOnly;
    }
    
    if (options.isDerived !== undefined) {
      this.isDerived = options.isDerived;
    }
    
    if (options.isEnd !== undefined) {
      this.isEnd = options.isEnd;
    }
    
    if (options.redefinitionIds) {
      this.redefinitionIds = [...options.redefinitionIds];
    }
    
    this.direction = options.direction;
    this._typeId = options.typeId;
  }
  
  /**
   * 型参照IDを取得
   */
  get typeId(): string | undefined {
    return this._typeId;
  }
  
  /**
   * 型参照IDを設定
   */
  set typeId(id: string | undefined) {
    this._typeId = id;
  }
  
  /**
   * 共通オブジェクト形式に変換（派生クラスでのオーバーライド用）
   * @returns FeatureObject 構造
   */
  toObject(): FeatureObject {
    return {
      id: this.id,
      name: this.name,
      type: 'Feature',
      properties: {
        isUnique: this.isUnique,
        isOrdered: this.isOrdered,
        isComposite: this.isComposite,
        isPortion: this.isPortion,
        isReadOnly: this.isReadOnly,
        isDerived: this.isDerived,
        isEnd: this.isEnd,
        direction: this.direction,
        typeId: this._typeId,
        redefinitionIds: [...this.redefinitionIds],
        ownerId: this.ownerId,
        shortName: this.shortName,
        qualifiedName: this.qualifiedName,
        description: this.description
      }
    };
  }

  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Feature {
    const obj = this.toObject();
    // obj.properties内のすべてのプロパティをトップレベルに移動
    const result = {
      ...obj,
      ...obj.properties,
      __type: 'Feature',
      isUnique: this.isUnique,
      isOrdered: this.isOrdered,
      isComposite: this.isComposite,
      isPortion: this.isPortion,
      isReadOnly: this.isReadOnly,
      isDerived: this.isDerived,
      isEnd: this.isEnd,
      direction: this.direction,
      type: this._typeId,
      redefinitions: this.redefinitionIds.length > 0 ? this.redefinitionIds : undefined
    };
    // propertiesプロパティは削除
    delete result.properties;
    return result as KerML_Feature;
  }
  
  /**
   * JSON形式から特性を作成
   * @param json JSON表現
   * @returns 特性インスタンス
   */
  static fromJSON(json: KerML_Feature, featureInstances: Feature[] = []): Feature {
    // 基本的なFeature情報で初期化
    const feature = new Feature({
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
      isComposite: json.isComposite,
      isPortion: json.isPortion,
      isReadOnly: json.isReadOnly,
      isDerived: json.isDerived,
      isEnd: json.isEnd,
      direction: json.direction,
      typeId: json.type,
      redefinitionIds: json.redefinitions
    });
    
    // 入れ子のFeature情報は既に生成されたインスタンスを使用
    if (featureInstances.length > 0) {
      featureInstances.forEach(childFeature => {
        if (childFeature.ownerId === feature.id) {
          feature.addFeature(childFeature);
        }
      });
    }
    
    return feature;
  }
}