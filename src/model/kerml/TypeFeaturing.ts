import { v4 as uuidv4 } from 'uuid';
import { KerML_TypeFeaturing } from './interfaces';

/**
 * KerML TypeFeaturing クラス
 * KerML メタモデルの型特性関係概念を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class TypeFeaturing {
  /** 一意識別子 */
  readonly id: string;
  
  /** 所有者要素ID */
  ownerId?: string;
  
  /** 要素名 */
  name?: string;
  
  /** 短い名前（エイリアス） */
  shortName?: string;
  
  /** 修飾名（完全修飾名） */
  qualifiedName?: string;
  
  /** 説明 */
  description?: string;
  
  /** 特性を持つ型のID */
  featuringType: string;
  
  /** 特性として使われる型のID */
  featuredType: string;
  
  /**
   * TypeFeaturing コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    ownerId?: string;
    name?: string;
    shortName?: string;
    qualifiedName?: string;
    description?: string;
    featuringType: string;
    featuredType: string;
  }) {
    this.id = options.id || uuidv4();
    this.ownerId = options.ownerId;
    this.name = options.name;
    this.shortName = options.shortName;
    this.qualifiedName = options.qualifiedName;
    this.description = options.description;
    
    // 必須プロパティ
    this.featuringType = options.featuringType;
    this.featuredType = options.featuredType;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_TypeFeaturing {
    return {
      __type: 'TypeFeaturing',
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      shortName: this.shortName,
      qualifiedName: this.qualifiedName,
      description: this.description,
      featuringType: this.featuringType,
      featuredType: this.featuredType
    };
  }
  
  /**
   * JSON形式から型特性関係を作成
   * @param json JSON表現
   * @returns 型特性関係インスタンス
   */
  static fromJSON(json: KerML_TypeFeaturing): TypeFeaturing {
    return new TypeFeaturing({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      featuringType: json.featuringType,
      featuredType: json.featuredType
    });
  }
}