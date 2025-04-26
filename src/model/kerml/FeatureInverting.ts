import { v4 as uuidv4 } from 'uuid';
import { KerML_FeatureInverting } from './interfaces';

/**
 * KerML FeatureInverting クラス
 * KerML メタモデルの特性反転関係概念を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class FeatureInverting {
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
  
  /** 反転される特性のID */
  featureInverted: string;
  
  /** 反転する特性のID */
  invertingFeature: string;
  
  /**
   * FeatureInverting コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    ownerId?: string;
    name?: string;
    shortName?: string;
    qualifiedName?: string;
    description?: string;
    featureInverted: string;
    invertingFeature: string;
  }) {
    this.id = options.id || uuidv4();
    this.ownerId = options.ownerId;
    this.name = options.name;
    this.shortName = options.shortName;
    this.qualifiedName = options.qualifiedName;
    this.description = options.description;
    
    // 必須プロパティ
    this.featureInverted = options.featureInverted;
    this.invertingFeature = options.invertingFeature;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_FeatureInverting {
    return {
      __type: 'FeatureInverting',
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      shortName: this.shortName,
      qualifiedName: this.qualifiedName,
      description: this.description,
      featureInverted: this.featureInverted,
      invertingFeature: this.invertingFeature
    };
  }
  
  /**
   * JSON形式から特性反転関係を作成
   * @param json JSON表現
   * @returns 特性反転関係インスタンス
   */
  static fromJSON(json: KerML_FeatureInverting): FeatureInverting {
    return new FeatureInverting({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      featureInverted: json.featureInverted,
      invertingFeature: json.invertingFeature
    });
  }
}