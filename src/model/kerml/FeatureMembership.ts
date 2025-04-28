/**
 * KerML FeatureMembership クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7.9に準拠
 * 
 * KerMLのFeatureMembershipは、ある型とその特性（Feature）の所有関係を表現します。
 * フィーチャ参画は、型がフィーチャを持つことを明示的に表現するものです。
 */

import { v4 as uuid } from 'uuid';
import { KerML_Element } from './interfaces';

/**
 * FeatureMembership クラス
 * 型とその特性の所有関係を表現するクラス
 */
export class FeatureMembership implements KerML_Element {
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
  
  /** 要素の型 - 常に 'FeatureMembership' */
  readonly __type: string = 'FeatureMembership';
  
  /** 所有者型のID */
  ownedTypeId: string;
  
  /** 所有される特性のID */
  ownedFeatureId: string;
  
  /** 派生関係かどうか */
  isDerived: boolean = false;
  
  /** 公開（public）かどうか */
  isPublic: boolean = true;
  
  /** 関連付けを排他的に所有するかどうか */
  isOwned: boolean = true;
  
  /**
   * FeatureMembership コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    description?: string;
    shortName?: string;
    qualifiedName?: string;
    ownerId?: string;
    ownedTypeId: string;
    ownedFeatureId: string;
    isDerived?: boolean;
    isPublic?: boolean;
    isOwned?: boolean;
  }) {
    this.id = options.id || uuid();
    this.name = options.name || `${options.ownedTypeId}_has_${options.ownedFeatureId}`;
    this.description = options.description;
    this.shortName = options.shortName;
    this.qualifiedName = options.qualifiedName;
    this.ownerId = options.ownerId;
    
    this.ownedTypeId = options.ownedTypeId;
    this.ownedFeatureId = options.ownedFeatureId;
    this.isDerived = options.isDerived || false;
    this.isPublic = options.isPublic !== undefined ? options.isPublic : true;
    this.isOwned = options.isOwned !== undefined ? options.isOwned : true;
  }
  
  /**
   * 検証を行う
   * @throws Error 検証エラーがある場合
   */
  validate(): void {
    if (!this.ownedTypeId) {
      throw new Error('所有者型ID（ownedTypeId）は必須です');
    }
    
    if (!this.ownedFeatureId) {
      throw new Error('所有される特性ID（ownedFeatureId）は必須です');
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
      ownedTypeId: this.ownedTypeId,
      ownedFeatureId: this.ownedFeatureId,
      isDerived: this.isDerived,
      isPublic: this.isPublic,
      isOwned: this.isOwned
    };
  }
  
  /**
   * JSONデータからインスタンスを作成する
   * @param json JSONデータ
   * @returns FeatureMembershipインスタンス
   */
  static fromJSON(json: any): FeatureMembership {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    if (!json.ownedTypeId || !json.ownedFeatureId) {
      throw new Error('所有者型IDと所有される特性IDは必須です');
    }
    
    return new FeatureMembership({
      id: json.id,
      name: json.name,
      description: json.description,
      shortName: json.shortName,
      qualifiedName: json.qualifiedName,
      ownerId: json.ownerId,
      ownedTypeId: json.ownedTypeId,
      ownedFeatureId: json.ownedFeatureId,
      isDerived: json.isDerived,
      isPublic: json.isPublic,
      isOwned: json.isOwned
    });
  }
}