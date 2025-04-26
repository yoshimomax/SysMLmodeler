import { v4 as uuidv4 } from 'uuid';
import { KerML_Conjugation } from './interfaces';

/**
 * KerML Conjugation クラス
 * KerML メタモデルの共役関係概念を表現する
 * OMG仕様：ptc/2025-02-02, KerML v1.0 Beta3
 */
export class Conjugation {
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
  
  /** 元の型要素のID */
  originalType: string;
  
  /** 共役型要素のID */
  conjugatedType: string;
  
  /**
   * Conjugation コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    ownerId?: string;
    name?: string;
    shortName?: string;
    qualifiedName?: string;
    description?: string;
    originalType: string;
    conjugatedType: string;
  }) {
    this.id = options.id || uuidv4();
    this.ownerId = options.ownerId;
    this.name = options.name;
    this.shortName = options.shortName;
    this.qualifiedName = options.qualifiedName;
    this.description = options.description;
    
    // 必須プロパティ
    this.originalType = options.originalType;
    this.conjugatedType = options.conjugatedType;
  }
  
  /**
   * JSON形式に変換
   * @returns JSON表現
   */
  toJSON(): KerML_Conjugation {
    return {
      __type: 'Conjugation',
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      shortName: this.shortName,
      qualifiedName: this.qualifiedName,
      description: this.description,
      originalType: this.originalType,
      conjugatedType: this.conjugatedType
    };
  }
  
  /**
   * JSON形式から共役関係を作成
   * @param json JSON表現
   * @returns 共役関係インスタンス
   */
  static fromJSON(json: KerML_Conjugation): Conjugation {
    return new Conjugation({
      id: json.id,
      ownerId: json.ownerId,
      name: json.name,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      description: json.description,
      originalType: json.originalType,
      conjugatedType: json.conjugatedType
    });
  }
}