/**
 * KerML Specialization クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.8に準拠
 * 
 * KerMLのSpecializationは、型の特化関係を表現する基本クラスです。
 * 特化とは、ある型が別の型の特殊化であることを示す関係です。
 */

import { v4 as uuid } from 'uuid';
import { KerML_Element } from './interfaces';

/**
 * Specialization クラス
 * 型の特化関係を表現するクラス
 */
export class Specialization implements KerML_Element {
  /** 要素の一意識別子 */
  readonly id: string;
  
  /** 要素の名前 */
  name?: string;
  
  /** 要素の説明 */
  description?: string;
  
  /** 短縮名 */
  shortName?: string;
  
  /** 限定名 */
  qualifiedName?: string;
  
  /** 所有者のID */
  ownerId?: string;
  
  /** 要素の型 - 常に 'Specialization' */
  readonly __type: string = 'Specialization';
  
  /** 特殊型（サブタイプ）のID */
  specificId: string;
  
  /** 一般型（スーパータイプ）のID */
  generalId: string;
  
  /** 再定義（Redefinition）かどうか */
  isRedefinition: boolean = false;
  
  /** サブセット（Subset）かどうか */
  isSubset: boolean = false;
  
  /** 共変（Covariant）かどうか */
  isCovariant: boolean = false;
  
  /**
   * Specialization コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    description?: string;
    shortName?: string;
    qualifiedName?: string;
    ownerId?: string;
    specificId: string;
    generalId: string;
    isRedefinition?: boolean;
    isSubset?: boolean;
    isCovariant?: boolean;
  }) {
    this.id = options.id || uuid();
    this.name = options.name || `${options.specificId}_extends_${options.generalId}`;
    this.description = options.description;
    this.shortName = options.shortName;
    this.qualifiedName = options.qualifiedName;
    this.ownerId = options.ownerId;
    
    this.specificId = options.specificId;
    this.generalId = options.generalId;
    this.isRedefinition = options.isRedefinition || false;
    this.isSubset = options.isSubset || false;
    this.isCovariant = options.isCovariant || false;
  }
  
  /**
   * 検証を行う
   * @throws Error 検証エラーがある場合
   */
  validate(): void {
    if (!this.specificId) {
      throw new Error('特殊型（specificId）は必須です');
    }
    
    if (!this.generalId) {
      throw new Error('一般型（generalId）は必須です');
    }
    
    if (this.specificId === this.generalId) {
      throw new Error('特殊型と一般型は異なる必要があります');
    }
  }
  
  /**
   * JSONオブジェクトに変換する
   * @returns JSONオブジェクト
   */
  toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      shortName: this.shortName,
      qualifiedName: this.qualifiedName,
      ownerId: this.ownerId,
      __type: this.__type,
      specificId: this.specificId,
      generalId: this.generalId,
      isRedefinition: this.isRedefinition,
      isSubset: this.isSubset,
      isCovariant: this.isCovariant
    };
  }
  
  /**
   * JSONデータからインスタンスを作成する
   * @param json JSONデータ
   * @returns Specializationインスタンス
   */
  static fromJSON(json: any): Specialization {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    if (!json.specificId || !json.generalId) {
      throw new Error('特殊型IDと一般型IDは必須です');
    }
    
    return new Specialization({
      id: json.id,
      name: json.name,
      description: json.description,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      ownerId: json.ownerId,
      specificId: json.specificId,
      generalId: json.generalId,
      isRedefinition: json.isRedefinition,
      isSubset: json.isSubset,
      isCovariant: json.isCovariant
    });
  }
}