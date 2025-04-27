/**
 * SysML v2 AttributeUsage クラス
 * OMG SysML v2 Beta3 Part1 (ptc/2025-02-11) §8.2.3に準拠
 * 
 * AttributeUsageは、値の保持と参照のための特性を表現するクラスです。
 * システム内での属性の使用を表します。
 */

import { v4 as uuid } from 'uuid';
import { Feature } from '../kerml/Feature';
import { FeatureObject } from '../kerml/Feature';

export class AttributeUsage extends Feature {
  /**
   * AttributeUsage コンストラクタ
   * @param options 初期化オプション
   */
  constructor(options: {
    id?: string;
    name?: string;
    ownerId?: string;
    description?: string;
    value?: any;
    typeId?: string;
    isReadOnly?: boolean;
    isAbstract?: boolean;
  } = {}) {
    super({
      id: options.id,
      name: options.name,
      ownerId: options.ownerId,
      description: options.description,
      typeId: options.typeId,
      isReadOnly: options.isReadOnly,
      isAbstract: options.isAbstract
    });
  }
  
  /**
   * 属性の情報をオブジェクトとして返す
   * @returns FeatureObject 構造
   */
  override toObject(): FeatureObject {
    const baseObject = super.toObject();
    return {
      ...baseObject,
      type: 'AttributeUsage',
      properties: {
        ...baseObject.properties
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
      __type: 'AttributeUsage'
    };
    // propertiesプロパティを除外した新しいオブジェクトを作成
    const { properties, ...resultWithoutProperties } = result;
    return resultWithoutProperties;
  }
  
  /**
   * JSONデータからAttributeUsageインスタンスを作成する
   * @param json JSON形式のデータ
   * @returns 新しいAttributeUsageインスタンス
   */
  static fromJSON(json: any): AttributeUsage {
    if (!json || typeof json !== 'object') {
      throw new Error('有効なJSONオブジェクトではありません');
    }
    
    // AttributeUsageインスタンスを作成
    const attributeUsage = new AttributeUsage({
      id: json.id || uuid(),
      name: json.name,
      ownerId: json.ownerId,
      description: json.description,
      typeId: json.type,
      isReadOnly: json.isReadOnly,
      isAbstract: json.isAbstract
    });
    
    return attributeUsage;
  }
}