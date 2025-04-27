/**
 * KerML Feature クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §7に準拠
 * 
 * KerMLのFeatureは、型やその他のFeatureの特性を表現する基本クラスです。
 * SysMLのすべてのUsageクラスの基底クラスとなります。
 */

import { v4 as uuid } from 'uuid';
import { Type } from './Type';

/**
 * Feature情報を表現するオブジェクト型
 */
export interface FeatureObject {
  id: string;
  name: string;
  type: string;
  properties: {
    ownerId?: string;
    description?: string;
    direction?: 'in' | 'out' | 'inout';
    isAbstract?: boolean;
    isReadOnly?: boolean;
    isDerived?: boolean;
    redefinitionIds?: string[];
    [key: string]: any;
  };
}

/**
 * Featureクラス
 * KerMLの特性を表現するクラス、すべてのSysML v2 Usageの親クラス
 */
export class Feature extends Type {
  /** このFeatureの所有者ID */
  ownerId?: string;
  
  /** 方向 (in, out, inout) */
  direction?: 'in' | 'out' | 'inout';
  
  /** ユニーク性 */
  isUnique: boolean = true;
  
  /** 順序指定 */
  isOrdered: boolean = false;
  
  /** 合成関係 */
  isComposite: boolean = false;
  
  /** 部分指定 */
  isPortion: boolean = false;
  
  /** 読み取り専用 */
  isReadOnly: boolean = false;
  
  /** 派生特性 */
  isDerived: boolean = false;
  
  /** 端点特性 */
  isEnd: boolean = false;
  
  /** 再定義関係にある特性のID配列 */
  redefinitionIds: string[] = [];
  
  /** 型のID（オプション） */
  typeId?: string;
  
  /** このFeatureに含まれる子Feature（合成関係） */
  features: Feature[] = [];
  
  /**
   * Feature コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    ownerId?: string;
    description?: string;
    direction?: 'in' | 'out' | 'inout';
    isReadOnly?: boolean;
    isDerived?: boolean;
    isUnique?: boolean;
    isOrdered?: boolean;
    isComposite?: boolean;
    isPortion?: boolean;
    isAbstract?: boolean;
    isEnd?: boolean;
    typeId?: string;
    redefinitionIds?: string[];
  } = {}) {
    super({
      id: options.id,
      name: options.name || 'unnamed',
      description: options.description,
      isAbstract: options.isAbstract
    });
    
    this.ownerId = options.ownerId;
    this.direction = options.direction;
    this.isReadOnly = options.isReadOnly ?? false;
    this.isDerived = options.isDerived ?? false;
    this.isUnique = options.isUnique ?? true;
    this.isOrdered = options.isOrdered ?? false;
    this.isComposite = options.isComposite ?? false;
    this.isPortion = options.isPortion ?? false;
    this.isEnd = options.isEnd ?? false;
    this.typeId = options.typeId;
    
    if (options.redefinitionIds) {
      this.redefinitionIds = [...options.redefinitionIds];
    }
  }
  
  /**
   * 再定義関係を追加する
   * @param redefinedId 再定義対象のID
   */
  addRedefinition(redefinedId: string): void {
    if (!this.redefinitionIds.includes(redefinedId)) {
      this.redefinitionIds.push(redefinedId);
    }
  }
  
  /**
   * 子Featureを追加する
   * @param feature 追加するFeature
   */
  addFeature(feature: Feature): void {
    this.features.push(feature);
    feature.ownerId = this.id;
  }
  
  /**
   * 子Featureを削除する
   * @param featureId 削除するFeatureのID
   */
  removeFeature(featureId: string): void {
    this.features = this.features.filter(f => f.id !== featureId);
  }
  
  /**
   * シリアライズ可能なオブジェクトに変換する
   * @returns FeatureObject
   */
  toObject(): FeatureObject {
    return {
      id: this.id,
      name: this.name,
      type: 'Feature',
      properties: {
        ownerId: this.ownerId,
        description: this.description,
        direction: this.direction,
        isAbstract: this.isAbstract,
        isReadOnly: this.isReadOnly,
        isDerived: this.isDerived,
        isUnique: this.isUnique,
        isOrdered: this.isOrdered,
        isComposite: this.isComposite,
        isPortion: this.isPortion,
        isEnd: this.isEnd,
        typeId: this.typeId,
        redefinitionIds: [...this.redefinitionIds]
      }
    };
  }
  
  /**
   * JSONシリアライズ用のメソッド
   * @returns JSON形式のオブジェクト
   */
  override toJSON(): any {
    const obj = this.toObject();
    // obj.properties内のすべてのプロパティをトップレベルに移動
    const result = {
      ...obj,
      ...obj.properties,
      __type: 'Feature'
    };
    // propertiesプロパティを除外した新しいオブジェクトを作成
    const { properties, ...resultWithoutProperties } = result;
    return resultWithoutProperties;
  }
  
  /**
   * JSONデータからFeatureインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいFeatureインスタンス
   */
  static fromJSON(json: any): Feature {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    const feature = new Feature({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      description: json.description,
      direction: json.direction,
      isAbstract: json.isAbstract,
      isReadOnly: json.isReadOnly,
      isDerived: json.isDerived,
      isUnique: json.isUnique,
      isOrdered: json.isOrdered,
      isComposite: json.isComposite,
      isPortion: json.isPortion,
      isEnd: json.isEnd,
      typeId: json.typeId,
      redefinitionIds: json.redefinitionIds
    });
    
    return feature;
  }
}