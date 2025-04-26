import { v4 as uuidv4 } from 'uuid';
import { KerML_FeatureChaining } from './interfaces';

/**
 * KerML FeatureChaining クラス
 * KerML メタモデルの特性チェーン関係概念を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class FeatureChaining {
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
  
  /** チェーン特性のID */
  chainingFeature: string;
  
  /** 特性を持つ要素のID */
  featuredBy: string;
  
  /**
   * FeatureChaining コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    ownerId?: string;
    name?: string;
    shortName?: string;
    qualifiedName?: string;
    description?: string;
    chainingFeature: string;
    featuredBy: string;
  }) {
    this.id = options.id || uuidv4();
    this.ownerId = options.ownerId;
    this.name = options.name;
    this.shortName = options.shortName;
    this.qualifiedName = options.qualifiedName;
    this.description = options.description;
    
    // 必須プロパティ
    this.chainingFeature = options.chainingFeature;
    this.featuredBy = options.featuredBy;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_FeatureChaining {
    return {
      __type: 'FeatureChaining',
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      shortName: this.shortName,
      qualifiedName: this.qualifiedName,
      description: this.description,
      chainingFeature: this.chainingFeature,
      featuredBy: this.featuredBy
    };
  }
  
  /**
   * JSON形式から特性チェーン関係を作成
   * @param json JSON表現
   * @returns 特性チェーン関係インスタンス
   */
  static fromJSON(json: KerML_FeatureChaining): FeatureChaining {
    return new FeatureChaining({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      chainingFeature: json.chainingFeature,
      featuredBy: json.featuredBy
    });
  }
}