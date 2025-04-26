import { v4 as uuidv4 } from 'uuid';
import { KerML_Specialization } from './interfaces';

/**
 * KerML Specialization クラス
 * KerML メタモデルの特殊化関係概念を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Specialization {
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
  
  /** 一般型要素のID */
  general: string;
  
  /** 特殊型要素のID */
  specific: string;
  
  /**
   * Specialization コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    ownerId?: string;
    name?: string;
    shortName?: string;
    qualifiedName?: string;
    description?: string;
    general: string;
    specific: string;
  }) {
    this.id = options.id || uuidv4();
    this.ownerId = options.ownerId;
    this.name = options.name;
    this.shortName = options.shortName;
    this.qualifiedName = options.qualifiedName;
    this.description = options.description;
    
    // 必須プロパティ
    this.general = options.general;
    this.specific = options.specific;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Specialization {
    return {
      __type: 'Specialization',
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      shortName: this.shortName,
      qualifiedName: this.qualifiedName,
      description: this.description,
      general: this.general,
      specific: this.specific
    };
  }
  
  /**
   * JSON形式から特殊化関係を作成
   * @param json JSON表現
   * @returns 特殊化関係インスタンス
   */
  static fromJSON(json: KerML_Specialization): Specialization {
    return new Specialization({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      general: json.general,
      specific: json.specific
    });
  }
}