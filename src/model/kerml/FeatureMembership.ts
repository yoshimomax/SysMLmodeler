import { v4 as uuidv4 } from 'uuid';
import { KerML_FeatureMembership } from './interfaces';

/**
 * KerML FeatureMembership クラス
 * KerML メタモデルの特性メンバーシップ関係概念を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class FeatureMembership {
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
  
  /** 所有している型のID */
  owningType: string;
  
  /** メンバーである特性のID */
  memberFeature: string;
  
  /**
   * FeatureMembership コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    ownerId?: string;
    name?: string;
    shortName?: string;
    qualifiedName?: string;
    description?: string;
    owningType: string;
    memberFeature: string;
  }) {
    this.id = options.id || uuidv4();
    this.ownerId = options.ownerId;
    this.name = options.name;
    this.shortName = options.shortName;
    this.qualifiedName = options.qualifiedName;
    this.description = options.description;
    
    // 必須プロパティ
    this.owningType = options.owningType;
    this.memberFeature = options.memberFeature;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_FeatureMembership {
    return {
      __type: 'FeatureMembership',
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      shortName: this.shortName,
      qualifiedName: this.qualifiedName,
      description: this.description,
      owningType: this.owningType,
      memberFeature: this.memberFeature
    };
  }
  
  /**
   * JSON形式から特性メンバーシップ関係を作成
   * @param json JSON表現
   * @returns 特性メンバーシップ関係インスタンス
   */
  static fromJSON(json: KerML_FeatureMembership): FeatureMembership {
    return new FeatureMembership({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      owningType: json.owningType,
      memberFeature: json.memberFeature
    });
  }
}